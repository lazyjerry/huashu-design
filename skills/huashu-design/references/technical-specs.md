# Technical Specs：Starter Components 與技術決策速查

這份文件收斂起手元件、固定尺寸內容、簡報架構等技術規格。React + Babel 基礎規範仍以 `references/react-setup.md` 為主。

## Starter Components

| 檔案 | 用途 | 提供 |
|---|---|---|
| `assets/deck_index.html` | 多檔簡報聚合 | iframe 拼接、鍵盤導航、scale、計數器 |
| `assets/deck_stage.js` | 單檔簡報 | auto-scale、鍵盤翻頁、speaker notes |
| `assets/design_canvas.jsx` | 靜態變體對比 | 帶標籤網格 |
| `assets/animations.jsx` | 動畫 | Stage、Sprite、時間軸工具 |
| `assets/ios_frame.jsx` | iOS 原型 | iPhone bezel、status bar、home indicator |
| `assets/android_frame.jsx` | Android 原型 | 裝置外殼 |
| `assets/macos_window.jsx` | 桌面 app mockup | 視窗 chrome |
| `assets/browser_window.jsx` | 瀏覽器 mockup | URL bar、tab bar |

## 匯出工具

| 檔案 | 場景 |
|---|---|
| `scripts/export_deck_pdf.mjs` | 多檔 HTML 匯出 PDF |
| `scripts/export_deck_stage_pdf.mjs` | deck-stage 單檔簡報匯出 PDF |
| `scripts/export_deck_pptx.mjs` | 匯出可編輯 PPTX |
| `scripts/html2pptx.js` | DOM 到 PPTX 元素翻譯 |

## 固定尺寸內容規則

- 簡報、影片、固定畫布內容要自己做 auto-scale + letterboxing
- 不依賴瀏覽器自然縮放
- 播放位置與頁碼預設存 localStorage

## 簡報架構選型

| 場景 | 選型 |
|---|---|
| ≥10 頁、學術課件、多 agent 並行 | 多檔案 + `assets/deck_index.html` |
| ≤10 頁、pitch deck、需跨頁共享狀態 | 單檔 + `assets/deck_stage.js` |

如果目標是可編輯 PPTX，先讀 `references/editable-pptx.md`，不要做完才補救。

## 手寫動畫引擎時的硬要求

不用 `assets/animations.jsx` 時，至少做到兩件事：

1. 第一幀同步設 `window.__ready = true`
2. 偵測 `window.__recording === true` 時強制 `loop = false`

否則錄影流程很容易出錯。