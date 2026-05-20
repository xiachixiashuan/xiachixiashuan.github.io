---
layout: post
title: "GitHub 周榜 Top5｜2026-05-20"
date: 2026-05-20
categories: GitHub
---

# GitHub 周榜 Top5｜2026-05-20

本周 GitHub 涌现出一批值得关注的开源新项目，覆盖多模态大模型、自进化 AI Agent、文本生成、漏洞发现 Agent 以及 AI Agent 学习课程，全部在过去 7 天内诞生，星标增速亮眼。以下逐一拆解。

---

## 一、bytedance/Lance

⭐ 314 ｜ Python ｜ 作者：ByteDance

字节跳动开源了 **Lance**，一个拥有 30 亿激活参数的原生统一多模态模型，支持图像与视频理解。该模型采用"统一"架构，无需在视觉编码器和语言解码器之间做外挂式拼接，直接在同一套参数里处理图像、视频和文本。在图像理解、视频问答等多项基准上，Lance 表现出与同量级闭源模型相竞争的能力。对于希望在本地部署轻量级多模态能力的研究者和工程师，这是一个值得关注的起点。

[项目地址](https://github.com/bytedance/Lance)

---

## 二、sapientinc/HRM-Text

⭐ 400 ｜ Python ｜ 作者：sapientinc

**HRM-Text** 是一个基于 HRM（Hierarchical Reasoning Model）架构的 10 亿参数文本生成模型。HRM 架构的核心思路是引入层次化推理单元，让模型在生成时能够进行多层次的内部"思考"，而不仅仅是逐 token 解码。官方称已通过任务专项增强训练，在代码生成、逻辑推理等垂直场景中表现优于同参数量的标准 Transformer 模型。代码和权重均已开放，适合研究架构创新的团队试验。

[项目地址](https://github.com/sapientinc/HRM-Text)

---

## 三、agentic-in/elephant-agent

⭐ 345 ｜ Python ｜ 作者：agentic-in

**Elephant Agent** 提出"个人模型优先、自进化"的设计理念。它能够在运行过程中持续更新自己的知识库和行为策略，像大象一样拥有"长期记忆"——不依赖外部向量数据库，而是将经验直接内化进 Agent 的提示链路与内存结构中。项目采用模块化设计，支持插件式技能扩展，可以接入网络搜索、代码执行等工具，是探索 Agent 自我改进路径的有趣实验。

[项目地址](https://github.com/agentic-in/elephant-agent)

---

## 四、evilsocket/audit

⭐ 292 ｜ Python ｜ 作者：evilsocket

**audit** 是安全研究员 evilsocket（Simone Margaritelli）开源的一款 8 阶段漏洞发现 Agent。它将代码安全审计拆解为侦察、漏洞假设生成、精准分析、概念验证构造等多个自主推进的阶段，全程由 LLM 驱动，减少人工翻阅代码的负担。evilsocket 以 bettercap、pwnagotchi 等知名安全工具著称，这款 Agent 延续了其"自动化渗透测试"的一贯风格。适合安全团队在合法授权范围内进行自动化代码审计。

[项目地址](https://github.com/evilsocket/audit)

---

## 五、Callous-0923/agent-study

⭐ 287 ｜ HTML ｜ 作者：Callous-0923

**agent-study** 是一套 36 章的 AI Agent 全栈课程，从 ReAct 循环讲到 Claude Code 逆向、MCP/A2A 协议、RAG、DSPy、生产可观测性，所有内容以可直接运行的 Python 文件呈现。课程涵盖当前 Agent 工程落地的主流技术栈，对想系统学习 Agent 开发的工程师而言是难得的中文系统资料。代码即文档，无需额外搭环境，clone 后即可逐章实验。

[项目地址](https://github.com/Callous-0923/agent-study)
