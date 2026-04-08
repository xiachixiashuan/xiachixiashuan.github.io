---
name: xhs-from-blog
description: 把本仓库里的 Jekyll 博客文章转换成小红书图文帖素材。用于将一篇多章节博客改写成「一章一卡」的小红书卡片，产出 YAML 结构化数据并由本地渲染器生成 PNG。风格：亮蓝渐变封面 + 浅蓝卡片 + 白色圆角子卡 + 编号徽章，2×2 emoji 图标格子（参考主流科技类小红书帖子）。
---

# 博客 → 小红书卡片素材

把 `_posts/YYYY-MM-DD-xxx.md` 转成一套小红书图文帖：**每个 H2 章节一张卡片**，封面 + N 张。

## 视觉风格（锁定）

- **封面**：深蓝渐变（#3B7EE8 → #2550C0）+ 大号 emoji + 白色粗体中文标题 + 副标题 + 玻璃态 hashtag 胶囊 + footer
- **内容卡**：浅蓝渐变（#E6EFFE → #F4F8FF → #FFFFFF）+ 圆形编号徽章 + 中文大标题 + 英文 sub-title + 白色 repo 头卡 + **2×2 白色圆角子卡**（每个有 emoji 图标、粗体标题、灰色小描述）+ 右下角页码

这个风格由 `.claude/skills/xhs-from-blog/render.js` 固化，**不要**用 `~/.claude/skills/Auto-Redbook-Skills` 的通用主题（terminal/sketch 等）去渲染。

## 输入 & 输出

| | 路径 |
|---|---|
| 输入 | `_posts/YYYY-MM-DD-slug.md`（Jekyll 博客） |
| 数据中间件 | `assets/xhs-source/YYYY-MM-DD-slug/cards.yml`（提交进 git） |
| 图片产物 | `assets/xhs-output/YYYY-MM-DD-slug/`（gitignore，不提交） |
| 渲染器 | `.claude/skills/xhs-from-blog/render.js`（提交，跨机器可复用） |

## 工作流程

### 1. 读源文件
读 `_posts/...md`，抓出 frontmatter title、每个 H2 章节的标题/数据点/链接。

### 2. 写 `cards.yml`
在 `assets/xhs-source/YYYY-MM-DD-slug/cards.yml` 按下面结构写入：

```yaml
date: "YYYY-MM-DD"
cover:
  emoji: "🔥"                      # 主题 emoji，一个即可
  title_line1: "封面主标题第一行"   # ≤8 汉字
  title_line2: "封面主标题第二行"   # ≤8 汉字
  subtitle_lines:                   # 3 行左右，每行 ≤15 汉字
    - "第一行副标题"
    - "第二行副标题"
    - "第三行副标题"
  tags:                             # 4-6 个，作为 hashtag 胶囊
    - 标签一
    - 标签二
  footer: "系列名 · 日期"

items:
  - number: "01"                    # 编号徽章，字符串
    section_title: "章节中文标题"    # ≤12 汉字
    section_en: "ENGLISH SUBTITLE"  # 英文小标题，会被转大写
    section_emoji: "🦾"             # 章节末尾 emoji
    repo: "owner/repo"              # 或其他主标识符
    meta: "⭐ 18.8k · Lang · 作者"  # 一行基础信息
    bullets:                        # 恰好 4 个，形成 2×2 网格
      - icon: "🧠"
        title: "要点标题"            # ≤8 汉字，粗体
        desc: "要点描述"             # ≤20 汉字，灰色小字
      - icon: "🧩"
        title: "..."
        desc: "..."
      - icon: "💼"
        title: "..."
        desc: "..."
      - icon: "🛠️"
        title: "..."
        desc: "..."
```

**内容规则**：
- 每张卡必须恰好 **4 个 bullet**，保证 2×2 网格对称
- bullet.title ≤ 8 汉字；bullet.desc ≤ 20 汉字
- 所有数据来自源文章，不编造
- 按项目主题选 icon emoji：AI/模型 🤖🧠🦾✨🔮；代码 🛠️⚙️💻🧩🔧；安全 🔒🛡️🚨；数据 📈📊🔥⭐；行动 👉✅📌
- 每个 bullet 的 icon 不重复，封面 emoji 与章节 section_emoji 呼应内容主题

### 3. 本机渲染
```bash
mkdir -p assets/xhs-output/YYYY-MM-DD-slug
node .claude/skills/xhs-from-blog/render.js \
  assets/xhs-source/YYYY-MM-DD-slug/cards.yml \
  -o assets/xhs-output/YYYY-MM-DD-slug
```

产物：`cover.png` + `card_1.png`…`card_N.png`，全部 1080×1440 @ 2x dpr。

渲染器会从 `~/.claude/skills/Auto-Redbook-Skills/node_modules` 借用 `playwright` 和 `yaml`，**本机必须已经装过 Auto-Redbook-Skills**。

### 4. 提交
```bash
git add assets/xhs-source/YYYY-MM-DD-slug/cards.yml
git add .claude/skills/xhs-from-blog/   # 如果 skill 本身有改动
```
`assets/xhs-output/` 已 gitignore。

## 远程沙盒（CCR）下的行为

远程 CCR 沙盒没有 playwright + chromium，**不要尝试渲染**。远程只负责：
1. 按上面规则写 `cards.yml`
2. 和博客文章、`_data/trending_sent.json`、`.telegram-outbox/latest.txt` 一起进入同一个 commit 推送

本机看到新 commit 后手动（或脚本化）跑一次 `render.js` 即可出图。

## 常见错误

- ❌ bullet 数量 ≠ 4（会破坏 2×2 布局）
- ❌ bullet.title 过长导致换行挤压子卡高度
- ❌ subtitle_lines 超过 4 行（封面会被挤出画面）
- ❌ 在远程沙盒里调 render.js（没有 chromium）
- ❌ 编造源文章里没有的数据或链接
- ❌ 用 terminal / 其他黑底主题——风格已经锁定为亮蓝
