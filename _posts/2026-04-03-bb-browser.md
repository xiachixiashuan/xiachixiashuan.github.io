---
layout: post
title: "bb-browser：用你的浏览器登录态，让 AI agent 无需 API Key 操控任何网站"
date: 2026-04-03
categories: AI
---

# bb-browser：用你的浏览器登录态，让 AI agent 无需 API Key 操控任何网站

> "Your browser is the API. No keys. No bots. No scrapers."

这句话是 bb-browser 创始人 yan5xu 在发布时写的。听起来像噱头，但读完代码之后，你会发现它说的是实话。

bb-browser 是一个开源工具，让 AI agent 可以直接复用你已经登录的浏览器状态来操控网页——不需要申请 API key，不需要处理 OAuth，不需要担心反爬策略。截至写这篇文章时，它在 GitHub 上有 3.7k star，并已经被纳入 MCP（Model Context Protocol）生态，可以直接被 Claude Code 这类 AI 编码助手调用。

这篇文章会从四个角度拆解 bb-browser：它为什么存在、怎么用、怎么实现的、还有什么可以改进。

## 一、为什么需要 bb-browser？

### 1.1 Web 自动化的老问题

现有的浏览器自动化工具不是没有，Playwright、Puppeteer 早就成熟了。但它们解决的是一个不同的问题：**测试和通用自动化**。

用 Playwright 做一个需要登录的任务，你要：

1. 申请目标网站的 API key（如果有的话）
2. 或者用代码模拟登录流程，维护 cookie / session
3. 应对网站的反机器人策略（CAPTCHA、行为指纹、User-Agent 检测……）
4. 处理 token 过期、session 失效的边界情况

而且这还是针对一个网站。你要接入 10 个网站，就要做 10 次。

更根本的问题是：**大多数网站根本没有 API**。Twitter 的 API 以前免费，现在贵得离谱；小红书没有开放 API；B 站的内部接口随时可能变；知乎的反爬一直在加强。LLM 时代最大的信息孤岛不是数据库，而是那些只有登录用户才能看到的 web 内容。

### 1.2 bb-browser 的核心洞察

bb-browser 的切入点非常简单：**你自己就是那个已经通过身份验证的用户，你的浏览器里存着所有 cookie 和 session token**。

与其让 agent 从零开始处理身份认证，不如直接借用你已有的登录态。你在 Chrome 里登录了 Twitter，bb-browser 就能让 agent 用你的身份发帖、搜索、读消息——网站看到的请求和你手动操作没有区别。

这个洞察带来了一个根本性的优势：**不检测**。Playwright 之所以容易被识别为 bot，是因为它启动的是一个独立的无头浏览器实例，行为特征和真实用户差异明显。bb-browser 不是这样——它运行在你的真实 Chrome 实例里，通过 Chrome DevTools Protocol（CDP）控制，网站看到的是一个正常的已登录用户。

### 1.3 与主流工具的对比

| 维度 | bb-browser | Playwright / Puppeteer | browser-use | Browserbase |
|------|-----------|----------------------|-------------|-------------|
| 身份认证 | 复用你的登录态，零配置 | 需要手写登录逻辑或管理 cookie | 需要手写 | 云端自动管理 |
| 反 bot 检测 | 不存在（就是你自己） | 容易被检测 | 容易被检测 | 内置反检测 |
| API key | 不需要 | 不需要，但需要你自己实现认证 | 不需要 | 商业服务 |
| 运行环境 | 本地真实 Chrome | 本地或 CI 无头浏览器 | 本地 | 云端 |
| 站点适配 | 36 个平台，103 个命令，开箱即用 | 通用，你自己实现 | 通用 | 通用 |
| 适合场景 | Agent 的有状态 web 访问 | 自动化测试、通用爬虫 | 简单 AI 任务 | 企业级大规模 |

## 二、如何使用

### 2.1 安装与启动

```bash
npm install -g bb-browser
```

安装之后，第一次运行任何命令时，bb-browser 会自动在后台启动一个 daemon 进程，通过 CDP 连接到你的 Chrome 浏览器。

### 2.2 基础命令

**打开网页和快照：**

```bash
# 打开一个页面
bb-browser open https://github.com

# 获取页面的可访问性树（semantic DOM 结构）
bb-browser snapshot

# 只显示可交互元素
bb-browser snapshot -i

# 截图
bb-browser screenshot
```

**与页面交互：**

```bash
# 点击元素（@3 是 snapshot 返回的 ref 编号）
bb-browser click @3

# 填写输入框
bb-browser fill @5 "搜索关键词"

# 执行任意 JavaScript
bb-browser eval "document.title"

# 用你的登录态发送 fetch 请求
bb-browser fetch https://api.example.com/data --json
```

**查看浏览器状态：**

```bash
# 查看网络请求（只看上一次操作之后的）
bb-browser network requests --since last_action --json

# 查看 console 输出
bb-browser console

# 查看 JavaScript 报错
bb-browser errors
```

**标签页管理：**

```bash
# 列出所有标签页
bb-browser tab list

# 在特定标签页执行命令
bb-browser --tab c416 snapshot
```

### 2.3 Site 适配器：开箱即用的站点命令

这是 bb-browser 最有用的部分。它提供了一套社区维护的「站点适配器」，针对主流网站封装好了常用操作：

```bash
# 搜索 Twitter
bb-browser site twitter/search "AI agents"

# 获取知乎热榜
bb-browser site zhihu/hot

# 搜索 arXiv 论文
bb-browser site arxiv/search "transformer architecture"

# 查股票（东方财富）
bb-browser site eastmoney/stock "茅台"

# Boss 直聘搜岗位
bb-browser site boss/search "AI engineer"

# Wikipedia 摘要
bb-browser site wikipedia/summary "Python"

# YouTube 视频字幕
bb-browser site youtube/transcript VIDEO_ID

# 搜 Stack Overflow
bb-browser site stackoverflow/search "async await"
```

所有命令都支持 `--json` 输出，方便接入 agent 的处理流程：

```bash
bb-browser site twitter/search "Claude Code" --json | jq '.tweets[].text'
```

### 2.4 作为 MCP Server 使用

bb-browser 支持以 MCP Server 的形式挂载到 Claude Code、Cursor 等工具里：

```json
{
  "mcpServers": {
    "bb-browser": {
      "command": "bb-browser",
      "args": ["mcp"]
    }
  }
}
```

挂载之后，Claude Code 就能直接调用 `browser_snapshot`、`browser_click`、`browser_eval`、`site_run` 等工具，让 AI agent 拥有真实的浏览器操控能力。

## 三、实现原理

### 3.1 整体架构

bb-browser 是一个三层架构：

```
┌─────────────────────────────────────────────┐
│              前端层（入口）                   │
│   CLI (bb-browser) / MCP Server             │
└──────────────────┬──────────────────────────┘
                   │  HTTP
┌──────────────────▼──────────────────────────┐
│              Daemon 层（后台守护进程）         │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐  │
│  │ HTTP 服务  │ │ CDP 连接  │ │ 标签页状态  │  │
│  │           │ │ 管理器    │ │ 管理器     │  │
│  └───────────┘ └──────────┘ └────────────┘  │
└──────────────────┬──────────────────────────┘
                   │  WebSocket (CDP 协议)
┌──────────────────▼──────────────────────────┐
│         Chrome DevTools Protocol             │
│              （你的真实 Chrome）               │
└─────────────────────────────────────────────┘
```

CLI 或 MCP Server 把命令通过 HTTP 发给 Daemon，Daemon 通过 CDP WebSocket 控制 Chrome 执行，再把结果返回。

### 3.2 两阶段启动

第一次运行命令时，bb-browser 会在后台启动 daemon 进程。Daemon 采用两阶段启动策略：

1. **第一阶段**：HTTP 服务立刻就绪，开始接收命令（命令先排队等待）
2. **第二阶段**：异步建立 CDP WebSocket 连接（最多等待 5 秒），连接成功后开始消费命令队列

这样做的好处是：Chrome 启动慢也不会让用户感觉到超时，命令在 CDP 就绪后会自动执行。Daemon 启动后会把自己的 PID 和 bearer token 写入 `~/.bb-browser/daemon.json`，CLI 每次启动时先检查这个文件判断 daemon 是否存活，不在就重新拉起。

### 3.3 Accessibility Tree：不用像素，用语义

很多浏览器自动化工具依赖截图——把画面截下来，让 vision 模型判断要点哪里。bb-browser 选择了另一条路：**可访问性树（Accessibility Tree）**。

`snapshot` 命令会把一段 JavaScript 注入到页面里执行，这段脚本递归遍历 DOM，把每个元素转换成语义化的树结构：

```
- main [ref=@1]
  - form [ref=@2]
    - textbox [ref=@3] "搜索" <input>
    - button [ref=@4] "搜索" <button>
  - list [ref=@5]
    - listitem [ref=@6]
      - link [ref=@7] "结果标题" <a>
```

每个节点都有一个 `@N` 形式的引用编号（ref）。后续的 click、fill 等命令直接用这个编号来定位元素，比 CSS 选择器更稳定，比截图更精确，token 消耗也少得多——一棵语义树比一张截图小几个数量级。

Ref 的解析是懒加载的：daemon 缓存每个 ref 对应的 XPath 和 DOM 节点 ID，需要时才去 CDP 里查，结果再缓存起来供下次使用。

### 3.4 核心魔法：fetch() 借用登录态

bb-browser 最强的能力之一是 `fetch` 命令。它不是自己构造 HTTP 请求，而是在页面的 JavaScript 上下文里执行 `fetch()`——这意味着请求天然携带了页面的 cookie 和 session：

```javascript
// fetch 命令内部构造的 JS 字符串（简化版）
(async () => {
  const resp = await fetch("https://api.twitter.com/2/tweets/search/recent", {
    method: "GET",
    credentials: "include",   // ← 关键：自动携带 cookie
    headers: { ... }
  });
  return JSON.stringify({ status: resp.status, body: await resp.json() });
})()
```

这段脚本通过 CDP 的 `Runtime.evaluate` 注入页面执行。因为是在页面的 JavaScript 上下文里跑，浏览器把它当作正常的用户操作，cookie 全部自动带上。

Site 适配器也用同样的思路，但层次更高。以 Tier 2 适配器（需要 CSRF token）为例：

```javascript
// 站点适配器伪代码（以某平台为例）
async function searchTweets(args) {
  // 从页面上下文里取出 CSRF token
  const csrfToken = document.cookie.match(/ct0=([^;]+)/)?.[1];
  
  const resp = await fetch("/2/search/adaptive.json?q=" + args.query, {
    credentials: "include",
    headers: {
      "authorization": "Bearer ...",
      "x-csrf-token": csrfToken    // CSRF token 从页面拿
    }
  });
  return await resp.json();
}
```

Tier 3 适配器（针对高度 SPA 化的网站）更激进——直接访问页面的 webpack bundle，调用网站自己内部的 API 函数：

```javascript
// 通过 eval 调用页面的 webpack 模块（极简示意）
const pinia = window.__pinia;
const store = pinia._s.get("user");
return JSON.stringify(store.currentUser);
```

### 3.5 增量事件流：seq 号机制

Agent 做完一个操作之后，往往需要知道「这次操作之后发生了什么」。bb-browser 用一个全局递增的序列号（seq）来解决这个问题。

每个网络请求、console 输出、JavaScript 错误，都被打上一个 seq 号，存入每个标签页的环形缓冲区（网络请求保留最近 500 条，console 200 条，错误 100 条）。

查询时可以带上 `since` 参数：

```bash
# 只看上次操作（click @3）之后新产生的网络请求
bb-browser network requests --since last_action --json
```

这让 agent 能精确感知每次操作的副作用，而不需要全量拉取历史记录。对于需要多步操作的任务（填表、提交、等待跳转），这个机制让 agent 能准确判断每一步是否成功。

### 3.6 Site 适配器的生态逻辑

站点适配器本质上是一个小的 JavaScript 函数文件，头部带有 JSON 格式的 meta 信息：

```javascript
/* @meta
{
  "name": "twitter/search",
  "description": "搜索推文",
  "domain": "x.com",
  "args": { "query": { "required": true, "description": "搜索词" } },
  "readOnly": true
}
*/
async function(args) {
  // 实现逻辑
}
```

适配器分三级查找：私有适配器（`~/.bb-browser/sites/`）> 社区适配器（`~/.bb-browser/bb-sites/`）> 内置适配器。`bb-browser site update` 拉取最新的社区适配器。

目前社区仓库 [bb-sites](https://github.com/epiral/bb-sites) 已收录 36 个平台、103 个命令，覆盖了主流的社交平台、求职网站、学术数据库和金融平台。

## 四、还有什么改进空间

### 4.1 安全边界：这是最重要的问题

bb-browser 早期版本被安全研究者发现了几个严重漏洞，集中暴露了一个核心问题：**daemon 接受来自 localhost 的任何请求，任何访问了你浏览器的恶意网页都可以调用 daemon 的 API**。

具体的漏洞包括：
- 早期版本的 HTTP 接口没有鉴权
- CORS 设置为 `Access-Control-Allow-Origin: *`，允许任何网页从 JS 调用 localhost
- 命令 dispatch 直接用了 `eval()`，没有输入校验

目前版本已经加入了 Bearer token 认证、CORS 限制、结构化 command dispatch。但根本性的风险仍然存在：**它运行在 localhost，而 localhost 对所有在浏览器里打开的页面都是可见的**。一个精心构造的恶意网页可以尝试利用这个攻击面。

所以目前 bb-browser 适合**个人本地使用**，不适合把 daemon 暴露给外部网络，也不适合用于处理敏感账号（银行、医疗）。

### 4.2 站点适配器的维护成本

36 个平台、103 个命令，听起来不少，但网站的 API 结构随时在变。一旦某个平台更新了内部接口路径或 CSRF 机制，对应的适配器就会失效。社区维护的模式决定了这个问题会一直存在——活跃度高的平台更新快，冷门适配器可能长期 broken。

理想的解法是让 agent 自动发现和更新适配器。bb-browser 有一个 `site recommend` 命令（分析你的浏览器历史，推荐可以写适配器的网站），思路是对的，但自动**生成**和**测试**适配器目前还需要人工介入。

### 4.3 Chrome 单一依赖

目前 bb-browser 只支持 Chrome/Chromium，通过 CDP 协议控制。Firefox 和 Safari 的 CDP 兼容性不完整，暂时无法支持。对于需要在非 Chrome 环境下工作的场景（比如需要 Safari 的 iOS 模拟），还不是一个选项。

### 4.4 多用户和远程场景

bb-browser 的设计假设是「本地单用户」——daemon 运行在你自己的机器上，复用你自己的浏览器登录态。如果你想在 CI/CD 或云服务器上跑，就需要在远程机器上维护一个有登录态的 Chrome 实例，这个维护成本不低。

Browserbase 这类商业服务专门解决这个问题，但代价是：你的认证信息在别人的服务器上。bb-browser 目前还没有「团队共享」或「远程代理」的方案。

### 4.5 Accessibility Tree 的局限

用 accessibility tree 代替截图在大多数情况下更高效，但有两类场景它处理不好：

1. **canvas / WebGL 渲染的页面**：游戏、地图、数据可视化——这些内容不在 DOM 里，accessibility tree 拿不到任何有意义的信息。
2. **高度动态的 shadow DOM**：部分现代 web 组件用了 shadow DOM，accessibility tree 无法穿透。

对这些场景，回退到截图 + vision 模型可能是必要的。bb-browser 有 `screenshot` 命令，但把它和 accessibility tree 联合使用的 workflow 还没有标准化。

## 五、总结

bb-browser 做的事情本质上是：**把「用浏览器上网」这件人类最习以为常的事，变成了 AI agent 可以程序化复用的能力**。

它的核心洞察并不复杂——复用已有的登录态比重新建立认证更简单——但工程实现很精巧：CDP 直连避开了对 Playwright 这类额外抽象层的依赖，accessibility tree 比截图更适合 LLM 理解，seq 号机制让 agent 能精确感知操作副作用，fetch-in-page 让认证请求完全透明。

目前它最适合的场景是：**个人 agent 在本地需要访问有登录态的 web 内容**。3.7k star 和快速增长的站点适配器生态说明这个需求是真实存在的。安全边界和维护成本是它在生产级多用户场景大规模落地之前需要解决的主要问题。

如果你正在构建一个需要访问 web 内容的本地 agent，bb-browser 值得作为第一选择试一试——毕竟你已经登录了那些网站，何不让 agent 也用上？

---

**参考资源**

- [bb-browser GitHub](https://github.com/epiral/bb-browser)
- [bb-sites 社区适配器仓库](https://github.com/epiral/bb-sites)
- [Hacker News 讨论](https://news.ycombinator.com/item?id=47396414)
- [bb-browser 安全审计报告](https://medium.com/@linglijunmail/ai-browser-tool-security-audit-critical-vulnerabilities-9b6ad396e3ec)
- [awesome-agent-native-services](https://github.com/haoruilee/awesome-agent-native-services)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
