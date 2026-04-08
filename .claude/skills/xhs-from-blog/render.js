#!/usr/bin/env node
/**
 * XHS blue-theme renderer for GitHub weekly Top5 posts.
 *
 * Style reference: light-blue gradient cards, numbered circular badge,
 * bold Chinese title + English subtitle, 2x2 grid of white rounded sub-cards
 * with emoji icons, CTA strip at bottom. Cover: deep blue gradient, big emoji,
 * bold white title, hashtag pills.
 *
 * Usage:
 *   node render.js <data.yml> -o <output_dir>
 *
 * Dependencies are resolved from ~/.claude/skills/Auto-Redbook-Skills/node_modules
 * so no package.json is needed in this repo.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Resolve shared deps from Auto-Redbook-Skills
const VENDOR = path.join(os.homedir(), '.claude/skills/Auto-Redbook-Skills/node_modules');
const { chromium } = require(path.join(VENDOR, 'playwright'));
const YAML = require(path.join(VENDOR, 'yaml'));

const WIDTH = 1080;
const HEIGHT = 1440;

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const COMMON_HEAD = `
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden;
         font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', -apple-system, sans-serif; }
</style>
`;

function coverHtml(c) {
  const tags = (c.tags || []).map(t =>
    `<span style="display:inline-block;background:rgba(255,255,255,0.18);color:white;
      padding:18px 38px;border-radius:999px;font-size:38px;font-weight:500;
      border:2px solid rgba(255,255,255,0.35);backdrop-filter: blur(6px);">#${escapeHtml(t)}</span>`
  ).join('');

  const subtitle = (c.subtitle_lines || []).map(l => escapeHtml(l)).join('<br>');

  return `<!DOCTYPE html><html><head>${COMMON_HEAD}</head><body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;
  background:linear-gradient(180deg,#3B7EE8 0%,#2550C0 100%);
  position:relative;overflow:hidden;padding:120px 90px 90px;
  display:flex;flex-direction:column;">

  <!-- decorative blobs -->
  <div style="position:absolute;top:-120px;right:-120px;width:440px;height:440px;
    background:rgba(255,255,255,0.10);border-radius:50%;"></div>
  <div style="position:absolute;bottom:-80px;left:-80px;width:380px;height:380px;
    background:rgba(255,255,255,0.08);border-radius:50%;"></div>
  <div style="position:absolute;top:420px;left:60px;width:160px;height:160px;
    background:rgba(255,255,255,0.07);border-radius:50%;"></div>

  <!-- hero -->
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;
    justify-content:center;text-align:center;position:relative;z-index:2;">
    <div style="font-size:200px;line-height:1;margin-bottom:50px;">${escapeHtml(c.emoji || '🔥')}</div>
    <div style="font-size:120px;font-weight:900;color:white;line-height:1.18;
      letter-spacing:-2px;margin-bottom:56px;">
      ${escapeHtml(c.title_line1 || '')}<br>${escapeHtml(c.title_line2 || '')}
    </div>
    <div style="font-size:44px;color:rgba(255,255,255,0.92);line-height:1.75;
      font-weight:400;max-width:850px;">${subtitle}</div>
  </div>

  <!-- tags -->
  <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px;
    margin-bottom:28px;position:relative;z-index:2;">${tags}</div>

  <!-- footer -->
  <div style="text-align:center;font-size:34px;color:rgba(255,255,255,0.78);
    font-weight:400;position:relative;z-index:2;">${escapeHtml(c.footer || '')}</div>
</div>
</body></html>`;
}

function itemHtml(item, idx, total) {
  const bullets = (item.bullets || []).map(b => `
    <div style="background:white;border-radius:28px;padding:38px 36px;
      box-shadow:0 10px 36px rgba(37,80,192,0.10);
      display:flex;flex-direction:column;gap:12px;min-height:260px;">
      <div style="font-size:64px;line-height:1;">${escapeHtml(b.icon || '')}</div>
      <div style="font-size:40px;font-weight:700;color:#1A2B4B;line-height:1.25;">
        ${escapeHtml(b.title || '')}
      </div>
      <div style="font-size:30px;color:#4A5D7E;line-height:1.5;font-weight:400;">
        ${escapeHtml(b.desc || '')}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head>${COMMON_HEAD}</head><body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;
  background:linear-gradient(180deg,#E6EFFE 0%,#F4F8FF 60%,#FFFFFF 100%);
  padding:80px 78px 60px;position:relative;overflow:hidden;">

  <!-- decorative blobs -->
  <div style="position:absolute;top:-160px;right:-160px;width:500px;height:500px;
    background:rgba(59,126,232,0.08);border-radius:50%;"></div>
  <div style="position:absolute;bottom:-140px;left:-140px;width:420px;height:420px;
    background:rgba(59,126,232,0.06);border-radius:50%;"></div>

  <!-- numbered badge -->
  <div style="width:108px;height:108px;background:linear-gradient(135deg,#3B7EE8,#2550C0);
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    color:white;font-size:${String(item.number).length > 1 ? '48px' : '56px'};font-weight:800;
    box-shadow:0 10px 30px rgba(37,80,192,0.30);margin-bottom:36px;position:relative;z-index:2;">
    ${escapeHtml(String(item.number))}
  </div>

  <!-- section title -->
  <div style="font-size:72px;font-weight:900;color:#0F1D3A;line-height:1.18;
    margin-bottom:14px;position:relative;z-index:2;">
    ${escapeHtml(item.section_title || '')} ${escapeHtml(item.section_emoji || '')}
  </div>
  <div style="font-size:38px;color:#3B7EE8;font-weight:600;letter-spacing:1.5px;
    margin-bottom:40px;text-transform:uppercase;position:relative;z-index:2;">
    ${escapeHtml(item.section_en || '')}
  </div>

  <!-- repo header card -->
  <div style="background:white;border-radius:32px;padding:44px 52px;margin-bottom:34px;
    box-shadow:0 12px 40px rgba(37,80,192,0.10);position:relative;z-index:2;
    border-left:8px solid #3B7EE8;">
    <div style="font-size:58px;font-weight:800;color:#0F1D3A;line-height:1.2;
      margin-bottom:12px;word-break:break-all;">${escapeHtml(item.repo || '')}</div>
    <div style="font-size:34px;color:#4A5D7E;font-weight:500;">
      ${escapeHtml(item.meta || '')}
    </div>
  </div>

  <!-- bullets 2x2 -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px;
    position:relative;z-index:2;">${bullets}</div>

  <!-- page number -->
  <div style="position:absolute;bottom:32px;right:60px;font-size:30px;
    color:#7B8BAA;font-weight:500;z-index:2;">${idx}/${total}</div>
</div>
</body></html>`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node render.js <data.yml> [-o output_dir]');
    process.exit(1);
  }
  const dataPath = args[0];
  let outDir = path.dirname(dataPath);
  const oIdx = args.indexOf('-o');
  if (oIdx !== -1) outDir = args[oIdx + 1];
  fs.mkdirSync(outDir, { recursive: true });

  const data = YAML.parse(fs.readFileSync(dataPath, 'utf8'));
  const items = data.items || [];
  const total = items.length;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // cover
  await page.setContent(coverHtml(data.cover || {}), { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'cover.png'), omitBackground: false });
  console.log('  cover.png');

  // items
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await page.setContent(itemHtml(it, i + 1, total), { waitUntil: 'networkidle' });
    const name = `card_${i + 1}.png`;
    await page.screenshot({ path: path.join(outDir, name), omitBackground: false });
    console.log(`  ${name}`);
  }

  await browser.close();
  console.log(`\nDone. Output: ${outDir}`);
}

main().catch(e => { console.error(e); process.exit(1); });
