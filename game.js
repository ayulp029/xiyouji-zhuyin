// 西遊記注音大冒險：第 1 關
const L = LEVEL1;
const app = document.getElementById('app');
const APP_VERSION = document.documentElement.dataset.version || '';
const RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
const D = ms=>RM.matches ? Math.round(ms * .35) : ms; // 減少動態時縮短等待
const pic = (src, alt, cls='pic')=>src?`<img class="${cls}" src="${src}" alt="${alt||''}" draggable="false">`:'';
const exPic = w=>{ const x=L.examples.find(e=>e.w===w); return IMG.ex[w]?pic(IMG.ex[w],w):`<span class="emo">${x?x.e:''}</span>`; };
const blPic = c=>{ const b=L.blends.find(x=>x.ch===c); return IMG.blend[c]?pic(IMG.blend[c],c):`<span class="emo">${b.e}</span>`; };
function setBg(src){ document.body.style.backgroundImage = src?`url(${src})`:''; }
if(IMG.bg) document.body.style.backgroundImage=`url(${IMG.bg})`;

// ---- 畫面切換：換畫面時清掉上一個畫面排的計時器，避免舊動作跑到新畫面 ----
let sceneId=0, timers=[];
const alive = id=>id===sceneId;
function later(fn, ms){ const id=sceneId; const t=setTimeout(()=>{ if(id===sceneId) fn(); }, ms); timers.push(t); return t; }
function setPhase(p){ document.body.dataset.phase=p; } // 給自動測試看目前進行到哪
const el = (html)=>{ sceneId++; timers.forEach(clearTimeout); timers=[]; app.onclick=null; app.innerHTML = html; window.scrollTo(0,0); setPhase(''); };
const $ = s=>app.querySelector(s);
const $$ = s=>[...app.querySelectorAll(s)];
const shuffle = a=>{ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
const center = n=>{ const r=n.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, w:r.width, h:r.height}; };
function burst(node,ch='⭐',n=8){ if(!node) return; const c=center(node); for(let i=0;i<n;i++){ const s=document.createElement('div'); s.className='fly'; if(ch==='⭐'&&IMG.fx.star) s.innerHTML=`<img src="${IMG.fx.star}" style="width:44px">`; else s.textContent=ch;
  s.style.left=(c.x-22)+'px'; s.style.top=(c.y-22)+'px'; const a=Math.PI*2*i/n;
  s.style.setProperty('--dx',Math.cos(a)*120+'px'); s.style.setProperty('--dy',Math.sin(a)*120+'px'); document.body.appendChild(s); setTimeout(()=>s.remove(),1000); } }
function poofAt(x, y, size=110){ if(!IMG.fx.poof) return; const f=document.createElement('img'); f.src=IMG.fx.poof; f.className='poofx'; f.alt='';
  f.style.cssText=`left:${x-size/2}px;top:${y-size/2}px;width:${size}px;height:${size}px`; document.body.appendChild(f); setTimeout(()=>f.remove(),800); }
// 預先載入所有圖，換表情/姿勢時才不會閃一下
(function preloadImages(){ const all=[]; (function walk(o){ Object.values(o).forEach(v=>typeof v==='string'?all.push(v):v&&walk(v)); })(IMG); all.forEach(s=>{ const i=new Image(); i.src=s; }); })();

// ===== 悟空（多層結構：sway 輕晃 / act 動作 / body 呼吸 + 眼皮眨眼）=====
function lidsHTML(pose){ const e=WK_EYES[pose]; if(!e) return ''; const cyc=(4+Math.random()*2.5).toFixed(2), dl=(-Math.random()*4).toFixed(2);
  return e.map(([l,t,w,h])=>`<i class="lid" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%;--blink:${cyc}s;--bd:${dl}s"></i>`).join(''); }
function wkHTML(pose='stand', cls='', id=''){
  return `<div class="wk ${cls}"${id?` id="${id}"`:''} data-pose="${pose}"><div class="wk-sway"><div class="wk-act"><div class="wk-body">
    <img class="wk-img" src="${IMG.wukong[pose]||IMG.wukong.stand}" alt="悟空" draggable="false">${lidsHTML(pose)}</div></div></div></div>`;
}
function wkPose(node, pose){ if(!node) return; const img=node.querySelector('.wk-img'); if(node.dataset.pose===pose) return;
  node.dataset.pose=pose; img.src=IMG.wukong[pose]||IMG.wukong.stand; node.querySelectorAll('.lid').forEach(x=>x.remove()); img.insertAdjacentHTML('afterend', lidsHTML(pose)); }
const WK_ACTS=['jump','confused','pluck','blow'];
function wkAnim(node, act, ms){ if(!node) return Promise.resolve(); const a=node.querySelector('.wk-act');
  a.classList.remove(...WK_ACTS); void a.offsetWidth; a.classList.add(act); node.classList.add('busy');
  return wait(D(ms)).then(()=>{ a.classList.remove(act); node.classList.remove('busy'); }); }
function wkFx(node, html, ms){ if(!node) return; node.insertAdjacentHTML('beforeend', html); const f=node.lastElementChild; setTimeout(()=>f.remove(), ms); return f; }
// 答對：跳起來揮金箍棒（spin 圖 + 弧形棒影 + 星星），中途打到妖怪
const wkTake=node=>(node._act=(node._act||0)+1); // 新動作開始：舊動作結束時不要再改姿勢
const wkBase=node=>node.dataset.base||(node.dataset.base=node.dataset.pose);
async function wkCorrect(node, mon){
  if(!node) return; const back=wkBase(node), tk=wkTake(node); wkPose(node,'spin'); sfx.whoosh();
  wkFx(node, '<i class="swoosh"></i><i class="swoosh s2"></i>', 800);
  const p=wkAnim(node,'jump',800);
  await wait(D(300)); burst(node,'⭐',6); if(mon) monHit(mon);
  await p; if(node._act!==tk) return; wkPose(node,'happy'); await wait(D(350)); if(node._act===tk) wkPose(node, back);
}
// 答錯：歪頭抓頭、冒出小問號（不處罰）
async function wkConfused(node){
  if(!node) return; const back=wkBase(node), tk=wkTake(node); wkPose(node,'stand');
  wkFx(node, '<b class="wk-q">?</b><b class="wk-q q2">?</b>', 1500);
  await wkAnim(node,'confused',1300); if(node._act===tk) wkPose(node, back);
}
// 拔毫毛 → 吹一口氣 → 毫毛飛到每個目標 → 煙霧 → onArrive(i) 讓分身彈出
async function wkPluck(node, targets, onArrive, gap=160){
  if(!node) return; const back=wkBase(node), tk=wkTake(node); wkPose(node,'stand');
  wkFx(node, '<i class="wk-hair"></i>', 700);
  await wkAnim(node,'pluck',550);
  wkPose(node,'cast'); wkFx(node, '<i class="wind"></i><i class="wind w2"></i>', 900); sfx.whoosh();
  const blow=wkAnim(node,'blow',650);
  const img=node.querySelector('.wk-img').getBoundingClientRect(), m=WK_MOUTH.cast||[55,35];
  const from={x:img.left+img.width*m[0]/100, y:img.top+img.height*m[1]/100};
  const flights=targets.map((t,i)=>wait(D(i*gap)).then(()=>flyHair(from, center(t))).then(()=>{ const c=center(t); poofAt(c.x,c.y,Math.max(80,c.h*1.3)); sfx.poof(); onArrive&&onArrive(i); }));
  await Promise.all([blow, ...flights]); await wait(D(250)); if(node._act===tk) wkPose(node, back);
}
function flyHair(from, to){
  if(RM.matches || !document.body.animate) return wait(80);
  const h=document.createElement('i'); h.className='hairfly'; h.style.left=from.x+'px'; h.style.top=from.y+'px'; document.body.appendChild(h);
  const dx=to.x-from.x, dy=to.y-from.y, lift=-Math.min(120, 40+Math.abs(dx)*.25);
  const an=h.animate([{transform:'translate(0,0) rotate(0) scale(.6)',opacity:1},
    {transform:`translate(${dx*.5}px,${dy*.5+lift}px) rotate(360deg) scale(1.2)`,opacity:1,offset:.5},
    {transform:`translate(${dx}px,${dy}px) rotate(720deg) scale(.8)`,opacity:.9}],{duration:620,easing:'ease-in-out',fill:'forwards'});
  return new Promise(r=>{ let done=false; const fin=()=>{ if(done) return; done=true; h.remove(); r(); }; an.onfinish=fin; setTimeout(fin,900); });
}

// ===== 妖怪（float 待機浮動 / act 動作 / 表情圖切換）=====
function monHTML(face='normal', cls='', id='mon'){
  return `<div class="mon ${cls}" id="${id}"><div class="mon-float"><div class="mon-act"><img class="mon-img" src="${IMG.monster[face]||L.monster.img}" alt="${L.monster.name}" draggable="false"></div></div></div>`;
}
function monFace(node, face){ if(node&&IMG.monster[face]) node.querySelector('.mon-img').src=IMG.monster[face]; }
const MON_ACTS=['roar','hit','mock','defeat','tamein'];
function monAnim(node, act, ms){ if(!node) return Promise.resolve(); const a=node.querySelector('.mon-act');
  a.classList.remove(...MON_ACTS); void a.offsetWidth; a.classList.add(act); node.dataset.busy=act;
  return wait(D(ms)).then(()=>{ if(node.dataset.busy===act){ node.dataset.busy=''; if(act!=='defeat') a.classList.remove(act); } }); }
function monHit(node){ sfx.hit(); burst(node,'💥',5); return monAnim(node,'hit',700); }
function monMock(node, face){ monFace(node, face); const p=monAnim(node,'mock',900); later(()=>{ if(!node.dataset.busy) monFace(node,'normal'); }, 1700); return p; }
// 待機時偶爾張牙舞爪（換成 cheeky 表情）
function monIdle(node){ const sid=sceneId; const tick=()=>{ if(!alive(sid)||!document.body.contains(node)) return;
    if(!node.dataset.busy){ monFace(node,'cheeky'); monAnim(node,'roar',900).then(()=>{ if(!node.dataset.busy) monFace(node,'normal'); }); }
    later(tick, 4500+Math.random()*3500); };
  later(tick, 2500+Math.random()*2000); }

// ===== 開始畫面（iOS 一定要點這顆按鈕才會有聲音）=====
function startScreen(){
  el(`<h1>西遊記注音大冒險</h1>${wkHTML('stand','lg','wks')}
  <button class="btn red big" id="go">開始 ▶</button>
  <div class="step">🔔 iPhone 請把側邊靜音開關關掉，才聽得到聲音</div>
  <div class="credit">注音發音：2017 © 教育部，國語注音符號手冊-開放部件 CC BY 4.0；詞語發音：Wikimedia Commons（Wei Gao &amp; Vion Nicolas CC BY 2.0 FR、Yue Tan CC BY-SA 3.0）</div>
  ${APP_VERSION?`<div class="ver">v${APP_VERSION}</div>`:''}`);
  setPhase('start');
  $('#go').onclick=()=>{ unlockAudio(); sfx.ding(); mapScreen(); };
}

// ===== 取經地圖 =====
function mapScreen(){
  stopAll(); const st=levelState(1);
  setBg(IMG.bg);
  const btns=STATIONS.map((n,i)=>`<button class="station ${i===0?'open':''}" data-i="${i}" ${IMG.map?`style="left:${MAP_POS[i][0]}%;top:${MAP_POS[i][1]}%"`:''}>
    ${i===0?'🐵':'🔒'} ${n}${i===0?`<br><small>${st.learned?'📖 已學':''}${st.cleared?' 🏅':''}</small>`:''}</button>`).join('');
  el(`<h1>取經地圖</h1>`+(IMG.map?`<div class="mapimg" style="background-image:url(${IMG.map})">${btns}</div>`:`<div class="map">${btns}</div>`));
  setPhase('map');
  $('.station.open').onclick=()=>{ say('花果山'); levelMenu(); };
}
function levelMenu(){
  const st=levelState(1);
  el(`<h1>第 1 關｜花果山</h1>${monHTML('normal','solo')}
  <div class="row"><button class="btn blue big" id="learn">📖 教學場</button>
  ${st.learned?'<button class="btn red big" id="fight">🐒 對戰場</button>':''}</div>
  <button class="btn gray" id="back">◀ 地圖</button>`);
  setPhase('menu'); monIdle($('#mon'));
  $('#learn').onclick=()=>tutorial(0);
  if(st.learned) $('#fight').onclick=battleStart;
  $('#back').onclick=mapScreen;
}

// ===== 教學場 8 步驟 =====
const STEPS=[stepPicture,stepSentence,stepWords,stepChars,stepSymbols,stepContrast,stepBlend,stepSong];
let stepIdx=0;
function frame(title, body, voice){
  setBg(IMG.bg); el(`<div class="row" style="flex-wrap:nowrap">${IMG.tangseng?pic(IMG.tangseng.talk,'唐僧','wukong sm" id="ts'):''}${wkHTML('point','sm','wkt')}<div class="step tag">教學 ${stepIdx+1} / 8　${title}</div></div>${body}
   <div class="say" id="say">${voice||''}</div>
   <div class="row"><button class="btn gray" id="home">🗺️</button><button class="btn green" id="next" style="visibility:hidden">下一步 ▶</button></div>`);
  setPhase('teach-'+(stepIdx+1));
  $('#home').onclick=mapScreen; $('#next').onclick=()=>tutorial(stepIdx+1);
}
const showNext=()=>{ const t=$('#ts'); if(t&&IMG.tangseng) t.src=IMG.tangseng.praise; const n=$('#next'); if(n&&n.style.visibility!=='visible'){ n.style.visibility='visible'; n.classList.add('pop'); } };
function tutorial(i){ stepIdx=i; if(i>=STEPS.length) return restPoint(); STEPS[i](); }

function stepPicture(){
  frame('看圖說話', `<div class="panel">${monHTML('normal','solo')}
    <div class="row">${L.sceneItems.map(x=>`<button class="card" data-w="${x.w}"><span class="emo">${x.e}</span><small>${x.w}</small></button>`).join('')}</div></div>`,
    '唐僧：你看，小石猴在做什麼呀？');
  const sid=sceneId; say(['你看，小石猴在做什麼呀？', L.sentenceText]).then(()=>{ if(alive(sid)) showNext(); });
  $$('.card').forEach(b=>b.onclick=()=>{ b.classList.add('done'); say(b.dataset.w); });
  later(showNext,6000);
}
function stepSentence(){
  frame('認句子', `<div class="panel sent" id="sent">${L.sentence.map(([c,z])=>`<ruby>${c}<rt>${z}</rt></ruby>`).join('')}</div>`, '悟空：我們一起念一次！（點句子再聽一次）');
  const read=async()=>{ const rs=$$('#sent ruby'); say(L.sentenceText);
    for(const r of rs){ if(!document.body.contains(r)) return; r.classList.add('lit'); await wait(380); r.classList.remove('lit'); } showNext(); };
  $('#sent').onclick=read; later(read,600);
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
  $$('.choice').forEach(b=>b.onclick=()=>{ if(b.dataset.s==='ㄇ'){ sfx.ding(); b.classList.add('glow'); burst(b); wkCorrect($('#wkt')); say(['ㄇ','門']); showNext(); }
    else { sfx.boop(); b.classList.add('shake'); later(()=>b.classList.remove('shake'),500); wkConfused($('#wkt')); say('再看看，門有兩根柱子喔'); } });
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
      k++; later(()=>{ if(k<todo.length) one(); else { $('#say').textContent='你會拼了！'; showNext(); } },1800); });
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
  a.addEventListener('pointercancel',()=>{ on=false; a.style.transform=''; a.classList.remove('dragging'); });
  b.addEventListener('click',()=>{ if(a.dataset.picked) finish(); });
}
function stepSong(){
  frame('兒歌', `<div class="panel" id="song">${L.song.map(([s,t])=>`<div class="sent" style="font-size:1.9rem;margin:6px 0">${t}</div>`).join('')}</div>
   <div class="step">跟著拍手！（點畫面👏）</div>`, '一起唱！');
  app.onclick=e=>{ if(e.target.tagName!=='BUTTON'){ sfx.clap(); burst(e.target.closest('#song')||$('#say'),'👏'); } };
  const sid=sceneId;
  (async()=>{ const lines=$$('#song .sent'); for(let i=0;i<lines.length;i++){ if(!alive(sid)) return;
     lines[i].style.background='#ffe066'; lines[i].classList.add('pop'); await sayUpTo(say(L.song[i][1]), 6000); lines[i].style.background=''; } if(alive(sid)) showNext(); })();
}
function restPoint(){
  setLevel(1,{learned:true}); addSticker('花果山學會了');
  el(`<div class="row">${IMG.tangseng?pic(IMG.tangseng.rest,'唐僧','wukong'):''}${wkHTML('happy')}</div><h1>教學完成！</h1>${IMG.sticker?pic(IMG.sticker,'貼紙','stamp'):'<div class="stamp">🏵️</div>'}<div class="say">得到一張「學會了」貼紙！要繼續去打妖怪，還是下次再來？</div>
   <div class="row"><button class="btn red big" id="fight">🐒 去打妖怪</button><button class="btn gray big" id="later">🏠 下次再來</button></div>`);
  setPhase('rest');
  say('要繼續去打妖怪，還是下次再來？');
  $('#fight').onclick=battleStart; $('#later').onclick=mapScreen;
}

// ===== 對戰場（方案 B：答對＝多一個悟空分身，答錯不扣）=====
let qi=0, clones=0, wrongs=0, cur=null, locked=false;
function battleStart(){
  qi=0; clones=0; setBg(IMG.bgBattle||IMG.bg);
  el(`<div class="say">${L.monster.intro}</div>${monHTML('cheeky','solo pop')}<button class="btn red big" id="go">開始！</button>`);
  setPhase('battle-intro'); monIdle($('#mon'));
  say(L.monster.intro); $('#go').onclick=()=>{ sfx.ding(); nextQ(); };
}
function stageHTML(pose, circle){
  return `<div class="stage">${wkHTML(pose,'battle','wkq')}<div class="arena${circle?' circle':''}" id="arena">${monHTML('normal','in-arena')}<div class="ring" id="ring"></div></div></div>`;
}
// 分身位置：以妖怪為中心的橢圓，依「弧長」平均分配（不會擠在兩側）。
// 數量少時排成上方的弧形，數量越多弧越長，集滿時剛好一整圈包圍。
function cloneLayout(n, circle){
  const ar=$('#arena'); if(!ar||!n) return {pts:[],cw:0,ch:0};
  const W=ar.clientWidth, H=ar.clientHeight, slots=Math.max(n, L.battle.length);
  const ratio=429/512; // wukong-clone.png 寬高比
  let ch=Math.min(H*(circle?.24:.3), 92), cw=ch*ratio, a, b, per, samples;
  for(let k=0;k<4;k++){ // 太擠就縮小分身
    a=W/2-cw/2-2; b=H/2-ch/2-2;
    samples=[]; per=0; let px=0, py=-b; // 從正上方開始，順時針取樣
    for(let i=0;i<=360;i++){ const t=-Math.PI/2+Math.PI*2*i/360, x=a*Math.cos(t), y=b*Math.sin(t); if(i) per+=Math.hypot(x-px,y-py); samples.push([x,y,per]); px=x; py=y; }
    const gapNeed=cw*1.05; if(per/slots>=gapNeed) break; ch=ch*(per/slots)/gapNeed; cw=ch*ratio;
  }
  const step=per/slots, at=s=>{ s=((s%per)+per)%per; let i=samples.findIndex(p=>p[2]>=s); if(i<1) i=1; const [x0,y0,s0]=samples[i-1], [x1,y1,s1]=samples[i], f=(s-s0)/((s1-s0)||1); return [x0+(x1-x0)*f, y0+(y1-y0)*f]; };
  const pts=[]; for(let i=0;i<n;i++){ const [x,y]=at((i-(n-1)/2)*step); pts.push([W/2+x, H/2+y]); }
  return {pts, cw, ch};
}
// hideFrom：第幾隻之後先藏起來（等毫毛飛到才彈出）
function placeClones(n, {hideFrom=n, circle=false}={}){
  const ring=$('#ring'); if(!ring) return [];
  const {pts,cw,ch}=cloneLayout(n, circle), nodes=[...ring.children];
  pts.forEach(([x,y],i)=>{ let c=nodes[i];
    if(!c){ ring.insertAdjacentHTML('beforeend',`<div class="clone"><div class="clone-spin"><div class="clone-pop"><img src="${IMG.clone}" alt="" draggable="false" style="--d:${(-i*.17).toFixed(2)}s"></div></div></div>`); c=ring.lastElementChild; }
    c.style.cssText=`left:${x-cw/2}px;top:${y-ch/2}px;width:${cw}px;height:${ch}px`;
    c.classList.toggle('hide', i>=hideFrom); });
  nodes.slice(n).forEach(x=>x.remove());
  return [...ring.children];
}
function revealClone(c){ if(!c) return; c.classList.remove('hide'); c.classList.remove('new'); void c.offsetWidth; c.classList.add('new'); }
let relayout=null;
window.addEventListener('resize',()=>{ clearTimeout(relayout); relayout=setTimeout(()=>{ const ar=$('#arena'); if(ar) placeClones($$('.clone').length,{hideFrom:$$('.clone:not(.hide)').length,circle:ar.classList.contains('circle')}); },120); });

function promptFor(q){
  if(q.t==='T1'||q.t==='T2') return {text:'哪一個是？', voice:['哪一個是', q.ans], show:'再聽一次'};
  if(q.t==='T3'){ const ex=L.examples.find(e=>e.w===q.ex); return {text:`「${ex.w}」是什麼開頭的音？`, voice:[ex.w,'是什麼開頭的音？'], show:exPic(ex.w)+' '+ex.w}; }
  if(q.t==='T5') return {text:'哪一個是門的 ㄇ？', voice:['哪一個是門的','ㄇ'], show:'🚪'};
  if(q.t==='T6'){ const b=L.blends.find(x=>x.ch===q.blend); return {text:`${b.a} ${b.b} 拼起來是什麼？`, voice:[b.a,b.b,'拼起來是什麼？'], show:`<span class="sym" style="font-size:3rem">${b.a}${b.b}</span>`}; }
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
  el(`<div class="count">第 ${qi+1} / ${L.battle.length} 題　🐵 分身 <b id="cnt">${clones}</b> / ${L.battle.length}</div>
   ${stageHTML('point')}
   <div class="row prompt"><button class="btn blue" id="rep">${p.show} 🔊</button><div class="say" id="say">${p.text}</div></div>
   <div class="row choices">${cur.opts.map(o=>`<button class="choice ${cur.cls}" data-o="${o}">${cur.labels?cur.labels[o]:o}</button>`).join('')}</div>`);
  setPhase('battle-q');
  placeClones(clones); monIdle($('#mon'));
  $('#rep').onclick=()=>say(cur.voice); say(cur.voice);
  $$('.choice').forEach(b=>b.onclick=()=>pick(b));
}
const PRAISE=[['好棒！拔一根猴毛，呼～','好棒！'],['答對了！又多一個悟空！','答對了！'],['你好厲害！','你好厲害！']];
async function pick(b){
  if(locked) return; const o=b.dataset.o, sid=sceneId, wkN=$('#wkq'), mon=$('#mon');
  if(o===cur.ans){
    locked=true; clones++; sfx.ding(); burst(b); b.classList.add('glow'); $$('.choice').forEach(c=>{ if(c!==b) c.classList.add('fade'); });
    const [txt,vo]=PRAISE[Math.random()*PRAISE.length|0]; $('#say').textContent=txt;
    const v=say(cur.t==='T6'?[o,vo]:[vo]);
    setPhase('correct-anim');
    await wkCorrect(wkN, mon); if(!alive(sid)) return;
    const cs=placeClones(clones,{hideFrom:clones-1});
    await wkPluck(wkN, [cs[clones-1]], ()=>{ revealClone(cs[clones-1]); const n=$('#cnt'); if(n){ n.textContent=clones; n.parentNode.classList.remove('pop'); void n.offsetWidth; n.parentNode.classList.add('pop'); } });
    if(!alive(sid)) return; setPhase('correct-done');
    await sayUpTo(v, 3000); await wait(D(250)); if(!alive(sid)) return;
    qi++; nextQ();
  } else {
    wrongs++; sfx.boop(); b.classList.add('shake','fade');
    $('#say').textContent = wrongs===1 ? L.monster.oops : '看！發光的那個就是答案喔';
    if(wrongs>=2) $$('.choice').forEach(c=>{ if(c.dataset.o===cur.ans) c.classList.add('glow'); });
    setPhase('wrong-anim');
    monMock(mon, wrongs===1?'laugh':'cheeky'); wkConfused(wkN);
    say(wrongs===1?['差一點點！再聽一次',...cur.voice]:cur.voice);
    later(()=>{ if(!locked) setPhase('battle-q'); }, 1400);
  }
}
async function victory(){
  setLevel(1,{cleared:true, stamps:2});
  el(`<h1 id="vt">集滿 ${clones} 個分身！</h1>${stageHTML('stand',true)}<div class="say" id="say">分身們，出來吧！</div><div class="row" id="end"></div>`);
  setPhase('victory-clones'); const sid=sceneId, wkN=$('#wkq'), mon=$('#mon');
  // 1) 拔毫毛，分身依序彈出圍成一圈
  const cs=placeClones(clones,{hideFrom:0,circle:true});
  say('分身們，出來吧！');
  await wait(D(300)); await wkPluck(wkN, cs, i=>revealClone(cs[i]), 180); if(!alive(sid)) return;
  setPhase('clones');
  $('#arena').classList.add('spin'); $('#say').textContent='分身們手牽手轉圈圈～'; sfx.win();
  monFace(mon,'cheeky'); await Promise.all([sayUpTo(say('ㄅㄅㄅ，鼻子癢；ㄇㄇㄇ，米飯香'), D(5000)), wait(D(2500))]); // 語音失敗時畫面也至少停一下 if(!alive(sid)) return;
  // 2) 妖怪投降
  monFace(mon,'laugh'); monAnim(mon,'mock',900); $('#say').textContent='石頭頭：'+L.monster.surrender;
  await Promise.all([sayUpTo(say(L.monster.surrender), D(6000)), wait(D(2800))]); if(!alive(sid)) return;
  // 3) 最後一棒：被打中 → 旋轉縮小 → 煙霧消失
  $('#say').textContent='悟空：看我的金箍棒！';
  const v=say('看我的金箍棒！');
  await wkCorrect(wkN, mon); if(!alive(sid)) return;
  setPhase('defeat'); sfx.poof();
  monAnim(mon,'defeat',1000); await wait(D(700)); const c=center(mon.querySelector('.mon-img')); poofAt(c.x, c.y, 220);
  await wait(D(500)); await sayUpTo(v, 1500); if(!alive(sid)) return;
  // 4) 勝利：石猴變乖（tame）+ 蓋印章
  monFace(mon,'tame'); monAnim(mon,'tamein',700); $('#arena').classList.remove('spin');
  sfx.win(); burst($('#arena'),'⭐',10);
  $('#vt').textContent='花果山過關！';
  $('#say').textContent='石頭頭變成乖猴子了！蓋上印章！';
  $('#end').innerHTML=`${IMG.stamp?`<img class="stamp mini" src="${IMG.stamp}" alt="印章">`:'<div class="stamp mini">🏮🐵</div>'}<button class="btn red" id="again">🔁 再玩一次</button><button class="btn blue" id="map">🗺️ 地圖</button>`;
  $('#again').onclick=battleStart; $('#map').onclick=mapScreen;
  setPhase('victory');
  say('花果山過關！');
}
startScreen();
