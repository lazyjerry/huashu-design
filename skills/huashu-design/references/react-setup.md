# React + Babel 專案規範

用 HTML + React + Babel 做原型（Prototype）時必須遵守的技術規範。不遵守會出錯。

## Pinned Script Tags（必須使用這些版本）

在 HTML 的 `<head>` 裡放這三個 script tag，使用**固定版本 + integrity hash**：

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
```

**不要**使用 `react@18` 或 `react@latest` 這種 unpinned（未固定）版本——會出現版本漂移/快取問題。

**不要**省略 `integrity`——CDN 一旦被劫持或竄改，這是防線。

## 技術紅線速查

React + Babel 專案最低限度守這些：

1. 不要寫通用的 `const styles = {...}`，每個檔案都要唯一命名，例如 `terminalStyles`
2. 多個 `<script type="text/babel">` 作用域不共享，跨檔案元件與工具都要 `Object.assign(window, {...})`
3. 不要用 `scrollIntoView`，改用容器內捲動控制
4. 固定尺寸內容自己做 auto-scale + letterboxing
5. 簡報先決定是多檔 `deck_index.html` 還是單檔 `deck_stage.js`

Starter Components、匯出工具、簡報架構表請讀 `references/technical-specs.md`。

## 檔案結構

```
專案名/
├── index.html               # 主 HTML
├── components.jsx           # 元件檔案（type="text/babel" 載入）
├── data.js                  # 資料檔案
└── styles.css               # 額外 CSS（選填）
```

HTML 裡載入方式：

```html
<!-- 先 React + Babel -->
<script src="https://unpkg.com/react@18.3.1/..."></script>
<script src="https://unpkg.com/react-dom@18.3.1/..."></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/..."></script>

<!-- 然後你的元件檔案 -->
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel" src="pages.jsx"></script>

<!-- 最後主入口 -->
<script type="text/babel">
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
</script>
```

**不要**使用 `type="module"` ——會和 Babel 衝突。

## 三條不可違反的規矩

### 規矩 1：styles 物件必須使用唯一命名

**錯誤**（多元件時必炸）：
```jsx
// components.jsx
const styles = { button: {...}, card: {...} };

// pages.jsx  ← 同名覆蓋！
const styles = { container: {...}, header: {...} };
```

**正確**：每個元件檔案的 styles 使用唯一前綴。

```jsx
// terminal.jsx
const terminalStyles = { 
  screen: {...}, 
  line: {...} 
};

// sidebar.jsx
const sidebarStyles = { 
  container: {...}, 
  item: {...} 
};
```

**或者使用 inline styles（行內樣式）**（小元件推薦）：
```jsx
<div style={{ padding: 16, background: '#111' }}>...</div>
```

這條是**非協商**的。每次編寫 `const styles = {...}` 都必須 replace（替換）成 specific（特定）命名，否則多元件載入時全部出錯。

### 規矩 2：Scope（作用域）不共享，需手動 export（匯出）

**關鍵認知**：每個 `<script type="text/babel">` 被 Babel 獨立編譯，它們之間 **scope 不通**。`components.jsx` 裡定義的 `Terminal` 元件，在 `pages.jsx` 裡**預設是 undefined**。

**解決方式**：在每個元件檔案末尾，把要共享的元件/工具 export 到 `window`：

```jsx
// components.jsx 末尾
function Terminal(props) { ... }
function Line(props) { ... }
const colors = { green: '#...', red: '#...' };

Object.assign(window, {
  Terminal, Line, colors,
  // 所有你要在別處用的都列在這裡
});
```

然後 `pages.jsx` 就能直接使用 `<Terminal />`，因為 JSX 會去 `window.Terminal` 找。

### 規矩 3：不要使用 scrollIntoView

`scrollIntoView` 會把整個 HTML 容器往上推，搞壞 web harness（測試載體）的佈局。**永遠不要使用**。

替代方案：
```js
// 滾到容器內某個位置
container.scrollTop = targetElement.offsetTop;

// 或者使用 element.scrollTo
container.scrollTo({
  top: targetElement.offsetTop - 100,
  behavior: 'smooth'
});
```

## 呼叫 Claude API（HTML 內）

部分原生設計代理人（design-agent）環境（如 Claude.ai Artifacts）有免設定的 `window.claude.complete`，但大部分代理人環境（Claude Code / Codex / Cursor / Trae / 等）在地端**沒有**。

如果你的 HTML 原型需要呼叫 LLM 做 demo（比如做個聊天介面），兩個選項：

### 選項 A：不真調，使用 mock

Demo 場景推薦。編寫一個假 helper，回傳預設的 response：
```jsx
window.claude = {
  async complete(prompt) {
    await new Promise(r => setTimeout(r, 800)); // 模擬延遲
    return "這是一個 mock 回應。真部署時請替換為真 API。";
  }
};
```

### 選項 B：真調 Anthropic API

需要 API key，使用者必須在 HTML 裡填入自己的 key 才能執行。**永遠不要把 key 硬編碼在 HTML 裡**。

```html
<input id="api-key" placeholder="貼上你的 Anthropic API key" />
<script>
window.claude = {
  async complete(prompt) {
    const key = document.getElementById('api-key').value;
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.content[0].text;
  }
};
</script>
```

**注意**：瀏覽器直接呼叫 Anthropic API 會遇到 CORS 問題。如果使用者給你的預覽環境不支援 CORS bypass，這條路不通。這時候使用選項 A mock，或者告訴使用者需要一個 proxy（代理）後端。

### 選項 C：使用代理人側的 LLM 能力生成 mock 資料

如果只是在地端演示用，可以在當前代理人對話裡臨時呼叫該代理人的 LLM 能力（或使用者安裝的多模型類 skill）先生成 mock 回應資料，再硬編碼寫進 HTML。這樣 HTML 執行時完全不依賴任何 API。

## 典型 HTML 起手模板

拷貝這個模板作為 React 原型的骨架：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Prototype Name</title>

  <!-- React + Babel pinned -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; }
    body { 
      font-family: -apple-system, 'SF Pro Text', sans-serif;
      background: #FAFAFA;
      color: #1A1A1A;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- 你的元件檔案 -->
  <script type="text/babel" src="components.jsx"></script>

  <!-- 主入口 -->
  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      return (
        <div style={{padding: 40}}>
          <h1>Hello</h1>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
```

## 常見錯誤及解決

**`styles is not defined` 或 `Cannot read property 'button' of undefined`**
→ 你在一個檔案裡定義了 `const styles`，另一個檔案覆蓋了。給每個改成 specific 命名。

**`Terminal is not defined`**
→ 跨檔案引用時 scope 不通。在定義 Terminal 的檔案末尾加 `Object.assign(window, {Terminal})`。

**整個頁面白屏，控制台沒錯誤**
→ 多半是 JSX 語法錯誤但 Babel 沒報在控制台。把 `babel.min.js` 臨時換成 `babel.js` 非壓縮版，錯誤訊息更清晰。

**ReactDOM.createRoot is not a function**
→ 版本不對。確認使用了 react-dom@18.3.1（而不是 17 或其他）。

**`Objects are not valid as a React child`**
→ 你算繪（Render）了一個物件而不是 JSX/字串。通常是 `{someObj}` 寫成了 `{someObj.name}`。

## 大專案怎麼拆檔案

**>1000 行的單檔案**難維護。分拆思路：

```
專案/
├── index.html
├── src/
│   ├── primitives.jsx      # 基礎元素：Button、Card、Badge...
│   ├── components.jsx      # 業務元件：UserCard、PostList...
│   ├── pages/
│   │   ├── home.jsx        # 首頁
│   │   ├── detail.jsx      # 詳情頁
│   │   └── settings.jsx    # 設定頁
│   ├── router.jsx          # 簡單路由（React state 切換）
│   └── app.jsx             # 入口元件
└── data.js                 # mock data
```

HTML 裡按順序載入：
```html
<script type="text/babel" src="src/primitives.jsx"></script>
<script type="text/babel" src="src/components.jsx"></script>
<script type="text/babel" src="src/pages/home.jsx"></script>
<script type="text/babel" src="src/pages/detail.jsx"></script>
<script type="text/babel" src="src/pages/settings.jsx"></script>
<script type="text/babel" src="src/router.jsx"></script>
<script type="text/babel" src="src/app.jsx"></script>
```

**每個檔案末尾**都要 `Object.assign(window, {...})` 匯出要共享的東西。
