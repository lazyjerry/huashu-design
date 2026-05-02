# Design Advisor：需求模糊時的顧問模式

當使用者沒有 design context、只說「做個好看的」、或主動要風格建議時，不要硬做通用 hi-fi，先進顧問模式。

## 何時啟動

- 需求模糊
- 使用者要推薦風格、配色、設計哲學
- 沒有 design system、沒有品牌參考、也挖不出現成上下文
- 使用者直接說不知道要什麼風格

## 何時跳過

- 已有 Figma、品牌規範、截圖、明確風格參考
- 已清楚指定風格或目標
- 只是小修小補或工具型任務

不確定時，至少先給 3 個差異化方向讓使用者選。

## 八階段流程

### Phase 1：深度理解需求

一次最多問 3 個問題，聚焦受眾、核心資訊、情感基調、輸出格式。

### Phase 2：顧問式重述

用 100-200 字重述你理解的需求，最後接「基於這個理解，我準備了 3 個設計方向」。

### Phase 3：推薦 3 套設計哲學

每個方向必須包含：

- 設計師或機構名
- 為什麼適合這個任務
- 3-4 個標誌性視覺特徵
- 3-5 個氣質關鍵詞

三個方向必須來自不同流派。

| 流派 | 氣質 | 角色 |
|---|---|---|
| 資訊建築派 | 理性、資料驅動、剋制 | 安全選擇 |
| 運動詩學派 | 動感、沉浸、技術美學 | 大膽選擇 |
| 極簡主義派 | 留白、秩序、精緻 | 高階安全牌 |
| 實驗先鋒派 | 先鋒、生成藝術、衝擊 | 創新選擇 |
| 東方哲學派 | 溫潤、詩意、思辨 | 差異化選擇 |

詳細風格庫見 `references/design-styles.md`。

### Phase 4：展示 Showcase

先查 `assets/showcases/INDEX.md`，找到對應場景後展示截圖：

- 公眾號封面：`assets/showcases/cover/`
- PPT 資料頁：`assets/showcases/ppt/`
- 直版資訊圖：`assets/showcases/infographic/`
- 網站類：`assets/showcases/website-*/`

### Phase 5：生成 3 個視覺 Demo

- 優先用使用者真實內容
- HTML 存在 `_temp/design-demos/`
- 用 Playwright 截圖後並排展示
- 能並行就並行，不能並行就序列做

### Phase 6：讓使用者選

可選：

- 直接選一個深化
- 混搭，例如「A 的配色 + C 的佈局」
- 要求微調
- 全部重來

### Phase 7：生成 AI 提示詞

提示詞結構：設計哲學約束 + 內容描述 + 技術參數。

- 用具體特徵，不只用風格名
- 寫明色彩、比例、空間分配、輸出規格
- 避開 `references/anti-slop.md`

### Phase 8：回到主流程

方向定了之後，回 `references/workflow.md` 走 Junior Designer pass。

## 真實素材優先

若任務涉及使用者本人或其產品：

1. 先查私有 `personal-asset-index.json`
2. 首次使用就複製 `assets/personal-asset-index.example.json`
3. 找不到就問使用者，不編造