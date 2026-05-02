# Verification：輸出驗證流程

某些設計 Agent 的原生環境（例如 Claude.ai Artifacts）內建了 `fork_verifier_agent`，可以啟動 Sub-agent 使用 iframe 截圖檢查。但在大部分 Agent 環境（Claude Code / Codex / Cursor / Trae 等）中並沒有這種內建能力——此時手動使用 Playwright 就能涵蓋相同的驗證場景。

## 驗證檢查清單

每次產出 HTML 後，請按照此清單執行一遍：

### 1. 瀏覽器渲染檢查（必做）

最基礎的驗證：**HTML 能否正常開啟**？在 macOS 上：

```bash
open -a "Google Chrome" "/path/to/your/design.html"
```

或者使用 Playwright 截圖（詳見下一節）。

### 2. 主控台錯誤檢查

HTML 檔案中最常見的問題是 JS 出錯導致白屏。使用 Playwright 執行檢查：

```bash
python scripts/verify.py path/to/design.html
```

這個腳本會：
1. 使用 Headless Chromium 開啟 HTML。
2. 將截圖儲存至專案目錄。
3. 擷取主控台錯誤（console errors）。
4. 報告執行狀態（status）。

詳見 `scripts/verify.py`。

### 3. 多視窗（Viewport）檢查

如果是回應式設計（responsive design），請擷取多個 Viewport：

```bash
python scripts/verify.py design.html --viewports 1920x1080,1440x900,768x1024,375x667
```

### 4. 互動檢查

微調（Tweaks）、動畫、按鈕切換——這些在預設的靜態截圖中無法看見。**建議讓使用者親自開啟瀏覽器點擊測試**，或者使用 Playwright 錄影：

```python
page.video.record('interaction.mp4')
```

### 5. 簡報（Deck）逐頁檢查

對於簡報類 HTML，請逐張擷取：

```bash
python scripts/verify.py deck.html --slides 10  # 擷取前 10 張
```

這會產生 `deck-slide-01.png`、`deck-slide-02.png` 等檔案，方便快速瀏覽。

## Playwright 設定（Setup）

首次使用需要執行：

```bash
# 如果尚未安裝
npm install -g playwright
npx playwright install chromium

# 或者使用 Python 版本
pip install playwright
playwright install chromium
```

如果使用者已經全域安裝 Playwright，直接使用即可。

## 截圖最佳實踐

### 擷取完整頁面

```python
page.screenshot(path='full.png', full_page=True)
```

### 擷取可見視窗（Viewport）

```python
page.screenshot(path='viewport.png')  # 預設僅擷取目前可見區域
```

### 擷取特定元素

```python
element = page.query_selector('.hero-section')
element.screenshot(path='hero.png')
```

### 高清截圖

```python
page = browser.new_page(device_scale_factor=2)  # Retina 畫質
```

### 等待動畫結束再截圖

```python
page.wait_for_timeout(2000)  # 等待 2 秒讓動畫穩定（settle）
page.screenshot(...)
```

## 提供截圖給使用者

### 直接開啟本地截圖

```bash
open screenshot.png
```

使用者會在自己的預覽程式（Preview）/ Figma / VSCode / 瀏覽器中查看。

### 上傳至圖床分享連結

如果需要提供給遠端協作者觀看（例如 Slack / 飛書 / 微信 / LINE），請使用者使用自己的圖床工具或 MCP 上傳：

```bash
python ~/Documents/寫作/tools/upload_image.py screenshot.png
```

這會傳回 ImgBB 的永久連結，可以貼到任何地方。

## 驗證出錯時的處理

### 頁面白屏（Blank Page）

主控台（Console）一定有錯誤訊息。請先檢查：

1. React + Babel script tag 的 integrity hash 是否正確（參考 `react-setup.md`）。
2. 是否為 `const styles = {...}` 命名衝突。
3. 跨檔案的元件是否有匯出（export）到 `window`。
4. JSX 語法錯誤（babel.min.js 可能不出錯，建議更換為 babel.js 非壓縮版本）。

### 動畫卡頓

- 使用 Chrome 開發者工具的 Performance 分頁進行錄製。
- 尋找佈局抖動（layout thrashing，頻繁的 reflow 重排）。
- 動效優先使用 `transform` 和 `opacity`（可觸發 GPU 加速）。

### 字體顯示不正確

- 檢查 `@font-face` 的 URL 是否可正常存取。
- 檢查 Fallback 字體設定。
- 中文字體載入較慢：建議先顯示 Fallback，載入完成後再切換。

### 佈局錯位

- 檢查 `box-sizing: border-box` 是否已全域套用。
- 檢查 `* { margin: 0; padding: 0; }` 的重設（reset）。
- 在 Chrome 開發者工具中開啟網格線（gridlines）查看實際佈局。

## 驗證：設計師的第二雙眼睛

**永遠要親自檢查一遍**。AI 產出程式碼時常會出現：

- 看起來沒問題但互動（interaction）有錯誤。
- 靜態截圖完美但捲動（scroll）時發生位移。
- 寬螢幕好看但窄螢幕崩潰。
- 忘了測試暗黑模式（Dark mode）。
- 微調（Tweaks）切換後某些元件沒有回應。

**最後 1 分鐘的驗證可以節省 1 小時的重工**。

## 常用驗證指令

```bash
# 基礎：開啟 + 截圖 + 擷取錯誤
python scripts/verify.py design.html

# 多視窗檢查
python scripts/verify.py design.html --viewports 1920x1080,375x667

# 多簡報頁檢查
python scripts/verify.py deck.html --slides 10

# 輸出至指定目錄
python scripts/verify.py design.html --output ./screenshots/

# 非 headless 模式：開啟真實瀏覽器供你檢查
python scripts/verify.py design.html --show
```
