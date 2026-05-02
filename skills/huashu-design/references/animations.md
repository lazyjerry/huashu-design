# Animations：時間軸動畫引擎

做動畫/motion design（動態設計）HTML 時讀這個。原理、用法、典型模式。

## 核心模式：Stage + Sprite

我們的動畫系統（`assets/animations.jsx`）提供一個時間軸驅動的引擎：

- **`<Stage>`**：整個動畫的容器，自動提供 auto-scale（自動縮放，fit viewport）+ scrubber（進度條）+ play/pause/loop 控制
- **`<Sprite start end>`**：時間片段。一個 Sprite 只在 `start` 到 `end` 這段時間內顯示。內部可以透過 `useSprite()` hook 讀取自己的本地進度 `t` (0→1)
- **`useTime()`**：讀取當前全域時間（秒）
- **`Easing.easeInOut` / `Easing.easeOut` / ...**：緩動函式
- **`interpolate(t, from, to, easing?)`**：根據 t 內插（插值）

這套模式借鑒 Remotion/After Effects 思路，但輕量、零依賴。

## 起手

```html
<script type="text/babel" src="animations.jsx"></script>
<script type="text/babel">
  const { Stage, Sprite, useTime, useSprite, Easing, interpolate } = window.Animations;

  function Title() {
    const { t } = useSprite();  // 本地進度 0→1
    const opacity = interpolate(t, [0, 1], [0, 1], Easing.easeOut);
    const y = interpolate(t, [0, 1], [40, 0], Easing.easeOut);
    return (
      <h1 style={{ 
        opacity, 
        transform: `translateY(${y}px)`,
        fontSize: 120,
        fontWeight: 900,
      }}>
        Hello.
      </h1>
    );
  }

  function Scene() {
    return (
      <Stage duration={10}>  {/* 10秒動畫 */}
        <Sprite start={0} end={3}>
          <Title />
        </Sprite>
        <Sprite start={2} end={5}>
          <SubTitle />
        </Sprite>
        {/* ... */}
      </Stage>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<Scene />);
</script>
```

## 常用動畫模式

### 1. Fade In / Fade Out（淡入 / 淡出）

```jsx
function FadeIn({ children }) {
  const { t } = useSprite();
  const opacity = interpolate(t, [0, 0.3], [0, 1], Easing.easeOut);
  return <div style={{ opacity }}>{children}</div>;
}
```

**注意範圍**：`[0, 0.3]` 意思是在 sprite 的前 30% 時間完成漸入，後面保持 opacity=1。

### 2. Slide In（滑入）

```jsx
function SlideIn({ children, from = 'left' }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, 0.4], [0, 1], Easing.easeOut);
  const offset = (1 - progress) * 100;
  const directions = {
    left: `translateX(-${offset}px)`,
    right: `translateX(${offset}px)`,
    top: `translateY(-${offset}px)`,
    bottom: `translateY(${offset}px)`,
  };
  return (
    <div style={{
      transform: directions[from],
      opacity: progress,
    }}>
      {children}
    </div>
  );
}
```

### 3. 逐字打字機

```jsx
function Typewriter({ text }) {
  const { t } = useSprite();
  const charCount = Math.floor(text.length * Math.min(t * 2, 1));
  return <span>{text.slice(0, charCount)}</span>;
}
```

### 4. 數字計數

```jsx
function CountUp({ from = 0, to = 100, duration = 0.6 }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, duration], [0, 1], Easing.easeOut);
  const value = Math.floor(from + (to - from) * progress);
  return <span>{value.toLocaleString()}</span>;
}
```

### 5. 分段解釋（典型教學動畫）

```jsx
function Scene() {
  return (
    <Stage duration={20}>
      {/* Phase 1: 展示問題 */}
      <Sprite start={0} end={4}>
        <Problem />
      </Sprite>

      {/* Phase 2: 展示思路 */}
      <Sprite start={4} end={10}>
        <Approach />
      </Sprite>

      {/* Phase 3: 展示結果 */}
      <Sprite start={10} end={16}>
        <Result />
      </Sprite>

      {/* 全程顯示的字幕 */}
      <Sprite start={0} end={20}>
        <Caption />
      </Sprite>
    </Stage>
  );
}
```

## Easing 函式

預設的 easing curves（緩動曲線）：

| Easing | 特性 | 用在 |
|--------|------|------|
| `linear` | 勻速 | 捲動字幕、持續動畫 |
| `easeIn` | 慢→快 | 退場消失 |
| `easeOut` | 快→慢 | 登場出現 |
| `easeInOut` | 慢→快→慢 | 位置變化 |
| **`expoOut`** ⭐ | **指數緩出** | **Anthropic 等級主 easing**（物理重量感）|
| **`overshoot`** ⭐ | **彈性回彈** | **Toggle / 按鈕彈出 / 強調互動** |
| `spring` | 彈簧 | 互動回饋、幾何體歸位 |
| `anticipation` | 先反向再正向 | 強調動作 |

**預設主 easing 用 `expoOut`**（不是 `easeOut`）—— 見 `animation-best-practices.md` §2。
登場用 `expoOut`、出場用 `easeIn`、toggle 用 `overshoot`——Anthropic 等級動畫的基礎規律。

## 節奏和時長指南

### 微互動（0.1-0.3 秒）
- 按鈕 hover
- 卡片 expand（展開）
- Tooltip（工具提示）出現

### UI 過渡（0.3-0.8 秒）
- 頁面切換
- 模態框（Modal）出現
- 列表 item（項目）加入

### 敘事動畫（每段 2-10 秒）
- 概念解釋的一個 phase（階段）
- 資料圖表的 reveal（揭示）
- 場景轉換

### 單段敘事動畫最長不超過 10 秒
人類注意力有限。10 秒講一件事，講完換下一件。

## 設計動畫的思考順序

### 1. 先有內容/故事，再有動畫

**錯誤**：先想要做 fancy（華麗）動畫，再塞內容進去
**正確**：先想清楚要傳達什麼訊息，再用動畫手段 serve（服務）這個訊息

動畫是 **signal（訊號）**，不是**裝飾**。一個 fade-in 強調的是「這裡很重要，請看」——如果什麼都 fade-in，signal 就失效。

### 2. 分 Scene（場景）寫時間軸

```
0:00 - 0:03   問題出現（fade in）
0:03 - 0:06   問題放大/展開（zoom+pan）
0:06 - 0:09   解法出現（slide in from right）
0:09 - 0:12   解法展開說明（typewriter）
0:12 - 0:15   結果演示（counter up + chart reveal）
0:15 - 0:18   總結一句話（static，讀 3 秒）
0:18 - 0:20   CTA 或 fade out
```

寫完時間軸再寫元件。

### 3. 資源先行

動畫要用的圖片/圖示/字體**先**準備好。不要畫到一半去找素材——打斷節奏。

## 常見問題

**動畫卡頓**
→ 主要是 layout thrashing（佈局顛簸）。用 `transform` 和 `opacity`，不要動 `top`/`left`/`width`/`height`/`margin`。瀏覽器 GPU 加速 `transform`。

**動畫太快，看不清楚**
→ 人讀一個漢字需要 100-150ms，一個詞 300-500ms。如果你用文字講故事，單句至少留 3 秒。

**動畫太慢，觀眾無聊**
→ 有趣的視覺變化要密集。靜態畫面超過 5 秒就會悶。

**多個動畫互相影響**
→ 用 CSS 的 `will-change: transform` 提前告訴瀏覽器這個元素會動，減少 reflow（重排）。

**錄製成影片**
→ 用 skill 自帶工具鏈（一條命令出三種格式）：見 `video-export.md`
- `scripts/render-video.js` — HTML → 25fps MP4（Playwright + ffmpeg）
- `scripts/convert-formats.sh` — 25fps MP4 → 60fps MP4 + 優化 GIF
- 想要更精確的影格算繪？讓 render(t) 成為 pure function，見 `animation-pitfalls.md` 第 5 條

## 和影片工具的配合

這個 skill 做的是 **HTML 動畫**（在瀏覽器裡跑的）。如果最終產出要作為影片素材：

- **短動畫/concept demo（概念演示）**：用這裡的方法做 HTML 動畫 → 螢幕錄製
- **長影片/敘事**：本 skill 專注 HTML 動畫，長影片用 AI 影片生成類 skill 或專業影片軟體
- **motion graphics（動態圖形）**：專業的 After Effects/Motion Canvas 更合適

## 關於 Popmotion 等庫

如果你真的需要物理動畫（spring、decay、keyframes with precise timing），我們的 engine（引擎）搞不定，可以 fallback 到 Popmotion：

```html
<script src="https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js"></script>
```

但**先試試我們的 engine**。90% 的情況夠用。
