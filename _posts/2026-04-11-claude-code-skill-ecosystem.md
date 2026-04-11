---
layout: post
title: "superpowers、gstack 与 Claude Code 的 Skill 生态路线之争"
date: 2026-04-11
categories: AI
---

# superpowers、gstack 与 Claude Code 的 Skill 生态路线之争

## 一、引子：一个 2025 年 10 月后才真正存在的问题

2025 年 10 月 16 日，Anthropic 发布 Agent Skills 规范；同年 12 月 18 日，Claude Code 全面接入。从那之后短短半年，一个原本不存在的生态在 GitHub 上疯狂生长：官方 `anthropics/skills` 仓库积累超过 11.5 万星，Jesse Vincent 的个人项目 `obra/superpowers` 冲到 14.6 万星，Y Combinator CEO Garry Tan 在 2026 年 3 月发布的 `garrytan/gstack` 在 48 小时内破 1 万星，截至 4 月已经来到 6.9 万。

一个值得追问的问题是：这些 skill 包到底在卖什么？为什么开发者愿意把"让 Claude 跟着一堆 Markdown 流程走"当作"超能力"？当 Claude Code 本身已经是目前最强的终端 agent，为什么还需要一层层的外部框架去"驯化"它？

更关键的是，生态并没有形成共识。Jesse Vincent 和 Garry Tan 代表的是"流程派"的两个流派；Claude Code 负责人 Boris Cherny 在 Latent Space 播客里却建议"最好的用户只跑 2 到 3 个插件，甚至一个都不跑"。这本身就是一场关于 agentic coding 应该长什么样的路线之争。

这篇文章想做三件事：拆解 `superpowers` 和 `gstack` 两个代表作的设计哲学，梳理围绕它们的真实社区评价，再把整个生态的全景画出来，让你看清目前至少存在的几条并行路线。

---

## 二、主角一：obra/superpowers —— 把 TDD 纪律灌给 LLM

要理解 `superpowers` 为什么长成现在这个样子，必须先了解它背后的人。

Jesse Vincent 不是 AI 圈的新面孔。他 1998 年从 Wesleyan 毕业，1994 年在大学里写出 Request Tracker（RT）这个在 Perl 世界被用了三十年的开源工单系统，后来成立 Best Practical Solutions 商业化；他做过 Perl 6 的项目经理，在 Perl 5.12 和 5.14 担任 pumpking，把 Perl 5 从"什么时候想发就什么时候发"改造成每月开发版加每年稳定版的时间盒节奏，这个变化至今仍在沿用。再后来他是 Android 上 K-9 Mail 的创始人（后被 Mozilla 收购改名 Thunderbird for Android），以及 Keyboardio 机械键盘公司的联合创始人。简而言之，他有三十年"把混乱流程系统化"的履历。

`superpowers` 的核心论点只有一句话：**Skill 不是文档，是塑造 agent 行为的代码**。这句话决定了它的所有设计。

项目当前 14 个核心 skill，编排成一条完整的开发流水线：`brainstorming`（澄清需求、出 2-3 个方案、写 spec 进 repo）→ `writing-plans`（把 spec 拆成 2-5 分钟粒度的任务）→ `subagent-driven-development`（每个任务派发全新子代理，任务后做两阶段审查）→ `test-driven-development`（严格红绿循环）→ `systematic-debugging`（四阶段根因追溯）→ `verification-before-completion`（必须跑命令看到真实输出才能宣布完成）。另外还有 `writing-skills`、`using-git-worktrees`、`dispatching-parallel-agents`、`requesting-code-review`、`receiving-code-review`、`finishing-a-development-branch` 等元能力。

这些 skill 最有辨识度的地方是语言。`test-driven-development` 里写着"Iron Law: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST。Write code before the test? Delete it. Start over. No exceptions"。`systematic-debugging` 写着"Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST"。`using-superpowers` 里那段话几乎像是咒语："If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill. This is not negotiable. This is not optional. You cannot rationalize your way out of this."

这种绝对化语气不是情绪，是设计。Jesse 在 `writing-skills` 里明确描述了方法：借用 Robert Cialdini 的说服学原理，对 Claude 的子代理做对抗性压力测试——场景一模拟带金钱后果的时间压力，逼 agent 在"自己快速写"和"慢慢找 skill"之间选择；场景二诱导沉没成本谬误（已经写了 45 分钟的代码要不要丢掉改用 skill）。只有在这种对抗下 agent 仍合规，skill 才算过关。Jesse 在博客评论里半开玩笑地说："我很庆幸这项工作不用过 IRB 审查"，这是学术界人体试验的伦理审查委员会——他在拿 agent 当实验对象。

`using-superpowers` 还有一张"Red Flags 表"，列出 12 种 agent 常用的自我合理化话术并给出反驳："这是个简单问题" → "问题也是任务，去查 skill"；"我需要先了解上下文" → "skill 检查要在澄清问题之前"；"这事 skill 有点大材小用" → "简单的事会变复杂，用 skill"。这张表是 Jesse 在真实失效模式里观察出来的——他在观察 Claude 如何用语言替自己开脱，然后把这些开脱话术钉在代码里。

从技术实现看，`superpowers` 走的是 Claude Code 原生 Skill 机制：每个 skill 是一个带 YAML frontmatter 的 `SKILL.md`，Claude Code 启动时把 description 列入系统提示作为可发现列表，当 Claude 判断 skill 相关时通过 `Skill` 工具加载全文。入口 skill `using-superpowers` 的描述里写着"Use when starting any conversation - requiring Skill tool invocation before ANY response including clarifying questions"，这句话让 Claude 在任何响应前都要先走这一 skill，从而串联起整个强制框架。Simon Willison 在博客里特别点名 Jesse 使用 Graphviz DOT 图来表达 skill 内部的决策流程——这是一种他此前没见过的做法。Jesse 自己则强调效率：核心 bootstrap 不到 2k token，重活交给子代理，一次完整的实现会话大约 100k token。

社区反响两极。Simon Willison 在博客上写"I can't recommend this post strongly enough"，称 Jesse 是"最有创造力的 coding agent 使用者之一"。Evan Schwartz 写了一整篇独立 rave review，强调 `superpowers` 解决了 Claude Code 原生 plan mode 产出"一整页文档难以真正 review"的痛点。byteiota 追踪到 2026 年 2 月 26 日单日 1,528 星的病毒传播节点。另一方面，Hacker News 的 `preommr` 留下了那条被顶到 435 分的评论："把基于说服心理学的 prompt 机制称为工程是不合适的，这是 straight up voodoo nonsense"。`jackblemming` 直截了当："没有基准测试——它可能根本让 Claude 变得更糟"。还有用户反映 skill 启动后 Claude 反而更容易漂移、更频繁地重复造轮子。`raesene9` 对安装方式表达安全担忧："这就像 curl|bash，但加了 LLM agents"。

一个冷酷的数据能说明 Jesse 的立场：这个仓库有 **94% 的 PR 拒绝率**。Jesse 自己在贡献者指南里写得毫不客气："This repo has a 94% PR rejection rate. Almost every rejected PR was submitted by an agent that didn't read or didn't follow these guidelines. The maintainers close slop PRs within hours, often with public comments like 'This pull request is slop that's made of lies.'"更狠的一句是："PRs that restructure, reword, or reformat skills to 'comply' with Anthropic's skills documentation will not be accepted without extensive eval evidence showing the change improves outcomes"——连 Anthropic 自己的官方文档，他都不认为是权威。

---

## 三、主角二：garrytan/gstack —— 把一家软件公司切成 23 个角色

如果说 `superpowers` 是老工程师在训练没品位的 junior，`gstack` 则更像一位 CEO 把自己的整家公司流程打印出来，让同一个 Claude 戴不同的帽子轮番上岗。

Garry Tan 是另一种履历。他是 Y Combinator 现任 CEO（2023 年 1 月起），也是 Initialized Capital 的联合创始人，Palantir 第 10 号员工，Coinbase 种子轮的第一张支票，投过 Instacart 和 Flexport。他在 YouTube 和 X 上非常高调，自己写代码并把过程分享出去。他的 GitHub 个人简介写着"Writes software, dreams"。

`gstack` 于 2026 年 3 月 12 日发布——SXSW 前两天。官方介绍一句话写得很有野心："Use Garry Tan's exact Claude Code setup: 23 opinionated tools that serve as CEO, Designer, Eng Manager, Release Manager, Doc Engineer, and QA"。Slogan 更直白："Turn Claude Code into a Virtual Software Development Team"，再配一句"An open source software factory"。

它的核心方法论是 `Think → Plan → Build → Review → Test → Ship → Reflect`——一条完整的软件开发流水线。23 个角色技能按这条线排开：

**策略与规划阶段**：`/office-hours`（YC 风格的 forcing questions 诘问）、`/plan-ceo-review`（找到"十星产品"并调整 scope）、`/plan-eng-review`（锁架构、数据流、测试矩阵）、`/plan-design-review`（资深设计师审计）、`/plan-devex-review`（开发者体验审计）、`/autoplan`（自动跑完前四轮评审，只把"taste decisions"抛给人类）。

**设计阶段**：`/design-consultation`（从零建 design system）、`/design-shotgun`（生成 3 个视觉变体供对比）、`/design-html`（mockup 转生产级 HTML）、`/design-review`（80 项检查 + 自动修复 + before/after 截图）。

**构建与审查**：`/review`（staff engineer 模式查生产 bug）、`/investigate`（假设驱动的系统 debug，3 次失败即停）、`/cso`（OWASP Top 10 + STRIDE 安全审计）。

**测试**：`/qa`（跑测试、开 issue、原子 commit 修复）、`/qa-only`（只报 bug 不改代码）、`/browse`（真实 Chromium 每命令约 100ms）、`/benchmark`（页面加载、Core Web Vitals 基线化）。

**发布**：`/ship`（一键同步 + 测试 + 覆盖率 + PR）、`/land-and-deploy`（合 PR + 等 CI + 生产健康校验）、`/canary`（部署后监控错误与性能退化）、`/document-release`（自动更新文档以匹配代码）。

**反思**：`/retro`（每周复盘，含个人拆解、shipping streak、测试健康度）、`/codex`（交 OpenAI Codex 做跨模型独立 review）、`/learn`（跨 session 的偏好管理）。

另外还有 8 个"Power Tools"：`/careful`（破坏性命令前警告）、`/freeze` 和 `/unfreeze`（把编辑锁在单个目录里）、`/guard`（前两者组合）、`/pair-agent`（多家 AI agent 共享浏览器）、`/setup-deploy`、`/gstack-upgrade` 以及 `/open-gstack-browser`。

这里有一个必须强调的技术亮点：`gstack` 自带一个用 **Bun 编译的 58MB 单二进制浏览器 daemon**，基于 Playwright，首次启动 3 秒，后续命令 100-200ms，30 分钟闲置自动退出。它刻意不走 MCP 协议——`ARCHITECTURE.md` 里明确列出了"what's NOT here"：不走 WebSocket、不走 MCP（说 HTTP 更省 token、schema overhead 更小）、不支持 Windows/Linux cookie 解密（只在 macOS Keychain）、不做 iframe 自动发现。安全模型是 127.0.0.1 本地绑定 + 随机端口 + 每请求带 UUID Bearer Token + 原子写入 0o600 权限的状态文件。这一节体现了 Garry 作为写过硬件创业公司 Posterous（2012 年被 Twitter 2000 万美元收购）的工程底子。

`gstack` 本身 **不是** 一个 Next.js 或 Rails 脚手架。它的 `CLAUDE.md` 里写得很明确："Platform-Agnostic Design: Skills must read project-specific config from CLAUDE.md rather than hardcoding framework details"。同一套 skill 可通过 `--host` 参数安装到 Claude Code、Codex CLI、OpenCode、Cursor、Factory Droid、Slate、Kiro 等 8 个以上 AI coding agent。Garry 在 X 上特别澄清："Turns out it works with any python agent! Neat. Had no idea. I did try hard to make sure this was runtime-agnostic."

有几句 Garry 自己的话值得直接引用，因为它们定义了 `gstack` 的 ethos：

> "Planning is not review. Review is not shipping... I want explicit gears. These skills let me tell the model what kind of brain I want right now."

> "AI-assisted coding makes the marginal cost of completeness near-zero." —— 所以宁愿写 150 行完整版也不写 80 行的 90% 版。

> "AI models recommend. Users decide."

> "Build for Yourself. The best tools solve the creator's own problem. gstack exists because Garry Tan wanted it."

社区反响同样两极，但争议的轴线完全不同。一位著名 CTO 在 X 上发了一条被疯传的 tweet："Your gstack is crazy. This is like god mode. Your eng review discovered a subtle cross site scripting attack that I don't even think my team is aware of. I will make a bet that over 90% of new repos from today forward will use gstack"。TechCrunch 的 Julie Bort 写了一篇题为 "Why Garry Tan's Claude Code setup has gotten so much love, and hate" 的报道定调爱恨交织。SitePoint 写了教程，Junia.ai 写了深度分析：**"Process packaging now matters more than raw model quality... Even swapping models wouldn't diminish gstack's structural benefits"**。

反面意见更有意思，因为它们不只是在评论代码。Hacker News 的 `fdghrtbrt` 一句话戳破："It's just a bunch of files telling Claude to pretend to be different people"。`therobots927` 更不留情："This reads like a child telling you about their toys and making up fun stories"。`tabs_or_spaces` 盯着 Garry 自述的"过去 60 天写了 60 万行代码、每日 1-2 万行"开火："LOC will never be a good metric of software engineering. Why do we keep accepting this?"——历史上软件工程视 LOC 为负债而不是资产，Garry 的生产力叙事与这个共识正面冲突。

更尖锐的一条争议是利益冲突。Product Hunt 上一位叫 Sherveen 的用户直接写："Garry, let's be clear: if you weren't the CEO of YC, this wouldn't be on Product Hunt"。有人指控 YC 系 founder 扎堆点赞构成 astroturfing，也有人担心 `gstack` 事实上会变成 YC portfolio 的"默认 stack"，形成一种带钦定意味的影响力压制。Mo Bitar 在 YouTube 上发了一个视频，标题就叫 "AI is making CEOs delusional"。甚至有评论担心 Garry 的健康状况——他在 SXSW 公开说"我现在每晚只睡四小时，得了 cyber psychosis"，虽然事后助理澄清是玩笑。

`gstack` 的数据本身也能说明问题。截至 2026 年 4 月，它的 69.3k 星里绝大部分都在 3 月 12 日发布后的不到一个月内涌入，Product Hunt 首日获得 351 分，版本号从 0.16.0 到 0.16.3 三天发了三次——发版频率逼近日更。而所有这些势能，没有 Garry 的 YC CEO 身份根本不可能出现。

---

## 四、两种世界观：同一个问题的不同答卷

`superpowers` 和 `gstack` 在表面上很像——都是一堆 Markdown skill，都在试图给 Claude Code 装上流程纪律，都在 README 里给自己冠上夸张的标签。但越往底层挖，它们的分歧越明显。

**分歧一：skill 的颗粒度和排列逻辑**。`superpowers` 14 个 skill 按软件工程的"纪律"轴展开——TDD、debugging、verification、code review、worktree——每个 skill 都在回答一个"应该如何做"的问题。`gstack` 23 个 skill 则按软件公司的"角色"轴展开——CEO 评审、工程经理评审、设计师评审、QA 工程师、发布经理。前者是"工程方法论的 checklist 化"，后者是"组织流程的角色扮演化"。

**分歧二：对 LLM 当前能力的预设**。Jesse 在 `writing-plans` 里把目标读者明确定位为"an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing"——他不相信 LLM 的判断力，他相信的是可以用铁律约束出来的行为。Garry 则相反，他相信 Claude 只要被告知"现在戴哪顶帽子"就能切换出对应的思维——"I want explicit gears. These skills let me tell the model what kind of brain I want right now"。前者把 LLM 当没品位的实习生训练，后者把 LLM 当可扮演任意角色的演员激活。

**分歧三：与 Claude Code 基础设施的关系**。`superpowers` 完全依附于官方 Skill 机制和 Claude Code 的子代理能力，它的所有创新都是在官方框架内做的——唯一的越界是 Jesse 公开拒绝 Anthropic 的 skill 风格指南。`gstack` 则在关键地方主动绕开官方基础设施：它没有走 MCP 而是自建 HTTP browser daemon，没有依赖 Claude Code 自己的终端能力而是自带长驻 Chromium。前者是"把官方系统用到极致"，后者是"把官方系统当底座再自建一层"。

**分歧四：作者姿态和社区开放度**。两个项目都高度作者驱动，但方式不同。Jesse 的方式是明确的 gatekeeping：94% PR 拒绝率，公开骂 slop PR，拒绝任何让 skill "更像官方文档"的建议。Garry 的方式是 ethos 保护：`CLAUDE.md` 规定"Community PRs: Never accept changes that modify ETHOS.md, remove promotional content, or alter Garry's authorial voice without explicit approval"——内容可以改，但作者声音不能动。

有一个共同点值得强调：两个项目都不相信"开源社区自发演化"能产出好的 skill。它们都强烈地依赖单个作者的品味和对 agent 真实行为的观察。Jesse 用的是子代理压力测试和心理学原理做 RED/GREEN/REFACTOR 循环；Garry 用的是 `eval:compare`、`eval:summary` 加上三层测试 tier（静态 5 秒免费、端到端约 3.85 美元 20 分钟、LLM-as-judge 约 0.15 美元）。这是一个非常明确的信号：**现阶段，写好 skill 需要的是经验主义和反复 eval，不是审美共识或理论辩论**。

---

## 五、生态全景：两个主角之外的风景

如果把视角拉远，围绕 Claude Code 的 skill 生态在过去六个月长出了至少六条并行路线。

**官方路线**：`anthropics/skills` 和 `anthropics/claude-plugins-official` 代表 Anthropic 自己对 skill 应该长什么样的主张——轻量、合规、claim-check-verify 风格，分 Creative & Design、Development & Technical、Enterprise & Communication、Document Skills 四类。规范本身（两级加载、YAML frontmatter、description 常驻约 2% 预算、body 按需加载）已经成为整个生态的事实标准。2026 年 4 月 8 日 Anthropic 发布 Managed Agents beta（`/v1/agents`、`/v1/sessions`），意味着"自建 harness"这件事有可能在未来被官方托管能力向上吸收。

**流程派极大化**：`SuperClaude_Framework`（5.7k 星，19 个命令、9 种人格）、`BMAD-METHOD`（21 个 agent，50 个 workflow，敏捷开发流程包）、`ruvnet/ruflo`（原 claude-flow，54 个 agent + SPARC 方法论 + 共识机制）都走的是"把流程做大做全"的路线。`superpowers` 和 `gstack` 本质上也属于这一派。这一派的问题是每个都在主张自己是最优解，互相之间很难兼容。

**记忆派**：`thedotmack/claude-mem`（46.1k 星）、`supermemoryai/claude-supermemory`、`coleam00/claude-memory-compiler` 试图解决 Claude Code 的上下文遗忘问题。`claude-mem` 的方式是自动捕获会话、用 Claude Agent SDK 压缩、下次会话按 progressive disclosure 注入相关上下文。这派把精力花在"让 Claude 记住"而不是"让 Claude 遵守流程"。

**角色代理派**：`wshobson/agents`（84 个 specialized agent + 15 个 workflow orchestrator）、`iannuttall/claude-agents`、`contains-studio/agents`（按部门组织，rapid-prototyper、trend-researcher、whimsy-injector 等 40+ 个）。这一派和 `gstack` 有重叠，但更偏"把 subagent 功能玩到极致"。

**专业 skill 派**：`trailofbits/skills` 是最好的例子——智能合约安全、常数时间分析（检测密码学代码被编译器引入的 timing side channel）、DWARF 调试格式专家、逆向工程。被 awesome 列表反复推荐为"专业级 skill 范例"，体现了"behavioral guidance over reference dumps"的哲学。这一派的特点是 skill 数量不多但每一个都深耕一个领域。

**基础设施派**：`ryoppippi/ccusage`（用量监控事实标准）、`badlogic/cchistory`（提取对比不同版本 Claude Code 的 system prompt 和工具）、`getAsterisk/claudia`（现改名 Opcode，Claude Code 的 GUI）、`siteboon/claudecodeui`（Web/mobile 远程管理）、`disler/claude-code-hooks-mastery`（hooks 教学 + 示例）。这一派不造 skill，而是给 Claude Code 造周边。它们往往比上面几派更稳定、更低调，但也是日常生产里最常用的。

**极简派**：和上面所有流派对立的是 Boris Cherny（Claude Code 负责人）在 Latent Space 播客上的建议——最好的用户只跑 2 到 3 个插件甚至 0 个，只写一份非常精准的 `CLAUDE.md`。这派的代表是 `wcygan/dotfiles` 这种"把 Claude 塞进 dotfiles 文件夹让它自己帮你改工具配置"的用法，以及 `buildtolaunch` 2026 年评测里对"少而精"的反复强调。

**中文圈的独特路线**：国内生态对工程方法论 skill 的兴趣不大，反而在应用层跑出了另一条线。腾讯 CodeBuddy 团队做的"小红书封面图生成 Skill"、BibiGPT 做的 B 站/小红书/抖音/YouTube 视频总结 skill、大量 zhihu/cnblogs 文章谈的是"用 skill 做内容创作"而不是"用 skill 管理开发流程"。这个差异本身就反映了两个市场对 AI coding 的预期完全不同：英文圈把 Claude Code 当工程师的外骨骼，中文圈把它当内容创作者的流水线。

---

## 六、更深一层：skill 到底是什么

经过这一圈，真正值得回答的问题是：skill 在技术本质上是什么？

它的基础形式很简单——一个带 YAML frontmatter（name + description）的 Markdown 文件，放在插件目录下。Claude Code 启动时把所有 skill 的 description 塞进 system prompt 作为可发现列表，当 Claude 判断某个 skill 相关时通过内置 `Skill` 工具把对应文件的全文加载进上下文。这就是整个机制。

真正有分歧的是 skill 的本质定位。

Jesse Vincent 的回答是："Skills are not prose—they are code that shapes agent behavior"。这句话的含义是：skill 的评价标准是它能否让 agent 真实行为合规，而不是它文字写得多漂亮。`writing-skills` 里明确要求 skill 开发走 TDD 流程——先写压力测试让 agent 失败（RED），然后写 skill 让 agent 通过（GREEN），再堵漏洞（REFACTOR）。这是把 skill 当成函数来写，Markdown 只是它的表达载体。

Garry Tan 的回答更混合。`gstack` 的 skill 既是行为指令也是角色剧本——`SKILL.md` 由 `.tmpl` 模板经过 `gen-skill-docs.ts` 生成，每个 skill 有统一 preamble（更新检查、session 计数、操作日志、AskUserQuestion 标准格式）。这种结构更像是软件工程里的"流程文档 + 标准作业流程"，skill 的复用单元是"角色 + 触发条件 + 工具链"。

Anthropic 官方的回答介于两者之间——规范里强调轻量、明确 description、避免冗余，但具体怎么写让作者发挥。这也是为什么 Jesse 和官方的立场会有张力：官方要求的是可组合的零件，Jesse 要的是行为保证。

如果往远看一步，这场分歧很可能在未来被 Managed Agents 和类似的托管能力部分消解。当 Anthropic 把 session 状态、子代理调度、checkpoint、记忆都下沉到平台侧，现在这些"自建 harness"的工作会逐渐变成"配置"而不是"代码"。但在此之前，skill 生态的真正价值恰恰在于它逼着我们想清楚一件事：**LLM 写代码需要的不是更大的模型，而是更精细的流程外壳**。

---

## 七、选型建议

看完上面这些，你可能想知道自己应该用哪个。给几条直接的建议：

**刚接触 Claude Code 的人**：先别装 `superpowers` 或 `gstack`，先花一晚上学 Anthropic 官方的 Agent Skills 规范，然后写一份属于自己项目的 `CLAUDE.md`。这一步没做好，任何 skill 包都会变成噪声。

**个人开发者追求工程纪律**：`obra/superpowers`。如果你写 TDD、重视 code review、受不了 Claude 每次跳过测试直接写实现，这个包就是给你准备的。它会让你的 Claude 会话变慢，但产出物更可靠。代价是陡的学习曲线和一个固执的作者。

**单兵作战想要"一人即团队"**：`garrytan/gstack`。如果你在做独立产品、需要设计和工程和 QA 来回切，而且你能接受"这是个 YC CEO 的个人工具"的事实，它能给你最全的角色工具箱。代价是它对 macOS 更友好、一些功能依赖 Bun、以及你可能并不真的需要 23 个角色。

**团队使用，尤其是有敏捷流程的**：`BMAD-METHOD` 或 `buildermethods/agent-os`。它们把软件开发流程切得更细，更适合多个开发者共用同一套标准。

**重度使用者且讨厌框架**：`wcygan/dotfiles` 这种路线。把 Claude Code 塞进 dotfiles 文件夹，让它帮你改自己的工具配置，写一份非常精准的 `CLAUDE.md`，只在真正有必要时引入少量 skill。这是 Boris Cherny 推荐的路线，也是最容易被忽视的一条。

**永远不要陷入的陷阱**：不要因为某个 skill 包有 10 万星就装它。star 数量在这个生态里是声誉而不是质量信号——Jesse 的个人履历、Garry 的 YC 身份、Simon Willison 的背书，都会让 star 数膨胀远超项目内容的真实价值。真正的判断标准是装上之后你的 agent 行为变得更可预测还是更混乱。

---

## 八、结语：为什么这场讨论现在发生

LLM 的编码能力正在一个尴尬的边缘。模型已经强到可以写出成段看起来能运行的代码，但还没有强到能在没有流程外壳的情况下稳定交付复杂系统。这个边缘上，"如何让 Claude 真的能把事做对"不是一个小问题，而是每一个认真用它的人每天都在解答的问题。

`superpowers` 和 `gstack` 代表了两种解法：一种是把老派软件工程的纪律翻译成 LLM 能读懂的语言，用绝对化、压力测试和 Iron Law 把行为约束出来；另一种是把一家软件公司的组织结构切成角色剧本，让同一个 LLM 在不同阶段戴不同的帽子。它们都不是最终答案，但都是在 2025 年 10 月到 2026 年 4 月这半年里最认真的探索。

更值得记下的是那个反方向的声音——Boris Cherny 的"最好的用户只跑 2-3 个插件"。这句话的潜台词是：Claude Code 本身已经足够强，很多"流程框架"其实只是帮助不够熟练的使用者建立信心的拐杖；真正的高手会把精力花在 `CLAUDE.md` 的每一个字上，而不是把十几个框架堆在一起。

这两种声音哪个对并不重要。重要的是这场关于"如何让 LLM 真的能写代码"的公开对话正在把整个行业往前推。无论最终流行起来的是 `superpowers` 式的铁律派、`gstack` 式的角色派、还是 Anthropic 官方托管派，它们都在回答同一个核心问题：**面对一个会合理化自己错误的智能体，人类应该用什么语言和它说话，才能让它真的把事情做对**。

这个问题以前只存在于 Perl 社区那些关于 code review 文化的争论里，或者软件工程教材里关于结对编程的章节里。现在它变成了 GitHub 上 14 万星的仓库，变成了 YC CEO 发的 tweet，变成了 Hacker News 上每周一次的辩论。这本身就是一件新鲜事。

---

## 九、参考来源

**项目仓库**
- [obra/superpowers](https://github.com/obra/superpowers)
- [garrytan/gstack](https://github.com/garrytan/gstack)
- [anthropics/skills](https://github.com/anthropics/skills)
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)

**作者博客与媒体报道**
- Jesse Vincent: ["Superpowers: How I'm using coding agents in October 2025"](https://blog.fsck.com/2025/10/09/superpowers/)
- Jesse Vincent: ["How I'm using coding agents in September 2025"](https://blog.fsck.com/2025/10/05/how-im-using-coding-agents-in-september-2025/)
- Simon Willison: ["Superpowers"](https://simonwillison.net/2025/Oct/10/superpowers/)
- Evan Schwartz: ["A Rave Review of Superpowers for Claude Code"](https://emschwartz.me/a-rave-review-of-superpowers-for-claude-code/)
- TechCrunch: "Why Garry Tan's Claude Code setup has gotten so much love, and hate"
- Junia.ai: ["Garry Tan's Claude Code Setup (gstack) analysis"](https://www.junia.ai/blog/garry-tan-claude-code-setup-gstack)
- Latent Space: ["Claude Code with Boris Cherny"](https://www.latent.space/p/claude-code)

**Hacker News 讨论**
- [HN 45547344 – Superpowers 主贴](https://news.ycombinator.com/item?id=45547344)
- [HN 47623101 – Superpowers rave review 讨论](https://news.ycombinator.com/item?id=47623101)
- [HN 47355173 – gstack 首轮讨论](https://news.ycombinator.com/item?id=47355173)
- [HN 47418576 – gstack 争议讨论](https://news.ycombinator.com/item?id=47418576)
- [HN 47494890 – How I'm Productive with Claude Code](https://news.ycombinator.com/item?id=47494890)

**相关生态项目**
- [SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)
- [trailofbits/skills](https://github.com/trailofbits/skills)
- [wshobson/agents](https://github.com/wshobson/agents)
- [ryoppippi/ccusage](https://github.com/ryoppippi/ccusage)
- [wcygan/dotfiles](https://github.com/wcygan/dotfiles)
