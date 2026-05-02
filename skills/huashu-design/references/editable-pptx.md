# 可編輯 PPTX 匯出：HTML 硬約束 + 尺寸決策 + 常見錯誤

本文件講述的是**用 `scripts/html2pptx.js` + `pptxgenjs` 將 HTML 逐元素翻譯成真·可編輯 PowerPoint 文字框**的路徑，也是 `export_deck_pptx.mjs` 唯一支援的路徑。

> **核心前提**：要走這條路，HTML 必須從第一行就按下面 4 條約束編寫。**不是寫完再轉**——事後補救會觸發 2-3 小時返工（2026-04-20 期權私董會專案實測踩坑）。
>
> 視覺自由度優先的場景（動畫 / web component / CSS 漸變 / 複雜 SVG）請改走 PDF 路徑（`export_deck_pdf.mjs` / `export_deck_stage_pdf.mjs`），**不要**指望 pptx 匯出能兼得視覺保真和可編輯——這是 PPTX 檔案格式本身的物理約束（見文末「為什麼 4 條約束不是 Bug 而是物理約束」）。

---

## 畫布尺寸：用 960×540pt（LAYOUT_WIDE）

PPTX 單位是 **inch（英吋）**（物理尺寸），不是 px（像素）。決策原則：body 的 computedStyle 尺寸要**匹配 presentation layout 的 inch 尺寸**（±0.1"，由 `html2pptx.js` 的 `validateDimensions` 強制檢查）。

### 3 個候選尺寸對比

| HTML body | 物理尺寸 | 對應 PPT layout | 何時選 |
|---|---|---|---|
| **`960pt × 540pt`** | **13.333″ × 7.5″** | **pptxgenjs `LAYOUT_WIDE`** | ✅ **預設推薦**（現代 PowerPoint 16:9 標配） |
| `720pt × 405pt` | 10″ × 5.625″ | 自定義 | 僅當使用者指定「老版 PowerPoint Widescreen」模板時 |
| `1920px × 1080px` | 20″ × 11.25″ | 自定義 | ❌ 非標尺寸，投影後字體顯得異常小 |

**別把 HTML 尺寸當解析度想。** PPTX 是向量文件，body 尺寸決定的是**物理尺寸**不是清晰度。超大 body（20″×11.25″）不會讓文字更清晰——只會讓字號 pt 相對畫布變小，投影/列印時反而更難看。

### body 寫法三選一（等價）

```css
body { width: 960pt;  height: 540pt; }    /* 最清晰，推薦 */
body { width: 1280px; height: 720px; }    /* 等價，px 習慣 */
body { width: 13.333in; height: 7.5in; }  /* 等價，英吋直覺 */
```

配套的 pptxgenjs 程式碼：

```js
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch, 無需自定義
```

---

## 4 條硬約束（違反會直接出錯）

`html2pptx.js` 將 HTML 的 DOM 逐元素翻譯成 PowerPoint 物件。PowerPoint 的格式約束投射到 HTML 上 = 下面 4 條規則。

### 規則 1：DIV 裡不能直接寫文字 — 必須用 `<p>` 或 `<h1>`-`<h6>` 包裹

```html
<!-- ❌ 錯誤：文字直接在 div 裡 -->
<div class="title">Q3 營收增長 23%</div>

<!-- ✅ 正確：文字在 <p> 或 <h1>-<h6> 裡 -->
<div class="title"><h1>Q3 營收增長 23%</h1></div>
<div class="body"><p>新使用者是主要驅動力</p></div>
```

**為什麼**：PowerPoint 文字必須存在 text frame（文字框）裡，text frame 對應 HTML 的段落級元素（p/h*/li）。裸 `<div>` 在 PPTX 裡沒有對應的文字容器。

**也不能用 `<span>` 承載主文字**——span 是行內元素（inline element），沒法獨立對齊成文字框。span 只能**夾在 p/h\* 裡**做局部樣式（加粗、換色）。

### 規則 2：不支援 CSS 漸變 — 只能用純色

```css
/* ❌ 錯誤 */
background: linear-gradient(to right, #FF6B6B, #4ECDC4);

/* ✅ 正確：純色 */
background: #FF6B6B;

/* ✅ 如果必須多色條紋，用 flex 子元素各自純色 */
.stripe-bar { display: flex; }
.stripe-bar div { flex: 1; }
.red   { background: #FF6B6B; }
.teal  { background: #4ECDC4; }
```

**為什麼**：PowerPoint 的 shape fill（形狀填充）只支援 solid/gradient-fill 兩種，但 pptxgenjs 的 `fill: { color: ... }` 只映射 solid。漸變走 PowerPoint 原生 gradient 需要另寫結構，目前工具鏈不支援。

### 規則 3：背景/邊框/陰影只能在 DIV 上，不能在文字標籤上

```html
<!-- ❌ 錯誤：<p> 有背景色 -->
<p style="background: #FFD700; border-radius: 4px;">重點內容</p>

<!-- ✅ 正確：外層 div 承載背景/邊框，<p> 只負責文字 -->
<div style="background: #FFD700; border-radius: 4px; padding: 8pt 12pt;">
  <p>重點內容</p>
</div>
```

**為什麼**：PowerPoint 裡 shape（方塊/圓角矩形）和 text frame 是兩個物件。HTML 的 `<p>` 只翻譯成 text frame，背景/邊框/陰影屬於 shape——必須在**包裹文字的 div** 上寫。

### 規則 4：DIV 不能用 `background-image` — 用 `<img>` 標籤

```html
<!-- ❌ 錯誤 -->
<div style="background-image: url('chart.png')"></div>

<!-- ✅ 正確 -->
<img src="chart.png" style="position: absolute; left: 50%; top: 20%; width: 300pt; height: 200pt;" />
```

**為什麼**：`html2pptx.js` 只從 `<img>` 元素提取圖片路徑，不解析 CSS 的 `background-image` URL。

---

## Path A HTML 模板骨架

每張 slide 一個獨立 HTML 檔案，彼此作用域隔離（避開單檔案 deck 的 CSS 污染）。

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 960pt; height: 540pt;           /* ⚠️ 匹配 LAYOUT_WIDE */
    font-family: system-ui, -apple-system, "PingFang TC", sans-serif;
    background: #FEFEF9;                    /* 純色，不能漸變 */
    overflow: hidden;
  }
  /* DIV 負責佈局/背景/邊框 */
  .card {
    position: absolute;
    background: #1A4A8A;                    /* 背景在 DIV 上 */
    border-radius: 4pt;
    padding: 12pt 16pt;
  }
  /* 文字標籤只負責字體樣式，不加背景/邊框 */
  .card h2 { font-size: 24pt; color: #FFFFFF; font-weight: 700; }
  .card p  { font-size: 14pt; color: rgba(255,255,255,0.85); }
</style>
</head>
<body>

  <!-- 標題區：外層 div 定位，內層文字標籤 -->
  <div style="position: absolute; top: 40pt; left: 60pt; right: 60pt;">
    <h1 style="font-size: 36pt; color: #1A1A1A; font-weight: 700;">標題用斷言句，不是主題詞</h1>
    <p style="font-size: 16pt; color: #555555; margin-top: 10pt;">副標題補充說明</p>
  </div>

  <!-- 內容卡片：div 負責背景，h2/p 負責文字 -->
  <div class="card" style="top: 130pt; left: 60pt; width: 240pt; height: 160pt;">
    <h2>要點一</h2>
    <p>簡短說明文字</p>
  </div>

  <!-- 列表：使用 ul/li，不用手動 • 符號 -->
  <div style="position: absolute; top: 320pt; left: 60pt; width: 540pt;">
    <ul style="font-size: 16pt; color: #1A1A1A; padding-left: 24pt; list-style: disc;">
      <li>第一條要點</li>
      <li>第二條要點</li>
      <li>第三條要點</li>
    </ul>
  </div>

  <!-- 插圖：用 <img> 標籤，不用 background-image -->
  <img src="illustration.png" style="position: absolute; right: 60pt; top: 110pt; width: 320pt; height: 240pt;" />

</body>
</html>
```

---

## 常見錯誤速查

| 錯誤訊息 | 原因 | 修復方法 |
|---------|------|---------|
| `DIV element contains unwrapped text "XXX"` | div 裡有裸文字 | 將文字包進 `<p>` 或 `<h1>`-`<h6>` |
| `CSS gradients are not supported` | 用了 linear/radial-gradient | 改為純色，或用 flex 子元素分段 |
| `Text element <p> has background` | `<p>` 標籤加了背景色 | 外套 `<div>` 承載背景，`<p>` 只寫文字 |
| `Background images on DIV elements are not supported` | div 用了 background-image | 改為 `<img>` 標籤 |
| `HTML content overflows body by Xpt vertically` | 內容超出 540pt | 減少內容或縮小字號，或 `overflow: hidden` 截斷 |
| `HTML dimensions don't match presentation layout` | body 尺寸和 pres layout 對不上 | body 用 `960pt × 540pt` 配 `LAYOUT_WIDE`；或 defineLayout 自定義尺寸 |
| `Text box "XXX" ends too close to bottom edge` | 大字號 `<p>` 距離 body 底邊 < 0.5 inch | 往上挪，留足下邊距；PPT 底部本身就會被遮住一部分 |

---

## 基本工作流（3 步出 PPTX）

### Step 1：按約束寫每頁獨立 HTML

```
我的Deck/
├── slides/
│   ├── 01-cover.html    # 每個檔案都是完整 960×540pt HTML
│   ├── 02-agenda.html
│   └── ...
└── illustration/        # 所有 <img> 引用的圖片
    ├── chart1.png
    └── ...
```

### Step 2：寫 build.js 呼叫 `html2pptx.js`

```js
const pptxgen = require('pptxgenjs');
const html2pptx = require('../scripts/html2pptx.js');  // 本 skill 腳本

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch，匹配 HTML 的 960×540pt

  const slides = ['01-cover.html', '02-agenda.html', '03-content.html'];
  for (const file of slides) {
    await html2pptx(`./slides/${file}`, pres);
  }

  await pres.writeFile({ fileName: 'deck.pptx' });
})();
```

### Step 3：打開檢查

- PowerPoint/Keynote 打開匯出 PPTX
- 按兩下任意文字應能直接編輯（如果是圖片說明第 1 條違反了）
- 驗證 overflow：每頁應該在 body 範圍內，沒有被截斷

---

## 這條路徑 vs 其他選項（什麼時候選什麼）

| 需求 | 選什麼 |
|------|------|
| 同事會改 PPTX 裡的文字 / 發給非技術人員繼續編輯 | **本文路徑**（editable，需從頭按 4 條約束寫 HTML） |
| 只是演講用 / 發存檔，不再改 | `export_deck_pdf.mjs`（多檔案）或 `export_deck_stage_pdf.mjs`（單檔案 deck-stage），出向量 PDF |
| 視覺自由度優先（動畫、web component、CSS 漸變、複雜 SVG），接受不可編輯 | **PDF**（同上）——PDF 既保真又跨平台，比「圖片 PPTX」更合適 |

**絕不要在視覺自由寫好的 HTML 上硬跑 html2pptx**——實測視覺驅動的 HTML pass 率 < 30%，剩下的逐頁改造比重寫還慢。這種場景應該出 PDF，不是硬擠 PPTX。

---

## Fallback：已有視覺稿但使用者堅持要 editable PPTX

偶爾會遇到這個場景：你/使用者已經寫好一份視覺驅動的 HTML（漸變、web component、複雜 SVG 都用上了），本來出 PDF 最合適，但使用者明確說「不行，必須是可編輯的 PPTX」。

**不要硬跑 `html2pptx` 期待它 pass**——實測視覺驅動 HTML 在 html2pptx 上 pass 率 <30%，剩下 70% 會出錯或走樣。正確的 fallback 是：

### Step 1 · 先告知侷限性（透明溝通）

一句話跟使用者說清三件事：

> 「你現在的 HTML 用了 [具體列出：漸變 / web component / 複雜 SVG / ...]，直接轉 editable PPTX 會 fail（失敗）。我有兩個方案：
> - A. **出 PDF**（推薦）——視覺 100% 保留，接收方能看能印但不能改文字
> - B. **以視覺稿為藍本，重寫一版 editable HTML**（保留色彩/佈局/文案的設計決策，但按 4 條硬約束重新組織 HTML 結構，**犧牲**漸變、web component、複雜 SVG 等視覺能力）→ 再匯出 editable PPTX
>
> 你選哪個？」

不要把 B 方案說得雲淡風輕——明確告知**會遺失什麼**。讓使用者做取舍。

### Step 2 · 如果使用者選 B：AI 主動改寫，不要求使用者自己寫

這裡的 doctrine（教條/準則）是：**使用者給的是設計意圖，你負責翻譯成合規實作**。不是讓使用者去學 4 條硬約束然後自己重寫。

改寫時的遵循原則：
- **保留**：色彩系統（主色/輔色/中性色）、訊息層級（標題/副標題/內文/註解）、核心文案、layout（佈局）骨架（上中下 / 左右分欄 / 網格）、頁面節奏
- **降級**：CSS 漸變 → 純色或 flex 分段、web component → 段落級 HTML、複雜 SVG → 簡化的 `<img>` 或純色幾何、陰影 → 刪除或降為極弱、自定義字體 → 向系統字體靠攏
- **重寫**：裸文字 → 包進 `<p>` / `<h*>`、`background-image` → `<img>` 標籤、`<p>` 上的背景邊框 → 外層 div 承載

### Step 3 · 產出對照清單（透明交付）

改寫完成後給使用者一份 before/after（之前/之後）對照，讓他知道哪些視覺細節被簡化了：

```
原設計 → editable 版調整
- 標題區紫色漸變 → 主色 #5B3DE8 純色背景
- 資料卡片陰影 → 刪除（改為 2pt 描邊區分）
- 複雜 SVG 摺線圖 → 簡化為 <img> PNG（從 HTML 截圖生成）
- Hero 區 web component 動效 → 靜態首影格（web component 無法翻譯）
```

### Step 4 · 匯出 & 雙格式交付

- `editable` 版 HTML → 跑 `scripts/export_deck_pptx.mjs` 出可編輯 PPTX
- **建議同時保留**原視覺稿 → 跑 `scripts/export_deck_pdf.mjs` 出高傳真 PDF
- 雙格式交付給使用者：視覺稿的 PDF + 可編輯的 PPTX，各司其職

### 什麼情況下直接拒絕 B 方案

個別場景下改寫代價過高，應該勸使用者放棄 editable PPTX：
- HTML 核心價值是動畫或互動（改寫後只剩靜態首影格，訊息量損失 50%+）
- 頁數 > 30，改寫成本超過 2 小時
- 視覺設計深度依賴精確 SVG / 自定義 filter（改寫後和原圖幾乎無關）

此時告訴使用者：「這個 deck 改寫代價過高，建議出 PDF 而不是 PPTX。如果接收方確實要 pptx 格式，就接受視覺會大幅樸素化——要不要換成 PDF？」

---

## 為什麼 4 條約束不是 Bug 而是物理約束

這 4 條不是 `html2pptx.js` 作者偷懶——它們是 **PowerPoint 檔案格式（OOXML）本身的約束**投射到 HTML 上的結果：

- PPTX 裡文字必須在 text frame（`<a:txBody>`），對應段落級 HTML 元素
- PPTX 的 shape 和 text frame 是兩個物件，無法在同一 element 上同時畫背景和寫文字
- PPTX 的 shape fill 對 gradient（漸變）支援有限（僅某些預設漸變，不支援 CSS 任意角度漸變）
- PPTX 的 picture 物件必須引用真實圖片檔案，不是 CSS 屬性

理解這點後，**不要期待工具變聰明** —— 是 HTML 寫法要適配 PPTX 格式，不是反過來。
