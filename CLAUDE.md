# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese-language AI research & tech blog built with Jekyll, hosted on GitHub Pages. Site title: `xiachixiashuan`.

## Build & Preview

```bash
bundle exec jekyll serve        # Local dev server at localhost:4000
bundle exec jekyll build        # Build to _site/
```

Push to `master` branch deploys automatically via GitHub Pages.

## Writing Articles

**Frontmatter format:**
```yaml
---
layout: post
title: "文章标题"
date: YYYY-MM-DD
categories: AI          # optional
---
```

**Post conventions:**
- File naming: `_posts/YYYY-MM-DD-slug.md`
- Repeat title as H1 immediately after frontmatter
- H2 for major sections (numbered 一、二、三)
- H3 for subsections (numbered 2.1, 2.2, 3.1)
- Language: formal but accessible Chinese, use metaphors for complex concepts
- Bold (`**text**`) for key takeaways
- Code blocks with language specified
- Reference links at the end
- TOC auto-generates from H2/H3 headings (2+ required) via JS in `post.html`

## Architecture

- **`_config.yml`**: Kramdown markdown processor, jekyll-seo-tag plugin
- **`_layouts/`**: Three layouts — `default.html` (base with header/footer), `home.html` (wrapper), `post.html` (article with auto-TOC)
- **`assets/css/style.css`**: Dark theme (bg `#0a0e17`), Inter + JetBrains Mono fonts, indigo/cyan accent colors
- **`index.html`**: Home page with hero section + post card grid
- **`assets/images/`**: Static images (GIFs, diagrams)
- **`assets/xhs-output/`**: Generated Xiaohongshu card images (not committed)

## Xiaohongshu Card Generation

The `Auto-Redbook-Skills` skill is installed at `~/.claude/skills/Auto-Redbook-Skills/`. To render article content as XHS image cards:

```bash
node ~/.claude/skills/Auto-Redbook-Skills/scripts/render_xhs.js <markdown_file> -t terminal -m auto-split -o <output_dir>
```

Themes: `terminal` (dark), `sketch`, `default`, `playful-geometric`, `neo-brutalism`, `botanical`, `professional`, `retro`. Modes: `separator`, `auto-fit`, `auto-split`, `dynamic`.
