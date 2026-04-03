---
emoji: "🌐"
title: "bb-browser 深度解析"
subtitle: "复用登录态，Agent 免认证"
---

## 🤔 为什么需要 bb-browser？

AI Agent 想帮你操控网页，最大的障碍是**身份认证**

用 Playwright 做登录任务，你需要：
- 申请 API Key（很多网站没有）
- 手写登录逻辑，维护 Cookie
- 对抗反爬策略（CAPTCHA、指纹检测）
- 处理 Token 过期和 Session 失效

**而且这只是针对一个网站，接入 10 个就要做 10 次**

bb-browser 的核心洞察很简单：
> 你已经在 Chrome 里登录了这些网站，为什么不让 Agent 直接复用你的登录态？

---

## ⚡ 与主流工具的本质区别

| 维度 | bb-browser | Playwright |
|------|-----------|-----------|
| 认证 | 复用你的登录态 | 需手写登录逻辑 |
| 反 Bot | 不存在（就是你） | 容易被检测 |
| API Key | 不需要 | 不需要但要自己实现 |
| 运行环境 | 你的真实 Chrome | 独立无头浏览器 |
| 站点适配 | 36 平台 103 命令 | 通用，你自己实现 |

**关键区别：bb-browser 运行在你的真实 Chrome 里，网站看到的就是一个正常的已登录用户**

---

## 🛠 在 Claude Code 中使用

在 MCP 配置中加入：

```json
{
  "mcpServers": {
    "bb-browser": {
      "command": "npx",
      "args": ["-y", "bb-browser", "--mcp"]
    }
  }
}
```

挂载后 Claude 获得 25+ 浏览器操控工具

**场景：搜索 Twitter 并总结**

你说：「搜下 Twitter 上对 Claude Code 的评价」

Claude 自动执行：
1. `site_run("twitter/search", ["Claude Code"])`
2. bb-browser 用你的 Twitter 登录态执行搜索
3. 返回 JSON 格式推文列表
4. Claude 归类总结，返回给你

**全程零 API Key，零 OAuth 配置**

---

## 🏗 三层架构

```
CLI / MCP Server（入口层）
       ↓ HTTP
Daemon 守护进程（控制层）
       ↓ WebSocket
Chrome DevTools Protocol（你的 Chrome）
```

CLI 或 MCP 把命令通过 HTTP 发给 Daemon

Daemon 通过 CDP WebSocket 控制 Chrome 执行

再把结果返回

---

## 🔑 核心魔法：fetch() 借用登录态

bb-browser 不是自己构造 HTTP 请求

而是**在页面的 JS 上下文里执行 fetch()**

```javascript
(async () => {
  const resp = await fetch(url, {
    credentials: "include" // 自动携带 Cookie
  });
  return await resp.json();
})()
```

通过 CDP 的 `Runtime.evaluate` 注入页面执行

浏览器把它当作正常用户操作

**Cookie 全部自动带上** ✅

---

## 🌳 不用像素，用语义树

很多工具靠截图让 Vision 模型判断点哪里

bb-browser 用**可访问性树（Accessibility Tree）**：

```
- form [ref=@2]
  - textbox [ref=@3] "搜索"
  - button [ref=@4] "搜索"
- list [ref=@5]
  - link [ref=@7] "结果标题"
```

每个元素一个 @N 编号

后续操作直接用编号定位：`click @3`

**比截图精确，Token 消耗小几个数量级**

---

## ⚠️ 安全与改进空间

**安全风险**：
- 早期版本无鉴权、CORS 全开、用 eval() 执行
- 现已修复（Bearer Token + CORS 限制）
- 但 localhost 攻击面仍存在

**适合**：个人本地使用
**不适合**：敏感账号、暴露给外部网络

**其他局限**：
- 仅支持 Chrome/Chromium
- 站点适配器依赖社区维护，可能过时
- Canvas/WebGL 页面语义树无能为力

---

## 💡 总结

bb-browser 把「用浏览器上网」这件最平常的事，变成了 Agent 可编程复用的能力

**核心公式**：

你的登录态 + CDP 直连 + 语义树 = Agent 的浏览器超能力

> 你已经登录了那些网站，何不让 Agent 也用上？

📌 GitHub: github.com/epiral/bb-browser
⭐ 3.7k Stars | 36 平台 | 103 命令
