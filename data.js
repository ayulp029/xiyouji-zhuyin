// 第 1 關資料：之後新增關卡只要照這個格式加一組
const AUDIO_FILES = ["ㄧ","ㄨ","ㄅ","ㄇ","花果山","點一點發亮的花果山","點一點，我們一起來學注音","想再學一次，還是去打妖怪？","你看，小石猴在做什麼呀？","小石猴拿木頭，鼻子好癢。","小石猴","木頭","鼻子","找一找，木頭在哪裡？","鼻子在哪裡？","木頭的木","鼻子的鼻","點一點每個符號，聽它的聲音","一","烏鴉","包包","門","ㄅ有一個小勾勾，ㄇ是一扇門。","哪個是門？","再看看，門有兩根柱子喔","把兩張卡拖在一起，或是先點左邊，再點右邊","再點右邊這一張","木","鼻","米","ㄅㄅㄅ，鼻子癢","ㄇㄇㄇ，米飯香","ㄧㄧㄧ，一二三","ㄨㄨㄨ，烏鴉唱","教學完成了，你好棒！","要繼續去打妖怪，還是下次再來？","嘿嘿！想離開花果山？先陪我玩注音遊戲！","哪一個是","差一點點！再聽一次","烏龜","媽媽","是什麼開頭的音？","哪一個是門的","拼起來是什麼？","要怎麼拼？","好棒！","答對了！","你好厲害！","分身們，出來吧！","哇，好多個悟空！我被包圍了啦，哈哈，我也要當乖猴子！","看我的金箍棒！","花果山過關！","ㄚ","ㄛ","ㄆ","ㄈ","五指山","點一點發亮的五指山","你看，悟空怎麼了呀？","佛祖壓住悟空，悟空想吃葡萄。","悟空","大山","葡萄","找一找，佛祖在哪裡？","葡萄在哪裡？","佛祖","佛祖的佛","葡萄的葡","阿公","摩托車","盤子","飛機","ㄅ只有一個小勾勾，ㄆ下面有兩隻交叉的腳。","哪個是爬的ㄆ？","再看看，ㄆ有交叉的腳喔","爬","ㄚㄚㄚ，阿公笑哈哈","ㄛㄛㄛ，公雞喔喔叫","ㄆㄆㄆ，葡萄一串串","ㄈㄈㄈ，飛機飛高高","髮","佛","婆","八","媽","螃蟹","房子","哪一個是飛機的","我是五指山的岩岩！悟空想出來？先陪我玩注音遊戲！","哇，好多個悟空！山都搖起來了！好啦好啦，我認輸了！","悟空，師父來救你了。","我把山上的符咒揭開。","師父！我出來了！","五指山過關！","看！發光的那個就是答案喔","ㄉ","ㄊ","ㄋ","ㄌ","ㄍ","ㄎ","ㄏ","ㄐ","ㄑ","ㄒ","ㄓ","ㄔ","ㄕ","ㄖ","ㄗ","ㄘ","ㄙ","ㄩ","ㄜ","ㄝ","ㄞ","ㄟ","ㄠ","ㄡ","ㄢ","ㄣ","ㄤ","ㄥ","ㄦ","爸爸","大象","兔子","牛奶","老虎","狗狗","恐龍","蝴蝶","雞蛋","氣球","西瓜","蜘蛛","車子","獅子","熱狗","嘴巴","草莓","傘","衣服","雨傘","喔喔叫","蘑菇","鵝","椰子","愛心","杯子","桃子","玩偶","安全帽","糖果","燈","耳朵","這一關，你陪唐僧去救悟空。","師父好棒！","哎呀，你爬好快！","我看到符咒了！","到山頂了！"];
// 圖檔對照表：美術交新圖時，放進 img/ 並改這裡的檔名即可（null = 先用 emoji/CSS 代替）
const IMG = {
  bg:'img/bg-huaguoshan.jpg', bgBattle:'img/bg-battle.jpg', map:'img/map.jpg',
  wukong:{stand:'img/wukong-stand.png', happy:'img/wukong-happy.png', point:'img/wukong-point.png', cast:'img/wukong-cast.png', spin:'img/wukong-spin.png', trapped:'img/wukong-trapped.png'},
  clone:'img/wukong-clone.png',
  monster:{normal:'img/stone-monkey-normal.png', laugh:'img/stone-monkey-laugh.png', cheeky:'img/stone-monkey-cheeky.png', tame:'img/stone-monkey-tame.png'},
  tangseng:{talk:'img/tangseng-talk.png', praise:'img/tangseng-praise.png', rest:'img/tangseng-rest.png', climb:'img/tangseng-climb.png'},
  stamp:'img/stamp-level1.png', sticker:'img/sticker-level1.png',
  memo:{'ㄧ':'img/memory-yi.png','ㄨ':'img/memory-wu.png','ㄅ':'img/memory-b.png','ㄇ':'img/memory-m.png','ㄚ':'img/memory-a.png','ㄛ':'img/memory-o.png','ㄆ':'img/memory-p.png','ㄈ':'img/memory-f.png'},
  ex:Object.fromEntries(['衣服','椅子','烏龜','包子','爸爸','媽媽','貓咪','阿公','阿姨','摩托車','噢','螃蟹','盤子','房子','風箏'].map(w=>[w,'img/ex-'+w+'.png'])),
  blend:Object.fromEntries(['米','木','鼻','布','爬','髮','佛','婆','八','媽'].map(c=>[c,'img/blend-'+c+'.png'])),
  rock:{normal:'img/rock-normal.png', laugh:'img/rock-laugh.png', cheeky:'img/rock-cheeky.png', tame:'img/rock-tame.png'}, // 岩岩定稿第三版（灰色石頭怪、頭頂五座山峰）；四張同高不同寬，排版用高度對齊。換圖只要覆蓋這 4 個檔
  // 第 2 關（五指山）正式美術。注意：pebble.png、climb-stream.png 用的是 v2 內容（小溪兩岸已有黃花），檔名不帶 v2
  talisman:'img/talisman.png', mtnWuzhi:'img/mtn-wuzhishan.png',
  climb:{flower:'img/climb-flower.png', cloud:'img/climb-cloud.png', pine:'img/climb-pine.png', stream:'img/climb-stream.png', pebble:'img/pebble.png'},
  mapStation:{1:'img/map/station-2.png'}, // 地圖第 i 站圖示（index，0 起）
  fx:{poof:'img/fx-poof.png', star:'img/fx-star.png'}
};
// 悟空眼睛位置（左, 上, 寬, 高；% 對應圖片本身），用來疊「眼皮」做眨眼。換圖時要重新量；沒列的姿勢就不眨眼
const WK_EYES = { stand:[[42.4,26.0,13.8,7.8],[69.2,25.2,12.7,8.4]], point:[[32.8,26.4,10.1,8.0],[51.5,25.0,8.6,8.2]] };
// 吹毫毛的起點（%，cast 姿勢手指拿毫毛的位置）
const WK_MOUTH = { cast:[60,38] };
// 地圖站點位置（%，對應 map.jpg；換地圖時調這裡）
const MAP_POS=[[30,93],[67,76],[36,66],[62,58],[44,51],[67,34],[38,25],[78,22],[62,15],[50,6]];
const STATIONS = ['花果山','五指山','鷹愁澗','高老莊','流沙河','五莊觀','白虎嶺','號山','火焰山','雷音寺']; // 10 站（design/story-levels.md 已決定）
const LEVEL1 = {
  id: 1, name: '花果山', syms: ['ㄧ','ㄨ','ㄅ','ㄇ'], bg: IMG.bg, bgBattle: IMG.bgBattle,
  stickerName: '花果山學會了', sticker: IMG.sticker, stamp: IMG.stamp, ending: 'tame',
  pictureAsk: '你看，小石猴在做什麼呀？', pictureHero: 'monster',
  symTag: '木 = ㄇ ㄨˋ　鼻 = ㄅ ㄧˊ', symOrder: ['ㄇ','ㄨ','ㄅ','ㄧ'],
  contrast: { opts:['ㄅ','ㄇ'], ans:'ㄇ', hint:'ㄅ 有一個小勾勾，ㄇ 是一扇門，兩邊都有柱子。哪個是門？',
              voice:['ㄅ有一個小勾勾，ㄇ是一扇門。','哪個是門？'], retry:'再看看，門有兩根柱子喔', win:['ㄇ','門'] },
  t5: { text:'哪一個是門的 ㄇ？', voice:['哪一個是門的','ㄇ'], show:'🚪' },
  monster: { name: '石頭頭', faces: IMG.monster, img: IMG.monster.normal,
    intro: '嘿嘿！想離開花果山？先陪我玩注音遊戲！',
    oops: '差一點點！再聽一次，你可以的～',
    surrender: '哇，好多個悟空！我被包圍了啦，哈哈，我也要當乖猴子！' },
  sentence: [['小','ㄒㄧㄠˇ'],['石','ㄕˊ'],['猴','ㄏㄡˊ'],['拿','ㄋㄚˊ'],['木','ㄇㄨˋ'],['頭','ㄊㄡˊ'],['，',''],['鼻','ㄅㄧˊ'],['子','ㄗ˙'],['好','ㄏㄠˇ'],['癢','ㄧㄤˇ'],['。','']],
  sentenceText: '小石猴拿木頭，鼻子好癢。',
  sceneItems: [{e:'🐒',w:'小石猴'},{e:'🪵',w:'木頭'},{e:'👃',w:'鼻子'}],
  words: [{w:'木頭',e:'🪵',ch:'木'},{w:'鼻子',e:'👃',ch:'鼻'}],
  // 記憶圖：圖名用該音開頭
  memo: { 'ㄧ':{e:'🥢',w:'一根筷子',say:'一'}, 'ㄨ':{e:'🐦‍⬛',w:'烏鴉',say:'烏鴉'},
          'ㄅ':{e:'👜',w:'包包',say:'包包'}, 'ㄇ':{e:'🚪',w:'門',say:'門'} },
  // 例詞（看圖選開頭音 T3 用）
  examples: [{w:'衣服',e:'👕',s:'ㄧ'},{w:'椅子',e:'🪑',s:'ㄧ'},{w:'烏龜',e:'🐢',s:'ㄨ'},{w:'烏鴉',e:'🐦‍⬛',s:'ㄨ'},
             {w:'爸爸',e:'👨',s:'ㄅ'},{w:'包子',e:'🥟',s:'ㄅ'},{w:'媽媽',e:'👩',s:'ㄇ'},{w:'貓咪',e:'🐱',s:'ㄇ'}],
  blends: [{a:'ㄇ',b:'ㄨ',ch:'木',e:'🪵'},{a:'ㄅ',b:'ㄧ',ch:'鼻',e:'👃'},{a:'ㄇ',b:'ㄧ',ch:'米',e:'🍚'},{a:'ㄅ',b:'ㄨ',ch:'布',e:'🧣'}],
  song: [['ㄅ','ㄅㄅㄅ，鼻子癢'],['ㄇ','ㄇㄇㄇ，米飯香'],['ㄧ','ㄧㄧㄧ，一二三'],['ㄨ','ㄨㄨㄨ，烏鴉唱']],
  // 對戰固定順序：T1×2 → T2×2 → T3×2 → T5×1 → T6×2 → T7×1
  battle: [
    {t:'T1',ans:'ㄇ',opts:['ㄇ','ㄧ']}, {t:'T1',ans:'ㄨ',opts:['ㄨ','ㄅ']},
    {t:'T2',ans:'ㄅ',opts:['ㄅ','ㄇ','ㄧ']}, {t:'T2',ans:'ㄧ',opts:['ㄧ','ㄨ','ㄅ']},
    {t:'T3',ex:'烏龜'}, {t:'T3',ex:'媽媽'},
    {t:'T5',ans:'ㄇ',opts:['ㄇ','ㄈ','ㄩ']},
    {t:'T6',blend:'米'}, {t:'T6',blend:'木'},
    {t:'T7',blend:'鼻',opts:['ㄅㄧ','ㄇㄧ','ㄇㄨ']}
  ]
};

// 第 2 關：五指山（新符號 ㄚ ㄛ ㄆ ㄈ，複習 ㄅ ㄇ ㄨ）。美術未到的圖先用 emoji 暫代（見 CLAUDE.md 缺圖清單）
const LEVEL2 = {
  id: 2, name: '五指山', syms: ['ㄚ','ㄛ','ㄆ','ㄈ'], bg: 'img/bg-wuzhishan.jpg', bgBattle: 'img/bg-wuzhishan-battle.jpg',
  stickerName: '五指山學會了', clearSticker: '五指山過關了', sticker: 'img/sticker-level2.png', stamp: 'img/stamp-level2.png', ending: 'rescue',
  pictureAsk: '你看，悟空怎麼了呀？', pictureHero: 'trapped',
  monster: { name: '岩岩', faces: IMG.rock, img: IMG.rock.normal,
    intro: '我是五指山的岩岩！悟空想出來？先陪我玩注音遊戲！',
    oops: '差一點點！再聽一次，你可以的～',
    surrender: '哇，好多個悟空！山都搖起來了！好啦好啦，我認輸了！' },
  // 開場旁白＋爬山：前 8 題每答對一格往上走，之後 2 題＋念經挑戰在山頂（say 只有第 2、4、6、8 格；這 5 句沒有 mp3，退回裝置語音）
  intro: '這一關，你陪唐僧去救悟空。',
  climb: { n: 8, say: {2:'師父好棒！', 4:'哎呀，你爬好快！', 6:'我看到符咒了！', 8:'到山頂了！'} },
  sentence: [['佛','ㄈㄛˊ'],['祖','ㄗㄨˇ'],['壓','ㄧㄚ'],['住','ㄓㄨˋ'],['悟','ㄨˋ'],['空','ㄎㄨㄥ'],['，',''],
             ['悟','ㄨˋ'],['空','ㄎㄨㄥ'],['想','ㄒㄧㄤˇ'],['吃','ㄔ'],['葡','ㄆㄨˊ'],['萄','ㄊㄠˊ'],['。','']],
  sentenceText: '佛祖壓住悟空，悟空想吃葡萄。',
  sceneItems: [{e:'🐒',w:'悟空'},{e:'⛰️',w:'大山'},{e:'🍇',w:'葡萄'}],
  words: [{w:'佛祖',e:'🙏',ch:'佛'},{w:'葡萄',e:'🍇',ch:'葡'}],
  memo: { 'ㄚ':{e:'👴',w:'阿公',say:'阿公'}, 'ㄛ':{e:'🏍️',w:'摩托車',say:'摩托車'},
          'ㄆ':{e:'🍇',w:'葡萄',say:'葡萄'}, 'ㄈ':{e:'✈️',w:'飛機',say:'飛機'} },
  examples: [{w:'阿公',e:'👴',s:'ㄚ'},{w:'阿姨',e:'👩',s:'ㄚ'},{w:'摩托車',e:'🏍️',s:'ㄛ'},{w:'噢',e:'😮',s:'ㄛ'},
             {w:'螃蟹',e:'🦀',s:'ㄆ'},{w:'盤子',e:'🍽️',s:'ㄆ'},{w:'房子',e:'🏠',s:'ㄈ'},{w:'風箏',e:'🪁',s:'ㄈ'}],
  symTag: '佛 = ㄈ ㄛˊ　葡 = ㄆ ㄨˊ', symOrder: ['ㄈ','ㄛ','ㄆ','ㄚ'],
  contrast: { opts:['ㄅ','ㄆ'], ans:'ㄆ', hint:'ㄅ 只有一個小勾勾，ㄆ 下面有兩隻交叉的腳，可以爬爬爬。哪個是爬的 ㄆ？',
              voice:['ㄅ只有一個小勾勾，ㄆ下面有兩隻交叉的腳。','哪個是爬的ㄆ？'], retry:'再看看，ㄆ有交叉的腳喔', win:['ㄆ','爬'] },
  t5: { text:'哪一個是飛機的 ㄈ？', voice:['哪一個是飛機的','ㄈ'], show:'✈️' },
  blends: [{a:'ㄆ',b:'ㄚ',ch:'爬',e:'🧗'},{a:'ㄈ',b:'ㄚ',ch:'髮',e:'💇'},{a:'ㄈ',b:'ㄛ',ch:'佛',e:'🙏'},
           {a:'ㄆ',b:'ㄛ',ch:'婆',e:'👵'},{a:'ㄅ',b:'ㄚ',ch:'八',e:'8️⃣'},{a:'ㄇ',b:'ㄚ',ch:'媽',e:'👩'}],
  song: [['ㄚ','ㄚㄚㄚ，阿公笑哈哈'],['ㄛ','ㄛㄛㄛ，公雞喔喔叫'],['ㄆ','ㄆㄆㄆ，葡萄一串串'],['ㄈ','ㄈㄈㄈ，飛機飛高高']],
  battle: [
    {t:'T1',ans:'ㄆ',opts:['ㄆ','ㄅ']}, {t:'T1',ans:'ㄚ',opts:['ㄚ','ㄛ']},
    {t:'T2',ans:'ㄈ',opts:['ㄈ','ㄆ','ㄇ']}, {t:'T2',ans:'ㄛ',opts:['ㄛ','ㄚ','ㄨ']},
    {t:'T3',ex:'螃蟹'}, {t:'T3',ex:'房子'},
    {t:'T5',ans:'ㄈ',opts:['ㄈ','ㄉ','ㄆ']},
    {t:'T6',blend:'爬'}, {t:'T6',blend:'八'},
    {t:'T7',blend:'佛',opts:['ㄈㄛ','ㄆㄛ','ㄈㄚ']}
  ]
};
// 依地圖順序排（第 i 個對應 STATIONS[i]）；沒列在這裡的站仍鎖住
const LEVELS = [LEVEL1, LEVEL2];

// ===== 水簾洞：37 音卡片（[注音, 卡片詞, 缺圖時的 emoji]；詞見 design/cards-37.md，圖 img/cards/<注音>.png，缺圖自動退回 emoji）=====
const CARDS = [['ㄅ','爸爸','👨'],['ㄆ','葡萄','🍇'],['ㄇ','媽媽','👩'],['ㄈ','飛機','✈️'],['ㄉ','大象','🐘'],['ㄊ','兔子','🐰'],['ㄋ','牛奶','🥛'],['ㄌ','老虎','🐯'],['ㄍ','狗狗','🐶'],['ㄎ','恐龍','🦖'],['ㄏ','蝴蝶','🦋'],['ㄐ','雞蛋','🥚'],['ㄑ','氣球','🎈'],['ㄒ','西瓜','🍉'],['ㄓ','蜘蛛','🕷️'],['ㄔ','車子','🚗'],['ㄕ','獅子','🦁'],['ㄖ','熱狗','🌭'],['ㄗ','嘴巴','👄'],['ㄘ','草莓','🍓'],['ㄙ','傘','🌂'],['ㄧ','衣服','👕'],['ㄨ','烏龜','🐢'],['ㄩ','雨傘','☂️'],['ㄚ','阿公','👴'],['ㄛ','蘑菇','🍄'],['ㄜ','鵝','🦢'],['ㄝ','椰子','🥥'],['ㄞ','愛心','❤️'],['ㄟ','杯子','🥤'],['ㄠ','桃子','🍑'],['ㄡ','玩偶','🧸'],['ㄢ','安全帽','⛑️'],['ㄣ','門','🚪'],['ㄤ','糖果','🍬'],['ㄥ','燈','💡'],['ㄦ','耳朵','👂']].map(([s,w,e])=>({s,w,e}));
const CAVE_GROUPS = [{id:'initial',name:'聲母',list:CARDS.slice(0,21).map(c=>c.s)},{id:'medial',name:'介音',list:['ㄧ','ㄨ','ㄩ']},{id:'final',name:'韻母',list:CARDS.slice(24).map(c=>c.s)}];
const CAVE_SHOP = [ // 兌換：圖先用 emoji 暫代，img/shop/<id>.png 有檔就換成圖
  {id:'hat', name:'悟空的帽子', cost:2, e:'🎩', img:'img/shop/hat.png'}, {id:'robe', name:'悟空的戰袍', cost:3, e:'🥋', img:'img/shop/robe.png'},
  {id:'lantern', name:'洞口燈籠', cost:2, e:'🏮', img:'img/shop/lantern.png'}, {id:'flowers', name:'水邊花叢', cost:3, e:'🌸', img:'img/shop/flowers.png'}];
// 大地圖隊伍圖（有檔就用，沒檔：悟空用 wukong-stand 加金色棒，唐僧用 tangseng-rest）
const MAPIMG = {wukongStaff:'img/map/wukong-staff.png', tangFollow:'img/map/tangseng-follow.png'};
// 蟠桃門檻：total 題（10 或 11）、first 第一輪答對題數 → 1～3 顆
function peachTier(first, total){ const hi=total>10?10:9, mid=total>10?7:6; return first>=hi?3:first>=mid?2:1; }
