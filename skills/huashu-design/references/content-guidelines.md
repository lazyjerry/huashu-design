# Content Guidelines：反 AI slop、內容準則、Scale（規範）規範

AI 設計裡最容易掉進去的陷阱。這是一份「不做什麼」的清單，比「做什麼」更重要——因為 AI slop 是預設（Default）值，你不主動避免就會發生。

## AI Slop 完整黑名單

### 視覺陷阱

**❌ 激進漸變背景**
- 紫色 → 粉色 → 藍色 全屏漸變（AI 生成網頁的典型味道）
- 任何方向的 rainbow gradient（彩虹漸變）
- Mesh gradient（網格漸變）鋪滿背景
- ✅ 如果要用漸變：subtle（細微）、單色系、有意圖地點綴（比如 button hover）

**❌ 圓角卡片 + 左 border accent（強調）色**
```css
/* 這是 AI 味卡片的典型簽名 */
.card {
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  padding: 16px;
}
```
這種卡片在 AI 生成的 Dashboard 裡泛濫。想做強調？用更有設計感的方式：背景色對比、字重/字號對比、plain 分隔線、或者乾脆不分卡片。

**❌ Emoji 裝飾**
除非品牌本身使用 emoji（比如 Notion、Slack），否則不要在 UI 上放 emoji。**尤其不要**：
- 標題前的 🚀 ⚡️ ✨ 🎯 💡
- Feature（功能）列表的 ✅
- CTA 按鈕裡的 →（箭頭單獨出現 OK，emoji 箭頭不行）

沒圖示用真 icon 庫（Lucide/Heroicons/Phosphor），或者用 placeholder（佔位符）。

**❌ SVG 畫 imagery（意象）**
不要試圖用 SVG 畫：人物、場景、設備、物品、抽象藝術。AI 畫的 SVG imagery 一眼就是 AI 味，幼稚且廉價。**一個灰色矩形 + "插畫位 1200×800" 的文字標籤，比一個拙劣的 SVG hero illustration（英雄圖插畫）強 100 倍**。

唯一可以用 SVG 的場景：
- 真正的 icon（16×16 到 32×32 級別）
- 幾何圖形做裝飾元素
- Data viz（資料視覺化）的 chart（圖表）

**❌ 過多 iconography（圖示系統）**
不是每個標題/feature/section（區段）都需要 icon。濫用 icon 會讓介面像 toy（玩具）。Less is more（少即是多）。

**❌ "Data slop"**
編造的 stats（統計資料）裝飾：
- "10,000+ happy customers" （你都不知道有沒有）
- "99.9% uptime" （沒有真實資料就別寫）
- 用圖示 + 數字 + 詞組成的裝飾 "metric cards（指標卡片）"
- Mock table（模擬表格）裡的假資料裝點得花里胡哨

如果沒真實資料，留 placeholder 或問使用者（User）要。

**❌ "Quote slop"**
編造的使用者評價、名人名言裝飾頁面。留 placeholder 問使用者要真 quote（引用）。

### 字體陷阱

**❌ 避免這些爛大街字體**：
- Inter（AI 生成的網頁預設）
- Roboto
- Arial / Helvetica
- 純 system font stack（系統字體棧）
- Fraunces（AI 發現了這個就用濫了）
- Space Grotesk（最近 AI 的最愛）

**✅ 用有特點的 display（展示）+ body（內文）配對**。靈感方向：
- 襯線 display + 無襯線 body（editorial feel，編輯感）
- Mono（等寬）display + sans body（technical feel，技術感）
- Heavy（重）display + light（輕）body（contrast，對比）
- Variable font（可變字體）做 hero 的粗細動畫

字體資源：
- Google Fonts 的冷門好選項（Instrument Serif、Cormorant、Bricolage Grotesque、JetBrains Mono）
- 開源字體站（Fraunces 的兄弟字體、Adobe Fonts）
- 不要憑空發明字體名

### 色彩陷阱

**❌ 憑空發明顏色**
不要從頭設計一整套不熟悉的色彩。這通常不和諧。

**✅ 策略**：
1. 有品牌色 → 用品牌色，缺的 color token（色彩標記）用 oklch 內插（Interpolation）
2. 沒有品牌色但有參考 → 從參考產品截圖吸色
3. 完全從零 → 選一個 known（已知）的配色系統（Radix Colors / Tailwind 預設 palette / Anthropic brand），不要自己調

**oklch 定義色彩**是最現代的做法：
```css
:root {
  --primary: oklch(0.65 0.18 25);      /* 溫暖的 terracotta（赤陶色） */
  --primary-light: oklch(0.85 0.08 25); /* 同色系淺色 */
  --primary-dark: oklch(0.45 0.20 25);  /* 同色系深色 */
}
```
oklch 能保證調整亮度時色相不漂移，比 hsl 好用。

**❌ 夜間模式隨手加反色**
不是簡單 invert（反轉）顏色。好的 dark mode（深色模式）需要重新調整飽和度、對比度、accent 色。不想做 dark mode 就別做。

### Layout（佈局）陷阱

**❌ Bento grid（便當盒網格）過度泛濫**
每個 AI 生成的 landing page（落地頁）都想搞 bento。除非你的訊息 structure（結構）確實適合 bento，否則用其他 layout。

**❌ 大 hero + 3-column features + testimonials + CTA**
這個 landing page 模板被用濫了。想創新就真創新。

**❌ Card grid 裡每個 card 長一樣**
Asymmetric（非對稱）、不同大小的 cards、有的帶 image（圖片）有的只有文字、有的跨行——這才像真設計師做的。

## 內容準則

### 1. Don't add filler content（不要添加填充內容）

每個元素都必須 earn its place（贏得其位置）。空白是設計問題，用**構圖**解決（對比、節奏、留白），**不是**靠內容填滿。

**判斷 filler 的問題**：
- 如果去掉這段內容，設計會變差嗎？答案若是 "不會"，就去掉。
- 這個元素解決了什麼真問題？如果是 "讓頁面不那麼空"，刪掉。
- 這個 stats/quote/feature 有真實資料支持嗎？沒有就不要憑空寫。

「One thousand no's for every yes」。

### 2. Ask before adding material（添加素材前先詢問）

你覺得多加一段/一頁/一個 section（區段）會更好？先問使用者，不要單方面加。

原因：
- 使用者知道他的受眾比你清楚
- 加內容有成本，使用者可能不想要
- 單方面加內容違反了 "junior designer（初級設計師）彙報工作" 的關係

### 3. Create a system up front（預先建立系統）

探索完 design context（設計上下文）後，**先口頭說出你要用的系統**，讓使用者確認：

```markdown
我的設計系統：
- 色彩：#1A1A1A 主體 + #F0EEE6 背景 + #D97757 accent（來自你的品牌）
- 字型：Instrument Serif 做 display + Geist Sans 做 body
- 節奏：section title 用 full-bleed（滿版）彩色背景 + 白字；普通 section 用白背景
- 圖像：hero 用 full-bleed 照片，feature section 用 placeholder 等你提供
- 最多用 2 種背景色，避免雜亂

確認這個方向我就開始做。
```

使用者確認後再動手。這個 check-in（確認）能避免 "做完一半發現方向錯"。

## Scale 規範

### 幻燈片（1920×1080）

- 正文最小 **24px**，理想 28-36px
- 標題 60-120px
- Section title 80-160px
- Hero headline 可以用 180-240px 的大字
- 永遠不要用 <24px 的字放幻燈片

### 印刷文件

- 正文最小 **10pt**（≈13.3px），理想 11-12pt
- 標題 18-36pt
- Caption（圖說） 8-9pt

### Web 和行動端

- 正文最小 **14px**（老年人友好用 16px）
- 行動端正文 **16px**（避免 iOS 自動縮放）
- Hit target（可點擊元素）最小 **44×44px**
- 行高 1.5-1.7（中文 1.7-1.8）

### 對比度

- 正文 vs 背景 **至少 4.5:1**（WCAG AA）
- 大字 vs 背景 **至少 3:1**
- 用 Chrome DevTools 的 accessibility（無障礙）工具檢查

## CSS 神器

**高級 CSS 特性**是設計師的好朋友，大膽用：

### 排版

```css
/* 讓標題換行更自然，不會最後一行孤單單一個詞 */
h1, h2, h3 { text-wrap: balance; }

/* 正文換行，避免寡孀和孤兒 */
p { text-wrap: pretty; }

/* 中文排版神器：標點擠壓、行首行尾控制 */
p { 
  text-spacing-trim: space-all;
  hanging-punctuation: first;
}
```

### Layout

```css
/* CSS Grid + named areas = 可讀性爆表 */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Subgrid 對齊卡片內容 */
.card { display: grid; grid-template-rows: subgrid; }
```

### 視覺效果

```css
/* 有設計感的捲軸 */
* { scrollbar-width: thin; scrollbar-color: #666 transparent; }

/* 玻璃擬態（克制使用） */
.glass {
  backdrop-filter: blur(20px) saturate(150%);
  background: color-mix(in oklch, white 70%, transparent);
}

/* View transitions API 讓頁面切換絲滑 */
@view-transition { navigation: auto; }
```

### 互動

```css
/* :has() 選擇器讓條件樣式變容易 */
.card:has(img) { padding-top: 0; } /* 有圖片的卡片無頂 padding */

/* container queries（容器查詢）讓元件真的響應式 */
@container (min-width: 500px) { ... }

/* 新的 color-mix 函數 */
.button:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
```

## 決策速查：當你猶豫時

- 想加個漸變？→ 大概率不加
- 想加個 emoji？→ 不加
- 想給卡片加圓角 + border-left accent？→ 不加，換其他方式
- 想用 SVG 畫個 hero 插畫？→ 不畫，用 placeholder
- 想加一段 quote 裝飾？→ 先問使用者有沒有真 quote
- 想加一排 icon features？→ 先問要不要 icon，可能不需要
- 用 Inter？→ 換一個更有特點的
- 用紫色漸變？→ 換一個有根據的配色

**當你覺得 "加一下會更好看" 的時候——那通常是 AI slop 的徵兆**。先做最簡的版本，只在使用者要求時加。
