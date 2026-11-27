# 西遊記注音大冒險

給 5 歲、沒學過注音的孩子在 iPad Safari 用手指玩的注音遊戲。目前有第 1 關（花果山，ㄧㄨㄅㄇ）、第 2 關（五指山，ㄚㄛㄆㄈ，複習ㄅㄇㄨ，妖怪岩岩）與第 3 關（鷹愁澗，ㄉㄊㄋㄌ，妖怪水水）。孩子不太會讀字，重要的話一定要唸出來。企劃：/workspace/zhuyin-game/design/plan-v3.md

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
- 句子：佛祖壓住悟空，悟空想吃葡萄。（壓＝ㄧㄚ、空＝ㄎㄨㄥ、吃＝ㄔ，是對的）。例詞每音兩個（ㄆ＝螃蟹、盤子）；記憶圖詞 ㄚ阿公 ㄛ摩托車（say 摩托車）ㄆ葡萄（盤子退為例詞）ㄈ飛機；對比 ㄅ vs ㄆ；拼音教學用 爬 髮 佛。
- 單音 ㄚㄛㄆㄈ：教育部手冊錄音（F22/F23/F2/F4；手冊順序是聲符 F1–F21、韻符 F22–F34＝ㄚ…ㄦ、F35–F37＝ㄧㄨㄩ，不是「介音在韻母前」）。手冊 https://language.moe.gov.tw/001/Upload/files/site_content/M0001/juyin/index.html （CC BY 4.0）。v1.4.2-test 已修正先前 F25/F26 的誤對（舊 ㄚ、ㄛ 檔其實是 ㄝ、ㄞ）。其餘新台詞為 Yui（見 `audio/lines.json` 中 `level:2`）。
- 結局（與第 1 關不同）：打完岩岩認輸、被「看我的金箍棒！」打中消失 → `rescue()`：山＋山頂符咒、唐僧唸「悟空，師父來救你了。」→ 揭符咒（符飛走、山搖）唸「我把山上的符咒揭開。」→ 悟空跳出來唸「師父！我出來了！」→「五指山過關！」＋印章／貼紙（emoji 暫代）。不用「石頭頭變成乖猴子了」。
- 地圖：第 1 關過關後第 2 站可點；下一個該去的站發亮跳動並唸「點一點發亮的○○」。
- 第 2 關正式美術已接入 `img/`（見下方「第 2 關美術」）。音檔仍缺的旁白／爬山對話（阿姨、噢、風箏、開場旁白、爬山四句）繼續退回裝置 TTS。
- 還沒有錄音檔的詞（會退回瀏覽器語音）：阿姨、噢、風箏（只出現在例詞資料，目前不會被念）。摩托車（ㄛ 記憶圖詞，教學會播）需有 audio/摩托車.mp3；喔喔叫已不是第 2 關詞，檔仍保留給兒歌與水簾洞舊資料。

## 第 2 關流程（v1.4.12-test）
- 地圖 10 站：花果山、五指山、鷹愁澗、高老莊、流沙河、五莊觀、白虎嶺、號山、火焰山、雷音寺（`data.js` 的 `STATIONS`／`MAP_POS`）；刪掉黃風嶺、平頂山。
- 開場旁白：進第 2 關選單時先念「這一關，你陪唐僧去救悟空。」（`LEVEL2.intro`，與選單台詞同一個 `say`）。沒有 mp3，退回裝置語音；別呼叫 ElevenLabs，之後有錄再補檔。
- 對戰＝爬山 8 ＋ 山頂 3（含念經）共 11 題：`LEVEL2.climb`；`monkOn = L.id>=2`（第一次打就含唐僧念經，不用等過關）。前 8 題每答對唐僧沿 8 格山路走一格（`climbTo`，前傾旋轉＋彈跳，reduced-motion 直接換格）；答錯唐僧站穩、只有石階晃一下；第 9、10 題在山頂打岩岩；第 11 題 `monkChallenge`；結局仍是 `victory()`→`rescue()`。爬山只在第 2、4、6、8 格念「師父好棒！」「哎呀，你爬好快！」「我看到符咒了！」「到山頂了！」（沒有 mp3，退回裝置語音；已列在 `audio/lines.json`，`no_mp3:true`）。
- 測試鉤子：`#cnt`＝已答對題數；`body.dataset.qi`＝目前題號（0 起，念經＝10）、`body.dataset.climb`＝唐僧在第幾格；`#cts[data-pos]`＝唐僧；phase：`battle-q`、`correct-anim`、`correct-done`、`monk-q`、`monk-done`、`rescue`、`victory`。
- 教學記憶圖：ㄆ＝葡萄（盤子退為例詞：螃蟹＋盤子）；ㄛ＝摩托車（不是喔喔叫；兒歌仍是「ㄛㄛㄛ，公雞喔喔叫」）。
- 第 2 關美術（全是正式圖，已接入）：背景 `bg-wuzhishan.jpg`（教學）、`bg-wuzhishan-battle.jpg`（對戰／爬山）；`tangseng-climb.png`（爬山主圖，不用 talk/praise）、`wukong-trapped.png`（山腳／教學第一步／rescue 山下，跳出後換 happy）、`mtn-wuzhishan.png`（rescue 的山）、`talisman.png`、`stamp-level2.png`、`sticker-level2.png`、`map/station-2.png`（地圖第 2 站，`IMG.mapStation`）、`climb-{flower,cloud,pine,stream}.png`、`pebble.png`、`memory-{a,o,p,f}.png`、`ex-{阿公,阿姨,摩托車,噢,螃蟹,盤子,房子,風箏}.png`、`blend-{爬,髮,佛,婆,八,媽}.png`。對照在 `data.js` 的 `IMG`。
  - **`pebble.png`、`climb-stream.png` 的內容是 v2 版**（檔名不帶 v2；img/ 不放 v1/v2/v3、sample、notes、raw）。小溪兩岸已有黃花，所以花與溪要分開擺：`CLIMB_DECO` 花在左下（x33）、溪在右下（x80），不要把 climb-flower 放到溪旁。
  - 爬山：`.climb` 自己用 `bgBattle` 的上半（背景 100% 寬、0–55% 高，比例 1080/1056），不靠 body 背景（爬山時 body 是純草綠 `body.climb-bg`、內容靠上對齊）。`CLIMB_PATH` 9 點（%，相對 .climb）沿山路；裝飾依格數出現（花第 3、雲＋松第 4、溪第 5），小石子第 4 格從岩岩右側滾過、不碰唐僧；石階只剩極淡小點；符咒隨格數變大發光。爬山途中悟空只跳一下加油（`wkCheer`），山頂 2 題才揮棒。rescue 用 `mtn-wuzhishan.png`＋`talisman.png`＋`wukong-trapped.png`。
- `tests/e2e-level2.mjs`：10 站、旁白、教學、爬山 8＋山頂 2＋念經＋rescue＋回地圖看到唐僧；`level2-flow.png` 是爬山中截圖。audio 缺檔 404 與 `img/map|shop|cards/` 的缺圖備援 404 不算失敗。

## 發音自動檢查
- 工具在 `tools/pron-check/`（Python venv 在其內，`.cache/` 放模型）。用法見該資料夾 `README.md`：`python -m pron_check.cli check <音檔> --text 髮`、`calibrate`、`level2-new`。報告：`tools/pron-check/reports/REPORT.md`。
- 兩家 ASR（faster-whisper medium、Breeze-ASR-25）逐字稿轉帶調拼音，比音節＋聲調（同音字算對），再加 F0 聲調檢查；輸出 PASS / SUSPECT / FAIL。
- 教育部注音單音檔（ㄅㄆㄚㄛㄈ 等）要 `--split skip_symbol`（SKIP，不判）；拼接句（教育部單音＋AI 文本）用 `--split text_only`，只查文本段。
- 這只是輔助，用來挑出「該請 Freddy 聽」的音；校正集很小，不能取代人聽。
- 檢查流程只讀 `audio/`，不要在裡面改遊戲音檔，也不要呼叫 ElevenLabs。

## 第 3 關：鷹愁澗（v1.4.13-test）
- `LEVEL3`（data.js）：句子「小龍愛玩水，大象和老虎來看。」；例詞 ㄉ大象/蛋糕 ㄊ兔子/太陽 ㄋ牛奶/小鳥 ㄌ老虎/蘿蔔；比一比 ㄊ vs ㄉ（只用聽、不描述字形）；拼音 大兔梨拿泥路（教學前 3 個）；開場旁白「這一關，你和悟空一起過河。」（回到「跟悟空一起」視角）。
- 流程：教學 8 步 → 過河 8 題（`L.river`；`riverHTML`/`riverHop`；每答對一片荷葉浮上來、悟空跳一格；答錯腳下荷葉晃、水水噴水，悟空絕不掉水）→ 第 8 題後跳上小島（pos 9）→ 小島 2 題打水水 → 唐僧念經（第 11 題）→ `victory()` 的分身圈＋水水認輸 → `baimaEnding()`：水水變白龍馬、唐僧騎上去「白龍馬，謝謝你。」→ 印章＋貼紙。`PATHSC()` 讓第 2 關爬山與第 3 關過河共用 nextQ/pick/monkChallenge。
- 測試鉤子：`#rwk[data-pos]`＝悟空所在格（0 岸、1–8 荷葉、9 小島）、`.rv-leaf.on` 數量；phase 多了 `baima`。
- 地圖：`img/map-10.svg`（`tools-l3/make_placeholders.py` 產生，10 站，`MAP_POS` 已對齊）；隊伍精靈 `img/map/{wukong-staff,tangseng-follow,tangseng-baima}.png`（占位）；第 3 關過關後 `.pm.tang.horse`（唐僧騎白龍馬）。水簾洞多水水（`MON_IN_CAVE.water`）。舊 `img/map.jpg`（11 站）已不用。
- **第 3 關美術全是占位**（`tools-l3/make_placeholders.py` 輸出同名檔，正式圖覆蓋即可）；必須重畫的只有水水 4 表情與荷葉河面背景，見 `design/level3-art-brief.md`。
- **語音：本輪沒生成**（找不到 ElevenLabs API key）。第 3 關新句與第 2 關缺檔（旁白、爬山四句、阿姨／噢／風箏）都退回瀏覽器語音；清單與補錄規則在 `design/level3-voice-list.md`。ㄉㄊㄋㄌ 與大象／兔子／牛奶／老虎已有檔。
- 測試：`SHOT_DIR=… node tests/e2e-level3.mjs`（只測第 3 關；`level3-flow.png` 是過河中截圖）。
