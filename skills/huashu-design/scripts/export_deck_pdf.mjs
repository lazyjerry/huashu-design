#!/usr/bin/env node
/**
 * export_deck_pdf.mjs — 將多檔案 slide deck 匯出為單一向量 PDF
 *
 * 用法：
 *   node export_deck_pdf.mjs --slides <dir> --out <file.pdf> [--width 1920] [--height 1080]
 *
 * 特點：
 *   - 文字保留向量（可複製、可搜尋）
 *   - 背景/圖形 1:1 保真（Playwright 內嵌 Chromium 渲染）
 *   - 無需對 HTML 做任何改造
 *   - 視覺損失 = 0（PDF 等同瀏覽器列印輸出）
 *
 * 取捨：
 *   - PDF 不可再編輯文字（需修改請回到 HTML）
 *
 * 相依套件：playwright pdf-lib
 *   npm install playwright pdf-lib
 *
 * 依檔名排序（01-xxx.html → 02-xxx.html → ...）
 */

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

function parseArgs() {
  const args = { width: 1920, height: 1080 };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) {
    const k = a[i].replace(/^--/, '');
    args[k] = a[i + 1];
  }
  if (!args.slides || !args.out) {
    console.error('用法：node export_deck_pdf.mjs --slides <dir> --out <file.pdf> [--width 1920] [--height 1080]');
    process.exit(1);
  }
  args.width = parseInt(args.width);
  args.height = parseInt(args.height);
  return args;
}

async function main() {
  const { slides, out, width, height } = parseArgs();
  const slidesDir = path.resolve(slides);
  const outFile = path.resolve(out);

  const files = (await fs.readdir(slidesDir))
    .filter(f => f.endsWith('.html'))
    .sort();
  if (!files.length) {
    console.error(`在 ${slidesDir} 中找不到 .html 檔案`);
    process.exit(1);
  }
  console.log(`找到 ${files.length} 張投影片，位於 ${slidesDir}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height } });

  // 1) 將每個 HTML 渲染為獨立的 PDF buffer
  const pageBuffers = [];
  for (const f of files) {
    const page = await ctx.newPage();
    const url = 'file://' + path.join(slidesDir, f);
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
    await page.waitForTimeout(1200);  // 等待網頁字型渲染
    // 模擬 "screen" 媒體，確保 CSS 色彩/背景與瀏覽器一致
    await page.emulateMedia({ media: 'screen' });
    const buf = await page.pdf({
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: false,
    });
    pageBuffers.push(buf);
    await page.close();
    console.log(`  [${pageBuffers.length}/${files.length}] ${f}`);
  }

  await browser.close();

  // 2) 合併為單一 PDF
  const merged = await PDFDocument.create();
  for (const buf of pageBuffers) {
    const src = await PDFDocument.load(buf);
    const copied = await merged.copyPages(src, src.getPageIndices());
    copied.forEach(p => merged.addPage(p));
  }
  const bytes = await merged.save();
  await fs.writeFile(outFile, bytes);

  const kb = (bytes.byteLength / 1024).toFixed(0);
  console.log(`\n✓ 已寫入 ${outFile}（${kb} KB，${files.length} 頁，向量）`);
}

main().catch(e => { console.error(e); process.exit(1); });
