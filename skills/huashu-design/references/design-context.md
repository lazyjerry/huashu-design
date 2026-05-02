# Design Context：從已有上下文出發

**這是這個 skill 最重要的 one thing。**

好的 hi-fi（高傳真）設計一定是指從已有 design context（設計上下文）長出來的。**憑空做 hi-fi 是 last resort（最後手段），一定會產出 generic（通用且無特色）的作品**。所以每次設計任務開始，先問：有沒有可以參考的東西？

## 什麼是 Design Context

按優先順序從高到低：

### 1. 使用者（User）的 Design System / UI Kit
使用者自己產品已有的元件庫、色彩 token（標記）、字型規範、icon 系統。**最完美的情況**。

### 2. 使用者的 Codebase
如果使用者給了程式碼庫，裡面就有活生生的元件實作。Read 那些元件檔案：
- `theme.ts` / `colors.ts` / `tokens.css` / `_variables.scss`
- 具體的元件（Button.tsx、Card.tsx）
- Layout scaffold（佈局腳架）（App.tsx、MainLayout.tsx）
- Global stylesheets（全域樣式表）

**讀程式碼抄 exact values（精確值）**：hex codes（十六進位顏色碼）、spacing scale（間距比例）、font stack（字體棧）、border radius（圓角半徑）。不要憑記憶重畫。

### 3. 使用者已發布的產品
如果使用者有上線的產品但沒給程式碼，用 Playwright 或讓使用者提供截圖。

```bash
# 用 Playwright 截圖一個公開 URL
npx playwright screenshot https://example.com screenshot.png --viewport-size=1920,1080
```

讓你看到真實的視覺 vocabulary（詞彙）。

### 4. 品牌指南/Logo/已有素材
使用者可能有：Logo 檔案、品牌色規範、行銷物料、slide（投影片）模板。這些都是 context。

### 5. 競品參考
使用者說 "像 XX 網站那樣"——讓他提供 URL 或截圖。**不要**憑你訓練資料裡的模糊印象做。

### 6. 已知的 design system（fallback）
如果以上都沒有，用公認的設計系統作為 base（基礎）：
- Apple HIG
- Material Design 3
- Radix Colors（配色）
- shadcn/ui（元件）
- Tailwind 預設 palette（調色盤）

明確告訴使用者你用的什麼，讓他知道這是起點不是定稿。

## 獲取 Context 的流程

### Step 1：問使用者

任務開始時的必問清單（來自 `workflow.md`）：

```markdown
1. 你有現成的 design system / UI kit / 元件庫嗎？在哪？
2. 有品牌指南、色彩/字體規範嗎？
3. 可以給我現有產品的截圖或 URL 嗎？
4. 有 codebase 我可以讀嗎？
```

### Step 2：使用者說 "沒有" 時，幫他找

別直接放棄。嘗試：

```markdown
讓我看看有沒有線索：
- 你之前的專案（Project）有相關設計嗎？
- 公司的行銷（Marketing）網站用什麼色彩/字型？
- 你產品的 Logo 什麼風格？能給我一張嗎？
- 有什麼你欣賞的產品作為參考？
```

### Step 3：Read 所有能找到的 context

如果使用者給了 codebase 路徑，你讀：
1. **先 list 檔案結構**：找 style/theme/component 相關的檔案
2. **讀 theme/token 檔案**：lift（提取）具體的 hex/px values
3. **讀 2-3 個代表性元件**：看視覺 vocabulary（hover state、shadow、border、padding node pattern）
4. **讀 global stylesheet**：基礎重設、font loading
5. **如果有 Figma 連結/截圖**：看圖，但**更相信程式碼**

**重要**：**不要**看了一眼就憑印象做。讀下來有 30+ 個具體 values 才真的 lift 到了。

### Step 4：Vocalize（口頭說明）你要用的系統

看完 context 後，告訴使用者你要用的系統：

```markdown
根據你的 codebase 和產品截圖，我提煉的設計系統：

**色彩**
- Primary: #C27558（從 tokens.css）
- Background: #FDF9F0
- Text: #1A1A1A
- Muted: #6B6B6B

**字型**
- Display: Instrument Serif（從 global.css 的 @font-face）
- Body: Geist Sans
- Mono: JetBrains Mono

**Spacing（間距）**（來自你的 scale 系統）
- 4, 8, 12, 16, 24, 32, 48, 64

**Shadow pattern（陰影模式）**
- `0 1px 2px rgba(0,0,0,0.04)`（subtle card）
- `0 10px 40px rgba(0,0,0,0.1)`（elevated modal）

**Border-radius（圓角半徑）**
- 小元件 4px，卡片 12px，按鈕 8px

**component vocabulary（元件詞彙）**
- Button：filled primary，outlined secondary，ghost tertiary，全部圓角 8px
- Card：白色背景，subtle shadow，無 border

我按這套系統開始做。確認沒問題？
```

使用者確認後再動手。

## 憑空做設計（沒 Context 時的 fallback）

**強烈警告**：這種情況下的產出質量會顯著下降。明確告訴使用者。

```markdown
你沒有 design context，我就只能基於通用直覺做。
產出會是 "看起來 OK 但缺乏獨特性" 的東西。
你願意繼續，還是先補一些參考材料？
```

使用者執意要你做，按這個順序做決策：

### 1. 選一個 aesthetic direction（審美方向）
不要給 generic 結果。挑一個明確方向：
- brutally minimal（極端極簡）
- editorial/magazine（編輯/雜誌風）
- brutalist/raw（粗獷/原始）
- organic/natural（有機/自然）
- luxury/refined（奢華/精緻）
- playful/toy（活潑/玩具感）
- retro-futuristic（復古未來主義）
- soft/pastel（柔和/粉彩）

告訴使用者你選了哪個。

### 2. 選一個 known design system 作為骨架
- 用 Radix Colors 做配色（https://www.radix-ui.com/colors）
- 用 shadcn/ui 做元件 vocabulary（https://ui.shadcn.com）
- 用 Tailwind spacing scale（4 的倍數）

### 3. 選有特點的字體配對

不要用 Inter/Roboto。建議組合（從 Google Fonts 白嫖）：
- Instrument Serif + Geist Sans
- Cormorant Garamond + Inter Tight
- Bricolage Grotesque + Söhne（付費）
- Fraunces + Work Sans（注意 Fraunces 已經被 AI 用濫）
- JetBrains Mono + Geist Sans（technical feel）

### 4. 每個關鍵決策都有 reasoning（理由）

不要默默選。在 HTML 的 comment（註釋）裡寫：

```html
<!--
Design decisions:
- Primary color: warm terracotta (oklch 0.65 0.18 25) — fits the "editorial" direction  
- Display: Instrument Serif for humanist, literary feel
- Body: Geist Sans for cleanness contrast
- No gradients — committed to minimal, no AI slop
- Spacing: 8px base, golden ratio friendly (8/13/21/34)
-->
```

## Import 策略（使用者給了 codebase）

如果使用者說 "import 這個 codebase 做參考"：

### 小型（< 50 檔案）
全部 Read，把 context 內化。

### 中型（50-500 檔案）
Focus（聚焦）在：
- `src/components/` 或 `components/`
- 所有 styles/tokens/theme 相關的檔案
- 2-3 個代表性的整頁元件（Home.tsx、Dashboard.tsx）

### 大型（> 500 檔案）
讓使用者指明 focus：
- "我要做 settings 頁面" → 讀現有的 settings 相關
- "我要做一個新的 feature" → 讀整體 shell + 最接近的參考
- 不求全，求準

## 和 Figma / 設計稿的配合

如果使用者給了 Figma 連結：

- **不要**期望你能直接 "轉 Figma 為 HTML" —— 那需要額外工具
- Figma 連結通常不公開可存取
- 讓使用者：匯出為**截圖**發給你 + 告訴你具體的 color/spacing values

如果只給了 Figma 截圖，告訴使用者：
- 我能看到視覺，但取不到精確 values
- 關鍵數字（hex、px）請告訴我，或者 export as code（Figma 支援）

## 最後的提醒

**一個專案的設計質量上限，由你拿到的 context 質量決定**。

花 10 分鐘收集 context，比花 1 小時憑空畫 hi-fi 更有價值。

**遇到沒 context 的情況，優先問使用者要，而不是硬上**。
