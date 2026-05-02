# App Rules：App / iOS 原型專屬守則

做行動 app 原型時，這份文件覆蓋通用 placeholder 原則。原型是 demo 現場，不是靜態擺拍。

## 1. 先定架構

預設單檔案 inline React：JSX、資料、樣式都寫進主 HTML 的 `<script type="text/babel">`。

不要預設拆外部檔案，因為 `file://` 下容易被瀏覽器當跨來源擋掉。

只有兩種情況拆：

- 單檔超過 1000 行難維護
- 需要多 agent 並行處理不同頁面

| 場景 | 架構 | 交付 |
|---|---|---|
| 4-6 屏原型 | 單檔 inline | 一個 HTML 雙擊開 |
| 大型 App | 多 jsx + server | 附啟動命令 |
| 多 agent 並行 | 多 HTML + iframe | `index.html` 聚合 |

## 2. 真圖優先

預設主動找真實圖片，不用 SVG 假畫，不拿米白卡硬墊。

| 場景 | 首選來源 |
|---|---|
| 美術 / 博物館 / 歷史 | Wikimedia、Met、Art Institute |
| 一般攝影 | Unsplash、Pexels |
| 使用者本地素材 | `~/Downloads`、專案 archive、私有素材庫 |

取圖前先做誠實性測試：拿掉這張圖，資訊有沒有損失？

- 沒損失：不要加
- 有損失：必須加

## 3. 先問交付形態

多屏原型有兩種標準交付：

| 形態 | 適用 | 做法 |
|---|---|---|
| Overview 平鋪 | 看全貌、比較頁面、一眼 review | 每屏一臺獨立裝置並排 |
| Flow demo 單機 | 要走完整使用者流程 | 單臺裝置 + AppPhone 狀態管理 |

關鍵詞含「平鋪、所有頁面、比較」時走 overview。
關鍵詞含「流程、clickable、可互動」時走 flow demo。

## 4. 交付前跑點選測試

至少測三件事：

- 進入詳情
- 點關鍵標註點
- 切換 tab

檢查 `pageerror` 為 0 才交付。

## 5. 品位錨點

- 字型：襯線 display + `-apple-system` body
- 色彩：一個有溫度的底色 + 單一 accent
- 預設剋制，但 AI / Dashboard / Tracker / Copilot 類產品要有足夠資訊密度
- 留一個值得截圖的 hero 細節，不要每個地方平均用力

## 6. iPhone 外殼禁止手寫

做 iPhone mockup 必須用 `assets/ios_frame.jsx`，不要自己畫 Dynamic Island、status bar、home indicator。

原因：位置一錯就顯得很假，而且這些規格已在元件裡對齊過。

使用方式：

1. 讀 `assets/ios_frame.jsx`
2. 內嵌 `iosFrameStyles` 與 `IosFrame`
3. 你的畫面包在 `<IosFrame>` 裡

只有使用者明確要求 Android、非 Pro 劉海、自訂裝置形態時才繞過。