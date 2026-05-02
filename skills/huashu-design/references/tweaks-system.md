# Tweaks：設計變體即時調參系統

微調（Tweaks）是本 Skill 的核心能力之一——讓使用者不需要修改程式碼，就能即時切換變體（variations）或調整參數。

**跨 Agent 環境適配**：某些設計 Agent 的原生環境（例如 Claude.ai Artifacts）依賴主機（host）的 `postMessage` 將 Tweak 的數值寫回原始碼以實現持久化（persistence）。本 Skill 採用**純前端 localStorage 方案**——效果相同（重新整理後仍保留狀態），但持久化發生在瀏覽器的 localStorage 中，而非原始碼檔案。這個方案在任何 Agent 環境（Claude Code / Codex / Cursor / Trae 等）都能運作。

## 何時加入 Tweaks

- 使用者明確要求「可以調整參數」或「提供多個版本切換」時。
- 設計中有多個變體（variations）需要進行對比時。
- 使用者雖然沒明說，但你主觀判斷**加入幾個有啟發性的 Tweaks 能幫助使用者看見更多可能性**時。

預設建議：**每個設計都加入 2-3 個 Tweaks**（例如顏色主題、字級、佈局變體），即使使用者沒有要求——讓使用者看見設計的可能性空間也是設計服務的一部分。

## 實作方式（純前端版本）

### 基本結構

```jsx
const TWEAK_DEFAULTS = {
  "primaryColor": "#D97757",
  "fontSize": 16,
  "density": "comfortable",
  "dark": false
};

function useTweaks() {
  const [tweaks, setTweaks] = React.useState(() => {
    try {
      const stored = localStorage.getItem('design-tweaks');
      return stored ? { ...TWEAK_DEFAULTS, ...JSON.parse(stored) } : TWEAK_DEFAULTS;
    } catch {
      return TWEAK_DEFAULTS;
    }
  });

  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    try {
      localStorage.setItem('design-tweaks', JSON.stringify(next));
    } catch {}
  };

  const reset = () => {
    setTweaks(TWEAK_DEFAULTS);
    try {
      localStorage.removeItem('design-tweaks');
    } catch {}
  };

  return { tweaks, update, reset };
}
```

### Tweaks 面板 UI

右下角浮動面板，支援摺疊收合：

```jsx
function TweaksPanel() {
  const { tweaks, update, reset } = useTweaks();
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
    }}>
      {open ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          width: 280,
          fontFamily: 'system-ui',
          fontSize: 13,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <strong>Tweaks</strong>
            <button onClick={() => setOpen(false)} style={{
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
            }}>×</button>
          </div>

          {/* 顏色選擇 */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>主色</div>
            <input 
              type="color" 
              value={tweaks.primaryColor} 
              onChange={e => update({ primaryColor: e.target.value })}
              style={{ width: '100%', height: 32 }}
            />
          </label>

          {/* 字級滑桿 */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>字級 ({tweaks.fontSize}px)</div>
            <input 
              type="range" 
              min={12} max={24} step={1}
              value={tweaks.fontSize}
              onChange={e => update({ fontSize: +e.target.value })}
              style={{ width: '100%' }}
            />
          </label>

          {/* 密度選項 */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>密度</div>
            <select 
              value={tweaks.density}
              onChange={e => update({ density: e.target.value })}
              style={{ width: '100%', padding: 6 }}
            >
              <option value="compact">緊湊</option>
              <option value="comfortable">舒適</option>
              <option value="spacious">寬鬆</option>
            </select>
          </label>

          {/* 暗黑模式切換 */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <input 
              type="checkbox" 
              checked={tweaks.dark}
              onChange={e => update({ dark: e.target.checked })}
            />
            <span>暗黑模式</span>
          </label>

          <button onClick={reset} style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
          }}>重置</button>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          style={{
            background: '#1A1A1A',
            color: 'white',
            border: 'none',
            borderRadius: 999,
            padding: '10px 16px',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >⚙ Tweaks</button>
      )}
    </div>
  );
}
```

### 應用 Tweaks

在主元件中使用 Tweaks：

```jsx
function App() {
  const { tweaks } = useTweaks();

  return (
    <div style={{
      '--primary': tweaks.primaryColor,
      '--font-size': `${tweaks.fontSize}px`,
      background: tweaks.dark ? '#0A0A0A' : '#FAFAFA',
      color: tweaks.dark ? '#FAFAFA' : '#1A1A1A',
    }}>
      {/* 你的內容 */}
      <TweaksPanel />
    </div>
  );
}
```

在 CSS 中使用變數：

```css
button.cta {
  background: var(--primary);
  color: white;
  font-size: var(--font-size);
}
```

## 典型 Tweak 選項建議

根據不同類型的設計建議加入的 Tweaks：

### 通用選項
- 主色（Color Picker 顏色選擇器）
- 字級（Slider 滑桿 12-24px）
- 字型（Select 下拉選單：標題字型 vs 正文字型）
- 暗黑模式（Toggle 切換開關）

### 簡報（Deck）
- 主題（亮色/暗色/品牌色）
- 背景樣式（純色/漸層/圖片）
- 字體對比（裝飾性強 vs 簡約克制）
- 資訊密度（極簡/標準/密集）

### 產品原型（Prototype）
- 佈局變體（Layout A / B / C）
- 互動速度（動畫速度 0.5x - 2x）
- 資料量（Mock 資料筆數 5/20/100）
- 狀態（空白/載入中/成功/錯誤）

### 動畫
- 速度（0.5x - 2x）
- 循環（一次/循環/來回播放）
- 補間動畫函數（Linear / EaseOut / Spring）

### 到陸頁（Landing Page）
- Hero 區域風格（圖片/漸層/圖案/純色）
- CTA 文案（幾種變體）
- 結構（單欄 / 雙欄 / 側邊欄）

## Tweaks 設計原則

### 1. 有意義的選項，而非瑣碎調整

每個 Tweak 必須展示**真實的設計選項**。避免加入沒人會真正切換的 Tweak（例如圓角半徑 0-50px 的滑桿——使用者調完後會發現大部分中間值都很醜）。

好的 Tweak 應暴露**離散的、經過思考的變體**：
- 「圓角風格」：無圓角 / 微圓角 / 大圓角（三個選項）
- 而非：「圓角」：0-50px 滑桿

### 2. 少即是多

一個設計的 Tweaks 面板**最多建議 5-6 個**選項。過多會變成「設定頁面」，失去快速探索變體的意義。

### 3. 預設值即完成設計

Tweaks 是**錦上添花**。預設值本身必須是一個完整、可發布的設計。使用者關閉 Tweaks 面板後看到的就應該是最終產出。

### 4. 合理分組

選項較多時請分組顯示：

```
---- 視覺 ----
主色 | 字級 | 暗黑模式

---- 佈局 ----
密度 | 側欄位置

---- 內容 ----
顯示資料量 | 狀態
```

## 向前相容原始碼級持久化（Source Persistence）

如果你希望將設計上傳到支援原始碼級 Tweaks（例如 Claude.ai Artifacts）的環境中也能運作，請保留 **EDITMODE 標記區塊**：

```jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#D97757",
  "fontSize": 16,
  "density": "comfortable",
  "dark": false
}/*EDITMODE-END*/;
```

標記區塊在 localStorage 方案中**無實際作用**（僅作為一般註釋），但在支援原始碼寫回（write-back）的主機環境中會被讀取，以實現原始碼級持久化。加上這個對目前環境無害，同時能保持向前相容。

## 常見問題

**Tweaks 面板遮擋了設計內容**
→ 提供關閉功能。預設關閉，顯示一個小按鈕，使用者點擊後才展開。

**使用者切換 Tweaks 後重新整理需要重複設定**
→ 本方案已使用 localStorage。如果重新整理後未持久化，請檢查 localStorage 是否可用（無痕模式可能會失敗，需使用 try-catch）。

**多個 HTML 頁面想要共享 Tweaks 設定**
→ 為 localStorage 的 key 加入專案名稱：`design-tweaks-[projectName]`。

**我想讓 Tweak 選項之間有連動關係**
→ 在 `update` 函數中加入邏輯處理：

```jsx
const update = (patch) => {
  let next = { ...tweaks, ...patch };
  // 連動：切換到 dark mode 時自動調整文字顏色
  if (patch.dark === true && !patch.textColor) {
    next.textColor = '#F0EEE6';
  }
  setTweaks(next);
  localStorage.setItem(...);
};
```
