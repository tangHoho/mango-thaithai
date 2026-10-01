# 芒果泰泰

從 44 個子音開始的泰文初學闖關遊戲（PWA）。可以加到手機主畫面，以全螢幕 App 的方式開啟。

## 內容

10 個單元、46 課：

| 單元 | 內容 |
|---|---|
| 1 中子音 | 9 個中子音與口訣 |
| 2 高子音 | 11 個高子音 |
| 3 低子音 | 24 個低子音（成對 / 單獨 / 少用） |
| 4 母音 | 長短母音、複合母音、特殊母音 |
| 5 尾音 | 8 種尾音、活尾音與死尾音 |
| 6 聲調規則 | 活死音節、無符號聲調、聲調符號 × 三類子音 |
| 7 特殊規則 | 前導 ห、前導 อ |
| 8 數字 | 泰文數字、11 / 20 例外、價錢 |
| 9 常用單字 | 人稱家人、吃喝、動詞、形容詞、問句詞 |
| 10 會話 | 打招呼、自我介紹、購物點餐、旅行求助（女生用語 ค่ะ / คะ） |

每課先用教學卡介紹新內容，再出 8–12 題（看字選音、聽音選字、看中文選泰文、聲調 / 尾音判斷、配對題）。答錯的題目會在最後再考一次；5 顆愛心用完就要重來。

## 檔案結構

```
index.html            App 外殼
manifest.json         PWA 設定（名稱、圖示、全螢幕）
sw.js                 離線快取
css/style.css         樣式
js/data.js            全部課程內容（要加課程改這裡）
js/version.js         版本號（每次更新改這裡）
js/app.js             遊戲邏輯
js/sync.js            Firebase 登入與同步
js/firebase-config.js Firebase 設定（自行填入）
icons/                App 圖示
firestore.rules       Firestore 安全規則
```

## 上傳到 GitHub Pages

1. 在 GitHub 建立新的 repo，例如 `mango-thaithai`
2. 把這個資料夾裡的所有檔案上傳到 repo 根目錄（包含 `.nojekyll`）
3. repo 的 **Settings › Pages**，Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`
4. 等一兩分鐘，網址會是 `https://tanghoho.github.io/mango-thaithai/`

手機用 Chrome 開啟後，選單 › **加到主畫面**（iPhone 用 Safari › 分享 › 加入主畫面）。

## 設定 Firebase 登入（可選）

不設定也能玩，紀錄會存在手機本機。要跨裝置同步時：

1. 到 [Firebase 主控台](https://console.firebase.google.com/) 建立專案（或沿用現有專案）
2. **Authentication › Sign-in method**：啟用 **Google**
3. **Authentication › Settings › 授權網域**：加入 `tanghoho.github.io`
4. **Firestore Database**：建立資料庫，到 **規則** 分頁貼上 `firestore.rules` 的內容並發布
5. **專案設定 › 一般 › 你的應用程式**：新增網頁應用程式，把 `firebaseConfig` 貼進 `js/firebase-config.js`
6. 重新上傳 `js/firebase-config.js`

登入後，本機進度會和雲端合併（每課取最高星數、經驗值取較高的），之後每次過關都會自動同步。紀錄存在 Firestore 的 `users/{uid}`。

## 更新版本

版本號只放在一個地方：`js/version.js`。

```js
self.APP_VERSION = "1.0.1";
```

改完任何檔案要重新上傳時，把這個號碼往上加（例如 `1.0.2`），一起上傳。

- 版本號會顯示在畫面左上角 App 名稱旁邊、歡迎畫面和「我的」頁面最下方
- 離線快取（`sw.js`）也讀同一個號碼，號碼一變，手機下次開啟就會下載新版，並跳出「有新版本，點這裡更新」
- 「我的」頁面最下方有「檢查更新」，可以手動確認是不是最新版

建議的編號方式：修小錯字或 bug 加最後一位（1.0.1 → 1.0.2），新增課程或功能加中間那位（1.0.2 → 1.1.0）。

## 發音

使用裝置內建的泰文語音（Web Speech API），不需要網路音檔。三星手機若沒有聲音：**設定 › 一般管理 › 語言 › 文字轉語音**，偏好的引擎改成「Google 語音辨識與合成」，再下載泰文語音資料。
