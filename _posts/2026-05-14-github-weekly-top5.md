---
layout: post
title: "GitHub 周榜 Top5｜2026-05-14"
date: 2026-05-14
categories: GitHub
---

# GitHub 周榜 Top5｜2026-05-14

本周 GitHub 涌现出一批高质量开源项目，从 3D 打印切片到 AI 硬件仪表盘，从 A 股数据工具到移动开发技能包，再到 macOS 原生 AI 工作台，覆盖多个前沿方向。以下是本周诞生、星标增长最快的 5 个新项目。

## 一、FULU-Foundation/OrcaSlicer-bambulab

⭐ 2937 | 语言：C++ | 作者：FULU-Foundation

OrcaSlicer-bambulab 是深度适配 Bambu Lab 打印机的开源 3D 切片软件分支，在原版 OrcaSlicer 基础上针对拓竹系列机型做了大量优化与扩展。它继承了 OrcaSlicer 强大的多材料支持与精细化参数控制能力，同时补齐了官方 Bambu Studio 在高级切片场景下的短板。对于拥有 Bambu Lab 设备、又需要更灵活切片工作流的用户来说，这是目前社区最受关注的替代方案。

[项目地址](https://github.com/FULU-Foundation/OrcaSlicer-bambulab)

## 二、HermannBjorgvin/Clawdmeter

⭐ 679 | 语言：C | 作者：HermannBjorgvin

Clawdmeter 是一款基于 ESP32 的桌面硬件仪表盘，专门用于实时展示 Claude Code 的 Token 使用量与费用消耗。它通过 WiFi 拉取 Anthropic 账户 API 数据，将当日已用 Token、累计费用等指标显示在小屏幕上，让重度 Claude Code 用户随时掌握用量不超支。项目完全开源，硬件成本不足 20 美元，堪称 AI 时代的"电表"。

[项目地址](https://github.com/HermannBjorgvin/Clawdmeter)

## 三、simonlin1212/a-stock-data

⭐ 471 | 语言：Python | 作者：simonlin1212

a-stock-data 是一套面向 A 股市场的全栈数据工具包，采用 6 层架构设计，对外暴露 15 个 RESTful 端点，聚合了沪深交易所、东方财富、同花顺等 7 大数据源。开发者可以通过统一 API 获取行情、财报、资金流向等结构化数据，也支持作为 AI Skill 接入大模型工作流，实现自然语言查询 A 股信息。对于量化研究和 AI 投研场景均有较高实用价值。

[项目地址](https://github.com/simonlin1212/a-stock-data)

## 四、chrisbanes/skills

⭐ 430 | 语言：Kotlin | 作者：chrisbanes

chrisbanes（Tivi 与 Accompanist 作者）发布了面向 Kotlin、Jetpack Compose 和 Android 开发的官方技能包。内容涵盖 Compose 动画、状态管理、架构最佳实践等核心主题，以结构化文档形式封装，可直接接入支持 Skills 协议的 AI 编程助手。这让 Android 开发者在使用 AI 辅助编程时，能获得更贴合生产实践的 Compose 专项建议，而非泛化的通用代码。

[项目地址](https://github.com/chrisbanes/skills)

## 五、nickvasilescu/hermes-desktop-os1

⭐ 397 | 语言：Swift | 作者：nickvasilescu

hermes-desktop-os1 是一款 macOS 原生应用，为 Hermes Agent 提供类 OS1 风格的桌面工作台界面。它深度集成 Orgo 云端计算资源与 Streaming Sync 实时协作能力，使用纯 Swift 编写，界面风格致敬早期 macOS 的简洁美学。对于希望在 macOS 上获得沉浸式 AI Agent 操作体验的开发者，这是目前最有原生质感的开源选择之一。

[项目地址](https://github.com/nickvasilescu/hermes-desktop-os1)
