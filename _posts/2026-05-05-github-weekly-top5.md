---
layout: post
title: "GitHub 周榜 Top5｜2026-05-05"
date: 2026-05-05
categories: GitHub
---

# GitHub 周榜 Top5｜2026-05-05

本周 GitHub 热榜再度涌现出一批亮眼项目——从披露 9 年老漏洞的内核安全研究，到让 Claude Code 接入 DeepSeek 的开源方案，再到 AIOps 事故响应Agent、iOS 模拟器农场管理工具，以及可随身携带的 Claude Code 便携版。以下是本周最值得关注的 5 个新仓库。

## 一、theori-io/copy-fail-CVE-2026-31431

⭐ 3.2k｜Python｜Theori 安全研究团队

这是一个真实的 Linux 内核本地提权（LPE）漏洞利用项目，对应 CVE-2026-31431。该漏洞由 Theori 旗下 AI 安全工具 **Xint Code** 发现，潜伏内核长达 9 年，涉及 `copy_from_user` 系列函数中的整数溢出缺陷，可在主流 Linux 发行版上实现无需 root 的权限提升。仓库附有完整的 PoC 脚本与技术报告，对内核安全研究人员和红队从业者极具参考价值。

[项目地址](https://github.com/theori-io/copy-fail-CVE-2026-31431)

## 二、aattaran/deepclaude

⭐ 1.0k｜JavaScript｜aattaran

DeepClaude 将 **Claude Code 的自主 Agent 循环**与 DeepSeek V4 Pro（或任意 OpenRouter 兼容模型）无缝拼接：用 DeepSeek 做深度推理规划，再把执行权交给 Claude 的工具调用框架，从而在不失去 Claude 生态优势的前提下降低推理成本。项目支持自定义后端配置，适合希望在成本与能力之间灵活取舍的开发者。

[项目地址](https://github.com/aattaran/deepclaude)

## 三、Tommy-yw/RunbookHermes

⭐ 503｜Python｜Tommy-yw

RunbookHermes 是一个基于 Hermes Agent 框架的 **AIOps 事故响应代理**，专为生产环境故障处理设计。它采用"证据驱动"的诊断策略：自动抓取日志、指标和链路追踪，推断根因后生成修复建议，但每个高风险操作都需人工审批放行，兼顾自动化效率与操作安全。适合 SRE 团队作为 Runbook 自动化的起点。

[项目地址](https://github.com/Tommy-yw/RunbookHermes)

## 四、tddworks/baguette

⭐ 451｜Swift｜tddworks

Baguette 是一款面向 **iOS 26** 的无头模拟器管理平台，提供模拟器农场调度、宿主机侧手势注入（点击、滑动、键盘输入）等能力，可通过 API 批量控制多台模拟器，彻底摆脱 Xcode GUI 依赖。对于需要在 CI/CD 流水线中大规模并行运行 iOS UI 测试的团队，这是一个值得关注的基础设施工具。

[项目地址](https://github.com/tddworks/baguette)

## 五、techjarves/OpenClaude-Portable

⭐ 356｜HTML｜techjarves

OpenClaude-Portable 让你把 **Claude Code 装进 U 盘**，在任何 Windows PC 上免安装直接运行——无需配置 Node.js 环境，插入即用。项目内置了轻量级运行时打包方案和一键启动脚本，特别适合在无法安装软件的办公或学校电脑上临时使用 Claude Code。

[项目地址](https://github.com/techjarves/OpenClaude-Portable)
