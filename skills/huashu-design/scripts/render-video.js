#!/usr/bin/env node
/**
 * HTML 動畫 → MP4，透過 Playwright recordVideo + ffmpeg 實現。
 *
 * 需求：全域安裝 playwright（`npm install -g playwright`），ffmpeg 在 PATH 中。
 *
 * 用法：
 *   NODE_PATH=$(npm root -g) node render-video.js <html-file> \
 *     [--duration=30] [--width=1920] [--height=1080] \
 *     [--trim=<seconds>] [--fontwait=1.5] [--readytimeout=8] \
 *     [--keep-chrome]
 *
 * 設計：
 *   1. 暖機 context（不錄製）— 快取字型/資源，乾淨關閉
 *   2. 錄製 context（全新，recordVideo 開啟）— WebM 在 context 建立時開始寫入。
 *      Babel-standalone 編譯 + React 掛載 + fonts.ready 可能耗時 1.5-3s，
 *      期間 WebM 會寫入黑色幀。透過等待 window.__ready（由 animations.jsx
 *      Stage 元件在首次繪製後設定）來量測此偏移，並精確裁剪。
 *   3. addInitScript 注入 CSS，隱藏「介面框架」元素（進度條、重播按鈕、
 *      標題欄、頁尾等），這些元素在偵錯時有用，但不應出現在匯出影片中。
 *
 * 動畫就緒訊號：
 *   在 HTML 首次繪製後設定 `window.__ready = true`，告知錄製器
 *   「動畫已開始渲染，以此時為 t=0」。
 *   若使用 animations.jsx，Stage 會自動處理。否則請在首次 render 呼叫後加入：
 *   `document.fonts.ready.then(() => requestAnimationFrame(() => { window.__ready = true }));`
 *
 *   未設定 __ready 時，退而使用 --fontwait=1.5s（片頭可能有 1-2 秒黑畫面）。
 *   可用 --trim=<seconds> 手動覆寫。
 *
 * 預設隱藏介面框架元素（所有常見 class 名稱 + `.no-record` 慣例）。
 * 傳入 --keep-chrome 可停用此行為，查看原始 HTML。
 *
 * 輸出：緊鄰 HTML 檔案，同名加 .mp4 副檔名。
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

function arg(name, def) {
  const p = process.argv.find(a => a.startsWith('--' + name + '='));
  return p ? p.slice(name.length + 3) : def;
}
function hasFlag(name) {
  return process.argv.includes('--' + name);
}

const HTML_FILE = process.argv[2];
if (!HTML_FILE || HTML_FILE.startsWith('--')) {
  console.error('用法：node render-video.js <html-file>');
  console.error('範例：NODE_PATH=$(npm root -g) node render-video.js my-animation.html');
  process.exit(1);
}

const DURATION  = parseFloat(arg('duration', '30'));
const WIDTH     = parseInt(arg('width', '1920'));
const HEIGHT    = parseInt(arg('height', '1080'));
const TRIM_OVERRIDE = arg('trim', null);              // 手動覆寫（秒）。未設定時自動偵測。
const FONT_WAIT = parseFloat(arg('fontwait', '1.5')); // __ready 訊號缺失時的備用等待時間
const READY_TIMEOUT = parseFloat(arg('readytimeout', '8'));
const KEEP_CHROME = hasFlag('keep-chrome');

const HTML_ABS = path.resolve(HTML_FILE);
const BASENAME = path.basename(HTML_FILE, path.extname(HTML_FILE));
const DIR      = path.dirname(HTML_ABS);
const TMP_DIR  = path.join(DIR, '.video-tmp-' + Date.now() + '-' + process.pid);
const MP4_OUT  = path.join(DIR, BASENAME + '.mp4');

// 錄製時隱藏「介面框架」元素的 CSS。
// 涵蓋 skill 產出動畫中常見的 class 命名慣例，
// 以及 `.no-record` 明確排除 class。
const HIDE_CHROME_CSS = `
  .no-record,
  .progress, .progress-bar,
  .counter, .tCur,
  .phases, .phase-label, .phase,
  .replay, button.replay,
  .masthead, .kicker, .title,
  .footer,
  [data-role="chrome"], [data-record="hidden"] {
    display: none !important;
  }
`;

console.log(`▸ 渲染：${HTML_FILE}`);
console.log(`  尺寸：${WIDTH}x${HEIGHT} · 時長：${DURATION}s · 隱藏介面框架：${!KEEP_CHROME}`);
console.log(`  輸出：${MP4_OUT}`);

(async () => {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const browser = await chromium.launch();
  const url = 'file://' + HTML_ABS;

  // ── 階段 1：暖機（不錄製，快取字型/資源）─────────────
  console.log('▸ 暖機中（快取字型）…');
  const warmupCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
  });
  const warmupPage = await warmupCtx.newPage();
  // 使用 'load' 而非 'networkidle' — unpkg/Google Fonts 可能在所有關鍵資源
  // 載入後仍保持連線，超出 30s 預算。__ready 旗標 + FONT_WAIT 會正確處理動畫就緒狀態。
  await warmupPage.goto(url, { waitUntil: 'load', timeout: 60000 });
  await warmupPage.waitForTimeout(FONT_WAIT * 1000);
  await warmupCtx.close();

  // ── 階段 2：錄製（全新 context，動畫從 t=0 開始）─────────────
  console.log('▸ 錄製中（全新開始）…');
  const recordCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: TMP_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  // 告知頁面正在錄製 — animations.jsx Stage 讀取此旗標
  // 並強制 loop=false，讓匯出在最後一幀結束，而非
  // 捕捉下一個循環的開頭。手寫的 Stage 元件
  // 也應遵守此訊號（參見 animation-pitfalls.md §13）。
  await recordCtx.addInitScript(() => { window.__recording = true; });

  // 注入 CSS + JS 啟發式規則，隱藏「介面框架」元素。
  // 兩層機制：
  //   A. CSS 選擇器匹配常見 class 命名慣例（成本低）
  //   B. JS 啟發式規則，偵測含按鈕或時間讀數的固定定位
  //      橫條（捕捉 <Stage> 控制項等行內樣式的介面框架）
  // 透過 addInitScript 在重載後持續生效。
  if (!KEEP_CHROME) {
    await recordCtx.addInitScript(css => {
      const HIDE_MARK = 'data-video-hidden';

      function injectStyle() {
        const style = document.createElement('style');
        style.setAttribute('data-inject', 'render-video-chrome-hide');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
      }

      function hideChromeBars() {
        const vh = window.innerHeight;
        document.querySelectorAll('div, nav, header, footer, section, aside')
          .forEach(el => {
            if (el.hasAttribute(HIDE_MARK)) return;
            if (el.dataset.recordKeep === 'true') return;
            const s = getComputedStyle(el);
            if (s.position !== 'fixed' && s.position !== 'sticky') return;
            const r = el.getBoundingClientRect();
            // 只處理細窄橫條（非全螢幕覆蓋層）
            if (r.height > vh * 0.25) return;
            const atBottom = r.bottom >= vh - 30;
            const atTop = r.top <= 30 && r.height < 80;
            if (!atBottom && !atTop) return;
            // 介面框架特徵：含有按鈕或進度條/時間字符
            const txt = el.textContent || '';
            const hasBtn = !!el.querySelector('button, [role="button"]');
            const hasCtrls = /[⏸▶⏮⏭↻↺↩↪]|\d+\.\d+\s*s/.test(txt);
            if (hasBtn || hasCtrls) {
              el.style.setProperty('display', 'none', 'important');
              el.setAttribute(HIDE_MARK, '1');
            }
          });
      }

      const start = () => {
        injectStyle();
        hideChromeBars();
        // React/Vue 提交 DOM 變更時重新執行
        const obs = new MutationObserver(hideChromeBars);
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 6000);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
      } else {
        start();
      }
    }, HIDE_CHROME_CSS);
  }

  // 錄製 context 開啟頁面。WebM 在 context 建立當下開始寫入——
  // 因此在此記錄 T0，量測動畫真正就緒前（Babel 編譯 + React
  // 掛載 + fonts.ready）所經過的秒數。此耗時即為精確的裁剪偏移量。
  const T0 = Date.now();
  const page = await recordCtx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });

  // 等待動畫就緒訊號。Stage 元件（animations.jsx）在掛載後的第一個
  // rAF 且 fonts.ready 後設定 window.__ready = true。
  // 備用方案：若 HTML 在 READY_TIMEOUT 內未設定 __ready，改用 fontwait。
  let animationStartSec;
  const hasReady = await page.waitForFunction(
    () => window.__ready === true,
    { timeout: READY_TIMEOUT * 1000 },
  ).then(() => true).catch(() => false);

  if (hasReady) {
    // 第二道防線：主動將動畫 time 歸零——應對 HTML 未嚴格遵守 starter tick 模板
    // 的情況（例如 lastTick 使用 performance.now() 導致字型載入時間被算進首幀 dt）
    // 詳見 references/animation-pitfalls.md §12
    const seekCorrected = await page.evaluate(() => {
      if (typeof window.__seek === 'function') {
        window.__seek(0);
        return true;
      }
      return false;
    });
    if (seekCorrected) {
      // 等兩個 rAF 讓 seek 生效並渲染出 t=0 的畫面
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    }
    animationStartSec = (Date.now() - T0) / 1000;
    console.log(`▸ 就緒於 ${animationStartSec.toFixed(2)}s（來源：window.__ready${seekCorrected ? ' + __seek(0) 校正' : ''}）`);
  } else {
    await page.waitForTimeout(FONT_WAIT * 1000);
    animationStartSec = (Date.now() - T0) / 1000;
    // 備用偏移量不可靠：動畫可能已在 raf loop 中開始，
    // 裁剪點可能落在循環中途。加入 0.5s 安全邊界（參見
    // animation-pitfalls.md §13）。發出明顯警告，提示使用者修正 HTML。
    console.log('');
    console.log(`  ⚠️  警告：在 ${READY_TIMEOUT}s 內未偵測到 window.__ready 訊號`);
    console.log(`     錄製將使用備用裁剪時間 ${animationStartSec.toFixed(2)}s + 0.5s 安全邊界。`);
    console.log(`     此方式不可靠——影片可能從動畫中途開始或跳過幀。`);
    console.log('');
    console.log(`     修正方式：在 HTML 動畫 tick（或首幀 rAF）中加入：`);
    console.log(`        window.__ready = true;`);
    console.log(`     基於 animations.jsx 的 HTML 已自動處理。若為手寫 Stage，`);
    console.log(`     請參見 references/animation-pitfalls.md §12 的模板。`);
    console.log('');
  }

  // 讓動畫播放完整時長
  await page.waitForTimeout(DURATION * 1000 + 300);

  await page.close();
  await recordCtx.close();
  await browser.close();

  const webmFiles = fs.readdirSync(TMP_DIR).filter(f => f.endsWith('.webm'));
  if (webmFiles.length === 0) {
    console.error('✗ 未產生 webm 檔案');
    process.exit(1);
  }
  const webmPath = path.join(TMP_DIR, webmFiles[0]);
  console.log(`▸ WebM：${(fs.statSync(webmPath).size / 1024 / 1024).toFixed(1)} MB`);

  // 確定最終裁剪偏移量：
  //   - 手動 --trim=X     → 使用 X（使用者明確覆寫）
  //   - hasReady          → animationStartSec + 0.05s（Babel 提交微調）
  //   - 備用（無 __ready）→ animationStartSec + 0.5s 安全邊界（raf loop 可能
  //                          已開始執行；若無此邊界可能捕捉到中途幀）
  const resolvedTrim = TRIM_OVERRIDE !== null
    ? parseFloat(TRIM_OVERRIDE)
    : animationStartSec + (hasReady ? 0.05 : 0.5);

  console.log(`▸ ffmpeg：trim=${resolvedTrim.toFixed(2)}s${TRIM_OVERRIDE !== null ? '（手動）' : '（自動）'}，編碼 H.264…`);
  const ffmpeg = spawnSync('ffmpeg', [
    '-y',
    '-ss', String(resolvedTrim),
    '-i', webmPath,
    '-t', String(DURATION),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-preset', 'medium',
    '-movflags', '+faststart',
    MP4_OUT,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  if (ffmpeg.status !== 0) {
    console.error('✗ ffmpeg 失敗：\n' + ffmpeg.stderr.toString().slice(-2000));
    process.exit(1);
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  const mp4Size = (fs.statSync(MP4_OUT).size / 1024 / 1024).toFixed(1);
  console.log(`✓ 完成：${MP4_OUT}（${mp4Size} MB）`);
})();
