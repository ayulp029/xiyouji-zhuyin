# 西遊記注音大冒險

給 5 歲、沒學過注音的孩子在 iPad Safari 用手指玩的注音遊戲。目前只有第 1 關（花果山，ㄧㄨㄅㄇ）。孩子不太會讀字，重要的話一定要唸出來。企劃：/workspace/zhuyin-game/design/plan-v3.md

## 檔案地圖
- `index.html`：進入點，`data-version`、`app-version`、所有 `?v=` 要一起改（避免 iPad 快取）
- `data.js`：第 1 關資料、圖檔對照 IMG、`AUDIO_FILES`（預載清單）
- `game.js`：畫面流程（開始、地圖、教學 8 步、休息點、對戰、過關）
- `audio.js`：`say()` 優先播 `audio/<句子>.mp3`，沒有檔退回瀏覽器 TTS；一次只念一句
- `audio/lines.json`：第 1 關全部台詞（key = say 的字串；tts_text 給 ElevenLabs）
- `style.css`、`save.js`（localStorage 存檔）、`img/`
- `tests/e2e.mjs`、`PROBLEMS.md`（審視紀錄）

## 怎麼測
`node tests/e2e.mjs`（需 playwright；約 2.5 分鐘）。截圖在 `screenshots/`（已 gitignore）。
改台詞時同步更新 `audio/lines.json`。

## 發布規則
- 新版先上測試網址 https://ayulp029.github.io/xiyouji-zhuyin-test/
- 宇鋒點頭後才可合併／推 main
- 正式站 https://ayulp029.github.io/xiyouji-zhuyin/ 不要直接動

## 語音來源
- 對話／說明／兒歌／單詞：ElevenLabs Stacy（eleven_multilingual_v2）的 mp3，key 見 `audio/lines.json`；不要重生成。
- 注音單音 ㄧ ㄨ ㄅ ㄇ 仍用教育部錄音（AI 版會多唸衣／烏／玻／摸），不要覆蓋。
- 發布一律先上測試網址。
- 語速已放慢（ffmpeg 0.8 倍、逗號停頓、句間 400ms）
