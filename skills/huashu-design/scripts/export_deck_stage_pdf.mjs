#!/usr/bin/env node
/**
 * export_deck_stage_pdf.mjs — 單檔案 <deck-stage> 架構專用 PDF 匯出
 *
 * 用法：
 *   node export_deck_stage_pdf.mjs --html <deck.html> --out <file.pdf> [--width 1920] [--height 1080]
 *
 * 何時使用此腳本？
 *   - 你的 deck 是**單一 HTML 檔案**，所有投影片為 `<section>`，外層用 `<deck-stage>` 包裹
 *   - 此時 `export_deck_pdf.mjs`（多檔案專用）無法使用
 *
 * 為何不能直接用 `page.pdf()`（2026-04-20 踩坑記錄）：
 *   1. deck-stage 的 shadow CSS `::slotted(section) { display: none }` 讓只有 active 投影片可見
 *   2. print 媒體下外層 `!important` 壓不住 shadow DOM 規則
 *   3. 結果：PDF 永遠只有 1 頁（active 那張）
 *
 * 解決方案：
 *   開啟 HTML 後，用 page.evaluate 將所有 section 從 deck-stage slot 拔出，
 *   掛到 body 下一個普通 div，內聯 style 強制 position:relative + 固定尺寸，
 *   每個 section 加 page-break-after: always，最後一個改 auto 避免尾部空白頁。
 *
 * 相依套件：playwright
 *   npm install playwright
 *
 * 輸出特點：
 *   - 文字保留向量（可複製、可搜尋）
 *   - 視覺 1:1 保真
 *   - 字型必須能被 Chromium 載入（本機字型或 Google Fonts）
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

function parseArgs() {
  const args = { width: 1920, height: 1080 };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) {
    const k = a[i].replace(/^--/, '');
    args[k] = a[i + 1];
  }
  if (!args.html || !args.out) {
    console.error('用法：node export_deck_stage_pdf.mjs --html <deck.html> --out <file.pdf> [--width 1920] [--height 1080]');
    process.exit(1);
  }
  args.width = parseInt(args.width);
  args.height = parseInt(args.height);
  return args;
}

async function main() {
  const { html, out, width, height } = parseArgs();
  const htmlAbs = path.resolve(html);
  const outFile = path.resolve(out);

  await fs.access(htmlAbs).catch(() => {
    console.error(`找不到 HTML 檔案：${htmlAbs}`);
    process.exit(1);
  });

  console.log(`渲染 ${path.basename(htmlAbs)} → ${path.basename(outFile)}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();

  await page.goto('file://' + htmlAbs, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);  // 等待 Google Fonts + deck-stage 初始化

  // 核心修正：將 section 從 shadow DOM slot 拔出並攤平
  const sectionCount = await page.evaluate(({ W, H }) => {
    const stage = document.querySelector('deck-stage');
    if (!stage) throw new Error('<deck-stage> 不存在——此腳本僅適用於單檔案 deck-stage 架構');
    const sections = Array.from(stage.querySelectorAll(':scope > section'));
    if (!sections.length) throw new Error('<deck-stage> 內找不到 <section>');

    // 注入列印樣式
    const style = document.createElement('style');
    style.textContent = `
      @page { size: ${W}px ${H}px; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; background: #fff; }
      deck-stage { display: none !important; }
    `;
    document.head.appendChild(style);

    // 攤平到 body 下
    const container = document.createElement('div');
    container.id = 'print-container';
    sections.forEach(s => {
      // 行內 style 取得最高優先級；確保 position:relative 讓 absolute 子元素正確約束
      s.style.cssText = `
        width: ${W}px !important;
        height: ${H}px !important;
        display: block !important;
        position: relative !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
        margin: 0 !important;
        padding: 0 !important;
      `;
      container.appendChild(s);
    });
    // 最後一頁不分頁，避免尾部空白頁
    const last = sections[sections.length - 1];
    last.style.pageBreakAfter = 'auto';
    last.style.breakAfter = 'auto';
    document.body.appendChild(container);
    return sections.length;
  }, { W: width, H: height });

  await page.waitForTimeout(800);

  await page.pdf({
    path: outFile,
    width: `${width}px`,
    height: `${height}px`,
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  const stat = await fs.stat(outFile);
  const kb = (stat.size / 1024).toFixed(0);
  console.log(`\n✓ 已寫入 ${outFile}（${kb} KB，${sectionCount} 頁，向量）`);
  console.log(`  驗證頁數：mdimport "${outFile}" && pdfinfo "${outFile}" | grep Pages`);
}

main().catch(e => { console.error(e); process.exit(1); });
