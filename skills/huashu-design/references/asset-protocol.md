# Asset Protocol：核心資產協議

涉及具體品牌時，資產優先於規範。只抽色值、不找 logo 與主體素材，做出來會變成 generic 設計。

## 觸發條件

- 使用者提到明確品牌、公司、產品、客戶
- 任務要做品牌動畫、官網、簡報、原型、活動物料

前置條件：先完成 `references/fact-checking.md`。

## 核心理念

品牌被認出來，靠的是核心資產，不是口頭說自己有遵守品牌精神。

| 資產 | 識別度 | 必需性 |
|---|---|---|
| Logo | 最高 | 任何品牌必備 |
| 產品圖 / 產品渲染圖 | 極高 | 實體產品必備 |
| UI 截圖 / 介面素材 | 極高 | 數位產品必備 |
| 色值 | 中 | 輔助 |
| 字型 | 低 | 輔助 |
| 氣質關鍵詞 | 低 | 輔助 |

## 硬規則

- 只抽色值和字型，不找 logo / 產品圖 / UI 截圖：違規
- 用 CSS 剪影或 SVG 手畫代替真實產品：違規
- 找不到資產還硬做：違規
- 找不到時先停下來問，或改用誠實 placeholder

## 五步流程

### Step 1：一次問完整資產清單

```text
關於 <brand/product>，你手上有以下哪些資料？
1. Logo（SVG / 高畫質 PNG）
2. 產品圖 / 官方渲染圖
3. UI 截圖 / 介面素材
4. 色值清單
5. 字型清單
6. Brand guidelines / Figma / 官網連結
```

### Step 2：按資產類型搜官方來源

| 資產 | 優先搜尋路徑 |
|---|---|
| Logo | 官網 brand / press / press-kit / header inline SVG |
| 產品圖 | 產品頁 hero、gallery、press kit、官方 launch film 擷取 |
| UI 截圖 | App Store、Google Play、官網 screenshots、官方展示影片 |
| 色值 | inline CSS、Tailwind config、brand guidelines |
| 字型 | stylesheet、Google Fonts、brand guidelines |

兜底關鍵詞：

- `<brand> logo download SVG`
- `<brand> press kit`
- `<brand> <product> official renders`
- `<brand> app screenshots`

### Step 3：下載資產

#### Logo

1. 直接 SVG / PNG
2. 官網 HTML 抽 inline SVG
3. 官方社群頭像作最後手段

#### 產品圖

1. 官方產品頁 hero image
2. 官方 press kit
3. 官方 launch video 擷取影格
4. Wikimedia Commons
5. AI 生成兜底，但必須以官方參考圖為基底

#### UI 截圖

- App Store / Google Play
- 官網 screenshots
- 官方展示影片擷取影格
- 產品官方社群發布圖
- 使用者真實帳號截圖

### Step 4：驗證

| 資產 | 驗證標準 |
|---|---|
| Logo | 檔案存在、可開啟、至少兩版、透明底 |
| 產品圖 | 至少一張 2000px+、背景乾淨、多角度更佳 |
| UI 截圖 | 最新版本、無敏感資料、解析度正常 |
| 色值 | 從實際 SVG / HTML / CSS 抽，排除黑白灰 |

## 5-10-2-8 原則

Logo 不適用這條。Logo 有就一定用。

其他素材遵守：

- 搜尋 5 輪
- 蒐集 10 個候選
- 最終只選 2 個好的
- 每個至少 8/10

### 8/10 評分維度

1. 解析度
2. 版權清晰度
3. 與品牌氣質一致
4. 光線、構圖、風格一致
5. 能否獨立承擔敘事角色

不夠 8 分，寧可不用。

## `brand-spec.md` 模板

```markdown
# <Brand> · Brand Spec
> 採集日期：YYYY-MM-DD
> 資產來源：<來源列表>
> 資產完整度：<完整 / 部分 / 推斷>

## 核心資產

### Logo
- 主版本：`assets/<brand>-brand/logo.svg`
- 淺底反色版：`assets/<brand>-brand/logo-white.svg`

### 產品圖（實體產品必填）
- 主視角：`assets/<brand>-brand/product-hero.png`
- 細節圖：`assets/<brand>-brand/product-detail-1.png`

### UI 截圖（數位產品必填）
- 首頁：`assets/<brand>-brand/ui-home.png`
- 核心功能：`assets/<brand>-brand/ui-feature-<name>.png`

## 輔助資產

### 色板
- Primary: #XXXXXX
- Background: #XXXXXX
- Ink: #XXXXXX
- Accent: #XXXXXX

### 字型
- Display: <font stack>
- Body: <font stack>
- Mono: <font stack>

### 禁區
- <品牌不能出現的色、做法、語氣>

### 氣質關鍵詞
- <3-5 個>
```

## 執行紀律

- HTML 直接引用 `brand-spec.md` 內的真實資產路徑
- Logo 和產品圖用 `<img>`，不重畫
- CSS 變數從 spec 注入，不現場亂發明新色

## 找不到資產時的兜底

| 缺失 | 處理 |
|---|---|
| Logo | 停下問使用者 |
| 產品圖 | 官方參考圖 + AI 生成，或誠實 placeholder |
| UI 截圖 | 問使用者要帳號截圖，或抓官方展示影片影格 |
| 色值 | 進 `references/design-advisor.md` 推風格方向 |

## 常見反例

- 憑印象猜 Kimi 是橙色，結果官方主色是藍色
- 把產品示範內容的第三方品牌色誤當成主品牌色
- 用 CSS 剪影代替 DJI Pocket 4 實機圖，最後變成 generic 科技動畫

30 分鐘走完協議，通常能省掉後面幾小時返工。