// 水簾洞＋成長系統（v1.4.0-test）：圖片退回、裝備、地圖隊伍、蟠桃、洞裡的練習／兌換／妖怪複習
// 依賴 game.js 的 el/$/$$/later/alive/wait/say/burst/sfx 等（呼叫時才用到，載入順序在 game.js 之後）

// ---- 圖檔退回：<img data-fb="備用圖"> 或 <img data-emo="emoji">；主圖載入失敗（沒檔）就換掉，不破版 ----
function wireImgFb(root=app){
  root.querySelectorAll('img[data-fb],img[data-emo]').forEach(i=>{
    const fix=()=>{ i.onerror=null;
      if(i.dataset.fb){ const f=i.dataset.fb; delete i.dataset.fb; if(i.parentNode) i.parentNode.classList.add('fb'); i.src=f; }
      else if(i.dataset.emo){ const s=document.createElement('span'); s.className='emo-fb'; s.textContent=i.dataset.emo; i.replaceWith(s); } };
    i.onerror=fix; if(i.complete && i.naturalWidth===0 && i.getAttribute('src')) fix();
  });
}
const hasStaff=()=>levelState(1).cleared;      // 金箍棒：第 1 關過關後
const hasMonk=()=>levelState(2).cleared;       // 唐僧：第 2 關過關後
const owns=id=>caveState().owned.includes(id);
// 悟空身上的換裝（帽子、戰袍）：有 img/shop/<id>.png 用圖，沒檔用 emoji
function gearHTML(){
  return ['robe','hat'].filter(owns).map(id=>{ const it=CAVE_SHOP.find(x=>x.id===id);
    return `<span class="gear ${id}"><img src="${it.img}" data-emo="${it.e}" alt="${it.name}" draggable="false"></span>`; }).join('');
}
const peachesHTML=n=>[0,1,2].map(k=>`<i class="pc ${k<n?'on':''}">🍑</i>`).join('');

// ===== 大地圖：隊伍（悟空拿棒、唐僧跟在後面）＋ 水簾洞入口 =====
function mapExtras(){
  const staff=hasStaff(), monk=hasMonk(); let party='';
  if(staff){
    const cleared=LEVELS.filter(lv=>levelState(lv.id).cleared).length, p=Math.min(cleared, STATIONS.length-1);
    const [x,y]=MAP_POS[p], prev=MAP_POS[Math.max(0,p-1)], dir=prev[0]>x?1:-1, cl=v=>Math.max(9,Math.min(91,v));
    party=`<div class="party" id="party">`+
      (monk?`<div class="pm tang" style="left:${cl(x+dir*35)}%;top:${y+7}%"><img src="${MAPIMG.tangFollow}" data-fb="${IMG.tangseng.rest}" alt="唐僧" draggable="false"></div>`:'')+
      `<div class="pm wk-m gwk" style="left:${cl(x+dir*19)}%;top:${y+7}%"><img src="${MAPIMG.wukongStaff}" data-fb="${IMG.wukong.stand}" alt="悟空拿金箍棒" draggable="false">${gearHTML()}</div></div>`;
  }
  return party;
}
function caveButton(cls=''){ return `<button class="cave-mouth ${cls}" id="cavego">🌊<span>水簾洞</span><small>🍑 ${peachWallet()}</small></button>`; }
function wireCaveButton(){ const b=$('#cavego'); if(b) b.onclick=()=>{ sfx.ding(); say('水簾洞'); caveScreen(); }; }

// ===== 水簾洞 =====
const FR_POS=[[10,12],[24,62],[44,8],[58,66],[72,14],[86,58],[93,10]]; // 猴子朋友的位置（%），最多 7 隻
const friendsN=n=>Math.min(7, Math.floor(n/5));
const cardOf=s=>CARDS.find(c=>c.s===s);
const cardImg=c=>`<img src="img/cards/${c.s}.png" data-emo="${c.e}" alt="${c.w}" draggable="false">`;
function caveFriendHTML(i){ const [l,t]=FR_POS[i]; return `<span class="friend" data-i="${i}" style="left:${l}%;top:${t}%">🐵</span>`; }
const MON_IN_CAVE={ stone:{name:'石頭頭', lv:1, face:()=>IMG.monster.tame, pool:()=>LEVEL1.syms}, rock:{name:'岩岩', lv:2, face:()=>IMG.rock.tame, pool:()=>LEVEL2.syms} };
function caveScreen(){
  stopAll(); setBg(IMG.bg);
  const cs=caveState(), n=Object.keys(cs.heard).length, fr=friendsN(n), all=n>=CARDS.length, staff=hasStaff();
  const mons=Object.entries(MON_IN_CAVE).filter(([k,m])=>levelState(m.lv).cleared)
    .map(([k,m])=>`<button class="cmon" data-m="${k}"><img src="${m.face()}" alt="${m.name}" draggable="false"><b>${m.name}</b></button>`).join('');
  const sections=CAVE_GROUPS.map(g=>`<section class="cg" id="g-${g.id}"><h2>${g.name}</h2><div class="cave-grid">${
    g.list.map(s=>{ const c=cardOf(s); return `<div class="cc" data-s="${s}"><button class="cs">${s}</button><button class="cw">${cardImg(c)}<span>${c.w}</span></button></div>`; }).join('')}</div></section>`).join('');
  el(`<div class="cave-top"><button class="btn gray sm" id="back">◀ 地圖</button><h1>🌊 水簾洞</h1>
      <button class="btn gold sm" id="shopbtn">🍑 <b id="wallet">${peachWallet()}</b>　換好東西</button></div>
    <div class="cave-scene ${all?'all':''}" id="scene"><div class="fall"></div>
      <div class="lants"><span class="lant ${all?'lit':''}">🏮</span><span class="lant ${all?'lit':''}">🏮</span></div>
      ${owns('lantern')?`<span class="deco lantern"><img src="${CAVE_SHOP[2].img}" data-emo="${CAVE_SHOP[2].e}" alt="燈籠" draggable="false"></span>`:''}
      ${owns('flowers')?`<span class="deco flowers"><img src="${CAVE_SHOP[3].img}" data-emo="${CAVE_SHOP[3].e}" alt="花叢" draggable="false"></span>`:''}
      <div class="rock-seat">🪨</div>
      <div class="cave-wk gwk" id="cavewk">${wkHTML('stand','cave','wkc')}${staff?'<i class="staff-bar"></i>':''}${gearHTML()}</div>
      <div class="cmons">${mons}</div>
      <div id="friends">${Array.from({length:fr},(_,i)=>caveFriendHTML(i)).join('')}</div>
      <div class="splash-layer" id="splash"></div></div>
    <div class="cave-tabs"><button class="tab on" data-g="initial">聲母</button><button class="tab" data-g="medial">介音</button><button class="tab" data-g="final">韻母</button>
      <span class="cave-count">聽過 <b id="heardN">${n}</b> / ${CARDS.length}</span></div>
    ${sections}<div class="hint">點左邊的注音聽聲音，點右邊的卡片聽名字</div>`);
  setPhase('cave'); wireImgFb();
  $('#back').onclick=mapScreen; $('#shopbtn').onclick=shopOpen;
  $$('.cs').forEach(b=>b.onclick=()=>hearSym(b.parentNode.dataset.s, b));
  $$('.cw').forEach(b=>b.onclick=()=>{ const c=cardOf(b.parentNode.dataset.s); say(c.w); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  $$('.cave-tabs .tab').forEach(t=>t.onclick=()=>{ $$('.cave-tabs .tab').forEach(x=>x.classList.toggle('on',x===t)); const g=$('#g-'+t.dataset.g); if(g) g.scrollIntoView({behavior:RM.matches?'auto':'smooth',block:'start'}); });
  $$('.cmon').forEach(b=>b.onclick=()=>monsterQuiz(b.dataset.m));
  if(all) $$('.cc').forEach(c=>c.classList.add('seen'));
  Object.keys(cs.heard).forEach(s=>{ const c=$(`.cc[data-s="${s}"]`); if(c) c.classList.add('seen'); });
}
// 點注音：播教育部單音；第一次聽到才算進度（5 個不同注音 +1 猴子，最多 7）；重複聽只閃水花
function hearSym(s, btn){
  const p=say(s); const cs=caveState(), had=cs.heard[s]||0, before=Object.keys(cs.heard).length;
  cs.heard[s]=had+1; const n=Object.keys(cs.heard).length; setCave({heard:cs.heard});
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  $('.cc[data-s="'+s+'"]').classList.add('seen');
  if(had) splashAt(btn); else burst(btn,'✨',4);
  const f0=friendsN(before), f1=friendsN(n);
  const hn=$('#heardN'); if(hn) hn.textContent=n;
  if(f1>f0){ const fr=$('#friends'); fr.insertAdjacentHTML('beforeend', caveFriendHTML(f1-1)); const f=fr.lastElementChild; f.classList.add('new'); sfx.win(); }
  if(n>=CARDS.length && !cs.allHeard){
    setCave({allHeard:true}); const sc=$('#scene'); sc.classList.add('all','flash'); $$('.lant').forEach(l=>l.classList.add('lit')); setTimeout(()=>sc.classList.remove('flash'),1600);
    burst($('#scene'),'🎉',10); setPhase('cave-all');
    p.then(ok=>{ if(ok && document.body.dataset.phase==='cave-all') say('水簾洞好熱鬧！'); });
  }
}
function splashAt(node){ const L2=$('#splash'); if(!L2) return; const r=node.getBoundingClientRect(), s=L2.getBoundingClientRect();
  const d=document.createElement('i'); d.className='splash'; d.textContent='💧'; d.style.left=(r.left+r.width/2-s.left)+'px'; L2.appendChild(d); setTimeout(()=>d.remove(),900); }

// ---- 兌換 ----
function shopOpen(){
  const cs=caveState(), wallet=peachWallet(); let sel=null;
  const m=document.createElement('div'); m.className='modal'; m.id='shop';
  m.innerHTML=`<div class="modal-box"><h2>🍑 蟠桃兌換　你有 <b>${wallet}</b> 顆</h2><div class="shop-grid">${CAVE_SHOP.map(it=>{ const own=cs.owned.includes(it.id);
    return `<button class="shop-item ${own?'own':''} ${!own&&wallet<it.cost?'poor':''}" data-id="${it.id}"><span class="si"><img src="${it.img}" data-emo="${it.e}" alt="${it.name}" draggable="false"></span><b>${it.name}</b><em>${own?'✔ 已擁有':'🍑 × '+it.cost}</em></button>`; }).join('')}</div>
    <div class="shop-ask" id="ask"></div><button class="btn gray" id="shopx">關起來</button></div>`;
  document.body.appendChild(m); wireImgFb(m); setPhase('shop');
  const close=()=>{ m.remove(); setPhase('cave'); };
  m.querySelector('#shopx').onclick=close;
  m.querySelectorAll('.shop-item').forEach(b=>b.onclick=()=>{
    const it=CAVE_SHOP.find(x=>x.id===b.dataset.id); if(cs.owned.includes(it.id)){ say('你已經有了'); return; }
    if(wallet<it.cost){ sfx.boop(); b.classList.add('shake'); setTimeout(()=>b.classList.remove('shake'),500); say('蟠桃還不夠喔'); return; }
    sel=it; m.querySelectorAll('.shop-item').forEach(x=>x.classList.toggle('sel',x===b));
    m.querySelector('#ask').innerHTML=`換「${it.name}」要 ${it.cost} 顆蟠桃？<button class="btn green" id="buy">換！</button><button class="btn gray" id="nobuy">不要</button>`; say(`換${it.name}嗎？`);
    m.querySelector('#nobuy').onclick=()=>{ sel=null; m.querySelector('#ask').innerHTML=''; m.querySelectorAll('.shop-item').forEach(x=>x.classList.remove('sel')); };
    m.querySelector('#buy').onclick=()=>{ const c2=caveState(); if(!sel||c2.owned.includes(sel.id)||peachWallet()<sel.cost) return;
      setCave({spent:c2.spent+sel.cost, owned:[...c2.owned, sel.id]}); sfx.win(); m.remove(); caveScreen(); burst($('#scene'),'🎉',10); say('換好了！'); };
  });
}

// ---- 洞裡的妖怪：點一下出 1 題複習（只從牠那一關的符號）；答完留在洞裡 ----
function monsterQuiz(key){
  const mo=MON_IN_CAVE[key], pool=mo.pool(), ans=pool[Math.random()*pool.length|0], kind=Math.random()<.5?'hear':'see';
  const opts=shuffle([ans,...shuffle(pool.filter(s=>s!==ans)).slice(0,2)]);
  const m=document.createElement('div'); m.className='modal'; m.id='mq'; let done=false;
  const ask=kind==='hear'?['哪一個是',ans]:['這是哪一個聲音？'];
  m.innerHTML=`<div class="modal-box"><img class="mq-mon" src="${mo.face()}" alt="${mo.name}" draggable="false">
    <div class="say" id="mqs">${mo.name}：${kind==='hear'?'哪一個是？':'這個符號，哪一個聲音對？'}</div>
    ${kind==='hear'?'<button class="btn blue" id="mqrep">再聽一次 🔊</button>':`<div class="sym">${ans}</div>`}
    <div class="row choices">${opts.map(o=>kind==='hear'?`<button class="choice" data-o="${o}">${o}</button>`:`<button class="choice" data-o="${o}">🔊</button>`).join('')}</div></div>`;
  document.body.appendChild(m); window.__mq={ans,kind}; setPhase('mq');
  if(kind==='hear'){ say(ask); m.querySelector('#mqrep').onclick=()=>say(ask); } else say(ask);
  m.querySelectorAll('.choice').forEach(b=>b.onclick=async()=>{ if(done) return; const o=b.dataset.o;
    if(kind==='see') say(o);
    if(o===ans){ done=true; sfx.ding(); burst(b); b.classList.add('glow'); m.querySelector('#mqs').textContent=mo.name+'：答對了！你好厲害！';
      if(kind==='hear') say('答對了！'); else setTimeout(()=>say('答對了！'),1400);
      await wait(D(2200)); m.remove(); setPhase('cave'); }
    else { sfx.boop(); b.classList.add('shake'); setTimeout(()=>b.classList.remove('shake'),500);
      m.querySelector('#mqs').textContent=mo.name+'：差一點點，再試試看！'; if(kind==='hear') say(['差一點點！再聽一次','哪一個是',ans]); }
  });
}

// ===== 對戰：金箍棒連擊（純慶祝，不跳題不提示）=====
async function staffBurst(){
  setPhase('staff-burst'); const sm=$('#smini'), mon=$('#mon'), sid=sceneId;
  const t=$('#say'); if(t) t.textContent='悟空：看我的金箍棒！'; const v=say('看我的金箍棒！'); sfx.win();
  if(sm) sm.classList.add('big');
  const fx=document.createElement('div'); fx.className='staff-fx'; fx.innerHTML='<i></i>'; document.body.appendChild(fx); setTimeout(()=>fx.remove(),1500);
  burst($('#arena'),'⭐',10); await wait(D(450)); if(alive(sid)&&mon) monHit(mon);
  await Promise.all([sayUpTo(v,2000), wait(D(1000))]); if(sm) sm.classList.remove('big');
}
// ===== 對戰：唐僧的念經挑戰（第 2 關起、已有唐僧才加；算第 11 題）=====
function monkChallenge(){
  const pool=LEVELS.filter(lv=>lv.id<=L.id).flatMap(lv=>lv.syms), n=2+(Math.random()*2|0), seq=shuffle(pool).slice(0,n);
  const opts=shuffle([...seq,...shuffle(pool.filter(s=>!seq.includes(s))).slice(0,6-n)]); window.__seq=seq;
  let k=0, tries=0, locked=false; const total=L.battle.length+1;
  el(`<div class="count">念經挑戰　第 ${total} / ${total} 題</div>
    <div class="monk">${pic(IMG.tangseng.talk,'唐僧','wukong')}<div class="bubble">🔔 阿彌陀佛～</div></div>
    <div class="slots" id="slots">${seq.map(()=>'<span class="slot"></span>').join('')}</div>
    <div class="say" id="say">唐僧在念經，聽仔細，照順序點！</div>
    <div class="row prompt"><button class="btn blue" id="rep">再聽一次 🔊</button></div>
    <div class="row choices">${opts.map(o=>`<button class="choice" data-o="${o}">${o}</button>`).join('')}</div>`);
  setPhase('monk-q'); const sid=sceneId, slots=$$('.slot'), chs=$$('.choice');
  const intro=['唐僧要念經了，聽仔細喔',...seq]; say(intro); $('#rep').onclick=()=>say(seq);
  const reset=()=>{ k=0; slots.forEach(s=>{ s.textContent=''; s.classList.remove('fill'); }); chs.forEach(c=>c.classList.remove('used')); };
  chs.forEach(b=>b.onclick=async()=>{ if(locked) return; const o=b.dataset.o;
    if(o===seq[k]){ slots[k].textContent=o; slots[k].classList.add('fill'); b.classList.add('used'); say(o); k++;
      if(k>=seq.length){ locked=true; if(tries===0) monkOk=true; setPhase('monk-done'); sfx.win(); burst(b); $('#say').textContent='好棒！念對經了！';
        await wait(D(1300)); if(alive(sid)) { say('好棒！'); await wait(D(700)); } if(alive(sid)) victory(); } }
    else { tries++; sfx.boop(); b.classList.add('shake'); setTimeout(()=>b.classList.remove('shake'),500); reset();
      if(tries===1){ $('#say').textContent='差一點點！再聽一次，照順序點～'; say(['差一點點！再聽一次',...seq]); }
      else { locked=true; setPhase('monk-reveal'); $('#say').textContent='看！發光的順序就是答案喔'; await wait(D(600));
        for(let i=0;i<seq.length;i++){ if(!alive(sid)) return; const c=chs.find(x=>x.dataset.o===seq[i]); c.classList.add('glow'); slots[i].textContent=seq[i]; slots[i].classList.add('fill');
          await Promise.all([sayUpTo(say(seq[i]),1500), wait(D(700))]); }
        await wait(D(900)); if(alive(sid)) victory(); } }
  });
}
