# 第 3 關正式美術 brief

風格對齊第 2 關岩岩：粗黑描邊、平塗陰影、chibi、背景透明（角色）。四張同高 512，寬度可不同，檔名 `img/water-{normal,laugh,cheeky,tame}.png`（覆蓋占位即可，不必改程式）。

## 1. 水水（小白龍）4 表情
共同設定：圓滾滾的淺藍色小龍寶寶，白肚子，兩支奶油色小角，頭頂一滴小水珠，側邊小魚鰭，愛玩水、有點愛哭。
- normal：圓眼睛、小微笑。 laugh：瞇眼大笑、張嘴。 cheeky：眨一隻眼、吐舌頭，周圍噴水珠（丟水花）。 tame：閉眼微笑、臉紅，旁邊一顆小星星（認輸後變乖）。

English prompt (use once per expression, swap the expression line):
> Chibi cartoon baby water dragon, round chubby light-blue body, white belly, two small cream horns, a tiny water droplet on top of the head, small fins on the sides, thick black outline, flat cel shading with simple shadow, cute children's game character, full body, front view, plain white background, same height and proportions as a stone monster mascot. Expression: [normal: round eyes and small smile / laughing: closed happy eyes, open mouth / cheeky: one eye winking, tongue out, water droplets splashing around / tame: eyes closed, gentle smile, rosy cheeks, a small sparkle].

## 2. 荷葉河面背景 `img/bg-yingchou-battle.jpg`（1080×1920，上半 0–55% 是遊戲用的場景）
上方是兩側山壁（鷹愁澗峽谷），中間遠處有小島（遊戲另疊 `island.png`），大片藍色河面、有水波，下緣是近岸草地；河面空著，荷葉由程式疊上去（荷葉位置見 `RIVER_PATH`）。
> Vertical children's game background, a gentle gorge river scene: grey-green cliffs on both sides at the top, a wide calm blue river with soft white ripple lines filling the middle, a grassy bank along the bottom, empty water for lily pads to be placed, thick dark outline on the bank edges, flat colors with simple shading, bright and friendly, same style as a chibi stone-monster game, no characters, no text. 1080x1920.

## 可用占位、非必須重畫
荷葉 `lotus.png`、小島 `island.png`、白龍馬 `baima.png`、地圖精靈 `map/*.png`、10 站地圖 `map-10.svg`、印章／貼紙 `stamp-level3.png`／`sticker-level3.png`、`map/station-3.png`、記憶圖 `memory-{d,t,n,l}.png`、例詞 `ex-*.png`、拼音 `blend-*.png`、教學背景 `bg-yingchou.jpg`。占位由 `tools-l3/make_placeholders.py` 產生（圓角色塊／簡單 SVG）。
