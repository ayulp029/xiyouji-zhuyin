// 第 1 關資料：之後新增關卡只要照這個格式加一組
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
  monster: { name: '石頭頭', img: IMG.monster.normal,
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
