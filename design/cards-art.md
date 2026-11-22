# 水簾洞卡片圖來源（Fluent Emoji）

Freddy 2026-11-22 決定：37 張卡片圖以 Microsoft Fluent UI Emoji 3D 圖庫為主（MIT 授權），真的沒有適合的才請毛毛畫。毛毛先前的 3 張樣本（ㄆ／ㄓ／ㄦ）這一版先不用。

處理規則：下載 3D PNG → 依不透明像素裁切主體 → 最長邊縮到約 512×68%（約 348px）→ 置中放在 512×512 透明畫布（完全透明像素的 RGB 為 0）。存成 `img/cards/<注音>.png`。遊戲若檔案不存在則改用表情符號。

## 用圖庫的詞（直接對應）

| 注音 | 卡片詞 | Fluent 資產 | 檔名 |
|---|---|---|---|
| ㄆ | 葡萄 | Grapes | `grapes_3d.png` |
| ㄈ | 飛機 | Airplane | `airplane_3d.png` |
| ㄉ | 大象 | Elephant | `elephant_3d.png` |
| ㄊ | 兔子 | Rabbit | `rabbit_3d.png` |
| ㄋ | 牛奶 | Glass of milk | `glass_of_milk_3d.png` |
| ㄌ | 老虎 | Tiger face | `tiger_face_3d.png` |
| ㄍ | 狗狗 | Dog | `dog_3d.png` |
| ㄎ | 恐龍 | T-rex | `t-rex_3d.png` |
| ㄏ | 蝴蝶 | Butterfly | `butterfly_3d.png` |
| ㄐ | 雞蛋 | Egg | `egg_3d.png` |
| ㄑ | 氣球 | Balloon | `balloon_3d.png` |
| ㄒ | 西瓜 | Watermelon | `watermelon_3d.png` |
| ㄔ | 車子 | Automobile | `automobile_3d.png` |
| ㄕ | 獅子 | Lion | `lion_3d.png` |
| ㄖ | 熱狗 | Hot dog | `hot_dog_3d.png` |
| ㄗ | 嘴巴 | Mouth | `mouth_3d.png` |
| ㄘ | 草莓 | Strawberry | `strawberry_3d.png` |
| ㄙ | 傘 | Umbrella | `umbrella_3d.png` |
| ㄨ | 烏龜 | Turtle | `turtle_3d.png` |
| ㄩ | 雨傘 | Umbrella with rain drops | `umbrella_with_rain_drops_3d.png` |
| ㄝ | 椰子 | Coconut | `coconut_3d.png` |
| ㄞ | 愛心 | Red heart | `red_heart_3d.png` |
| ㄠ | 桃子 | Peach | `peach_3d.png` |
| ㄣ | 門 | Door | `door_3d.png` |
| ㄤ | 糖果 | Candy | `candy_3d.png` |
| ㄦ | 耳朵 | Ear/Default | `ear_3d_default.png` |

## 替代清單（圖庫有相近圖、詞不改、不必重錄）

| 注音 | 卡片詞 | 改用的圖 | 原因 |
|---|---|---|---|
| ㄅ | 爸爸 | Man/Default | 替代：通用男性頭像，不是專畫「爸爸」，但五歲看得出是男生大人 |
| ㄇ | 媽媽 | Woman/Default | 替代：長髮女性頭像，不是專畫「媽媽」 |
| ㄧ | 衣服 | T-shirt | 替代：短袖上衣，五歲一看就懂是衣服 |
| ㄚ | 阿公 | Old man/Default | 替代：白髮老人頭像，夠清楚 |
| ㄛ | 喔喔叫 | Rooster | 替代：公雞（詞仍是「喔喔叫」，圖用公雞很清楚） |
| ㄜ | 鵝 | Swan | 替代：白天鵝。圖庫 Goose 是棕色、容易被認成鴨子；天鵝更接近台灣小孩認知的白鵝。詞不改。 |
| ㄟ | 杯子 | Cup with straw | 替代：吸管杯（比茶杯、咖啡杯更接近小孩日常的杯子）。不採用看起來像酒杯的 tumbler。 |
| ㄡ | 玩偶 | Teddy bear | 替代：泰迪熊，夠清楚代表玩偶 |
| ㄥ | 燈 | Light bulb | 替代：燈泡，清楚代表「燈」。不採用燈籠，以免和水簾洞裝飾燈籠混淆。 |

## 需要毛毛畫的清單

| 注音 | 卡片詞 | 原因 |
|---|---|---|
| ㄓ | 蜘蛛 | Fluent 3D 蜘蛛是黑色偏寫實，對五歲太可怕，不採用。請毛毛畫可愛卡通蜘蛛（圓潤、可有表情，不可怕）。 |
| ㄢ | 安全帽 | 圖庫沒有黃色工程安全帽。Rescue workers helmet 是紅色救護/消防帽（白十字），Military helmet 是綠色軍用頭盔，都不適合五歲「安全帽」教學。請毛毛畫黃色工程安全帽。 |

這一版這兩張不寫入 `img/cards/`，介面先用表情符號暫代。建議畫成與現有 ex- 卡片相近的可愛卡通風、512×512 透明底、主體約佔 68%。

