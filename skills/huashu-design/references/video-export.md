# Video Export：HTML 動畫匯出為 MP4/GIF

當 HTML 動畫完成後，使用者常會詢問「可以匯出影片嗎」。這份指南提供了完整的作業流程。

## 何時進行匯出

**匯出時機**：
- 動畫已完整執行且經過視覺驗證（使用 Playwright 截圖確認各個時間點的狀態正確）。
- 使用者已在瀏覽器看過至少一次，並表示效果滿意。
- **切勿**在動畫 Bug 尚未修正完畢的階段匯出——匯出成影片後的修改成本更高。

**使用者可能提出的需求**：
- 「可以匯出成影片嗎？」
- 「轉成 MP4」
- 「做成 GIF」
- 「要 60fps」

## 產出規格

預設一次提供三種格式供使用者選擇：

| 格式 | 規格 | 適合場景 | 典型大小（30s） |
|---|---|---|---|
| MP4 25fps | 1920×1080 · H.264 · CRF 18 | 社群媒體嵌入、影音平台（YouTube/FB/IG） | 1-2 MB |
| MP4 60fps | 1920×1080 · minterpolate 插幀 · H.264 · CRF 18 | 高更新率展示、作品集、高品質展示 | 1.5-3 MB |
| GIF | 960×540 · 15fps · 調色盤（palette）優化 | Twitter/X、README、Slack 預覽 | 2-4 MB |

## 工具鏈

兩個指令腳本位於 `scripts/`：

### 1. `render-video.js` — HTML → MP4

錄製一個 25fps 的 MP4 基礎版本。依賴全域安裝的 Playwright。

```bash
NODE_PATH=$(npm root -g) node /path/to/claude-design/scripts/render-video.js <html檔案>
```

可選參數：
- `--duration=30` 動畫總時長（秒）。
- `--width=1920 --height=1080` 解析度。
- `--trim=2.2` 從影片開頭裁切掉的秒數（用於移除重新載入與字體載入時間）。
- `--fontwait=1.5` 字體載入等待時間（秒），字體較多時請調高。

輸出：與 HTML 檔案同目錄，檔名後綴為 `.mp4`。

### 2. `add-music.sh` — MP4 + BGM → MP4

為無聲 MP4 混入背景音樂（BGM），可根據場景（mood）從內建 BGM 庫中選擇，也可指定外部音檔。會自動匹配時長並加入淡入淡出（fade in/out）效果。

```bash
bash add-music.sh <input.mp4> [--mood=<name>] [--music=<path>] [--out=<path>]
```

**內建 BGM 庫**（位於 `assets/bgm-<mood>.mp3`）：

| `--mood=` | 風格 | 適合場景 |
|-----------|------|---------|
| `tech`（預設） | Apple Silicon / 發表會風格，簡約合成器+鋼琴 | 產品發布、AI 工具、Skill 宣傳 |
| `ad` | Upbeat 現代電子，具節奏起伏（build + drop） | 社交媒體廣告、產品預告、促銷片 |
| `educational` | 溫暖明亮、輕快吉他/電鋼琴，具親和力 | 科普、教學介紹、課程預告 |
| `educational-alt` | 同類別備選曲目 | 同上 |
| `tutorial` | Lo-fi 環境音，背景感極強 | 軟體演示、程式教學、長篇演示 |
| `tutorial-alt` | 同類別備選曲目 | 同上 |

**行為說明**：
- 音樂會根據影片時長進行裁切。
- 0.3s 淡入 + 1s 淡出（避免聲音突兀切斷）。
- 影片流使用 `-c:v copy` 不重新編碼，音訊使用 AAC 192k。
- `--music=<path>` 優先度高於 `--mood`，可直接指定任意外部音檔。
- 輸入錯誤的 mood 名稱會列出所有可用選項，不會靜默失敗。

**典型工作流**（動畫匯出三件套 + 配樂）：
```bash
node render-video.js animation.html                        # 錄影
bash convert-formats.sh animation.mp4                      # 產生 60fps + GIF
bash add-music.sh animation-60fps.mp4                      # 加入預設 tech BGM
# 或針對不同場景：
bash add-music.sh tutorial-demo.mp4 --mood=tutorial
bash add-music.sh product-promo.mp4 --mood=ad --out=promo-final.mp4
```

### 3. `convert-formats.sh` — MP4 → 60fps MP4 + GIF

從現有的 MP4 檔案產生 60fps 版本與 GIF。

```bash
bash /path/to/claude-design/scripts/convert-formats.sh <input.mp4> [gif_width] [--minterpolate]
```

輸出（與輸入檔案同目錄）：
- `<name>-60fps.mp4` — 預設使用 `fps=60` 幀複製（相容性廣）；加入 `--minterpolate` 則啟用高品質運動插幀。
- `<name>.gif` — 經過調色盤優化的 GIF（預設 960 寬度，可調整）。

**60fps 模式選擇**：

| 模式 | 指令 | 相容性 | 使用場景 |
|---|---|---|---|
| 幀複製（預設）| `convert-formats.sh in.mp4` | QuickTime/Safari/Chrome/VLC 全數支援 | 通用交付、上傳平台、社群媒體 |
| minterpolate 插幀 | `convert-formats.sh in.mp4 --minterpolate` | macOS QuickTime/Safari 可能無法播放 | 需要真實插幀的高品質展示場景，**交付前必須先在目標播放器測試**。 |

為什麼預設改為幀複製？minterpolate 輸出的 H.264 基本串流（elementary stream）存在已知的相容性錯誤——先前預設使用 minterpolate 時多次遇到「macOS QuickTime 無法開啟」的問題。詳見 `animation-pitfalls.md` 第 14 點。

`gif_width` 參數：
- 960（預設）—— 社交平台通用規格。
- 1280 —— 更清晰但檔案較大。
- 600 —— Twitter/X 優先載入規格。

## 完整流程（標準建議）

當使用者提出「匯出影片」後：

```bash
cd <專案目錄>

# 假設 $SKILL 指向本 Skill 的根目錄（請根據實際安裝位置替換）

# 1. 錄製 25fps 基礎 MP4
NODE_PATH=$(npm root -g) node "$SKILL/scripts/render-video.js" my-animation.html

# 2. 衍生出 60fps MP4 與 GIF
bash "$SKILL/scripts/convert-formats.sh" my-animation.mp4

# 產出清單：
# my-animation.mp4         (25fps · 1-2 MB)
# my-animation-60fps.mp4   (60fps · 1.5-3 MB)
# my-animation.gif         (15fps · 2-4 MB)
```

## 技術細節（排除故障用）

### Playwright `recordVideo` 的限制

- 幀率固定為 25fps，無法直接錄製 60fps（這是 Chromium Headless 的合成器上限）。
- 錄製從 Context 建立時即開始，必須使用 `trim` 裁切掉前段載入時間。
- 預設格式為 WebM，需要使用 FFmpeg 轉換為 H.264 MP4 才能通用播放。

`render-video.js` 已處理上述問題。

### FFmpeg `minterpolate` 參數

目前設定：`minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`

- `mi_mode=mci` — 運動補償插幀（motion compensation interpolation）。
- `mc_mode=aobmc` — 自適應重疊區塊運動補償（adaptive overlapped block motion compensation）。
- `me_mode=bidir` — 雙向運動估計。
- `vsbmc=1` — 可變大小區塊運動補償（variable size block motion compensation）。

對於 CSS **transform 動畫**（translate/scale/rotate）效果極佳。
對於**純淡入淡出（fade）** 可能會產生輕微的殘影（ghosting）——若使用者不滿意，請改用簡單的幀複製：

```bash
ffmpeg -i input.mp4 -r 60 -c:v libx264 ... output.mp4
```

### GIF 調色盤（palette）為何需要兩階段

GIF 格式僅支援 256 色。一次性處理的 GIF 會將全起動畫色彩壓縮至通用 256 色調色盤，這會讓米色背景+橘色這種細膩配色變得模糊。

兩階段處理流程：
1. `palettegen=stats_mode=diff` —— 先掃描全片，產生**針對此動畫的優化調色盤（optimal palette）**。
2. `paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle` —— 使用此調色盤編碼，`rectangle diff` 僅更新變化區域，大幅縮小檔案大小。

對於淡入淡出（fade）過渡，使用 `dither=bayer` 比 `none` 效果更平滑，但檔案會稍微變大。

## Pre-flight check（匯出前自檢）

匯出前請花 30 秒進行檢查：

- [ ] HTML 在瀏覽器中已完整執行過，且無主控台錯誤（console error）。
- [ ] 動畫第 0 幀為完整的初始狀態（而非空白載入中）。
- [ ] 動畫最後一幀為穩定的結束狀態（而非半途中斷）。
- [ ] 字體/圖片/Emoji 均正常渲染（參考 `animation-pitfalls.md`）。
- [ ] Duration 參數與 HTML 中的實際動畫時長相符。
- [ ] HTML 中的 Stage 檢測 `window.__recording` 強制 `loop=false`（手寫 Stage 必查；使用 `assets/animations.jsx` 則內建此功能）。
- [ ] 結尾 Sprite 的 `fadeOut={0}`（確保影片最後一幀不淡出）。
- [ ] 包含「Created by Huashu-Design」浮水印（動畫場景必加；第三方品牌作品需加「非官方出品 · 」前綴。詳見 SKILL.md 「Skill 推廣浮水印」一節）。

## 交付時附帶的說明

匯出完成後提供給使用者的標準說明格式：

```
**完整交付內容**

| 檔案 | 格式 | 規格 | 大小 |
|---|---|---|---|
| foo.mp4 | MP4 | 1920×1080 · 25fps · H.264 | X MB |
| foo-60fps.mp4 | MP4 | 1920×1080 · 60fps（運動插幀）· H.264 | X MB |
| foo.gif | GIF | 960×540 · 15fps · 調色盤優化 | X MB |

**說明**
- 60fps 影片使用 minterpolate 進行運動估計插幀，對於位移/縮放動畫效果極佳。
- GIF 檔案經過調色盤優化，30 秒動畫可壓縮至約 3MB 左右。

如需調整尺寸或幀率請告知。
```

## 常見使用者追加需求

| 使用者反饋 | 應對方式 |
|---|---|
| 「檔案太大了」 | MP4：將 CRF 提高至 23-28；GIF：降低解析度至 600 或將 fps 降至 10。 |
| 「GIF 太模糊」 | 將 `gif_width` 提高至 1280；或建議改用 MP4（微信/LINE/FB 等均支援）。 |
| 「需要豎屏 9:16」 | 修改 HTML 原始檔解析度與匯出參數 `--width=1080 --height=1920`，重新錄製。 |
| 「需要加浮水印」 | 使用 FFmpeg 加入 `-vf "drawtext=..."` 或 `overlay=` 指定一張 PNG 圖片。 |
| 「需要透明背景」 | MP4 不支援 Alpha 通道；請改用 WebM VP9 + Alpha 或 APNG 格式。 |
| 「需要無損畫質」 | 將 CRF 改為 0 並使用 `preset veryslow`（檔案會大 10 倍以上）。 |
