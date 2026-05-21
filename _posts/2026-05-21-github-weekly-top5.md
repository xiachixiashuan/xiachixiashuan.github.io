---
layout: post
title: "GitHub 周榜 Top5｜2026-05-21"
date: 2026-05-21
categories: GitHub
---

# GitHub 周榜 Top5｜2026-05-21

本周 GitHub 涌现出一批令人眼前一亮的新项目，从专为 AI Agent 设计的编程语言，到链上巨鲸实时追踪工具，再到对话驱动的 API 文档生成器，技术创新的步伐依然未停。以下是过去 7 天内诞生、并迅速积累大量 Star 的 5 个亮眼新仓库。

## 一、vercel-labs/zerolang

⭐ 3.9k｜语言：C｜作者：Vercel Labs

Zero 是由 Vercel 实验室打造的一门**专为 AI Agent 设计的编程语言**。与其他"把现有语言改造给 Agent 用"的方案不同，Zero 从第一性原理出发重新思考语言设计：紧凑可预测的语法让 Agent 能快速从示例中习得，内置丰富标准库取代散乱依赖，结构化机器可读的诊断输出支持自动调试与修复。目前项目处于 pre-1 实验阶段，已支持原生代码编译并配套 VS Code 扩展，但官方明确提示破坏性变更随时可能出现。

[项目地址](https://github.com/vercel-labs/zerolang)

## 二、thananon/9arm-skills

⭐ 874｜语言：Shell｜作者：thananon

9arm-skills 是一套面向 **Claude Code** 的可复用 Agent Skill 合集，将工程团队的最佳实践封装成即插即用的提示词工具。技能涵盖结构化调试方法论、标准化事后分析（postmortem）报告生成、以及从外部视角进行代码评审等场景。全部用 Shell 编写，可直接安装到 `~/.claude/skills/` 目录，特别适合多人协作使用 Claude Code 的团队统一工作流。

[项目地址](https://github.com/thananon/9arm-skills)

## 三、Glazenovatag/hyperliquid-whale-order-tracking

⭐ 490｜语言：Python｜作者：Glazenovatag

这是一个追踪 Hyperliquid 去中心化永续合约交易所**巨鲸大额订单**的实时监控工具。通过 WebSocket 流式接收链上公开数据，可检测超过可配置阈值（默认 10 万美元）的市场成交与大额挂单，支持按代币设置不同触发阈值（如 BTC 与小市值币种区别对待），并通过 Telegram 批量推送告警以避免 API 限速。完全只读、零 API Key、内置指数退避自动重连，一行命令即可部署。

[项目地址](https://github.com/Glazenovatag/hyperliquid-whale-order-tracking)

## 四、husu/loom

⭐ 329｜语言：TypeScript / Node.js｜作者：husu

Loom 是一个通过**对话式 AI 生成和维护 API 文档**的 Agent 工具，支持接入 DeepSeek 和 OpenAI 模型。开发者只需在终端 TUI 聊天界面描述接口，系统即生成结构化 JSON Schema 文档；`/scan` 命令可自动从源代码扫描识别现有 API；内置 React SPA 文档浏览器和动态 Mock 服务，将文档编写、接口浏览、接口测试三个环节整合在同一工具链，大幅减少上下文切换。

[项目地址](https://github.com/husu/loom)

## 五、basketikun/infinite-canvas

⭐ 250｜语言：TypeScript + Go｜作者：basketikun

Infinite Canvas 是一款**面向 AI 图像创作的开源无限画布工作台**，将 AI 生图（文生图/图生图）、参考图编辑、画布节点编排、对话助手和提示词库整合在同一界面。前端采用 Next.js + React + TypeScript，后端用 Go + Gin，兼容 OpenAI 接口生态，支持 Docker 一键部署。对需要多轮迭代、对比风格、组合参考图的设计师和创作者来说，是一个值得尝试的创作中枢。

[项目地址](https://github.com/basketikun/infinite-canvas)
