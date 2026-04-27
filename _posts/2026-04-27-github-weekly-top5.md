---
layout: post
title: "GitHub 周榜 Top5｜2026-04-27"
date: 2026-04-27
categories: GitHub
---

# GitHub 周榜 Top5｜2026-04-27

本周 GitHub 涌现出一批值得关注的新项目——从 GPT-Image-2 工业级提示词库、AI 驱动的游戏精灵图生成器，到腾讯超大规模推理模型，以及用 Go 构建的隐私网络穿透工具和受日本列车调度启发的智能体矩阵运行时。以下是精选的 5 个本周新星。

## 一、freestylefly/awesome-gpt-image-2

⭐ 612 ｜ 综合 ｜ freestylefly

"Prompt as Code"——这是 awesome-gpt-image-2 的核心理念。项目对 **329 个真实 GPT-Image-2 案例进行了逆向工程**，提炼出 13 套工业级提示词模板，覆盖电商、广告、产品设计等主流场景。无论是刚接触图像生成的新手还是需要批量产图的专业用户，都能从这个精心整理的提示词库中找到可以直接复用的参考范例。

[项目地址](https://github.com/freestylefly/awesome-gpt-image-2)

## 二、0x0funky/agent-sprite-forge

⭐ 567 ｜ Python ｜ 0x0funky

agent-sprite-forge 是一款**专为游戏开发设计的 AI 智能体工具**，能自动生成 2D 精灵图表（Sprite Sheet）和游戏地图，输出带透明通道的 PNG 帧序列，可直接导入 Unity、Godot 等主流引擎。项目以 Agent Skill 形式封装，开发者只需描述角色外观和动作，即可批量产出游戏资产，大幅缩短独立开发者的美术制作周期。

[项目地址](https://github.com/0x0funky/agent-sprite-forge)

## 三、NullLatency/FlowDriver

⭐ 377 ｜ Go ｜ NullLatency

FlowDriver 是一个用 Go 编写的**网络隐蔽穿透工具**，将 SOCKS5 流量封装在合法的 Google 服务请求中，从而绕过深度包检测（DPI）和严格的企业/国家防火墙。项目设计轻量，单二进制部署，无需额外依赖，特别适合需要在受限网络环境中维持稳定连接的开发者和运维人员。

[项目地址](https://github.com/NullLatency/FlowDriver)

## 四、chekusu/wanman

⭐ 362 ｜ TypeScript ｜ chekusu

Wanman 的灵感来自日本单人驾驶列车系统（ワンマン運転）——一个驾驶员掌控全局。这个开源**智能体矩阵运行时**以相同理念构建：每条"线路"（Agent Pipeline）由最少的资源运转最多的任务。基于 TypeScript 实现，天然适配现代 Web 生态，可与 Node.js 无缝集成，为构建高并发、低开销的多智能体系统提供了新思路。

[项目地址](https://github.com/chekusu/wanman)

## 五、Tencent-Hunyuan/Hy3-preview

⭐ 250 ｜ Python ｜ Tencent-Hunyuan

腾讯混元团队发布的 **Hy3 推理与智能体模型预览版**，参数规模达 295B（21B 激活参数），在同规模模型中属于领先水平。Hy3 专为复杂推理链和长上下文 Agent 任务优化，支持多步骤规划与工具调用。作为腾讯首个公开的大规模推理模型预览，这次发布标志着国内大厂在自研基础模型上的重要进展。

[项目地址](https://github.com/Tencent-Hunyuan/Hy3-preview)
