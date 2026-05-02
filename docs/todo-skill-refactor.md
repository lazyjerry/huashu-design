# SKILL.md 重構計畫：輕量化與模組化

## 核心目標
- **降低 Token 消耗**：將 `SKILL.md` 從目前的 700+ 行縮減至 150 行以內，僅保留核心身分定位與任務派發邏輯。
- **提升維護性**：將具體的硬流程（Hard Protocols）與特定場景守則拆分至 `references/`，使 Agent 能按需讀取。
- **優化執行精準度**：透過模組化文件，讓 Agent 在執行特定任務時（如品牌資產採集）能專注於該專屬守則。

## 拆分方案 (Mapping)

| 原始章節 | 目標檔案 | 備註 |
| :--- | :--- | :--- |
| 核心原則 #0 · 事實驗證 | `references/fact-checking.md` | 包含 WebSearch 硬流程與 product-facts.md 規範 |
| 核心資產協議 (§1.a) | `references/asset-protocol.md` | 包含 5 步硬流程、5-10-2-8 原則、brand-spec.md 模板 |
| 設計方向顧問 (Fallback) | `references/design-advisor.md` | 包含 8 個 Phase 的完整顧問流程 |
| 反 AI Slop 清單 | `references/anti-slop.md` | 與 `content-guidelines.md` 合併或獨立，聚焦「為什麼」與「如何避免」 |
| App / iOS 原型專屬守則 | `references/app-rules.md` | 包含裝置框硬性繫結、真圖取用邏輯、交付形態 |
| Starter Components | `references/technical-specs.md` | 詳細的組件功能表與技術參數 |
| 技術紅線 (React+Babel) | `references/react-setup.md` | 合併至既有的 React 設定文件 |

## 待辦事項清單 (Todo List)

### Phase 1: 建立/更新引用文件
- [x] 建立 `references/fact-checking.md` 並移轉事實驗證流程。
- [x] 建立 `references/asset-protocol.md` 並移轉資產採集協議。
- [x] 建立 `references/design-advisor.md` 並移轉顧問模式流程。
- [x] 建立 `references/app-rules.md` 並移轉行動裝置原型守則。
- [x] 建立 `references/anti-slop.md` (或更新 `content-guidelines.md`)。
- [x] 更新 `references/react-setup.md` 納入技術紅線與組件詳解。

### Phase 2: 重構 SKILL.md 主檔
- [x] **精簡身分定義**：保留設計師身分與專門專家 (Embody) 的描述。
- [x] **重寫任務決策樹**：根據任務類型（簡報、動畫、原型、顧問）引導 Agent 讀取對應的 `references/`。
- [x] **優化工作流程 (Workflow)**：僅保留 Checkpoints 與高階步驟，具體細節指向外部文件。
- [x] **保留觸發詞 (Triggers)**：確保 Skill 觸發機制不受影響。

### Phase 3: 驗證與調整
- [x] 測試 Agent 在處理「品牌任務」時是否會主動讀取 `references/asset-protocol.md`。
- [x] 檢查 `SKILL.md` 的 Token 節省量。
- [x] 確保所有相對路徑引用正確無誤。

## 驗證結果

- `SKILL.md` 已改成路由式主檔，品牌任務明確指向 `references/asset-protocol.md`。
- 新增拆分檔：`fact-checking.md`、`asset-protocol.md`、`design-advisor.md`、`app-rules.md`、`anti-slop.md`。
- 補充 `references/technical-specs.md`，並在 `references/react-setup.md` 加入技術紅線速查。

---
*註：本重構計畫遵循「謹慎為主」原則，確保在拆分過程中不遺漏任何花叔原話中提到的核心約束。*
