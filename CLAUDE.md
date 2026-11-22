# 西遊記注音大冒險

給 5 歲、沒學過注音的孩子在 iPad Safari 用手指玩的注音遊戲。目前有第 1 關（花果山，ㄧㄨㄅㄇ）與第 2 關（五指山，ㄚㄛㄆㄈ，複習ㄅㄇㄨ，妖怪岩岩）。孩子不太會讀字，重要的話一定要唸出來。企劃：/workspace/zhuyin-game/design/plan-v3.md

## 檔案地圖
- `index.html`：進入點，`data-version`、`app-version`、所有 `?v=` 要一起改（避免 iPad 快取）；音檔 URL 也要帶同樣的 `?v=`（由 `audio.js` 的 `audioUrl` 自動讀 `data-version` 加上）
- `data.js`：`LEVEL1`/`LEVEL2`（`LEVELS` 依地圖順序）、圖檔對照 IMG、`AUDIO_FILES`（預載清單）。關卡差異（句子、對比題、T5 題幹、結局 `ending`、妖怪圖 `monster.faces`）全在關卡資料，game.js 用 `L` 讀取，新增關卡照 LEVEL2 格式加；前一關 cleared 才解鎖下一站
- `game.js`：畫面流程（開始、地圖、教學 8 步、休息點、對戰、過關）
- `cave.js`：v1.4.0 水簾洞（37 音卡片、兌換、洞裡妖怪複習）、地圖隊伍、金箍棒連擊、唐僧念經挑戰；測試 `SHOT_DIR=… node tests/e2e-cave.mjs`。設計見 design/growth-system.md；存檔仍是 `xiyou-zhuyin-v1`（levels[].peaches、cave:{heard,spent,owned,allHeard}）
- `audio.js`：`say()` 優先播 `audio/<句子>.mp3`，沒有檔退回瀏覽器 TTS；一次只念一句
- `audio/lines.json`：第 1 關全部台詞（key = say 的字串；tts_text 給 ElevenLabs）
- `style.css`、`save.js`（localStorage 存檔）、`img/`
- `tests/e2e.mjs`（第 1 關）、`tests/e2e-level2.mjs`（第 2 關：地圖解鎖→教學→對戰→結局，`SHOT_DIR=… node tests/e2e-level2.mjs`）、`PROBLEMS.md`（審視紀錄）
- `img/rock-{normal,laugh,cheeky,tame}.png`：岩岩定稿第三版（Freddy 通過；灰色石頭怪，頭頂有五座小山峰）。四張同高 512、寬度不同，CSS 以高度對齊（`.mon-img` 用 `height` + `width:auto`），身體大小才會一致。換圖只要覆蓋這 4 個檔。不要用 v1/、v2/ 舊圖。

## 怎麼測
`node tests/e2e.mjs`（需 playwright；約 2.5 分鐘）。截圖在 `screenshots/`（已 gitignore）。
改台詞時同步更新 `audio/lines.json`。

## 發布規則
- 新版先上測試網址 https://ayulp029.github.io/xiyouji-zhuyin-test/
- 宇鋒點頭後才可合併／推 main
- 正式站 https://ayulp029.github.io/xiyouji-zhuyin/ 不要直接動

## 語音來源
- 對話/說明/兒歌/單詞：ElevenLabs Yui（eleven_v3，voice_id kGjJqO6wdwRN9iJsoeIC）的 mp3，key 見 `audio/lines.json`；不要重生成。
- 注音單音 ㄧ ㄨ ㄅ ㄇ 仍用教育部錄音（AI 版會多唸衣／烏／玻／摸），不要覆蓋。
- 發布一律先上測試網址。
- 語速由模型內自然放慢（`[speaking slowly and gently]`），不再用 ffmpeg atempo；句間仍是 400ms

- 第 1 關發音修正（v1.2.3-test）：「癢」念成「養」（ㄧㄤˇ）；兒歌單獨注音改標準同音字（玻摸衣屋，ㄨ用屋並加停頓）；記憶圖詞「一」的 tts_text 用「衣」。單音 ㄧㄨㄅㄇ 仍是教育部錄音；聲音仍是 Yui + eleven_v3 + `[speaking slowly and gently]`。

## 第 2 關：五指山（v1.3.0-test）
- 句子：佛祖壓住悟空，悟空想吃葡萄。（壓＝ㄧㄚ、空＝ㄎㄨㄥ、吃＝ㄔ，是對的）。例詞每音兩個；記憶圖詞 ㄚ阿公 ㄛ喔喔叫（say 喔喔）ㄆ盤子 ㄈ飛機；對比 ㄅ vs ㄆ；拼音教學用 爬 髮 佛。
- 單音 ㄚㄛㄆㄈ：教育部手冊錄音（F22/F23/F2/F4；手冊順序是聲符 F1–F21、韻符 F22–F34＝ㄚ…ㄦ、F35–F37＝ㄧㄨㄩ，不是「介音在韻母前」）。手冊 https://language.moe.gov.tw/001/Upload/files/site_content/M0001/juyin/index.html （CC BY 4.0）。v1.4.2-test 已修正先前 F25/F26 的誤對（舊 ㄚ、ㄛ 檔其實是 ㄝ、ㄞ）。其餘新台詞為 Yui（見 `audio/lines.json` 中 `level:2`）。
- 結局（與第 1 關不同）：打完岩岩認輸、被「看我的金箍棒！」打中消失 → `rescue()`：山＋山頂符咒、唐僧唸「悟空，師父來救你了。」→ 揭符咒（符飛走、山搖）唸「我把山上的符咒揭開。」→ 悟空跳出來唸「師父！我出來了！」→「五指山過關！」＋印章／貼紙（emoji 暫代）。不用「石頭頭變成乖猴子了」。
- 地圖：第 1 關過關後第 2 站可點；下一個該去的站發亮跳動並唸「點一點發亮的○○」。
- 還缺的圖（目前 emoji／CSS 暫代）：五指山背景（沿用花果山草地）、對戰背景、五指山／符咒圖（⛰️📜）、山下的悟空（用 stand 縮小半透明）、第 2 關印章與貼紙、記憶圖 ㄚㄛㄆㄈ（memory-*.png）、例詞圖（阿公 阿姨 喔喔叫 噢 葡萄 螃蟹 房子 風箏）、拼音圖（爬 髮 佛 婆 八 媽）、地圖第 2 站專屬圖示。岩岩已用定稿第三版。
- 還沒有錄音檔的詞（會退回瀏覽器語音）：阿姨、喔喔叫、噢、風箏（只出現在例詞資料，目前不會被念）。

## 發音自動檢查
- 工具在 `tools/pron-check/`（Python venv 在其內，`.cache/` 放模型）。用法見該資料夾 `README.md`：`python -m pron_check.cli check <音檔> --text 髮`、`calibrate`、`level2-new`。報告：`tools/pron-check/reports/REPORT.md`。
- 兩家 ASR（faster-whisper medium、Breeze-ASR-25）逐字稿轉帶調拼音，比音節＋聲調（同音字算對），再加 F0 聲調檢查；輸出 PASS / SUSPECT / FAIL。
- 教育部注音單音檔（ㄅㄆㄚㄛㄈ 等）要 `--split skip_symbol`（SKIP，不判）；拼接句（教育部單音＋AI 文本）用 `--split text_only`，只查文本段。
- 這只是輔助，用來挑出「該請 Freddy 聽」的音；校正集很小，不能取代人聽。
- 檢查流程只讀 `audio/`，不要在裡面改遊戲音檔，也不要呼叫 ElevenLabs。
