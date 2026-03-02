
## 生成內容
網頁靜態檔案，含 html js css 等等 (能掛在 github page)

## 規格
- 需要 RWD（Web/ Mobile/ iPad）
- 在[架構]章節中，若有關於動態資料的部份，一律取自靜態檔案 (ex. json檔)，並可自行生成

## 方向
B2C × 輔助機師面試與學習的 AI 產品的官網 x 專業但要有質感，甚至一點高級感

## 視覺
- 黑白高對比 × 單一亮色，亮色只出現在最關鍵的地方（CTA、數字、accent）
- 亮色：可使用 #FFD600  訊號黃，或由你推薦機師最熟悉的強調色
- 字體：可使用如下字體，或由你推薦當代但不爛大街的字體
    - 標題：Roboto Mono
    - 內文：Sans-serif

## 特性 or 特殊功能

### 浮窗/ 跑馬燈

動態社會認同引擎 (Live Social Proof)

**1. 核心目標 (Objective)**

- 解決新產品上線初期的「空城效應 (Cold Start Problem)」。
- 利用從眾心理 ，透過不斷彈出的微小提示，營造「全球頂尖機師都在用這個系統備戰」的熱烈氛圍與信任感。

**2. 視覺與佈局 (UI Components & Layout)**

- **UI 型態：** 懸浮在網頁左下角 (或右下角) 的「吐司提示框 (Toast Notification)」。
- **視覺氛圍：** 帶有微微的毛玻璃效果 (Glassmorphism)，背景為深色半透明，文字清晰但不過度搶眼，確保不會干擾使用者閱讀網頁主要內容。
- **動畫效果：** 從底部平滑向上滑出 (Slide up & Fade in)，停留 4 秒後，自然向上淡出消失 (Fade out up)。

**3. 觸發邏輯與時間軸 (Interaction Logic)**

- **首次觸發 (Initial Delay)：** 使用者進入網頁或滾動到 Section 2 後，延遲 **5~8 秒**才彈出第一個提示（避免一進站就干擾）。
- **輪播間隔 (Interval)：** 每個提示消失後，隨機等待 **12~25 秒**再彈出下一個，營造「真實且不規律」的有機流量感。

**4. 前端假資料池 (Frontend Mock Data Pool)***工程師只需在前端寫一個 Array 隨機抽取以下字串，不需要串接真實資料庫：*

- **類型 A：引發競爭焦慮 (別人在練什麼模式)**
    - *"A B777 Captain just started the Question Bank mode."* (一位 B777 機長剛啟動了題庫模式。)
    - *"An A320 FO is currently practicing HR scenarios."* (一位 A320 副機師正在練習 HR 情境。)
    - *"A pilot is currently preparing for an Emirates interview."*(一位機師正在準備阿聯酋面試。)
- **類型 B：暗示轉換與系統價值 (別人註冊了/獲得回饋了)**
    - *"A B737 pilot just created an account to unlock AI feedback."* (一位 B737 機師剛註冊帳號以解鎖 AI 回饋。)
    - *"An FO just completed an interview session with the AI Check Airman."* (一位副機師剛完成了與 AI 考核機長的面試。)
- **類型 C：稀缺性與熱度 (大家都在用)**
    - *"4 pilots are currently preparing in the HR mode."* (目前有 4 位機師正在 HR 模式中備戰。)
    - *"12 interview sessions completed in the last hour."* (過去一小時內已完成 12 場模擬面試。)

## 架構

### Section 1: 簡潔的 tagline 和 CTA

#### Headline
Master Your Next Interview with an AI Senior Check Airman.

#### Sub-headline
- Operationalize your question bank.
- Transform static study into interactive HR and technical simulations.

#### CTA
Start Assessment

### Section 2: The Magic Moment

這是一個**高轉換率的互動試玩引流區 (Lead Generation Hook)**，旨在讓使用者親自體驗產品的面試準備威力。它是一個嵌在網頁中的區塊容器，使用者會在這個單一容器內互動，體驗一場微型面試。

**1. Vibe & Aesthetics**

- **主題：** 尊榮、高科技、專業航空感。
- **配色：** 深色模式 (深炭灰/石板灰背景)，用來模擬現代飛機的玻璃座艙 (Glass Cockpit)，並與網站其他部分產生強烈對比。
- **點綴色：** 在互動元素上巧妙使用航空警告色（例如：柔和的主警告紅 Master Caution Red，或是明亮的啟用綠 Active Green）。
- **風格：** 俐落的 UI 介面，帶有一點玻璃擬物化 (Glassmorphism) 以呈現層次感。

**2. Layout & Interactive States (同一個容器內的 3 種狀態切換)**
在這個單一區塊容器內，請設計出 3 種 UI 狀態的切換流程：

#### 狀態 1：The Setup (設定狀態)

- **區塊標題：** **"Target Your Next Airline."** (乾淨、粗體的排版)。
- **製造商選擇器：** 橫向排列的 3 個標籤 (Tabs)：`[ ✈️ Boeing ]`, `[ ✈️ Airbus ]`, `[ 🌐 General ]`。（Boeing 為預設選中狀態）。
- **機型選擇器：** 在標籤正下方，一排可橫向滑動的俐落藥丸狀按鈕：`[ B777 ]` (選中狀態), `[ B737 ]`, `[ B787 ]`, `[ B747 ]`, `[ B767 ]`, `[ B757 ]`。*(註解：如果 Airbus 被選中，則會顯示 A320, A350, A330, A380, A340)*。
- **挑戰選擇器：** 3 張並排或網格排列、看起來很高質感的視覺卡片：
    1. `[ 🇦🇪 Emirates Latest Gouge (阿聯酋最新考古題) ]` (帶有小小的 "🔥 Hot" 標籤)。
    2. `[ 🇶🇦 Qatar Airways Latest Gouge (卡達最新考古題) ]`
    3. `[ 🇸🇬 Singapore Airlines Latest Gouge (新加坡最新考古題) ]`
- **底部主按鈕：** 一個醒目、寬大的按鈕：**`[ Enter Interview (進入面試) ]`**。

#### 狀態 2：The Challenge & Input (挑戰與輸入狀態 - 取代狀態 1 的畫面)

*(當使用者點擊進入面試按鈕後，區塊內的內容平滑過渡到此狀態)*

- **頂部資訊列：**
    - 左側：一個隱約閃爍的紅色指示燈（模擬主警告燈 Master Caution）。
    - 右側：數位倒數計時器 `[ 02:59 ]`。（總共是3分鐘，製造緊張感但不催促）
- **題目：** 乾淨、易讀的文字提示：*"You are at V1, right engine failure, explicit fire warning. The fire bell rings after V1 but before Vr. What is your immediate decision and callout?"*
- **輸入區：**
    - **主要動作：** 一個巨大、誘人的麥克風按鈕 `[ 🎙️ Hold to Speak (按住說話) ]`。
    - **次要動作：** 乾淨的文字輸入框，佔位文字為：*"Captain, state your decision..."*
    - **執行按鈕：** **`[ Submit Answer ]`** (放在輸入框旁邊或下方)。
    - **防呆連結：** 最下方隱約的文字連結：`[ Skip to Evaluation ]`。

#### 狀態 3：The Paywall Hook (付費牆鉤子狀態 - 取代狀態 2 的畫面)

*(區塊內的心理學鉤子收網狀態)*

- **鉤子句 (The Hook)：** 頂部清晰簡潔的文字，給予真實回饋：*"Solid initial callout, but you completely missed the Boeing specific fire bell inhibition logic..." (起手的呼叫指令很穩，但你完全漏掉了波音特有的火警鈴抑制邏輯...)*
- **模糊效果 (The Blur Effect - 極度重要)：** 緊接在鉤子句下方，是一大塊文字區塊（代表詳細的機長參考答案）。**這整塊文字必須被重度的「高斯模糊 (Gaussian blur)」覆蓋**，完全無法閱讀。
- **懸浮標籤 (Over the blur)：** 在模糊區塊上方懸浮著兩個高對比的指標標籤：
    - `[ ⚠️ 2 Key Elements Missing ]`
    - `[ 💡 Standard Reference Available ]`
- **最終主按鈕 (置中於模糊區塊上方)：** 一個實心、高轉換率、帶有鎖頭圖示的按鈕：**`[ 🔒 Unlock Full Critique - Create Free Account ]`**。
- **微拷貝 (Microcopy)：** 緊貼在主按鈕下方的小字：*"Takes 10 seconds. Free for early access pilots.)"*

### Section 3

**Our ApproachPowered by Real Gouge. Driven by Aviation Standards.**

- **Targeted practice with verified airline-specific gouge.**
- **Identify critical threats that generic AI models fail to catch.**
- **Align your answers with top-tier Check Airman expectations.**
