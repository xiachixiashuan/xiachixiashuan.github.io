---
layout: post
title: "GitHub 周榜 Top5｜2026-05-17"
date: 2026-05-17
categories: GitHub
---

# GitHub 周榜 Top5｜2026-05-17

本周 GitHub 涌现了一批值得关注的新项目：从 Vercel Labs 推出的 Agent 专用编程语言，到学术界的连续扩散语言模型，再到跨平台 DeepSeek V4 桌面客户端，覆盖工具链、AI 研究和实用工具多个维度。以下是过去 7 天内新建且最受关注的 5 个项目速览。

## 一、vercel-labs/zero

⭐ 1,008 | 语言：C | 作者：Vercel Labs

Zero 是 Vercel Labs 推出的面向 Agent 的系统编程语言，专注于原生小工具、显式副作用声明、可预测内存管理和结构化编译器输出。它的设计目标是让 AI Agent 能够编写并调用体积小、行为完全可预测的本地可执行文件，填补了 AI 工具链中"可信赖原生执行层"的空白。Zero 目前处于实验阶段，编译器、标准库和文档已可试用，语言规范仍在迭代演化中。项目提供 `zero check`、`zero run`、`zero build`、`zero routes` 等一套完整的 CLI 命令。

[项目地址](https://github.com/vercel-labs/zero)

## 二、DenisSergeevitch/agents-best-practices

⭐ 578 | 语言：Markdown/Skill | 作者：DenisSergeevitch

这是一个与 AI 提供商完全无关的 Agent Skill，可在 Codex、Claude Code 等主流 Agentic 框架上通过 `npx skills add` 一键安装。核心理念简洁有力：**"模型提议动作，Harness 负责验证、授权、执行、记录和返回观测"**，将 Agent 运行时的职责边界划分得清晰可操作。其适用范围远超编码场景，涵盖研究、运营、销售、法务、医疗等各类业务工作流，是目前设计 Agentic Harness 最系统的参考资料之一。

[项目地址](https://github.com/DenisSergeevitch/agents-best-practices)

## 三、lillian039/ELF

⭐ 572 | 语言：Python (JAX) | 作者：lillian039

ELF（Embedded Language Flows）是一类基于连续时间流匹配（Flow Matching）的扩散语言模型，论文发表于 arXiv（2605.10938）。与现有离散扩散语言模型不同，ELF 在整个去噪过程中主要停留在连续嵌入空间，仅在最后一步才将嵌入映射到离散 Token，这让图像扩散领域常用的分类器自由引导（CFG）技术可以直接迁移到文本生成。官方提供基于 JAX/TPU 的参考实现，并附带 ELF-B（105M）、ELF-M（342M）、ELF-L（652M）三档预训练权重，在同等训练设置下优于现有离散与连续扩散语言模型基线。

[项目地址](https://github.com/lillian039/ELF)

## 四、JUk1-GH/gpt-promo-scanner

⭐ 503 | 语言：Python | 作者：JUk1-GH

这是一个针对 ChatGPT Business（原 Team 版，标准价 \$50/月起）促销码的批量自动化工具，覆盖批量发现、有效性验证、价格收集和一键支付完整流程。支持 17 个国家的 34 个促销码，最高折扣幅度可达 71%，通过 Clash Verge 代理切换多国节点完成跨区验证。项目原创研究首发于 Linux Do 社区，使用 Python 实现，适合有一定技术基础、希望研究 OpenAI 促销体系的开发者。

[项目地址](https://github.com/JUk1-GH/gpt-promo-scanner)

## 五、yaassin12/DeepSeek-V4-Pro-App

⭐ 481 | 语言：Python + Rust | 作者：yaassin12

这是一款面向 DeepSeek-V4 大模型的高性能跨平台桌面与移动客户端，支持 Windows、macOS 和 Linux 三端。核心亮点包括：完整的思维链（CoT）可视化、专为多文件代码生成优化的 Pro 代码助手、本地数据存储与加密 API 通信的隐私保护模式，以及 Markdown、LaTeX 和代码高亮的原生渲染支持。后端基于 Python 3.12+ 和 Rust 构建，前端使用 Next.js / Electron，提供低延迟流式响应和多模态（文本 + 视觉 + 文档）分析能力。

[项目地址](https://github.com/yaassin12/DeepSeek-V4-Pro-App)
