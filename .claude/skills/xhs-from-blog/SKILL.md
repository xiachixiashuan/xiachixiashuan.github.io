---
name: xhs-from-blog
description: 把本仓库里的 Jekyll 博客文章转换成小红书图文帖素材。用于任何需要将一篇多章节博客文章改写为"一章一卡、emoji 丰富、短句速读"的小红书风格卡片素材时。生成渲染就绪的 Markdown 源文件并可选择调用本机的 Auto-Redbook-Skills 渲染器产出 PNG 卡片。
---

# 博客文章 → 小红书图文帖素材

把一篇 `_posts/YYYY-MM-DD-xxx.md` 转换为小红书图文帖素材：**每个 H2 章节生成一张卡片**，配以丰富 emoji 与极简短句，方便直接发布。

## 核心规则

1. **一章一卡**：源文章里每个 `## H2` 章节对应一张正文卡片；再加一张封面卡片，总共 `N+1` 张。
2. **emoji 密度高**：每张卡片至少 4 个 emoji，平均每 1–2 行一个；标题里也要带。但不要滥用同一个 emoji。
3. **短句速读**：每张卡片正文 ≤ 120 字、≤ 6 行；句式短，避免长段落；用 emoji 作为视觉项目符号。
4. **信息保真**：不虚构数据，关键数字、项目名、链接必须来自源文章。
5. **封面抓眼球**：封面用 ≤ 15 字的主标题 + ≤ 15 字的副标题，配一个主题 emoji。

## 输入与输出

**输入**：`_posts/YYYY-MM-DD-slug.md`（Jekyll 博客文章，至少 2 个 H2 章节）

**输出目录**：`assets/xhs-source/YYYY-MM-DD-slug/`
- `cards.md` — 渲染就绪的 Markdown（提交进 git）
- 渲染后的 PNG 卡片写入 `assets/xhs-output/YYYY-MM-DD-slug/`（已 gitignore）

## 工作流程

### 1. 读源文件，提取章节
读 `_posts/` 下的源文章。抓出：
- 文章标题（frontmatter `title`）
- 每个 H2 的标题与内容（包括其下的 H3 子结构、列表、链接）

### 2. 生成 cards.md
在 `assets/xhs-source/YYYY-MM-DD-slug/cards.md` 写入下列结构，使用 `---` 手动分隔每张卡片：

```markdown
---
emoji: "🔥"
title: "封面主标题(≤15字)"
subtitle: "封面副标题(≤15字)"
---

# 🔥 封面卡上的大标题

✨ 一句话钩子
📌 今天聊什么
👉 重点提炼 3 条

---

# 一、{章节标题}{emoji}

🏷️ 一行关键信息/数据
✨ 第二行短句
💡 第三行洞察
🛠️ 第四行行动点

👉 {如果源章节有链接/CTA，放这里}

---

# 二、{下一章节}{emoji}
...
```

**改写要点**：
- 把原文的长段落压缩成 3–5 条短句，每条短句前加 emoji
- 原文中的加粗 `**xx**` 可以保留，它们在卡片里会以彩色高亮
- 原文的链接只保留 1 个最重要的，放在卡片最后一行
- 保留原文的 ⭐ star 数、作者、语言等结构化元信息

### 3. 渲染卡片（本机运行时执行；远程沙盒跳过此步）
本机有 `~/.claude/skills/Auto-Redbook-Skills/` 时：

```bash
mkdir -p assets/xhs-output/YYYY-MM-DD-slug
node ~/.claude/skills/Auto-Redbook-Skills/scripts/render_xhs.js \
  assets/xhs-source/YYYY-MM-DD-slug/cards.md \
  -t terminal \
  -m separator \
  -o assets/xhs-output/YYYY-MM-DD-slug
```

默认主题：`terminal`（黑底、适配这个博客的整体风格）。备选：`playful-geometric`（彩色鲜活）、`sketch`（手绘感）、`neo-brutalism`（粗野）、`botanical`（柔和）。

如果渲染器不存在（例如远程 CCR 沙盒），只完成第 1–2 步并提交 `cards.md`，后续由本机补渲染。

### 4. 提交
```bash
git add assets/xhs-source/YYYY-MM-DD-slug/cards.md
```
`assets/xhs-output/` 已经在 `.gitignore` 里，不会被提交。

## emoji 使用建议

按章节主题选 emoji，而不是随机撒：

| 场景 | 常用 emoji |
|---|---|
| AI/模型 | 🤖 🧠 🦾 ✨ 🔮 |
| 代码/开发 | 🛠️ ⚙️ 💻 🧩 🔧 |
| 安全/漏洞 | 🔒 🛡️ 🚨 ⚠️ 🕵️ |
| 数据/增长 | 📈 📊 💹 🔥 ⭐ |
| 新闻/爆点 | 📣 🚀 💥 🎯 👀 |
| 警示/争议 | ⚡ 💣 🤔 ❗ 🔴 |
| 行动/CTA | 👉 ✅ 📌 🎁 🔗 |

封面 emoji 与内容 emoji 要呼应主题。

## 常见错误

- ❌ 原样复制博客正文大段落
- ❌ 一张卡片 > 6 行或 > 120 字
- ❌ 忘记 `---` 分隔导致所有内容渲染成一张卡
- ❌ 编造源文章里没有的数据或链接
- ❌ emoji 堆在一起像乱码，而不是作为项目符号

## 验证
生成后：
1. 确认 `cards.md` 开头是 frontmatter
2. 统计 `---` 数量应等于章节数（N 个 H2 → N+1 张卡，分隔符为 N 个）
3. 本机渲染后，`assets/xhs-output/YYYY-MM-DD-slug/` 应产出 `cover.png` + `card_1.png`…`card_N.png`
