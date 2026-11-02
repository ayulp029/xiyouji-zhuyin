// 西遊記注音大冒險：第 1 關 MVP
const L = LEVEL1;
const app = document.getElementById('app');
const wk = (pose='stand', cls='wukong')=>`<img class="${cls}" src="${IMG.wukong[pose]||IMG.wukong.stand}" alt="悟空">`;
const W = wk('stand');
const pic = (src, alt, cls='pic')=>src?`<img class="${cls}" src="${src}" alt="${alt||''}">`:'';
const exPic = w=>{ const x=L.examples.find(e=>e.w===w); return IMG.ex[w]?pic(IMG.ex[w],w):`<span class="emo">${x?x.e:''}</span>`; };
const blPic = c=>{ const b=L.blends.find(x=>x.ch===c); return IMG.blend[c]?pic(IMG.blend[c],c):`<span class="emo">${b.e}</span>`; };
function setBg(src){ document.body.style.backgroundImage = src?`url(${src})`:''; }
if(IMG.bg) document.body.style.backgroundImage=`url(${IMG.bg})`;
const el = (html)=>{ app.innerHTML = html; window.scrollTo(0,0); };
const $ = s=>app.querySelector(s);
const $$ = s=>[...app.querySelectorAll(s)];
const shuffle = a=>{ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
function burst(node,ch='⭐'){ const r=node.getBoundingClientRect(); for(let i=0;i<8;i++){ const s=document.createElement('div'); s.className='fly'; if(ch==='⭐'&&IMG.fx.star) s.innerHTML=`<img src="${IMG.fx.star}" style="width:48px">`; else s.textContent=ch;
  s.style.left=(r.left+r.width/2-20)+'px'; s.style.top=(r.top+r.height/2-20)+'px'; const a=Math.PI*2*i/8;
  s.style.setProperty('--dx',Math.cos(a)*120+'px'); s.style.setProperty('--dy',Math.sin(a)*120+'px'); document.body.appendChild(s); setTimeout(()=>s.remove(),1000); } }

// ===== 開始畫面（iOS 一定要點這顆按鈕才會有聲音）=====
function startScreen(){
  el(`<h1>西遊記注音大冒險</h1>${W}
  <button class="btn red big" id="go">開始 ▶</button>
  <div class="step">🔔 iPhone 請把側邊靜音開關關掉，才聽得到聲音</div>
  <div class="credit">注音發音：2017 © 教育部，國語注音符號手冊-開放部件 CC BY 4.0；詞語發音：Wikimedia Commons（Wei Gao &amp; Vion Nicolas CC BY 2.0 FR、Yue Tan CC BY-SA 3.0）</div>`);
  $('#go').onclick=()=>{ unlockAudio(); sfx.ding(); mapScreen(); };
}

// ===== 取經地圖 =====
function mapScreen(){
  stopAll(); const st=levelState(1);
  setBg(IMG.bg);
  const btns=STATIONS.map((n,i)=>`<button class="station ${i===0?'open':''}" data-i="${i}" ${IMG.map?`style="left:${MAP_POS[i][0]}%;top:${MAP_POS[i][1]}%"`:''}>
    ${i===0?'🐵':'🔒'} ${n}${i===0?`<br><small>${st.learned?'📖 已學':''}${st.cleared?' 🏅':''}</small>`:''}</button>`).join('');
  el(`<h1>取經地圖</h1>`+(IMG.map?`<div class="mapimg" style="background-image:url(${IMG.map})">${btns}</div>`:`<div class="map">${btns}</div>`));
  $('.station.open').onclick=()=>{ say('花果山'); levelMenu(); };
}
function levelMenu(){
  const st=levelState(1);
  el(`<h1>第 1 關｜花果山</h1><img class="monster" src="${L.monster.img}" alt="石頭頭">
  <div class="row"><button class="btn blue big" id="learn">📖 教學場</button>
  ${st.learned?'<button class="btn red big" id="fight">🐒 對戰場</button>':''}</div>
  <button class="btn gray" id="back">◀ 地圖</button>`);
  $('#learn').onclick=()=>tutorial(0);
  if(st.learned) $('#fight').onclick=battleStart;
  $('#back').onclick=mapScreen;
}

// ===== 教學場 8 步驟 =====
const STEPS=[stepPicture,stepSentence,stepWords,stepChars,stepSymbols,stepContrast,stepBlend,stepSong];
let stepIdx=0;
function frame(title, body, voice){
  setBg(IMG.bg); el(`<div class="row" style="flex-wrap:nowrap">${IMG.tangseng?pic(IMG.tangseng.talk,'唐僧','wukong sm" id="ts'):''}${wk('point','wukong sm')}<div class="step tag">教學 ${stepIdx+1} / 8　${title}</div></div>${body}
   <div class="say" id="say">${voice||''}</div>
   <div class="row"><button class="btn gray" id="home">🗺️</button><button class="btn green" id="next" style="visibility:hidden">下一步 ▶</button></div>`);
  $('#home').onclick=mapScreen; $('#next').onclick=()=>tutorial(stepIdx+1);
}
const showNext=()=>{ const t=$('#ts'); if(t&&IMG.tangseng) t.src=IMG.tangseng.praise; const n=$('#next'); if(n){ n.style.visibility='visible'; n.classList.add('pop'); } };
function tutorial(i){ stepIdx=i; if(i>=STEPS.length) return restPoint(); STEPS[i](); }

function stepPicture(){
  frame('看圖說話', `<div class="panel"><img class="monster" src="${L.monster.img}" alt="">
    <div class="row">${L.sceneItems.map(x=>`<button class="card" data-w="${x.w}"><span class="emo">${x.e}</span><small>${x.w}</small></button>`).join('')}</div></div>`,
    '唐僧：你看，小石猴在做什麼呀？');
  say(['你看，小石猴在做什麼呀？', L.sentenceText]).then(showNext);
  $$('.card').forEach(b=>b.onclick=()=>{ b.classList.add('done'); say(b.dataset.w); });
  setTimeout(showNext,6000);
}
function stepSentence(){
  frame('認句子', `<div class="panel sent" id="sent">${L.sentence.map(([c,z])=>`<ruby>${c}<rt>${z}</rt></ruby>`).join('')}</div>`, '悟空：我們一起念一次！（點句子再聽一次）');
  const read=async()=>{ const rs=$$('#sent ruby'); say(L.sentenceText);
    for(const r of rs){ if(!document.body.contains(r)) return; r.classList.add('lit'); await wait(380); r.classList.remove('lit'); } showNext(); };
  $('#sent').onclick=read; setTimeout(read,600);
}
function stepWords(){
  frame('找詞', `<div class="panel sent">${L.sentence.map(([c])=>c).join('')}</div>
   <div class="row">${L.words.map(w=>`<button class="card" data-w="${w.w}"><span class="emo">${w.e}</span>${w.w}</button>`).join('')}</div>`, '找一找：「木頭」在哪裡？「鼻子」在哪裡？');
  say('找到了，木頭！鼻子！'); let n=0;
  $$('.card').forEach(b=>b.onclick=()=>{ if(!b.classList.contains('done')){ b.classList.add('done','pop'); sfx.ding(); n++; } say(b.dataset.w); if(n>=2) showNext(); });
}
function stepChars(){
  frame('找字', `<div class="row">${L.words.map(w=>`<button class="card" data-w="${w.w}" data-c="${w.ch}"><span style="font-size:5rem">${w.ch}</span><small>${w.w}</small></button>`).join('')}</div>`, '木頭的「木」，鼻子的「鼻」。');
  say(['木頭的木','鼻子的鼻']); let n=0;
  $$('.card').forEach(b=>b.onclick=()=>{ if(!b.classList.contains('done')){ b.classList.add('done'); n++; } say(b.dataset.w+'的'+b.dataset.c); if(n>=2) showNext(); });
}
function stepSymbols(){
  const order=['ㄇ','ㄨ','ㄅ','ㄧ'];
  frame('認符號', `<div class="step tag">木 = ㄇ ㄨˋ　鼻 = ㄅ ㄧˊ</div><div class="row">${order.map(s=>`<button class="card" data-s="${s}">${IMG.memo[s]?`<span class="memo"><img src="${IMG.memo[s]}" alt=""><b>${s}</b></span>`:`<span class="sym">${s}</span><span class="emo" style="opacity:.6">${L.memo[s].e}</span>`}<small>${L.memo[s].w}</small></button>`).join('')}</div>`,
   '點一點每個符號，聽它的聲音');
  const seen=new Set();
  $$('.card').forEach(b=>b.onclick=()=>{ const s=b.dataset.s; b.classList.add('done','pop'); seen.add(s);
    $('#say').textContent=`這是 ${s}，${s}～${L.memo[s].w}的 ${s}`; say([s, L.memo[s].say]); if(seen.size>=4) showNext(); });
}
function stepContrast(){
  frame('比一比', `<div class="row">${shuffle(['ㄅ','ㄇ']).map(s=>`<button class="choice" data-s="${s}">${s}</button>`).join('')}</div>`,
   'ㄅ 有一個小勾勾，ㄇ 是一扇門，兩邊都有柱子。哪個是門？');
  say(['ㄅ有一個小勾勾，ㄇ是一扇門。','哪個是門？']);
  $$('.choice').forEach(b=>b.onclick=()=>{ if(b.dataset.s==='ㄇ'){ sfx.ding(); b.classList.add('glow'); burst(b); say(['ㄇ','門']); showNext(); }
    else { sfx.boop(); b.classList.add('shake'); setTimeout(()=>b.classList.remove('shake'),500); say('再看看，門有兩根柱子喔'); } });
}
function stepBlend(){
  const todo=[L.blends[0],L.blends[1],L.blends[2]]; let k=0;
  frame('拼一拼', `<div id="bz"></div>`, '把兩張卡拖在一起！'); 
  const one=()=>{ const b=todo[k];
    $('#bz').innerHTML=`<div class="step">第 ${k+1} / ${todo.length} 個</div><div class="row" style="gap:60px">
      <div class="card drag" id="da"><span class="sym">${b.a}</span></div><div class="card" id="db"><span class="sym">${b.b}</span></div></div>
      <div class="emo" id="res" style="min-height:90px"></div>`;
    dragOnto($('#da'),$('#db'),()=>{ sfx.poof(); $('#res').innerHTML=`${blPic(b.ch)} <b style="font-size:3.5rem">${b.ch}</b>`; $('#res').classList.add('pop');
      $('#say').textContent=`${b.a} 和 ${b.b} 碰一起，就是「${b.ch}」！`; say(b.ch);
      k++; setTimeout(()=>{ if(k<todo.length) one(); else { $('#say').textContent='你會拼了！'; showNext(); } },1800); });
  };
  say('把兩張卡拖在一起'); one();
}
// 拖曳：把 a 拖到 b 上；也可以先點 a 再點 b（小手拖不好時的備案）
function dragOnto(a,b,done){
  let sx=0,sy=0,on=false,fin=false;
  const finish=()=>{ if(fin) return; fin=true; a.style.transform=''; a.classList.remove('dragging'); done(); };
  a.addEventListener('pointerdown',e=>{ on=true; sx=e.clientX; sy=e.clientY; a.classList.add('dragging'); a.setPointerCapture&&a.setPointerCapture(e.pointerId); });
  a.addEventListener('pointermove',e=>{ if(on) a.style.transform=`translate(${e.clientX-sx}px,${e.clientY-sy}px)`; });
  a.addEventListener('pointerup',e=>{ if(!on) return; on=false; a.classList.remove('dragging');
    const r=b.getBoundingClientRect(), moved=Math.hypot(e.clientX-sx,e.clientY-sy);
    if(e.clientX>r.left-40&&e.clientX<r.right+40&&e.clientY>r.top-40&&e.clientY<r.bottom+40) finish();
    else { a.style.transform=''; if(moved<10){ a.classList.add('done'); a.dataset.picked='1'; } } });
  b.addEventListener('click',()=>{ if(a.dataset.picked) finish(); });
}
function stepSong(){
  frame('兒歌', `<div class="panel" id="song">${L.song.map(([s,t])=>`<div class="sent" style="font-size:1.9rem;margin:6px 0">${t}</div>`).join('')}</div>
   <div class="step">跟著拍手！（點畫面👏）</div>`, '一起唱！');
  app.onclick=e=>{ if(e.target.tagName!=='BUTTON'){ sfx.clap(); burst(e.target.closest('#song')||$('#say'),'👏'); } };
  (async()=>{ const lines=$$('#song .sent'); for(let i=0;i<lines.length;i++){ if(!document.body.contains(lines[i])) return;
     lines[i].style.background='#ffe066'; lines[i].classList.add('pop'); await say(L.song[i][1]); if(lines[i]) lines[i].style.background=''; } showNext(); })();
}
function restPoint(){
  app.onclick=null; setLevel(1,{learned:true}); addSticker('花果山學會了');
  el(`<div class="row">${IMG.tangseng?pic(IMG.tangseng.rest,'唐僧','wukong'):''}${wk('happy')}</div><h1>教學完成！</h1>${IMG.sticker?pic(IMG.sticker,'貼紙','stamp'):'<div class="stamp">🏵️</div>'}<div class="say">得到一張「學會了」貼紙！要繼續去打妖怪，還是下次再來？</div>
   <div class="row"><button class="btn red big" id="fight">🐒 去打妖怪</button><button class="btn gray big" id="later">🏠 下次再來</button></div>`);
  say('要繼續去打妖怪，還是下次再來？');
  $('#fight').onclick=battleStart; $('#later').onclick=mapScreen;
}

// ===== 對戰場（方案 B：答對＝多一個悟空分身，答錯不扣）=====
let qi=0, clones=0, wrongs=0, cur=null, locked=false;
function battleStart(){
  app.onclick=null; qi=0; clones=0; setBg(IMG.bgBattle||IMG.bg);
  el(`<div class="say">${L.monster.intro}</div><img class="monster pop" src="${L.monster.img}" alt=""><button class="btn red big" id="go">開始！</button>`);
  say(L.monster.intro); $('#go').onclick=()=>{ sfx.ding(); nextQ(); };
}
function arenaHTML(){ return `<div class="count">分身 ${clones} / ${L.battle.length}</div><div class="arena" id="arena"><div class="ring" id="ring"></div><img class="monster" id="mon" src="${IMG.monster.cheeky||L.monster.img}" alt=""></div>`; }
function placeClones(n, full){
  const ring=$('#ring'); if(!ring) return; ring.innerHTML='';
  const tot=L.battle.length, W0=$('#arena').clientWidth;
  const H0=$('#arena').clientHeight, cy=full?H0/2:150, R=full?Math.min(W0/2-45,H0/2-45):Math.min(W0/2-40,130);
  for(let i=0;i<n;i++){ const a = full ? Math.PI*2*i/tot : Math.PI*(1-i/(tot-1)); // 半圓：左到右；集滿：整圈
    const x=W0/2+Math.cos(a)*R-30, y=cy-Math.sin(a)*R+42;
    ring.insertAdjacentHTML('beforeend',`<img class="clone" src="${IMG.clone}" style="left:${x}px;top:${y-42}px" alt="">`); }
}
function promptFor(q){
  if(q.t==='T1'||q.t==='T2') return {text:'哪一個是？', voice:['哪一個是', q.ans], show:'再聽一次'};
  if(q.t==='T3'){ const ex=L.examples.find(e=>e.w===q.ex); return {text:`「${ex.w}」是什麼開頭的音？`, voice:[ex.w,'是什麼開頭的音？'], show:exPic(ex.w)+' '+ex.w}; }
  if(q.t==='T5') return {text:'哪一個是門的 ㄇ？', voice:['哪一個是門的','ㄇ'], show:'🚪'};
  if(q.t==='T6'){ const b=L.blends.find(x=>x.ch===q.blend); return {text:`${b.a} ${b.b} 拼起來是什麼？`, voice:[b.a,b.b,'拼起來是什麼？'], show:`<span class="sym" style="font-size:3.5rem">${b.a}${b.b}</span>`}; }
  if(q.t==='T7'){ const b=L.blends.find(x=>x.ch===q.blend); return {text:`「${b.ch}」要怎麼拼？`, voice:[b.ch,'要怎麼拼？'], show:blPic(b.ch)+' '+b.ch}; }
}
function optionsFor(q){
  if(q.t==='T3'){ const ex=L.examples.find(e=>e.w===q.ex); return {ans:ex.s, opts:shuffle([ex.s,...shuffle(L.syms.filter(s=>s!==ex.s)).slice(0,2)]), cls:''}; }
  if(q.t==='T6'){ const b=L.blends.find(x=>x.ch===q.blend); const others=shuffle(L.blends.filter(x=>x.ch!==b.ch)).slice(0,2);
    return {ans:b.ch, opts:shuffle([b,...others]).map(x=>x.ch), labels:Object.fromEntries(L.blends.map(x=>[x.ch,blPic(x.ch)+'<br>'+x.ch])), cls:'small'}; }
  if(q.t==='T7'){ const b=L.blends.find(x=>x.ch===q.blend); return {ans:b.a+b.b, opts:shuffle(q.opts), cls:'small'}; }
  return {ans:q.ans, opts:shuffle(q.opts), cls:''};
}
function nextQ(){
  if(qi>=L.battle.length) return victory();
  const q=L.battle[qi]; const p=promptFor(q); cur=optionsFor(q); cur.t=q.t; cur.voice=p.voice; wrongs=0; locked=false;
  window.__ans=cur.ans; // 測試用
  el(`${arenaHTML()}<div class="step">第 ${qi+1} 題 / 共 ${L.battle.length} 題</div>
   <img class="wukong sm" id="wkq" src="${IMG.wukong.point}" alt="">
   <button class="btn blue" id="rep" style="font-size:2rem">${p.show} 🔊</button><div class="say" id="say">${p.text}</div>
   <div class="row" style="width:min(96vw,600px);flex-wrap:nowrap">${cur.opts.map(o=>`<button class="choice ${cur.cls}" data-o="${o}">${cur.labels?cur.labels[o]:o}</button>`).join('')}</div>`);
  placeClones(clones,false);
  $('#rep').onclick=()=>say(cur.voice); say(cur.voice);
  $$('.choice').forEach(b=>b.onclick=()=>pick(b));
}
function pick(b){
  if(locked) return; const o=b.dataset.o;
  if(o===cur.ans){ locked=true; clones++; sfx.ding(); burst(b); b.classList.add('glow'); const wq=$('#wkq'); if(wq&&IMG.wukong.cast) wq.src=IMG.wukong.cast;
    $('#say').textContent=['好棒！拔一根猴毛，呼～','答對了！又多一個悟空！','你好厲害！'][Math.random()*3|0];
    setTimeout(()=>{ sfx.poof(); placeClones(clones,false); const last=$$('.clone').pop(); if(last&&IMG.fx.poof){ const f=document.createElement('img'); f.src=IMG.fx.poof; f.className='poof'; f.style.left=last.style.left; f.style.top=last.style.top; $('#ring').appendChild(f); setTimeout(()=>f.remove(),700); } $('.count').textContent=`分身 ${clones} / ${L.battle.length}`; },300);
    say(cur.t==='T6'?o:[]); setTimeout(()=>{ qi++; nextQ(); },2000); }
  else { wrongs++; sfx.boop(); b.classList.add('shake','fade');
    $('#say').textContent = wrongs===1 ? L.monster.oops : '看！發光的那個就是答案喔';
    if(wrongs>=2) $$('.choice').forEach(c=>{ if(c.dataset.o===cur.ans) c.classList.add('glow'); });
    say(wrongs===1?['差一點點！再聽一次',...cur.voice]:cur.voice); }
}
function victory(){
  setLevel(1,{cleared:true, stamps:2});
  el(`<h1>集滿 ${clones} 個分身！</h1>${arenaHTML()}${wk('spin','wukong sm')}<div class="say" id="say">分身們手牽手轉圈圈～</div><div id="end"></div>`);
  $('#arena').classList.add('circle'); placeClones(clones,true); sfx.win(); say('ㄅㄅㄅ，鼻子癢；ㄇㄇㄇ，米飯香');
  setTimeout(()=>{ $('#mon').classList.add('laugh'); if(IMG.monster.laugh) $('#mon').src=IMG.monster.laugh; $('#say').textContent='石頭頭：'+L.monster.surrender; say(L.monster.surrender); },3500);
  setTimeout(()=>{ const m=$('#mon'); if(m&&IMG.monster.tame){ m.classList.remove('laugh'); m.src=IMG.monster.tame; } $('#end').innerHTML=`${IMG.stamp?`<img class="stamp" src="${IMG.stamp}" alt="印章">`:'<div class="stamp">🏮🐵</div>'}<div class="say">花果山過關！蓋上印章！</div>
     <div class="row"><button class="btn red" id="again">🔁 再玩一次</button><button class="btn blue" id="map">🗺️ 地圖</button></div>`;
     $('#end').scrollIntoView({behavior:'smooth',block:'end'}); $('#again').onclick=battleStart; $('#map').onclick=mapScreen; },7000);
}
startScreen();
