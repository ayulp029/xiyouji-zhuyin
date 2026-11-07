// 關卡資料：之後新增關卡只要照這個格式加一組，再放進最下面的 LEVELS
// audio/ 裡「有」的真人錄音才列在 AUDIO_FILES；沒列的會用裝置語音（TTS）
const AUDIO_FILES = ['ㄧ','ㄨ','ㄅ','ㄇ','爸爸','媽媽','貓咪'];
// 圖檔對照表：美術交新圖時，放進 img/ 並改這裡的檔名即可（null = 先用 emoji/CSS 代替）
const IMG = {
  bg:'img/bg-huaguoshan.jpg', bgBattle:'img/bg-battle.jpg', map:'img/map.jpg',
  wukong:{stand:'img/wukong-stand.png', happy:'img/wukong-happy.png', point:'img/wukong-point.png', cast:'img/wukong-cast.png', spin:'img/wukong-spin.png'},
  clone:'img/wukong-clone.png',
  monster:{normal:'img/stone-monkey-normal.png', laugh:'img/stone-monkey-laugh.png', cheeky:'img/stone-monkey-cheeky.png', tame:'img/stone-monkey-tame.png'},
  tangseng:{talk:'img/tangseng-talk.png', praise:'img/tangseng-praise.png', rest:'img/tangseng-rest.png'},
  stamp:'img/stamp-level1.png', sticker:'img/sticker-level1.png',
  memo:{'ㄧ':'img/memory-yi.png','ㄨ':'img/memory-wu.png','ㄅ':'img/memory-b.png','ㄇ':'img/memory-m.png'},
  ex:Object.fromEntries(['衣服','椅子','烏龜','包子','爸爸','媽媽','貓咪'].map(w=>[w,'img/ex-'+w+'.png'])),
  blend:Object.fromEntries(['米','木','鼻','布'].map(c=>[c,'img/blend-'+c+'.png'])),
  fx:{poof:'img/fx-poof.png', star:'img/fx-star.png'}
};
// 地圖站點位置（%，對應 map.jpg；換地圖時調這裡）
const MAP_POS=[[30,93],[67,76],[36,66],[62,58],[44,51],[38,43],[67,34],[38,25],[78,22],[62,15],[50,6]];
const STATIONS = ['花果山','五行山下','鷹愁澗','高老莊','流沙河','黃風嶺','五莊觀','白虎嶺','平頂山','火焰山','雷音寺'];
const LEVEL1 = {
  id: 1, name: '花果山', syms: ['ㄧ','ㄨ','ㄅ','ㄇ'],
  monster: { name: '石頭頭', e:'🐒', art: IMG.monster,
    intro: '嘿嘿！想離開花果山？先陪我玩注音遊戲！',
    oops: '差一點點！再聽一次，你可以的～',
    surrender: '哇，好多個悟空！我被包圍了啦，哈哈，我也要當乖猴子！' },
  sentence: [['小','ㄒㄧㄠˇ'],['石','ㄕˊ'],['猴','ㄏㄡˊ'],['拿','ㄋㄚˊ'],['木','ㄇㄨˋ'],['頭','ㄊㄡˊ'],['，',''],['鼻','ㄅㄧˊ'],['子','ㄗ˙'],['好','ㄏㄠˇ'],['癢','ㄧㄤˇ'],['。','']],
  sentenceText: '小石猴拿木頭，鼻子好癢。',
  pictureAsk: '你看，小石猴在做什麼呀？',
  stamp: IMG.stamp, sticker: IMG.sticker, stickerName: '花果山學會了',
  sceneItems: [{e:'🐒',w:'小石猴'},{e:'🪵',w:'木頭'},{e:'👃',w:'鼻子'}],
  words: [{w:'木頭',e:'🪵',ch:'木'},{w:'鼻子',e:'👃',ch:'鼻'}],
  // 記憶圖：圖名用該音開頭
  memo: { 'ㄧ':{e:'🥢',w:'一根筷子',say:'一'}, 'ㄨ':{e:'🐦‍⬛',w:'烏鴉',say:'烏鴉'},
          'ㄅ':{e:'👜',w:'包包',say:'包包'}, 'ㄇ':{e:'🚪',w:'門',say:'門'} },
  // 例詞（看圖選開頭音 T3 用）
  examples: [{w:'衣服',e:'👕',s:'ㄧ'},{w:'椅子',e:'🪑',s:'ㄧ'},{w:'烏龜',e:'🐢',s:'ㄨ'},{w:'烏鴉',e:'🐦‍⬛',s:'ㄨ'},
             {w:'爸爸',e:'👨',s:'ㄅ'},{w:'包子',e:'🥟',s:'ㄅ'},{w:'媽媽',e:'👩',s:'ㄇ'},{w:'貓咪',e:'🐱',s:'ㄇ'}],
  symTag: '木 = ㄇ ㄨˋ　鼻 = ㄅ ㄧˊ', symOrder: ['ㄇ','ㄨ','ㄅ','ㄧ'],
  contrast: { opts:['ㄅ','ㄇ'], ans:'ㄇ', hint:'ㄅ 有一個小勾勾，ㄇ 是一扇門，兩邊都有柱子。', ask:'哪個是門？',
              retry:'再看看，門有兩根柱子喔', win:['ㄇ','門'] },
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

// 第 2 關：五行山下（新符號 ㄚ ㄛ ㄆ ㄈ，也複習 ㄅ ㄇ ㄨ）
// 美術還沒交圖：art / stamp / sticker 先放 null，會用 emoji 代替
const LEVEL2 = {
  id: 2, name: '五行山下', syms: ['ㄚ','ㄛ','ㄆ','ㄈ'],
  monster: { name: '岩岩', e:'🗿', art: null,
    intro: '我是五行山的岩岩！悟空想出來？先陪我玩注音遊戲！',
    oops: '差一點點！再聽一次，你可以的～',
    surrender: '哇，好多悟空一起推，山都搖起來了！好啦好啦，放你出來，快去找師父吧！' },
  sentence: [['佛','ㄈㄛˊ'],['祖','ㄗㄨˇ'],['壓','ㄧㄚ'],['住','ㄓㄨˋ'],['悟','ㄨˋ'],['空','ㄎㄨㄥ'],['，',''],
             ['悟','ㄨˋ'],['空','ㄎㄨㄥ'],['想','ㄒㄧㄤˇ'],['吃','ㄔ'],['葡','ㄆㄨˊ'],['萄','ㄊㄠˊ'],['。','']],
  sentenceText: '佛祖壓住悟空，悟空想吃葡萄。',
  pictureAsk: '你看，悟空怎麼了呀？',
  stamp: null, sticker: null, stickerName: '五行山學會了',
  sceneItems: [{e:'🐒',w:'悟空'},{e:'⛰️',w:'大山'},{e:'🍇',w:'葡萄'}],
  words: [{w:'佛祖',e:'🙏',ch:'佛'},{w:'葡萄',e:'🍇',ch:'葡'}],
  memo: { 'ㄚ':{e:'👴',w:'阿公',say:'阿公'}, 'ㄛ':{e:'🐓',w:'喔喔叫',say:'喔喔'},
          'ㄆ':{e:'🍽️',w:'盤子',say:'盤子'}, 'ㄈ':{e:'✈️',w:'飛機',say:'飛機'} },
  examples: [{w:'葡萄',e:'🍇',s:'ㄆ'},{w:'螃蟹',e:'🦀',s:'ㄆ'},{w:'房子',e:'🏠',s:'ㄈ'},{w:'風箏',e:'🪁',s:'ㄈ'},{w:'阿公',e:'👴',s:'ㄚ'}],
  symTag: '佛 = ㄈ ㄛˊ　葡 = ㄆ ㄨˊ', symOrder: ['ㄈ','ㄛ','ㄆ','ㄚ'],
  contrast: { opts:['ㄅ','ㄆ'], ans:'ㄆ', hint:'ㄅ 只有一個小勾勾，ㄆ 下面有兩隻交叉的腳，可以爬爬爬。', ask:'哪個是爬的 ㄆ？',
              retry:'再看看，ㄆ 有交叉的腳喔', win:['ㄆ','爬'] },
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
// 依地圖順序排（第 i 個對應 STATIONS[i]）
const LEVELS = [LEVEL1, LEVEL2];
