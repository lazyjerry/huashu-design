#!/usr/bin/env node
/**
 * export_deck_pptx.mjs — 將多檔案 slide deck 匯出為可編輯 PPTX
 *
 * 用法：
 *   node export_deck_pptx.mjs --slides <dir> --out <file.pptx>
 *
 * 行為：
 *   - 呼叫 scripts/html2pptx.js，將 HTML DOM 逐元素轉換為 PowerPoint 原生物件
 *   - 文字為真正的文字框，在 PPT 中雙擊即可直接編輯
 *   - body 尺寸 960pt × 540pt（LAYOUT_WIDE，13.333″ × 7.5″）
 *
 * ⚠️ HTML 必須符合 4 條硬性限制（詳見 references/editable-pptx.md）：
 *   1. 文字需包在 <p>/<h1>-<h6> 中（div 不可直接放文字）
 *   2. 不使用 CSS 漸層
 *   3. <p>/<h*> 不可有 background/border/shadow（請放到外層 div）
 *   4. div 不可使用 background-image（請改用 <img>）
 *
 * 視覺導向的 HTML 幾乎無法通過——必須從第一行起就按限制撰寫。
 * 視覺自由度優先的場景（動畫、web component、CSS 漸層、複雜 SVG）
 * 請改用 export_deck_pdf.mjs / export_deck_stage_pdf.mjs 匯出 PDF。
 *
 * 相依套件：npm install playwright pptxgenjs sharp
 *
 * 依檔名排序（01-xxx.html → 02-xxx.html → ...）。
 */

import pptxgen from 'pptxgenjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) {
    const k = a[i].replace(/^--/, '');
    args[k] = a[i + 1];
  }
  if (!args.slides || !args.out) {
    console.error('用法：node export_deck_pptx.mjs --slides <dir> --out <file.pptx>');
    console.error('');
    console.error('⚠️ HTML 必須符合 4 條硬性限制（詳見 references/editable-pptx.md）。');
    console.error('   視覺自由度優先的場景請改用 export_deck_pdf.mjs 匯出 PDF。');
    process.exit(1);
  }
  return args;
}

async function main() {
  const { slides, out } = parseArgs();
  const slidesDir = path.resolve(slides);
  const outFile = path.resolve(out);

  const files = (await fs.readdir(slidesDir))
    .filter(f => f.endsWith('.html'))
    .sort();
  if (!files.length) {
    console.error(`在 ${slidesDir} 中找不到 .html 檔案`);
    process.exit(1);
  }

  console.log(`透過 html2pptx 轉換 ${files.length} 張投影片…`);

  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  let html2pptx;
  try {
    html2pptx = require(path.join(__dirname, 'html2pptx.js'));
  } catch (e) {
    console.error(`✗ 載入 html2pptx.js 失敗：${e.message}`);
    console.error(`  相依套件缺失時請執行：npm install playwright pptxgenjs sharp`);
    process.exit(1);
  }

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch，對應 HTML body 960 × 540 pt

  const errors = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const fullPath = path.join(slidesDir, f);
    try {
      await html2pptx(fullPath, pres);
      console.log(`  [${i + 1}/${files.length}] ${f} ✓`);
    } catch (e) {
      console.error(`  [${i + 1}/${files.length}] ${f} ✗  ${e.message}`);
      errors.push({ file: f, error: e.message });
    }
  }

  if (errors.length) {
    console.error(`\n⚠️ ${errors.length} 張投影片轉換失敗。常見原因：HTML 不符合 4 條硬性限制。`);
    console.error(`  詳見 references/editable-pptx.md 的「常見錯誤速查」。`);
    if (errors.length === files.length) {
      console.error(`✗ 全部失敗，不產生 PPTX。`);
      process.exit(1);
    }
  }

  await pres.writeFile({ fileName: outFile });
  console.log(`\n✓ 已寫入 ${outFile}（${files.length - errors.length}/${files.length} 張，可編輯 PPTX）`);
}

main().catch(e => { console.error(e); process.exit(1); });
