---
layout: post
title: "GitHub 周榜 Top5｜2026-05-08"
date: 2026-05-08
categories: GitHub
---

# GitHub 周榜 Top5｜2026-05-08

本周（2026-05-01 至 2026-05-08）GitHub 上诞生了一批极具潜力的新项目，从中文 AI 提示词库到轻量级大模型推理引擎，覆盖 AI 工具、系统基础设施与网络安全多个维度。以下是本周 5 个最热新项目精选。

## 一、yaojingang/yao-open-prompts

⭐ 1.1k｜语言：Python｜作者：yaojingang

一个专为中文用户打造的 AI 提示词开源库，覆盖工作汇报、学习笔记、内容创作、营销文案和日常生活等多种场景。项目收录了大量经过验证的高质量 prompt，并按场景分类整理，方便直接复用或二次改造。对于想用好 ChatGPT / Claude 的中文用户，这是一份难得的实用"提示词字典"，也是国内 prompt 工程实践的集大成之作。

[项目地址](https://github.com/yaojingang/yao-open-prompts)

## 二、strukto-ai/mirage

⭐ 993｜语言：TypeScript｜作者：strukto-ai

Mirage 是专为 AI Agent 设计的统一虚拟文件系统层，支持 Claude Code、LangChain、OpenAI Agents 等主流框架接入。它通过 FUSE 实现跨平台文件抽象，让 Agent 在沙盒环境中安全操作文件，同时支持 Bash 工具和 Python 脚本执行。**对于需要赋予 Agent 文件读写能力的开发者来说，Mirage 提供了一套生产级的安全隔离解决方案。**

[项目地址](https://github.com/strukto-ai/mirage)

## 三、lightseekorg/tokenspeed

⭐ 641｜语言：Python｜作者：lightseekorg

TokenSpeed 定位为"光速"大模型推理引擎，目标是最大化 LLM 的 token/s 吞吐量。项目对 Blackwell GPU 架构深度优化，支持 DeepSeek、Qwen、Kimi、MiniMax 等国产主流模型的高效部署。**在显存受限的场景下，TokenSpeed 通过激进的量化策略和算子融合，实现比 vLLM 更高的推理吞吐。**

[项目地址](https://github.com/lightseekorg/tokenspeed)

## 四、antirez/ds4

⭐ 573｜语言：C｜作者：antirez（Redis 作者）

antirez（Redis 创始人 Salvatore Sanfilippo）带来的新项目：ds4 是一个面向 Apple Silicon 的 DeepSeek 4 Flash 本地推理引擎，纯 C 实现、零依赖，通过 Apple Metal 进行 GPU 加速。体积极小，但推理速度在 MacBook 上表现出色。**这是 antirez 一贯极简主义工程风格的又一次精彩体现，也是本地运行前沿大模型的最轻量路径之一。**

[项目地址](https://github.com/antirez/ds4)

## 五、MayersScott/rkn-block-checker

⭐ 512｜语言：Python｜作者：MayersScott

一个分层诊断网络封锁的命令行工具，逐级检测 DNS 污染、TCP 阻断、TLS 干扰和 HTTP 过滤，精确定位 RKN/TSPU（俄罗斯国家互联网管控系统）的封锁层级。对于研究网络审查机制的安全研究员和开发者来说，这是一个清晰易用的诊断利器，同样适用于分析其他地区的互联网管控手段。

[项目地址](https://github.com/MayersScott/rkn-block-checker)
