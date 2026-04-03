#!/usr/bin/env node
/**
 * md2xhs - 将 Markdown 博客全文渲染为多张小红书风格图片
 *
 * 用法: node scripts/md2xhs.js <markdown_file> [-o output_dir]
 *
 * 特点:
 * - 不精简内容，完整渲染原文
 * - 自动按高度切分，避免大片空白（允许页面超高）
 * - 暖黄科技风格主题
 */

const { chromium } = require('playwright');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

// ─── 配置 ───────────────────────────────────────────
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1440;
const MAX_CARD_HEIGHT = 1920; // 允许超高，避免空白
const DPR = 2;
const PADDING = 72;

// ─── 解析参数 ─────────────────────────────────────────
const args = process.argv.slice(2);
let inputFile = null;
let outputDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-o' && args[i + 1]) { outputDir = args[++i]; }
  else if (!inputFile) { inputFile = args[i]; }
}

if (!inputFile) {
  console.error('用法: node scripts/md2xhs.js <markdown_file> [-o output_dir]');
  process.exit(1);
}

if (!outputDir) {
  outputDir = path.join(path.dirname(inputFile), 'xhs-output');
}

// ─── 解析 Markdown ──────────────────────────────────────
const raw = fs.readFileSync(inputFile, 'utf-8');

let title = '';
let content = raw;
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (fmMatch) {
  const fm = fmMatch[1];
  content = fmMatch[2];
  const titleMatch = fm.match(/title:\s*"?([^"\n]+)"?/);
  if (titleMatch) title = titleMatch[1].trim();
}

// 移除重复 H1
const h1Match = content.match(/^\s*#\s+(.+)\n/);
if (h1Match && title && h1Match[1].trim() === title.trim()) {
  content = content.replace(/^\s*#\s+.+\n/, '');
}

const htmlContent = marked.parse(content);

// ─── CSS 主题（暖黄科技风） ─────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  width: ${CARD_WIDTH}px;
  background: #1a1a2e;
  color: #e8e6df;
  font-size: 28px;
  line-height: 1.72;
  -webkit-font-smoothing: antialiased;
}

.page-container {
  width: ${CARD_WIDTH}px;
  padding: ${PADDING}px;
  padding-bottom: 100px;
}

/* ─── 封面 ──────────────────────── */
.cover {
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${PADDING}px;
  position: relative;
  overflow: hidden;
}

.cover::before {
  content: '';
  position: absolute;
  top: -150px;
  right: -150px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(247,181,56,0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.cover::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -80px;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(78,205,196,0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.cover-tag {
  font-size: 26px;
  color: #f7b538;
  font-weight: 500;
  letter-spacing: 3px;
  margin-bottom: 36px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.cover-tag::before {
  content: '';
  width: 10px;
  height: 10px;
  background: #f7b538;
  border-radius: 50%;
  box-shadow: 0 0 12px #f7b538;
}

.cover-title {
  font-size: 76px;
  font-weight: 900;
  line-height: 1.25;
  background: linear-gradient(135deg, #f7b538 0%, #fcd34d 40%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 36px;
  position: relative;
  z-index: 1;
}

.cover-divider {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #f7b538, #4ecdc4);
  border-radius: 2px;
  margin-bottom: 36px;
  position: relative;
  z-index: 1;
}

.cover-subtitle {
  font-size: 30px;
  color: #a0a0b0;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.cover-page-num {
  position: absolute;
  bottom: 50px;
  right: ${PADDING}px;
  font-size: 24px;
  color: #505068;
  font-family: 'JetBrains Mono', monospace;
  z-index: 1;
}

/* ─── 正文卡片 ─────────────────────── */
.card {
  width: ${CARD_WIDTH}px;
  background: #1a1a2e;
  position: relative;
}

.card-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f7b538, #4ecdc4);
}

.card-content {
  padding: ${PADDING}px;
  padding-top: 36px;
}

.card-footer {
  padding: 20px ${PADDING}px 40px;
  text-align: right;
  font-size: 24px;
  color: #505068;
  font-family: 'JetBrains Mono', monospace;
}

/* ─── 排版 ──────────────────────── */
h2 {
  font-size: 40px;
  font-weight: 700;
  color: #4ecdc4;
  margin: 36px 0 16px 0;
  line-height: 1.35;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(78,205,196,0.2);
}

h3 {
  font-size: 33px;
  font-weight: 600;
  color: #f7b538;
  margin: 28px 0 12px 0;
  line-height: 1.4;
}

h4 {
  font-size: 30px;
  font-weight: 600;
  color: #fbbf24;
  margin: 22px 0 10px 0;
}

p {
  margin-bottom: 16px;
  color: #d4d0c8;
}

strong, b {
  color: #f7b538;
  font-weight: 600;
}

em, i {
  color: #4ecdc4;
  font-style: italic;
}

a {
  color: #60a5fa;
  text-decoration: none;
  border-bottom: 1px solid rgba(96,165,250,0.3);
}

/* 列表 */
ul, ol {
  margin: 12px 0;
  padding-left: 40px;
}

li {
  margin-bottom: 8px;
  color: #ccc8be;
}

li::marker {
  color: #f7b538;
}

/* 引用 */
blockquote {
  margin: 16px 0;
  padding: 16px 24px;
  background: rgba(247,181,56,0.06);
  border-left: 4px solid #f7b538;
  border-radius: 0 10px 10px 0;
  color: #c8c4ba;
}

blockquote p {
  margin: 0;
  color: #c8c4ba;
}

/* 行内代码 */
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  background: rgba(78,205,196,0.12);
  color: #4ecdc4;
  padding: 2px 8px;
  border-radius: 5px;
}

/* 代码块 */
pre {
  margin: 16px 0;
  padding: 20px;
  background: #0f0f23;
  border: 1px solid rgba(247,181,56,0.1);
  border-radius: 10px;
  overflow-x: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
}

pre code {
  background: transparent;
  color: #b8b5a8;
  padding: 0;
  font-size: 22px;
  line-height: 1.5;
}

/* 表格 */
table {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
  font-size: 24px;
}

th {
  background: rgba(247,181,56,0.12);
  color: #f7b538;
  font-weight: 600;
  padding: 10px 14px;
  text-align: left;
  border: 1px solid rgba(247,181,56,0.15);
}

td {
  padding: 8px 14px;
  border: 1px solid rgba(247,181,56,0.08);
  color: #c8c4ba;
}

tr:nth-child(even) td {
  background: rgba(247,181,56,0.03);
}

/* 分割线 */
hr {
  margin: 32px 0;
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(247,181,56,0.25), transparent);
}

img {
  max-width: 100%;
  border-radius: 10px;
  margin: 16px 0;
}
`;

// ─── HTML 生成 ──────────────────────────────────────────
function generateFullPageHtml() {
  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>${CSS}</style>
</head><body>
<div class="page-container" id="content">${htmlContent}</div>
</body></html>`;
}

function generateCoverHtml(pageCount) {
  const subtitleMatch = content.match(/^>\s*(.+)/m) || content.match(/^([^#\n].{10,80})/m);
  const subtitle = subtitleMatch ? subtitleMatch[1].replace(/[>"*]/g, '').trim() : '';

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>${CSS}</style>
</head><body>
<div class="cover">
  <div class="cover-tag">TECH BLOG</div>
  <div class="cover-title">${title}</div>
  <div class="cover-divider"></div>
  <div class="cover-subtitle">${subtitle}</div>
  <div class="cover-page-num">1 / ${pageCount + 1}</div>
</div>
</body></html>`;
}

function generateCardHtml(htmlSlice, pageNum, totalPages) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>${CSS}</style>
</head><body>
<div class="card">
  <div class="card-header"></div>
  <div class="card-content">${htmlSlice}</div>
  <div class="card-footer">${pageNum} / ${totalPages}</div>
</div>
</body></html>`;
}

// ─── 主流程 ──────────────────────────────────────────
async function main() {
  console.log(`📖 读取文件: ${inputFile}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: CARD_WIDTH, height: MAX_CARD_HEIGHT },
    deviceScaleFactor: DPR,
  });

  // Step 1: 测量所有顶层元素位置
  console.log('📏 测量内容...');
  const measurePage = await context.newPage();
  await measurePage.setContent(generateFullPageHtml(), { waitUntil: 'networkidle' });
  await measurePage.waitForTimeout(1500);

  const elements = await measurePage.evaluate(() => {
    const container = document.getElementById('content');
    const children = container.children;
    const result = [];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      result.push({
        index: i,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        tagName: children[i].tagName,
      });
    }
    return result;
  });

  const totalHeight = elements.length > 0 ? elements[elements.length - 1].bottom : 0;
  console.log(`📏 总内容高度: ${Math.round(totalHeight)}px`);

  // Step 2: 智能切分——避免大片空白
  // 策略：标准高度 1440，但如果换页后剩余空白 > 30%，则允许超高到 MAX_CARD_HEIGHT
  const baseUsable = CARD_HEIGHT - 36 - 80; // header + footer
  const maxUsable = MAX_CARD_HEIGHT - 36 - 80;
  const pages = [];
  let currentPageElements = [];
  let pageStartTop = elements.length > 0 ? elements[0].top : 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const elRelativeBottom = el.bottom - pageStartTop;

    if (elRelativeBottom > baseUsable && currentPageElements.length > 0) {
      // 超出标准高度，检查空白比例
      const lastElBottom = elements[currentPageElements[currentPageElements.length - 1]].bottom - pageStartTop;
      const blankRatio = 1 - lastElBottom / CARD_HEIGHT;

      if (blankRatio > 0.25 && elRelativeBottom <= maxUsable) {
        // 空白太多且还在最大高度内，继续往当前页塞
        currentPageElements.push(el.index);
        continue;
      }

      // 换页
      pages.push([...currentPageElements]);
      currentPageElements = [el.index];
      pageStartTop = el.top;
    } else {
      currentPageElements.push(el.index);
    }
  }
  if (currentPageElements.length > 0) {
    pages.push(currentPageElements);
  }

  console.log(`📄 切分为 ${pages.length} 张卡片`);
  await measurePage.close();

  // Step 3: 提取每页 HTML
  const fullPage = await context.newPage();
  await fullPage.setContent(generateFullPageHtml(), { waitUntil: 'networkidle' });
  await fullPage.waitForTimeout(1000);

  const pageData = await fullPage.evaluate((params) => {
    const { pageIndices, elData } = params;
    const container = document.getElementById('content');
    const children = container.children;
    return pageIndices.map((indices) => {
      const html = indices.map(i => children[i].outerHTML).join('\n');
      const firstTop = elData[indices[0]].top;
      const lastBottom = elData[indices[indices.length - 1]].bottom;
      return { html, contentHeight: lastBottom - firstTop };
    });
  }, { pageIndices: pages, elData: elements });
  await fullPage.close();

  const totalPages = pages.length + 1;

  // Step 4: 渲染封面
  console.log('🎨 生成封面...');
  const coverPage = await context.newPage();
  await coverPage.setContent(generateCoverHtml(pages.length), { waitUntil: 'networkidle' });
  await coverPage.waitForTimeout(1500);
  const coverPath = path.join(outputDir, 'cover.png');
  await coverPage.screenshot({
    path: coverPath,
    clip: { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
  });
  console.log(`  ✅ cover.png (${CARD_WIDTH}x${CARD_HEIGHT})`);
  await coverPage.close();

  // Step 5: 渲染每张卡片
  for (let i = 0; i < pageData.length; i++) {
    const pageNum = i + 2;
    const { html, contentHeight } = pageData[i];
    console.log(`🎨 卡片 ${i + 1}/${pageData.length}...`);

    const cardPage = await context.newPage();
    await cardPage.setContent(generateCardHtml(html, pageNum, totalPages), { waitUntil: 'networkidle' });
    await cardPage.waitForTimeout(600);

    // 测量实际渲染高度
    const actualHeight = await cardPage.evaluate(() => document.body.scrollHeight);
    // 取实际高度和标准高度的较大值，但不低于标准高度
    const clipHeight = Math.max(CARD_HEIGHT, Math.min(actualHeight, MAX_CARD_HEIGHT));

    const cardPath = path.join(outputDir, `card_${i + 1}.png`);
    await cardPage.screenshot({
      path: cardPath,
      clip: { x: 0, y: 0, width: CARD_WIDTH, height: clipHeight },
    });
    console.log(`  ✅ card_${i + 1}.png (${CARD_WIDTH}x${clipHeight})`);
    await cardPage.close();
  }

  await browser.close();
  console.log(`\n✨ 完成！共 ${totalPages} 张，保存到: ${outputDir}`);
}

main().catch(err => {
  console.error('❌ 出错:', err.message);
  process.exit(1);
});
