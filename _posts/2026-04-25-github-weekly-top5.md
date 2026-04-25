---
layout: post
title: "GitHub 周榜 Top5｜2026-04-25"
date: 2026-04-25
categories: GitHub
---

# GitHub 周榜 Top5｜2026-04-25

本周 GitHub 涌现了一批令人眼前一亮的新项目——从将提示词秒变杂志感 PPT 的 Claude 技能，到 DeepSeek 团队开源的高性能 Tile 内核库，再到让所有 AI 编码 Agent 都能像高级工程师一样工作的配置文件、文字转 CAD 模型的开源框架，以及拥有 186 个 Agent 的可移植编排系统。以下 5 个项目均诞生于过去 7 天，按 Star 数排列。

## 一、op7418/guizang-ppt-skill

⭐ 1926 | 语言：HTML | 作者：op7418

「归藏 PPT Skill」是一个专为 Claude Code 打造的技能插件，能将一段自然语言提示词直接转化为横向滑动的杂志风格 HTML 演示文稿。它内置多种排版哲学，自动输出高保真原型级别的幻灯片，无需任何 PowerPoint 或 Keynote 依赖。对于需要频繁制作演示材料的开发者和内容创作者而言，这是一个可以大幅提效的"即插即用"工具。

[项目地址](https://github.com/op7418/guizang-ppt-skill)

## 二、deepseek-ai/TileKernels

⭐ 1071 | 语言：Python | 作者：DeepSeek AI

TileKernels 是 DeepSeek 团队开源的一套基于 TileLang 编写的高性能算子库，覆盖了深度学习推理与训练中常见的底层计算核心。项目旨在提供比传统 CUDA 手写核更灵活、更易组合的 Tile 级抽象，同时保持接近硬件极限的吞吐量。这是继 FlashAttention 系列之后，DeepSeek 在算子层面的又一次重要开源贡献。

[项目地址](https://github.com/deepseek-ai/TileKernels)

## 三、TheRealSeanDonahoe/agents-md

⭐ 504 | 语言：Markdown | 作者：TheRealSeanDonahoe

`AGENTS.md` 是一个"即投即用"的配置文件模板，只需放入项目根目录，就能让 Claude Code、Cursor、Codex 等主流 AI 编码 Agent 像一名了解你技术栈的高级工程师一样工作。它通过一套精心设计的约束规则，规范了 Agent 的代码风格、提交习惯、错误处理方式等行为，大幅减少"AI 胡乱重构"的情况。对多 Agent 协同开发场景尤其有价值。

[项目地址](https://github.com/TheRealSeanDonahoe/agents-md)

## 四、earthtojake/text-to-cad

⭐ 348 | 语言：JavaScript | 作者：earthtojake

text-to-cad 是一个开源的文字转 CAD 模型框架，用户只需用自然语言描述想要的三维零件或装配体，系统便会自动生成对应的 CAD 模型文件。项目基于 JavaScript 构建，采用开放的 Harness 架构，方便接入不同的大模型后端和 CAD 内核。这对机械工程师、产品设计师以及对生成式设计感兴趣的开发者来说，是一个极具探索价值的工具链。

[项目地址](https://github.com/earthtojake/text-to-cad)

## 五、GammaLabTechnologies/harmonist

⭐ 324 | 语言：Python | 作者：GammaLab Technologies

Harmonist 是一套可移植的 AI Agent 编排系统，内置机械协议强制执行机制，预置了多达 186 个专用 Agent。它的核心设计理念是"协议优先"——所有 Agent 之间的通信和任务交接都通过严格定义的协议完成，而非依赖模糊的自然语言传递，从而大幅提升多 Agent 流水线的可靠性和可调试性。对于正在构建复杂 Agentic 系统的团队，这是一个值得深入研究的参考实现。

[项目地址](https://github.com/GammaLabTechnologies/harmonist)
