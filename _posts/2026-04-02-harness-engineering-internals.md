---
layout: post
title: "从 Claude Code 源码看 Harness 工程的实现原理"
date: 2026-04-02
categories: AI
---

# 从 Claude Code 源码看 Harness 工程的实现原理

上一篇文章讲的是 harness 工程**是什么**——围绕 AI agent 搭建的完整运行环境，是缰绳、鞍具、围栏，是让 LLM 这匹马能安全跑起来的一切基础设施。这篇要回答另一个问题：**它是怎么实现的**。

2026 年 3 月，Claude Code 的 system prompt 意外泄露。这份泄露对工程师来说相当于拿到了一套精工打造的 harness 的拆机图——它暴露的不只是提示词，而是 Anthropic 如何在工程层面实现 harness 的每一个细节：循环结构、工具体系、行为规范、权限控制、多智能体编排。加上这个会话本身就在 Claude Code 里运行，所谓「知行合一」，你看到什么，它就在做什么。

本文从最简单的 ReAct loop 起步，一层一层往上拆，最后还原出一个生产级 harness 的完整架构。

## 一、Harness 的骨架：ReAct Agent Loop

### 1.1 最简模型

理解 harness 的起点，是理解它最核心的运行逻辑：ReAct 循环。ReAct 是 Reasoning + Acting 的缩写，由 Google 研究者于 2022 年提出。基本思路极简——让 LLM 交替地**思考**和**行动**，把复杂任务拆成一轮轮的"推理→工具调用→观察结果→继续推理"。

用 Python 伪代码写出来不到 20 行：

```python
messages = [system_prompt, user_message]

while True:
    response = llm.call(messages)

    # LLM 认为任务完成，直接返回
    if response.type == "final_answer":
        return response.text

    # LLM 要调用一个工具
    tool_result = execute_tool(response.tool_call)
    messages.append({"role": "tool", "content": tool_result})
```

就这样。LLM 每次返回要么是最终答案，要么是一个工具调用请求。执行工具，把结果塞回对话，再让 LLM 继续推理。如此循环，直到任务完成。

这个循环就是 harness 的骨架，所有复杂的东西都是在这个骨架上长出来的。

### 1.2 Claude Code 的 Agent Loop

Claude Code 的实现在概念上和上面的伪代码完全一致，但它在循环的每一个节点都注入了控制逻辑。拆开来看：

**进入循环前**，harness 会构建完整的 system prompt——把基础行为规范、当前工作目录信息、可用工具列表、记忆文件（MEMORY.md）、计划文件（plans/）全部打包进去。这不是一次性写死的 prompt，而是每个 session 动态组装的。

**工具调用时**，harness 在执行工具之前会拦截——检查这个操作是否需要用户确认（权限层，后面展开讲）。确认通过再执行，把结果注回对话。

**循环收尾时**，如果上下文窗口快满了，harness 会触发压缩逻辑——把历史消息总结成摘要，腾出空间让循环继续跑。

整个过程里，「LLM 在推理」和「harness 在控制」是并行发生的。LLM 看到的是一个干净的对话流，harness 在背后默默做着所有脏活。

## 二、Harness 的能力层：工具、技能与自动化

有了 ReAct 骨架，harness 开始往上堆能力。Claude Code 的能力层可以分成五个层次，每一层解决一类问题。

### 2.1 Tool Use：Agent 的手脚

LLM 本身只能处理文本，它不能读文件、不能跑命令、不能上网。Tool use 给了 LLM 与外部世界交互的能力——工具就是 agent 的手脚。

工具的定义是一份 JSON Schema，告诉 LLM：这个工具叫什么、做什么、接受哪些参数。LLM 在推理时，如果觉得需要某个能力，就生成一个符合 schema 的工具调用请求。Harness 解析这个请求，执行对应的函数，把结果作为新消息注回对话。

Claude Code 内置了一套相当完整的工具集，覆盖了代码工程的主要操作：

| 工具 | 能力 |
|------|------|
| Read / Write / Edit | 文件读写，Edit 只发送 diff |
| Bash | 执行 shell 命令 |
| Grep / Glob | 搜索文件内容、匹配文件路径 |
| WebFetch / WebSearch | 抓取网页、搜索引擎查询 |
| Agent | 派发子 agent（后面展开） |
| TodoWrite / TaskCreate | 任务跟踪 |

工具的设计有一个关键点：**颗粒度**。太粗，LLM 的意图表达就不精确；太细，调用次数多、开销大。Claude Code 的工具设计偏向精细，比如把文件操作拆成 Read / Write / Edit 三个工具，而不是一个万能的"文件操作"工具——这样 LLM 在声明意图时更清晰，harness 在拦截和审核时也更容易判断风险。

另一个工程细节：**工具可以并行调用**。当 LLM 的推理发现多个工具调用之间没有依赖，可以在一轮里批量发出，harness 并行执行，全部完成后再继续下一轮推理。这把很多任务的耗时压缩了一大截。

### 2.2 Skills：Harness 的「行为规范库」

工具解决了「能做什么」的问题，Skills 解决的是「该怎么做」的问题。

Skills 的本质是可复用的 prompt 模板——把一个专家的工作流程编码成结构化的指令，需要时动态注入到 LLM 的上下文里。换句话说，Skills 是 harness 的行为规范库：它不扩展 agent 的能力边界，而是约束 agent 的行为方式。

触发机制很简单：用户输入 `/skill-name`，harness 通过 Skill 工具把完整的 skill 内容展开，LLM 读到这份内容之后按照里面的指令行动。

几个典型的 skills，能清楚地展示这层的价值：

- **TDD**（测试驱动开发）：强制 agent 先写测试再写实现。不用 skill 时，LLM 会本能地直接写功能代码，因为这是训练数据里最常见的模式。skill 改变了这个默认行为。

- **systematic-debugging**：遇到 bug 时，强制 agent 先诊断根因，读错误信息，检查假设，再改代码。防止 LLM 陷入「改一行、试一下、还是不行、再改一行」的无效循环。

- **brainstorming**：在动手实现前，强制探索用户意图和多种方案。防止 LLM 拿到需求就直接开冲，做出来之后用户说「不是这个意思」。

- **requesting-code-review**：实现完成后，强制做一次结构化的代码审查，而不是直接宣布「搞定了」。

Skills 分两类：**rigid**（刚性）和 **flexible**（弹性）。刚性 skill 要求严格按流程执行，比如 TDD——先测试后实现这个顺序不能变。弹性 skill 提供原则和框架，LLM 在执行时有自主判断的空间，比如 brainstorming——探索多种方案，但具体探索几个、往哪个方向走，交给 LLM 判断。

这种分类本身就是一种精妙的 harness 设计：用刚性规则保住不能妥协的工程纪律，用弹性原则给 LLM 留住它最有价值的东西——推理能力。

### 2.3 Hooks：Harness 的「系统级拦截器」

Skills 约束的是 LLM 的推理行为，Hooks 约束的是系统的执行行为。

Hooks 是在 agent loop 的特定事件点插入 shell 命令的机制。事件类型包括：

- `PreToolUse`：工具调用前
- `PostToolUse`：工具调用后
- `SessionStart`：会话启动时
- `Notification`：通知触发时

配置方式是在 `settings.json` 里写：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "echo '即将执行 shell 命令'" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "prettier --write $FILE_PATH" }]
      }
    ]
  }
}
```

Hooks 的典型用途：
- **每次 Write 后自动格式化**：确保 LLM 写出的代码始终符合代码风格，不用每次都额外提醒。
- **SessionStart 时注入上下文**：把 CI 状态、最新 PR 列表、当前 sprint 目标塞进 session 开头，让 LLM 一上来就有充足的环境感知。
- **PreToolUse 时做安全检查**：在执行危险命令前触发自定义的检查脚本，比如禁止在生产分支上执行某些操作。

Skills 和 Hooks 的区别可以用一句话总结：**Skills 是 LLM 的工作手册，Hooks 是系统的自动化流水线**。前者在 LLM 推理层生效，后者在执行层生效，互不干涉，各司其职。

### 2.4 Agent Team：Harness 的「多智能体编排层」

单一 agent 有两个天然局限：一是上下文窗口有限，塞太多东西进去会稀释注意力；二是任务越来越复杂，单线程处理效率低。Agent Team 解决的就是这两个问题。

Claude Code 通过 Agent 工具支持多智能体编排：主 agent 把子任务派发给子 agent，子 agent 在独立的上下文里执行，完成后把结果汇报给主 agent。

内置的子 agent 类型各有专职：

- **Explore**：只读探索型，搜索代码、理解结构，不做任何修改
- **Plan**：架构规划型，分析需求、设计方案、识别关键文件，不动代码
- **general-purpose**：通用型，可以执行复杂多步任务
- **code-reviewer**：代码审查型，在实现完成后检查质量

主 agent 在派发时会做一个关键判断：哪些子任务之间没有依赖、可以并行？多个独立的子 agent 可以同时跑，大幅缩短任务耗时。比如「同时探索前端代码结构」和「同时探索后端 API 设计」两个子任务，完全可以并行派发，再把两份报告汇总回来统一分析。

更进一步，Claude Code 支持 **worktree 隔离模式**——子 agent 可以在独立的 git worktree 上工作，拥有完全隔离的文件系统状态，不会和主 agent 或其他子 agent 发生状态冲突。这对于「同时实现两个互相依赖但又需要独立验证的特性」这类场景特别有用。

多智能体编排把 harness 从单 agent 的执行框架升级成了一个**团队协作系统**——它不只是让一个 agent 能干活，而是让一群 agent 能协同干活、相互检验、分工负责。

### 2.5 Memory：Harness 的「跨会话状态管理」

LLM 本身没有持久记忆——每次 session 结束，上下文全部消失。这对于需要长期维护的代码库来说是个大问题：agent 昨天学到的知识，今天就全忘了。

Claude Code 的解法是文件式记忆系统。记忆分四种类型：

| 类型 | 内容 |
|------|------|
| user | 用户的角色、偏好、知识背景 |
| feedback | 用户对 agent 行为的纠正和确认 |
| project | 正在进行的工作、决策、截止日期 |
| reference | 外部系统的位置指针（Linear 项目、Grafana 看板等）|

存储结构是两层：`MEMORY.md` 作为索引，每条记忆对应一个独立的 `.md` 文件。MEMORY.md 的每一行都是一个指针，格式是「标题 + 一句话描述」，保持简短、可扫描。每个 session 开始时，harness 会把 MEMORY.md 塞进 system prompt，让 LLM 知道有哪些记忆可以调取。

这套设计和 RAG 有本质区别。RAG 是被动检索——向量数据库里躺着一堆文档，每次查询时用语义相似度找最相关的段落。Claude Code 的记忆是**主动维护的结构化状态**——LLM 自己决定什么值得记、怎么分类、何时更新。记忆的写入时机有两种：用户直接说「记住这个」，或者 LLM 观察到一个非显然的偏好（比如用户连续三次纠正同一类行为）之后主动记录。

这套记忆系统解决了 harness 跨会话的「认知连续性」问题——它不能让 agent 记住所有东西，但能让 agent 记住最重要的那些。

## 三、生产级 Harness 的复杂性

上面描述的五层能力，是 harness 的「理想状态」。一旦进入生产环境，还有一大堆问题需要处理。这些问题不那么性感，但它们决定了 harness 是否真的可用。

### 3.1 权限管理：在能力与安全之间划线

Agent 能力越强，风险越大。`git push --force`、`rm -rf`、`DROP TABLE` 这些操作，LLM 完全有可能在「合理」的推理链条下决定执行。如果没有拦截，损失可能是灾难性的且不可逆的。

Claude Code 的权限系统分三档：

- **auto-allow**：低风险的只读操作，直接执行，不打扰用户（比如 Read、Grep）
- **prompt**：有潜在影响的操作，执行前弹窗让用户确认（比如 Bash、Write）
- **deny**：高风险操作，直接拒绝并解释原因

但权限系统不只是一个「允许/拒绝」的开关，更重要的是 harness 在 system prompt 层面预先注入的行为规范：

- `NEVER skip hooks (--no-verify, --no-gpg-sign)` ——禁止绕过 git 钩子
- `NEVER force-push to main/master` ——禁止强推主干
- `NEVER run destructive operations without explicit user confirmation` ——破坏性操作必须用户明确确认
- `Prefer reversible actions` ——在有选择时，总是选可逆的那个

这些规范不是运行时的动态检查，而是静态注入到 LLM 推理过程里的行为约束。LLM 在生成工具调用请求之前就已经「知道」某些事不能做，从源头减少危险行为的发生。

两者结合——前者是系统级的执行拦截，后者是 LLM 层的行为引导——构成了一个双层安全机制。

### 3.2 多环境适配：同一个 Agent，不同的执行上下文

Claude Code 运行在不少不同的环境里：命令行 CLI、Web 应用、VSCode/JetBrains 插件、Telegram Bot。每个环境的能力边界不同：CLI 可以执行任意 Bash 命令，Web 环境可能没有 shell 访问权限；VSCode 环境有 IDE 集成，Telegram 只有文字和文件。

Harness 需要在 session 启动时做环境检测，并动态调整可用工具集和行为模式。比如：`NotebookEdit` 工具只在 Jupyter 环境里有意义；`WebSearch` 在网络受限环境里不可用；在 Telegram Bot 模式下，输出需要控制在 Telegram 消息格式的约束内（支持 MarkdownV2，但不支持 HTML）。

SessionStart hook 是实现这个适配层的关键机制——它在每个 session 开始时执行，可以探测环境、注入环境专属的上下文信息，再通过 harness 动态组装进 system prompt。这让同一套核心 agent 逻辑可以在不同环境里以不同形态运行，而不需要维护多套代码。

### 3.3 上下文压缩：让长任务不断线

LLM 的上下文窗口是有限的。一个复杂任务跑下来，几十轮工具调用，消息记录轻松超过几万个 token。窗口快满时有两个选择：截断（丢掉早期对话）或压缩（对历史做摘要）。

简单截断会丢失任务早期建立的关键上下文，很可能导致 agent 走回头路或做出前后矛盾的决策。Claude Code 的方案是**摘要压缩**：当上下文接近阈值时，把历史消息批量压缩成一段结构化摘要，保留关键决策、已完成步骤和待处理事项，然后以这份摘要作为新的起点继续循环。

但仅靠摘要还不够。长任务的连续性还依赖两个辅助机制：

- **计划文件（plans/）**：在任务开始时写入一份结构化的执行计划，即使上下文被压缩，这份计划文件仍然存在于文件系统上，agent 随时可以重新读取对齐当前状态。
- **任务列表（TodoWrite / TaskCreate）**：把任务拆成可追踪的小项，每完成一项就标记，让进度状态持久化在文件里，不随上下文压缩而丢失。

这两者组合，让 agent 在上下文压缩之后还能准确地知道「我做了什么、还剩什么、下一步是什么」。

### 3.4 Token 预算与 bail-out 逻辑

Harness 还需要管钱——或者更准确地说，管 token 消耗。LLM API 的计费是按 token 算的，一个失控的 agent loop 可能消耗几十倍于预期的 token。

Claude Code 维护一个 token 预算机制：预设一个预算上限，每轮 LLM 调用都追踪累计消耗。当消耗接近预算时，harness 会以 `budget_tokens` 参数告知 LLM 剩余预算不多，LLM 需要开始收尾而不是继续展开。当超出上限时，harness 强制触发 bail-out——终止当前循环，输出当前进度，等待用户决策是否继续。

这个机制防止了两种常见的失控场景：LLM 进入无限工具调用循环（每次调用都触发新的调用，无法收敛），以及任务范围蔓延（agent 在完成核心任务后继续优化周边代码，越做越多）。

### 3.5 错误处理与容错

生产环境里，工具调用失败是常态。网络超时、文件权限不足、命令执行报错——这些情况 harness 必须优雅处理，而不是直接崩溃或让 LLM 反复重试同样的调用。

Harness 的错误处理策略：

1. **把错误信息完整注回上下文**：不是隐藏错误，而是让 LLM 看到真实的失败原因，让它自己决定怎么应对。
2. **区分可重试和不可重试的错误**：网络超时可以重试，权限不足重试没有意义，后者应该转为向用户请求确认或解释。
3. **防止 tool call 格式错误的死循环**：如果 LLM 连续多次生成格式错误的工具调用（无法解析），harness 主动中断循环，输出诊断信息，而不是无限等待 LLM 自我纠正。

## 四、从源码看 Harness 的设计哲学

上面拆解的是技术层面的实现。往更深处看，Claude Code 的 harness 背后有几个一以贯之的设计哲学，值得单独提出来说。

### 4.1 「Measure Twice, Cut Once」

Harness 对操作的可逆性有强烈的执念。System prompt 里明确写着：**在有选择的时候，总是选可逆的那个操作**。

这条原则体现在很多地方：

- 修改文件之前先读，不要盲写
- 能用 Edit（发 diff）就不用 Write（全量覆盖）
- 删除分支、强推代码这类不可逆操作，必须用户明确确认
- 新建 commit 而不是 amend，保留历史记录

这背后的逻辑是风险不对称：确认一下的成本是几秒钟，一个不可逆误操作的代价可能是几小时甚至几天的工作。「量两次，剪一次」——在执行之前多花一点时间确认，远比事后补救划算。

### 4.2 Human-in-the-loop 的权限哲学

Harness 的权限设计不是为了限制 agent 的能力，而是为了保持人对关键决策的控制权。

有一个细节很能说明这种哲学：用户曾经批准过某个操作，不代表未来的同类操作也自动批准。Harness 在 system prompt 里明确规定：**除非用户在 CLAUDE.md 这类持久化指令文件里预授权，否则每次涉及高风险操作都要重新确认**。

这看起来麻烦，但它解决了一个微妙的问题：agent 的上下文在变、任务在变、环境在变，一次授权不能覆盖所有情况。「我允许你在这个分支上强推」和「我允许你以后随时强推」是两件完全不同的事。

### 4.3 确定性规则与 LLM 推理的分工

和前篇讲的一致：harness 的精髓在于确定性规则和 LLM 推理能力的恰当分工。

**用确定性规则处理可以形式化的硬约束**：权限检查、工具调用的参数校验、危险操作的拦截——这些有明确的对错，用代码判断比让 LLM 判断更可靠。

**用 LLM 的推理能力处理需要上下文理解的灰色地带**：任务分解策略、代码质量的主观判断、用户意图的理解——这些没有唯一正确答案，LLM 的语言理解和推理能力恰恰是它的优势所在。

两者的边界划错了，harness 就会出问题：用规则处理灰色地带，系统变得僵化；用 LLM 处理应该确定的事情，系统变得不可靠。

### 4.4 行为约束是写进推理里的，不是套在外面的

这是 Claude Code 的 harness 和很多「wrapper 式」harness 的根本区别。

很多 harness 实现是这样的：LLM 产出，harness 检查，不符合就拒绝或重试。这种设计把 LLM 和 harness 对立起来——LLM 想做 A，harness 不让，LLM 重试，harness 再拒绝，如此往复，效率低下，体验割裂。

Claude Code 的做法是把约束**写进 system prompt**，变成 LLM 在推理时就内化的行为准则。LLM 不是「想做坏事被拦住了」，而是「从一开始就知道有些事不该做」。行为的收敛发生在推理阶段，而不是执行阶段。

这让 harness 和 LLM 变成了合作关系：harness 提供环境和约束，LLM 在这个框架内充分发挥推理能力，两者方向一致，而不是相互对抗。

## 五、总结

用一个结构图来总结 harness 的层次关系：

```
┌─────────────────────────────────────────────────────┐
│                   用户 / 任务                        │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│               Harness 层（Claude Code）               │
│  ┌───────────┐ ┌────────┐ ┌───────┐ ┌────────────┐  │
│  │ 权限管理  │ │ Hooks  │ │Memory │ │ Agent Team │  │
│  └───────────┘ └────────┘ └───────┘ └────────────┘  │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Skills（行为规范库）                 │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │         ReAct Agent Loop（核心骨架）              │ │
│  │    推理 → 工具调用 → 观察 → 推理 → ……            │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                    LLM（Claude）                      │
└─────────────────────────────────────────────────────┘
```

ReAct 是骨架，Tools 是手脚，Skills 是行为规范，Hooks 是自动化流水线，Memory 是跨会话的记忆，Agent Team 是组织架构，权限系统是安全边界。每一层都在解决一个具体问题，合在一起，才构成一个生产可用的 harness。

上一篇文章的核心论点是：**harness 决定的成败比 model 本身更重要**。这篇文章说的是：**harness 是可以设计的、可以工程化的、可以一层一层搭建的**。Claude Code 的泄露，让我们看到了一个生产级 harness 的真实样子——不是什么神秘的黑箱，而是一套有迹可循的工程方法论。

---

**参考资源**

- 上篇：[AI Coding 中的 Harness Engineering：从写提示词到造环境](/2026/03/29/harness.html)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — Yao et al., 2022
- Claude Code System Prompt Leak（2026.03）— 公开讨论版本
- Anthropic: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- Mitchell Hashimoto: [My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey) (2026.02.05)
