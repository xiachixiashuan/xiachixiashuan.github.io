# AI Coding 中的 Harness Engineering：从写提示词到造环境

## 一、Harness Engineering 到底是什么？

2026 年 2 月，HashiCorp 创始人 Mitchell Hashimoto 在博客里写了一句话，简单到几乎像废话，但说出来之后整个行业都觉得被点醒了：**每次发现 AI agent 犯了个错，就把解决方案工程化，让它以后再也犯不了同样的错。** 他管这个过程叫 “Engineer the Harness”。

几天之后，OpenAI 放出了一篇实战报告。他们的一个团队从空仓库起步，五个月里用 Codex agent 写出了超过 100 万行代码的产品，已经有内部日活用户和外部测试者在用了。整个过程没有一行是人手敲的。紧接着 Martin Fowler 在 Thoughtworks 技术博客上做了分析，Ethan Mollick 把他的 AI 使用框架重组成了 “Models、Apps、Harnesses” 三层。几周之内，“harness engineering” 从一种大家隐约在做但说不出名字的实践，变成了 AI 工程领域的热词。

那 harness 到底是啥？这词本来指马具——缰绳、鞍子、嚼口——一整套用来驾驭马的装备。这个比喻非常贴切：**AI model 就是那匹马，力气大、跑得快，但它自己不知道该往哪跑。** Harness 不是马本身，而是你围绕这匹马搭的整套控制系统——缰绳定方向，围栏划边界，鞍具保证骑手不掉下来。

说得技术一点：**harness 就是围绕 AI agent 搭建的完整运行环境**，包括约束规则、feedback loop、文档体系、工具链、验证机制和生命周期管理。它不是 agent 本身，而是让 agent 能靠谱干活的所有基础设施。

打个更接地气的比方。你让一个新人进团队干活，不会只丢一句话就让他写代码。你会给他看团队文档和代码规范，让他的代码过 CI/CD 和 code review，出了问题复盘流程而不只是改代码。Harness engineering 干的就是同一件事——只是对象从人变成了 AI agent。

## 二、从 Prompt Engineering 到 Context Engineering 再到 Harness Engineering

人和 AI 的协作方式经历了三个阶段。每个阶段回答的核心问题不一样，对工程师的要求也完全不同。

### 2.1 Prompt Engineering 时代（2022–2024）：怎么问？

ChatGPT 出来之后，所有人都在研究怎么写 prompt。核心逻辑很简单：**问对了，答案就好。** 给 model 一个角色（“你是资深 Python 开发者”），把任务拆成步骤（chain-of-thought），给几个好的示例（few-shot），调措辞——效果立竿见影。

在一问一答的场景里，这确实够用了。但 prompt engineering 有一个根本局限：**它假设一轮对话就是全部。** 你打磨好一个 prompt，model 给出回答，完事。整个过程是单次交互，人是唯一的质量把关者——你看输出，判断好不好，手动改。反馈循环完全靠人力：试、看、调、再试。

等到 AI 开始被拿来构建真正的产品——不是一次性问答，而是要多步推理、记状态、调工具的系统——prompt engineering 的天花板就到了。

### 2.2 Context Engineering 时代（2025）：给 model 看什么？

2025 年中，Andrej Karpathy 把话说明了：**context engineering 比 prompt engineering 重要得多。** Shopify CEO Tobi Lütke 也表达了类似看法，认为 “context engineering” 这个词更准确——核心技能不是写好一句 prompt，而是精心设计 model 在推理时能看到的全部信息。

关键洞察说起来很简单：**model 只能基于它看到的东西来推理。** 问题不光是”怎么问”，更是”model 做决定的时候眼前摆着什么”。Context engineering 因此带来了一系列系统级的做法：

- **RAG**：每次调用前拉入相关文档，让 model 有据可依。
- **Tool design**：如果工具返回的数据又大又杂，就白白浪费 model 的注意力。精心设计工具接口变成了一等大事。
- **Compaction（上下文压缩）**：长对话做摘要，让 model 在干净的状态下继续工作。
- **Structured notes**：让 agent 把关键事实存到 context window 外面，需要的时候再取回来——就像开发者调 bug 时随手记的便签。

2025 年一项研究发现，即使 model 只关注问题和证据、屏蔽了所有无关 token，只要相关信息被埋在更长的上下文里，准确率照样下降 24.2%。这就是所谓的 “context rot”：context 越大，model 找到并利用关键信息就越难。

从 prompt 到 context 的转变，也改变了工程师的角色定位：从 “author”（写 prompt 的人）变成了 “architect”（设计信息管线的人）。干活的单元从一轮对话变成了多轮会话或一串 tool call。出了问题，你不再只是改 prompt，而是去查 context window 里装了什么、该给的信息是不是在正确的时间给到了。

### 2.3 Harness Engineering 时代（2026）：agent 在什么环境里才能靠谱干活？

等到 AI agent 真的进了生产环境、开始跨多个步骤自主行动，一类新的问题冒了出来——这些问题 context engineering 搞不定：

- Agent 不管团队的编码规范，各种风格随便写。
- Agent 违反架构依赖方向，在不该耦合的模块之间制造依赖。
- 多个 agent 并行跑的时候互相打架。
- 代码库在 agent 持续操作下质量越来越差——代码”熵增”。

这些问题的本质不是”model 该看到什么”，而是”系统该拦住什么、该量什么、该自动修什么”。Context engineering 管不了，因为它的设计目标是优化单次决策的信息输入，不是去治理一个长期跑着的自主系统。

**Harness engineering 在 2026 年 2 月正式得名，就是因为行业终于认清了一件事：agent 不难，harness 才难。**

三者的关系可以用一个套娃结构来理解：Harness ⊃ Context ⊃ Prompt。每一层加了新的维度，但不替代上一层。Prompt 告诉 model 做什么，context 给 model 做事的知识基础，harness 给 model 一个能安全、稳定干活的环境。更直白地说：

- Prompt engineering 是一句话：“右转。”
- Context engineering 是地图、路标、可见地形——帮马搞清楚该往哪跑。
- Harness engineering 是缰绳、鞍具、围栏和路面本身——让十匹马能同时安全地跑。

## 三、深度分析：Harness 的本质

### 3.1 核心命题——环境比 model 更重要

Harness engineering 的核心命题听起来反直觉，但数据越来越多：**围绕 model 搭建的系统，对输出质量的影响比 model 本身还大。**

最硬的数据来自安全研究者 Can Bölük。他用 180 个任务跑了 16 个 model、3 种 edit format，每种配置跑 3 次。结论：光是换了 harness 的编辑格式——model 怎么把改动写进文件——不动 model 权重、不换任务，Grok Code Fast 1 的成功率就从 6.7% 飙到 68.3%，整整翻了 10 倍。GPT-4 Turbo 在 Aider benchmark 里也因为换编辑格式，准确率从 26% 跳到了 59%。

LangChain 的例子同样有说服力。他们的 coding agent 在 Terminal Bench 2.0 上从 52.8% 升到 66.5%，排名从第 30 名到第 5 名——model 完全没换，只改了 harness。怎么改的？三板斧：在 system prompt 里强制自验证循环，推理资源不均匀分配（头尾用强推理、中间用标准推理的”三明治”策略），以及预加载环境信息减少 agent 瞎摸索。

Nate B Jones 2026 年的 benchmark 进一步印证：同一个 model，有像样的 harness 时成功率 78%，没有时 42%。

这些数字说的是同一件事：**与其纠结换哪个 model，不如先看看你的 harness 设计，性价比高得多。**

### 3.2 OpenAI 百万行实验——一次完整的 Harness Engineering 实践

OpenAI 的这次内部实验，是目前最完整的 harness engineering 案例。七个工程师，从 2025 年 8 月的空 repo 开始，五个月内用 GPT-5 的 Codex agent 搞出了一个有内部日活和外部 alpha tester 的生产级产品。核心约束：**零行手写代码。**

这个极端约束本身就是一个 forcing function——它逼着团队把所有精力砸在 harness 设计上，而不是在代码层面缝缝补补。从这个实验里长出来的 harness 架构，可以归纳成几根支柱：

**（1）Repo 就是知识库**

整个 repo 都是 agent 生成的，所以从一开始就为 agent 的可读性做了优化。团队发现一个铁律：从 agent 的视角看，任何它在执行时拿不到的信息，等于不存在。团队在 Slack 里讨论对齐了某个架构决策？如果没沉淀成 repo 里的文档，那对 agent 来说，就跟三个月后入职的新人没听说过一样。

所以团队不断地把各种 context 推进 repo——ADR（架构决策记录）、设计文档、可执行的 plan——全部用版本化的、机器可读的格式。文档之间的交叉引用用 linter 和 CI 来强制保持同步。

**（2）Golden Principles：用确定性规则对抗 pattern drift**

Agent 会复制 repo 里已有的 pattern——包括那些写得不太好的。时间一长，代码就会漂移。一开始团队每周五花 20% 的时间手工清理 “AI slop”。这显然扛不住。

后来他们把”黄金原则”直接写进 repo。这些规则是带观点的、机械式的，目的是让代码库对后续 agent 运行始终保持可读和一致。比如：公共逻辑必须放进共享的 utility package，不许 agent 每次自己从头写一个 helper——否则同一段逻辑散落在十个地方，改一处漏九处；再比如：不许”蒙着眼探数据”，访问数据前必须做边界校验或者用 typed SDK，防止 agent 拿一个猜出来的数据结构往上堆逻辑，结果运行时才发现字段根本不存在。

**（3）Depth-first 的任务拆解和 feedback loop**

核心工作模式是纵深推进：大目标拆成小积木（设计、写码、review、测试），让 agent 一块一块搭，再用这些积木解锁更复杂的任务。某一步挂了怎么办？答案几乎从来不是”再试一次”。因为所有代码都得让 Codex 来写，工程师必须退一步问自己：**缺了什么能力？怎么让这个能力对 agent 既可读又可强制执行？**

人和系统的交互方式是：描述任务、跑 agent、让它开 PR。为了让 PR 能合进去，他们设计了一个循环——Codex 先自审，再请求其他 agent 做 review（本地和云端都有），回应反馈，迭代到所有 agent reviewer 满意为止。

**（4）自动化的”反熵”清理**

Agent 持续运行会制造代码质量退化。前面说了，最初靠每周五人工清理，扛不住。解决方案是把清理过程本身也交给 Codex——后台跑定时任务做周期性重构，相当于一个自动化的代码库保洁员。

### 3.3 一个认识论层面的根本转变

Harness engineering 带来的最深层变化不在技术面，在认识论层面。工程师的活儿从”写对代码”变成了”造一个让 agent 能稳定写对代码的环境”。这是两个完全不同的问题。

传统软件工程里，代码出 bug，你 debug：查状态、加日志、推故障原因，最后改代码。Harness engineering 里，出了问题核心不是”agent 写的代码哪错了”，而是”环境里缺了什么能力或者护栏”。修复对象是环境——加一条 linter 规则、补一份文档、建一个新的验证机制。

Anthropic 的研究揭示了更深的原因：**model 没法可靠地评估自己的产出。** 让 model 评价自己的代码，它几乎总是表现出信心满满，哪怕代码其实是坏的。这就是为什么必须有外部的控制系统。Anthropic 的方案借鉴了 GAN 的思路：拆成两个 agent——generator 负责写代码，evaluator 像 QA 工程师一样用 Playwright 之类的工具去点按钮、查 API response、验数据库。他们发现一个有意思的规律：让一个 evaluator agent 变得严格，远比让 generator agent 学会自我批评容易。

### 3.4 一个成熟的 Harness 长什么样？

综合 OpenAI、Anthropic、LangChain、Stripe 等团队的实践，一个成熟的 harness 大致包含这几个维度：

**Constraints & boundaries**：架构规则、模块边界、依赖方向、稳定的数据结构——通过机器可读的 artifact（ADR、schema validator 等）来强制执行。这不是限制 agent 的能力，而是通过收窄解空间来提高可靠性——听起来矛盾，但实践反复验证了这一点。

**Feedback loops**：linter、test suite、agent 之间的交叉 review、telemetry（log、metrics、trace）。这些机制让 agent 能自动验证和自我修正，不需要人逐行盯着看。

**Documentation & context management**：AGENTS.md、CLAUDE.md、.cursorrules 这类项目指令文件，结构化的设计文档，可执行的 plan。它们就是 agent 开工前读的”新员工手册”。

**Lifecycle management**：跨 session 的状态持久化、清理机制、并发控制、error recovery。Anthropic 关于 long-running agent 的研究特别强调了 initializer agent 和 executor agent 的角色分离，以及通过外部化的 progress log 和 feature checklist 来弥补 model 在 context window 之间没有原生记忆的问题。

**Observability**：看不见 agent 在干嘛，就没法改进 harness。Telemetry、trace、session log、eval 机制构成了从 agent 行为到 harness 改进的闭环。这个维度大多数团队投入不够，但它往往是杠杆率最高的点。

### 3.5 Harness 的哲学内核——确定性与非确定性的共治

退远一步看，harness engineering 的本质是在一个非确定性系统周围建确定性的治理结构。LLM 是概率性的——同样的输入可以出不同的输出。传统软件工程建立在确定性之上——给定输入，期望固定输出。两种范式撞到一起，就产生了 harness engineering。

Martin Fowler 注意到，OpenAI 团队的 harness 混合了两类手段：确定性的（linter、结构测试、CI 校验）和 LLM-based 的（agent 间互审、文档生成）。这不是偶然，它反映了一个深层设计原则：**用确定性规则画死线，用 LLM 的判断力处理灰色地带。**

确定性规则擅长处理可以形式化的硬约束——“package A 不能依赖 package B”，“所有 public API 必须有 type declaration”。LLM review 擅长处理模糊的、需要上下文理解的质量问题——“这个函数名有没有准确表达意图”，“这段逻辑跟已有 pattern 是不是一致的”。两者搭配，形成的质量保障体系比任何单一手段都强。

## 四、总结与展望

### 4.1 关键结论

Harness engineering 在 2026 年初的快速爆发不是偶然的。它是 AI coding 能力跨过实用门槛后的必然产物——agent 强到了够用，但没强到能放心，这个精确的张力点催生了 harness engineering。

回顾这段路：prompt engineering 教会我们怎么跟 AI 说话，context engineering 教会我们该给 AI 看什么，harness engineering 教会我们 AI 得在什么环境里才能靠谱地干活。三者是层层累加的关系，不是替代关系。写好 prompt 仍然重要，设计好 context 仍然关键，但当 agent 需要在生产环境中长期自主运行时，harness 才是决定成败的那一层。

### 4.2 几个值得关注的方向

**Harness 模板化。** Martin Fowler 提了一个很有意思的猜想：以后团队可能会像今天选 service template 一样，从一组针对常见应用架构的 harness template 里挑起点——自带 linter、结构测试、基础文档和 context provider。Harness template 可能就是下一代的 “golden path”。

**按 harness 友好度选技术栈。** 一个反直觉的趋势正在冒头：要提高 AI 生成代码的可靠性，需要的是约束而不是更大的自由度。以后选技术栈和代码结构，可能不光看人用着顺不顺手，还得看 harness 好不好搭。

**Harness 必须跟着 model 一起演化。** Anthropic 的工程师在不断”拆” Claude Code 的 agent harness，model 一升级就重新设计。LangChain 的 Lance Martin 管这叫 “embrace re-architecture”——Manus 从 2024 年 3 月到现在已经重构了五次。Model 在变强，harness 也必须跟着变。过度设计的 harness 反而会在 model 能力提升后变成累赘。

**工程师角色的再定义。** OpenAI Codex 团队的表述最到位：软件工程团队的首要工作不再是写代码，而是设计环境、表达意图、搭 feedback loop，让 agent 能可靠地干活。这不是程序员的末日，而是程序员这个角色的一次深刻再定义。

-----

**参考资源**

- Mitchell Hashimoto: [My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey) (2026.02.05)
- OpenAI: [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/) (2026.02.11)
- Can Bölük: [I Improved 15 LLMs at Coding in One Afternoon. Only the Harness Changed.](https://blog.can.ac/2026/02/12/the-harness-problem/) (2026.02.12)
- Martin Fowler / Birgitta Böckeler: [Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) — Thoughtworks “Exploring Gen AI” 系列
- Anthropic: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- LangChain: [Improving Deep Agents with harness engineering](https://blog.langchain.dev/improving-deep-agents-with-harness-engineering/)
- Ethan Mollick: [A Guide to Which AI to Use in the Agentic Era](https://www.oneusefulthing.org/p/a-guide-to-which-ai-to-use-in-the)