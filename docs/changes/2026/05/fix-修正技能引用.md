# 修正技能引用

## 結論
修正 huashu-design skill 內 1 個失效文件連結，並移除 2 個 demo 對工作區外圖片目錄的依賴，讓本地文件與頁面可直接開啟。

## 問題分析
references/hero-animation-case-study.md 指向不存在的影片檔案，點擊後會失敗。

hero-animation-v10 系列 demo 依賴工作區外的圖片目錄。當該目錄不存在時，頁面會出現資源載入失敗，且改動初版仍殘留 BASE 預載引用，會在執行時拋出錯誤。

## 解決方案
將 case study 的本地參考改為現有的 hero-animation-v10.html。

將 hero-animation-v10.html 與 hero-animation-v10-en.html 的 gallery 圖片來源改成檔內產生的 SVG data URI poster，並同步調整 preload 邏輯，避免任何外部檔案依賴。

## 變更內容
- 更新 skills/huashu-design/references/hero-animation-case-study.md 的本地 demo 連結
- 更新 skills/huashu-design/demos/hero-animation-v10.html，改為使用內嵌 poster
- 更新 skills/huashu-design/demos/hero-animation-v10-en.html，改為使用內嵌 poster

## 注意事項
**向下相容性：**
- 不影響對外介面
- 僅變更文件連結與 demo 內部資源載入方式

**潛在錯誤：**
- 若後續需要還原真實投影片縮圖，需另外提供可攜式本地資產目錄，或將縮圖正式納入 repo
- 目前 poster 為程式生成的替代視覺，不代表原始投影片內容

**使用體驗影響：**
- case study 的本地參考可直接點開
- hero-animation-v10 系列 demo 不再依賴工作區外資料夾，跨機器開啟成功率較高
- gallery 會顯示自動生成的封面卡，而非外部匯出的投影片預覽圖
