<sub>🌐 <a href="README.en.md">English</a> · <b>繁體中文</b> · 此文件為繁體中文版</sub>

<div align="center">

# Huashu Design - 繁體中文版

> *「打字。按下 Enter。一份能交付的設計。」*
> *"Type. Hit enter. A finished design lands in your lap."*

[![License](https://img.shields.io/badge/License-Personal%20Use%20Only-orange.svg)](LICENSE)
[![Agent-Agnostic](https://img.shields.io/badge/Agent-Agnostic-blueviolet)](https://skills.sh)
[![Skills](https://img.shields.io/badge/skills.sh-Compatible-green)](https://skills.sh)

<br>

**在你的 agent 裡打一段話，拿回一份能交付的設計。**

<br>

3 到 30 分鐘，你能 ship 一段**產品發表動畫**、一個能點擊的 App 原型、一套能編輯的 PPT、一份印刷級資訊圖表。

不是那種「AI 做得還行」的水準，是看起來像大廠設計團隊做的成品。給 skill 你的品牌資產（logo、色票、UI 截圖），它會讀懂你的品牌氣質；什麼都不給，內建的 20 種設計語彙也能兜底，不會落到 AI slop。

**你在這篇 README 裡看到的每一個動畫，都是 huashu-design 自己做的。** 不是 Figma，不是 AE，就是一句 prompt + skill 跑通。下次產品發表要做宣傳片，現在你也能做。

```
npx skills add lazyjerry/huashu-design
```

跨 agent 通用，Claude Code、Cursor、Codex、OpenClaw、Hermes 都能裝。

[看效果](#demo-畫廊) · [安裝](#裝上就能用) · [能做什麼](#能做什麼) · [核心機制](#核心機制) · [和 Claude Design 的關係](#和-claude-design-的關係)

</div>

---

<p align="center">
  <img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.gif" alt="huashu-design Hero · 打字 → 選方向 → 畫廊展開 → 聚焦 → 品牌顯形" width="100%">
</p>

<p align="center"><sub>
  ▲ 25 秒 · Terminal → 4 個方向 → Gallery ripple → 4 次 Focus → Brand reveal<br>
  👉 <a href="https://www.huasheng.ai/huashu-design-hero/">開啟含音效的 HTML 互動版</a> ·
  <a href="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4">下載 MP4（含 BGM+SFX · 10MB）</a>
</sub></p>

---

## 裝上就能用

```bash
npx skills add lazyjerry/huashu-design
```

如果你是用 [AI Global](https://github.com/lazyjerry/ai-global) 管理全域 skills，也可以這樣裝：

```bash
# 先安裝 AI Global（擇一）
curl -fsSL https://raw.githubusercontent.com/lazyjerry/ai-global/main/install.sh | bash
# 或
npm install -g ai-global

# 首次執行，建立 ~/.ai-global/ 與符號連結
ai-global

# 安裝 huashu-design
ai-global add-skill lazyjerry/huashu-design

# 確認是否已加入
ai-global list-skills
```

如果你已經安裝過 AI Global，直接跑 `ai-global add-skill lazyjerry/huashu-design` 即可。

接著在 Claude Code 裡直接說：

```
「做一份 AI 心理學的演講 PPT，推薦 3 個風格方向讓我選」
「做個 AI 番茄鐘 iOS 原型，4 個核心畫面要真的能點」
「把這段邏輯做成 60 秒動畫，匯出 MP4 和 GIF」
「幫我對這個設計做一份 5 維度評審」
```

沒有按鈕、沒有面板、沒有 Figma 外掛。

---

## Star 趨勢

<p align="center">
  <a href="https://star-history.com/#lazyjerry/huashu-design&Date">
    <img src="https://api.star-history.com/svg?repos=lazyjerry/huashu-design&type=Date" alt="huashu-design Star History" width="80%">
  </a>
</p>

---

## 能做什麼

| 能力 | 交付物 | 典型耗時 |
|------|--------|----------|
| 互動原型（App / Web） | 單檔 HTML · 真 iPhone bezel · 可點擊 · Playwright 驗證 | 10–15 min |
| 演講投影片 | HTML deck（瀏覽器簡報）+ 可編輯 PPTX（保留文字方塊） | 15–25 min |
| 時間軸動畫 | MP4（25fps / 60fps 插幀）+ GIF（palette 最佳化）+ BGM | 8–12 min |
| 設計變體 | 3+ 並排比較 · Tweaks 即時調參 · 跨維度探索 | 10 min |
| 資訊圖 / 視覺化 | 印刷級排版 · 可匯出 PDF/PNG/SVG | 10 min |
| 設計方向顧問 | 5 流派 × 20 種設計哲學 · 推薦 3 個方向 · 並行生成 Demo | 5 min |
| 5 維度專家評審 | 雷達圖 + Keep/Fix/Quick Wins · 可執行修正清單 | 3 min |

---

## Demo 畫廊

### 設計方向顧問

需求模糊時的 fallback：從 5 流派 × 20 種設計哲學裡挑 3 個差異化方向，並行生成 3 個 Demo 讓你選。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w3-fallback-advisor.gif" width="100%"></p>

### iOS App 原型

iPhone 15 Pro 精準機身（動態島 / 狀態列 / Home Indicator）· 狀態驅動多畫面切換 · 真圖取自 Wikimedia/Met/Unsplash · Playwright 自動點擊測試。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c1-ios-prototype.gif" width="100%"></p>

### Motion Design 引擎

Stage + Sprite 時間片段模型 · `useTime` / `useSprite` / `interpolate` / `Easing` 四個 API 覆蓋所有動畫需求 · 一條指令匯出 MP4 / GIF / 60fps 插幀 / 含 BGM 的成片。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c3-motion-design.gif" width="100%"></p>

### HTML Slides → 可編輯 PPTX

HTML deck 瀏覽器簡報 · `html2pptx.js` 讀取 DOM 的 computedStyle，逐元素翻譯成 PowerPoint 物件 · 匯出的是**真的文字方塊**，在 PPT 裡雙擊就能編輯。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c2-slides-pptx.gif" width="100%"></p>

### Tweaks · 即時切換變體

配色 / 字型 / 資訊密度等參數化 · 側邊面板切換 · 純前端 + `localStorage` 持久化 · 重新整理也不會丟。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c4-tweaks.gif" width="100%"></p>

### 資訊圖 / 資料視覺化

雜誌級排版 · CSS Grid 精準分欄 · `text-wrap: pretty` 排印細節 · 真資料驅動 · 可匯出 PDF 向量 / PNG 300dpi / SVG。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c5-infographic.gif" width="100%"></p>

### 5 維度專家評審

哲學一致性 · 視覺層級 · 細節執行 · 功能性 · 創新性，各 0–10 分 · 雷達圖視覺化 · 輸出 Keep / Fix / Quick Wins 清單。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c6-expert-review.gif" width="100%"></p>

### Junior Designer 工作流

不是一開始就悶頭做大招：先寫 assumptions + placeholders + reasoning，盡早秀給你看，再迭代。理解錯了，越早改越便宜。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w2-junior-designer.gif" width="100%"></p>

### 核心資產協議 5 步硬流程

只要涉及具體品牌就強制執行：問 → 搜 → 下載（三條兜底）→ 驗證與提取 → 寫 `brand-spec.md`。

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w1-brand-protocol.gif" width="100%"></p>

---

## Showcase · 真實案例

### 「聊聊 skill」 · PM after-party 演講 deck

> **Live demo · [https://skill-huasheng.vercel.app](https://skill-huasheng.vercel.app)**

13 頁 HTML deck，**全部用 huashu-design 完成**：

- 黑底極簡襯線視覺系統（cover / about / hook / what / why / closing）
- 2 個含 BGM + SFX 的 22 秒 cinematic demo（Nuwa skill workflow + Darwin skill workflow），各自採用**完全獨立的視覺語言**：
  - **Nuwa**：3D 知識 orbit + Pentagon 提煉 + SKILL.md typewriter + 「21 分鐘」hero reveal
  - **Darwin**：autoresearch loop spin + v1/v5 並列 diff + Hill-Climb 全畫面曲線 + Ratchet gear lock
- 每個 cinematic 預設都顯示**完整靜態 workflow dashboard**，觀眾隨時都能看清 skill 怎麼跑，點 ▶ 才觸發動畫，跑完自動 fade 回 dashboard
- 內嵌 huasheng.ai 的 25 秒 hero 動畫（iframe 本地化兜底）
- 真實資料：14,495 stargazers 真實曲線（gh API 拉取）+ DeepSeek V4 真實 specs（WebSearch 驗證）
- 真實 AI 素材：用 `huashu-gpt-image` 跑 4×2 grid 大圖，`extract_grid.py` 摳出 8 張獨立透明 PNG，做 3D orbit 漂浮

**適合參考的頁面**：
- `/slides/slide-04b-nuwa-flow.html` · 靜態 dashboard + cinematic overlay 雙層架構
- `/slides/slide-06b-darwin-flow.html` · 完全獨立視覺語言的對照案例
- `/slides/slide-03b-deepseek-cover.html` · AI slop vs 真設計師視角的對照頁

詳細 cinematic patterns 見 `references/cinematic-patterns.md`。

---

## 核心機制

### 核心資產協議

skill 裡最硬的一段規則。只要涉及具體品牌（Stripe、Linear、Anthropic、自家公司等）就強制執行 5 步：

| 步驟 | 動作 | 目的 |
|------|------|------|
| 1 · 問 | 使用者有 brand guidelines 嗎？ | 尊重既有資源 |
| 2 · 搜官方品牌頁 | `<brand>.com/brand` · `brand.<brand>.com` · `<brand>.com/press` | 抓權威色值 |
| 3 · 下載資產 | SVG 檔 → 官網 HTML 全文 → 產品截圖取色 | 三條兜底，前一條失敗就立刻走下一條 |
| 4 · grep 擷取色值 | 從資產裡抓所有 `#xxxxxx`，依頻率排序，過濾黑白灰 | **絕不憑記憶猜品牌色** |
| 5 · 固化 spec | 寫 `brand-spec.md` + CSS 變數，所有 HTML 都引用 `var(--brand-*)` | 不固化就會忘 |

A/B 測試（v1 vs v2，各跑 6 agent）：**v2 的穩定性方差比 v1 低 5 倍**。穩定性的穩定性，這才是 skill 真正的護城河。

### 設計方向顧問（Fallback）

當使用者需求模糊到無法直接下手時觸發：

- 不憑通用直覺硬做，進入 Fallback 模式
- 從 5 流派 × 20 種設計哲學裡推薦 3 個**必須來自不同流派**的差異化方向
- 每個方向附代表作、氣質關鍵字、代表設計師
- 並行生成 3 個視覺 Demo 讓使用者選
- 選定後再進入主幹 Junior Designer 流程

### Junior Designer 工作流

預設工作模式，貫穿所有任務：

- 開工前先把問題清單一次秀給使用者，等對方集中答完再動手
- HTML 裡先寫 assumptions + placeholders + reasoning comments
- 儘早秀給使用者看，哪怕只是灰色方塊
- 填入實際內容 → variations → Tweaks，這三步各再秀一次
- 交付前用 Playwright 在瀏覽器裡肉眼過一遍

### 反 AI slop 規則

避免那種一眼 AI 的視覺最大公約數（紫色漸層 / emoji 圖示 / 圓角 + 左側 border accent / SVG 畫人臉 / Inter 當 display）。改用 `text-wrap: pretty` + CSS Grid + 精挑的 serif display 與 oklch 色彩。

---

## 和 Claude Design 的關係

我直接承認：核心資產協議的哲學，是從 Claude Design 流傳出來的提示詞裡偷師的。那份提示詞反覆強調，**好的高保真設計不是從白紙開始，而是從既有的設計脈絡長出來**。這個原則，是 65 分作品和 90 分作品的分水嶺。

定位差異：

| | Claude Design | huashu-design |
|---|---|---|
| 形態 | 網頁產品（在瀏覽器裡用） | skill（在 Claude Code 裡用） |
| 配額 | 訂閱 quota | API 消耗 · 並行跑 agent 不受 quota 限制 |
| 交付物 | 畫布內 + 可匯出 Figma | HTML / MP4 / GIF / 可編輯 PPTX / PDF |
| 操作方式 | GUI（點、拖、改） | 對話（說話、等 agent 做完） |
| 複雜動畫 | 有限 | Stage + Sprite 時間軸 · 60fps 匯出 |
| 跨 agent | 專屬 Claude.ai | 任意 skill 相容 agent |

Claude Design 是**更好的圖形工具**，huashu-design 是**讓圖形工具這層消失**。兩條路，不同受眾。

---

## Limitations

- **不支援圖層級可編輯的 PPTX 到 Figma**。產出是 HTML，可以截圖、錄影、匯圖，但不能拖進 Keynote 改文字位置。
- **做不到 Framer Motion 等級的複雜動畫**。3D、物理模擬、粒子系統都超出 skill 邊界。
- **完全空白的品牌，從零開始設計時品質會掉到 60–65 分**。憑空做 hi-fi，本來就是 last resort。

這是一個 80 分的 skill，不是 100 分的產品。對不想打開圖形介面的人來說，80 分的 skill 比 100 分的產品更好用。

---

## 倉庫結構

```
huashu-design/
├── SKILL.md                 # 主文件（給 agent 讀）
├── README.md                # 本文件（繁體中文版，給使用者讀）
├── assets/                  # Starter Components
│   ├── animations.jsx       # Stage + Sprite + Easing + interpolate
│   ├── ios_frame.jsx        # iPhone 15 Pro bezel
│   ├── android_frame.jsx
│   ├── macos_window.jsx
│   ├── browser_window.jsx
│   ├── deck_stage.js        # HTML 投影片引擎
│   ├── deck_index.html      # 多檔 deck 拼接器
│   ├── design_canvas.jsx    # 並排變體展示
│   ├── showcases/           # 24 個預製範例（8 場景 × 3 風格）
│   └── bgm-*.mp3            # 6 首場景化背景音樂
├── references/              # 依任務深入閱讀的子文件
│   ├── animation-pitfalls.md
│   ├── design-styles.md     # 20 種設計哲學詳細資料庫
│   ├── slide-decks.md
│   ├── editable-pptx.md
│   ├── critique-guide.md
│   ├── video-export.md
│   └── ...
├── scripts/                 # 匯出工具鏈
│   ├── render-video.js      # HTML → MP4
│   ├── convert-formats.sh   # MP4 → 60fps + GIF
│   ├── add-music.sh         # MP4 + BGM
│   ├── export_deck_pdf.mjs
│   ├── export_deck_pptx.mjs
│   ├── html2pptx.js
│   └── verify.py
└── demos/                   # 9 個能力示範 (c*/w*)，中英雙版 GIF/MP4/HTML + hero v10
```

---

## 起源

Anthropic 發布 Claude Design 那天，我玩到凌晨四點。幾天後發現自己再也沒點開過它。不是它不好，它是這條賽道目前最成熟的產品；只是我寧可讓 agent 在終端機裡幫我做事，也不想打開任何圖形介面。

於是我讓 agent 拆解 Claude Design 本身，包括社群流傳的系統提示詞、核心資產協議、元件機制，再蒸餾成結構化 spec，最後寫成 skill 裝進自己的 Claude Code。

感謝 Anthropic 把 Claude Design 的提示詞寫得夠清楚。這種基於其他產品靈感的二次創作，是 AI 時代開源文化的一種新形態。

---

## License · 使用授權

**個人使用免費、自由**。學習、研究、創作、替自己做東西、寫文章、做副業、發社群，都能直接用，不用先打招呼。

**企業商用禁止**。任何公司、團隊，或以營利為目的的組織，想把本 skill 整合進產品、對外服務，或拿來給客戶交付工作，**都必須先聯絡花生取得授權**。包括但不限於：
- 把 skill 當成公司內部工具鏈的一部分
- 把 skill 產出物當成對外交付物的主要創作手段
- 基於 skill 二次開發成商業產品
- 在客戶商案中使用

**商用授權聯絡方式**見下方社群平台。

---

## Connect · 花生（花叔）

花生是 AI Native Coder、獨立開發者、AI 自媒體創作者。代表作：小貓補光燈（AppStore 付費榜 Top 1）、《一本書玩轉 DeepSeek》、女媧 .skill（GitHub 12000+ star）。自媒體全平台 30 萬+ 粉絲。

| 平台 | 帳號 | 連結 |
|---|---|---|
| X / Twitter | @AlchainHust | https://x.com/AlchainHust |
| 公眾號 | 花叔 | 微信搜尋「花叔」 |
| B 站 | 花叔 | https://space.bilibili.com/14097567 |
| YouTube | 花叔 | https://www.youtube.com/@Alchain |
| 小紅書 | 花叔 | https://www.xiaohongshu.com/user/profile/5abc6f17e8ac2b109179dfdf |
| 官網 | huasheng.ai | https://www.huasheng.ai/ |
| 開發者主頁 | bookai.top | https://bookai.top |

商用授權、合作洽詢、自媒體邀稿 → 以上任一平台私訊花生即可。
