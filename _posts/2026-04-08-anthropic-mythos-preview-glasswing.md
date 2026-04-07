---
layout: post
title: "Anthropic 发布 Claude Mythos Preview：一个强到不敢公开的网络安全模型"
date: 2026-04-08
categories: AI
---

# Anthropic 发布 Claude Mythos Preview：一个强到不敢公开的网络安全模型

2026 年 4 月 7 日，Anthropic 正式公布了此前被意外泄露、在行业内已经传得沸沸扬扬的新模型 **Claude Mythos Preview**，同时宣布启动 **Project Glasswing** —— 一个联合十二家科技巨头与关键基础设施机构的防御性安全倡议。最引人注目的一点是：Anthropic 明确表示，这个模型**不会面向大众发布**，因为它在发现并利用软件漏洞方面的能力已经超过了绝大多数人类专家。

这是一次罕见的、头部 AI 实验室主动"按住"自己最强模型的案例。

## 一、新闻要点：模型用在哪？哪些公司能用？

Mythos Preview 是一款通用型前沿大模型，在推理、编程和网络安全三个维度上相比 Claude Opus 4.6 都有显著提升。但 Anthropic 这次的发布策略很特别：**不开放 API，不进 Claude.ai，也不在 Bedrock/Vertex 上铺量**，而是把它圈进 Project Glasswing，只给特定合作伙伴做"防御性安全"工作。

首批 12 家创始成员包括：

- Amazon Web Services
- Anthropic 自身
- Apple
- Broadcom
- Cisco
- CrowdStrike
- Google
- JPMorganChase
- Linux Foundation
- Microsoft
- NVIDIA
- Palo Alto Networks

除此之外，还有 40 多家承担关键软件基础设施维护职责的组织获得了准入，其中包括多个开源项目维护者。它们被允许使用 Mythos Preview 进行本地漏洞检测、二进制黑盒测试、终端加固以及渗透测试等场景，研究成果会在 90 天内由 Anthropic 汇总对外披露。

为了降低合作门槛，Anthropic 拿出了 **1 亿美元的使用额度** 赞助这一轮研究预览期。Preview 结束后，若未来放开，Mythos 类模型的官方参考定价是 **每百万 input token 25 美元 / 每百万 output token 125 美元**，大致是当前 Opus 的两到三倍。

开源社区的维护者可以通过 Anthropic 的 Claude for Open Source 计划申请。可以理解为：暂时只有"守方"能摸到这把枪。

## 二、它到底强在哪？评测数据与泄露草稿

Anthropic 这次给出的评测结果相当夸张，几个关键数字：

**CyberGym（真实漏洞发现基准）**

- Sonnet 4.6 与 Opus 4.6 分别只能在 tier 1 上命中 150–175 个案例，tier 2 约 100 次，tier 3 各仅一次
- Mythos Preview 在 tier 1 和 tier 2 合计拿下 **595 次崩溃**，在 tier 3–4 也有若干进展，并且在 **10 个完全打过补丁的目标上实现了完整的控制流劫持**

**Firefox 利用链**

- Opus 4.6 在数百次尝试中只成功构造出 2 次可用利用
- Mythos Preview 则高达 **181 次** 成功构造可用利用

**实战成果**

- 在过去几周里，它已经识别出 **数千个零日漏洞**，涵盖所有主流操作系统与浏览器
- 自主发现并利用了 FreeBSD NFS 中一个 **17 年未被发现** 的远程代码执行漏洞
- 找到了一个 **27 年前** 就存在于 OpenBSD TCP SACK 中的问题
- 揪出了一个可以追溯到 2003 年提交记录、**16 年** 一直躺在 FFmpeg H.264 解码器里的 bug

更令人吃惊的是成本。Anthropic 披露的几个数字：

- 在 OpenBSD 上跑了"上千次"模型实验，花费 **不到 2 万美元**，换回数十个关键漏洞
- 在 FFmpeg 上约 1 万美元的算力支出，挖出数百个问题
- 复杂的 Linux 内核漏洞利用链，**不到 1000 美元、半天时间** 就能跑完
- 多漏洞串联的高级 exploit，**2000 美元以下**

Anthropic 同时承认：**已发现漏洞中超过 99% 尚未被修复**，所以他们不打算公开披露具体细节。人工复核的数据显示，Mythos 自评的漏洞严重等级与人类专业分析师的判断有 89% 完全吻合——这意味着这些发现并不是噪音。

### 先于发布的"意外剧透"

这里还有一段让 Anthropic 自己颇为尴尬的插曲。早在官方发布前的 **2026 年 3 月 26 日**，安全研究者 Roy Paz（LayerX Security）和 Alexandre Pauwels（剑桥大学）就在 Anthropic 一个配置错误的 CMS 数据仓库里，发现了接近 **3000 份未发布的资产**，其中就包含一篇详细描述 Mythos 的草稿博客。

Fortune 当天联系了 Anthropic 通报漏洞，Anthropic 在收到通知后才关闭了该数据仓的公开搜索与下载权限。Anthropic 后来承认这是"人为配置错误"。草稿博客原文里称 Mythos 是一次 **"step change"**（阶跃式跃升），是公司"迄今训练出的最强大模型"。几天之后，Anthropic 的 Claude Code 源码也因为另一起事故被部分泄露——两次接连的疏漏放在一家强调"负责任 AI"的公司身上，颇具讽刺意味。

换个角度看，这次的公开发布其实是在**被动节奏下的主动确认**：既然剧透已经发生，不如顺势把故事讲完整，并借 Project Glasswing 把"负责任披露"的叙事重新夺回来。

## 三、它意味着什么：行业反应与争议

业内对这次发布的态度大致分成三派。

**认为这是及时的负责任决策。** 独立开发者与评论人 Simon Willison 在个人博客里明确表态，"把 Claude Mythos 限制在安全研究者手里，听起来是必要的"。他的理由很直接：如果攻击者能用同样的算力和成本在不到一天里复现这些漏洞利用链，那对整个互联网而言是一种系统性威胁，而非某个单点问题。

**认为炒作成分不低。** 安全公司 Aikido 基于自己内部"1000 次 AI 渗透测试"的数据发表了反驳文章，认为 Mythos 的实际威胁被过度渲染，真实攻击场景里很多限制因素未被公开测试覆盖。CNN 的技术评论员也提醒，"Watershed moment"这样的词在 AI 圈用得太多、太廉价。

**行业巨头选择入伙。** 相比争论，AWS、Apple、Google、Microsoft 等直接加入 Glasswing 的选择本身就说明了态度。他们都承担着数以亿计用户的基础设施安全，如果 Mythos 的能力是真的，不参加反而是更大的风险。Linux Foundation 和开源维护者的加入也意味着，这次 Anthropic 选择让"守方"先拿到武器，而不是等着"攻方"自行复现。

对开发者而言，这件事传递出几个信号：

1. **"模型能力到了，但部署策略未必跟得上"** 正在成为新常态。未来可能会有更多模型以"preview only、圈选客户"的形式存在，而不是一键开放 API。
2. **漏洞挖掘的经济学正在被改写。** 当一千美元就能让 AI 半天跑出一个内核漏洞链时，传统的"黑市零日定价"体系会受到实质冲击，防守方的红队能力也将被迫升级。
3. **AI 安全不再是理论议题。** Anthropic 披露的细节意味着所谓"AI 能写代码、也能找代码漏洞"的假设已经变成可以度量的现实，所有面向生产环境部署大模型的团队都应该重新评估威胁模型。

---

## 参考资料

- [Anthropic 官方：Claude Mythos Preview 技术报告](https://red.anthropic.com/2026/mythos-preview/)
- [Anthropic 官方：Project Glasswing](https://www.anthropic.com/glasswing)
- [TechCrunch：Anthropic debuts preview of powerful new AI model Mythos](https://techcrunch.com/2026/04/07/anthropic-mythos-ai-model-preview-security/)
- [Fortune：Anthropic is giving some firms early access to Claude Mythos](https://fortune.com/2026/04/07/anthropic-claude-mythos-model-project-glasswing-cybersecurity/)
- [Fortune：Anthropic 意外泄露 Mythos 细节](https://fortune.com/2026/03/26/anthropic-leaked-unreleased-model-exclusive-event-security-issues-cybersecurity-unsecured-data-store/)
- [VentureBeat：Anthropic says its most powerful AI cyber model is too dangerous to release publicly](https://venturebeat.com/technology/anthropic-says-its-most-powerful-ai-cyber-model-is-too-dangerous-to-release)
- [CyberScoop：Project Glasswing 生态介绍](https://cyberscoop.com/project-glasswing-anthropic-ai-open-source-software-vulnerabilities/)
- [Simon Willison：Project Glasswing 评论](https://simonwillison.net/2026/Apr/7/project-glasswing/)
- [Anthropic：Alignment Risk Report for Mythos Preview](https://www.anthropic.com/claude-mythos-preview-risk-report)
