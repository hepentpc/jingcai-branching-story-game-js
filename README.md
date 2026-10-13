# 經彩青春Do｜國中版・少男少女養成記

這是依照《經彩青春少男少女養成記｜國中版分支遊戲劇本｜網格修正版 V2》建置的月經友善互動分支遊戲。

## 使用方式

進入首頁閱讀三步驟動畫教學，開始遊戲後，依序閱讀青青的情境並選擇 A、B、C。三次選擇後會先看到選擇歷程，按「確定選擇」才會顯示做得好的地方、可以改進的地方以及過關狀態。「回頭再想一次」可以修改第三次選擇；上方「重新開始」及結局的「再玩一次」都會返回封面並清空上一輪選擇。

所有 **13 個情境**皆支援 16:9 劇情圖片。網站會依節點載入 `images/S0.webp`、`images/A1.webp`……`images/CC2.webp`；圖片尚未安裝時會保留「劇情圖片」佔位框，不顯示破圖。

## 一次上傳 13 張圖片（GitHub Actions 自動安裝）

已備妥新版、正確對應節點的圖片壓縮檔 **`jingcai-junior-13-images.zip`**，大小約 1.2 MB，內有 `images/代碼.webp` 共 13 張。

1. 從對話下載 **jingcai-junior-13-images.zip**。請使用這一份**新版圖包**；不要使用之前 36 MB、附中文原始圖的舊 ZIP。
2. 開啟 https://github.com/kaoelvmpvm/jingcai-branching-story-game-js/upload/main
3. **不要解壓縮**：直接上傳完整 ZIP 到 **main 分支的 Repository 根目錄**，檔名維持 `jingcai-junior-13-images.zip`，按 **Commit changes**。
4. GitHub Actions 會自動執行 **「安裝國中版十三張劇情圖片」**，檢查、解壓與驗證 13 張圖片，並提交到 `images/`。到 https://github.com/kaoelvmpvm/jingcai-branching-story-game-js/actions 確認工作流程顯示成功。
5. Pages 部署完成後，打開 https://kaoelvmpvm.github.io/jingcai-branching-story-game-js/ ，開始遊戲即可看見每個節點相應圖片。

若 GitHub Actions 在提交圖片時出現 `Permission denied` 或 `403`，請到 **Settings → Actions → General → Workflow permissions**，將權限改為 **Read and write permissions** 並重新執行。若 GitHub Pages 尚未啟用，到 Settings → Pages 選擇 main 分支的 /(root)。

> 注意：上傳 ZIP 後，需要等待 Actions 安裝成功及 Pages 發布；單純將 ZIP 放入 Repository 不會直接顯示圖片。

## 劇本與教育目標

- 13 個情境節點、39 個 ABC 選項，選項各增加四字行為／價值標籤，原始對話及跳轉保留 V2。
- 27 條唯一結局路徑，以及原版三句七字摘要、「做得好的地方」和「可以改進的地方」。
- 三個主題：**多元生理用品與生活自主、生理假與公平分工、月經迷思辨識及經期活動調節**。
- **暫定過關路徑 ACA、BAA、CAC**：取自原版文件列出的三條核心學習路徑，這是遊戲測試設定，並不是法規、官方評量標準或認定其他路徑毫無學習價值。
- UI 用語針對國中生設計，文字大小、按鈕觸控範圍與響應式版型延續國小版已完成的介面。

## 啟用網站

GitHub Pages：Settings → Pages → Deploy from a branch → main → /(root) → Save。

預計網址：https://kaoelvmpvm.github.io/jingcai-branching-story-game-js/

## 檔案說明

- `index.html`：首頁、遊戲操作頁、選擇確認與結局回饋。
- `assets/style.css`：完整響應式排版、大字級和教學動畫。
- `assets/app.js`：三層分支、回頭修改、確認回饋、重新開始、依情境代碼顯示圖片。
- `data/story.js`：13 個節點、39 個對話選項、四字標籤、暫定通關規則。
- `data/outcomes.js`：27 個結局及原版完整雙向回饋。
- `story-grid.html`：教師版劇本總覽、完整對照與 CSV 下載。
- `images/`：圖片 ZIP 安裝後自動出現的 13 張 WebP 插圖。
- `.github/workflows/install-images.yml`：收到 ZIP 自動安裝 13 張圖片。
- `tests/`：27 條路徑與操作流程的自動化測試。

## 測試

Node.js 20 以上，在根目錄執行：

```bash
node --test tests/*.test.cjs
```

修改通關路徑時，請編輯 `data/story.js` 的 `passRoutes`，並同步修正測試期望值。若未來要變更劇本內容，記得同時檢查節點的 `next` 跳轉與相應的結局回饋。
