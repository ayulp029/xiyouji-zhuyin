// 聲音：真人錄音優先（audio/xxx.mp3），沒有就用裝置語音（TTS）
// iOS 規則：一定要在使用者點擊（「開始」按鈕）時解鎖；從背景回來時 AudioContext 可能被暫停，要重新 resume。
// 播放策略：Web Audio API 解碼成 buffer（iOS 最穩）→ 失敗退回 <audio> → 再失敗用 speechSynthesis。
const AC = window.AudioContext || window.webkitAudioContext;
let ac = null, sayToken = 0, curStop = null, unlocked = false;
const bufCache = {}, elCache = {}, loading = {};
const wait = ms => new Promise(r => setTimeout(r, ms));
const audioUrl = k => 'audio/' + encodeURIComponent(k) + '.mp3';
function ctx(){ if(!ac && AC){ try{ ac = new AC(); }catch(e){ ac = null; } } return ac; }

// ---------- 預先載入 ----------
function decode(ab){
  const c = ctx();
  return new Promise((res, rej)=>{ // 舊 Safari 只有 callback 版本
    try{ const p = c.decodeAudioData(ab, res, rej); if(p && p.then) p.then(res, rej); }catch(e){ rej(e); }
  });
}
function makeEl(k){
  if(!elCache[k]){ const a = new Audio(); a.preload = 'auto'; a.src = audioUrl(k); try{ a.load(); }catch(e){} elCache[k] = a; }
  return elCache[k];
}
function loadOne(k){
  if(!loading[k]) loading[k] = (async()=>{
    try{
      if(!ctx()) throw new Error('no WebAudio');
      const r = await fetch(audioUrl(k)); if(!r.ok) throw new Error('HTTP ' + r.status);
      bufCache[k] = await decode(await r.arrayBuffer());
    }catch(e){ makeEl(k); } // 退回 HTMLAudioElement
  })();
  return loading[k];
}
function preloadAudio(){ return Promise.all(AUDIO_FILES.map(loadOne)); }

// ---------- 解鎖 / 恢復 ----------
function resumeAudio(){
  if(ac && ac.state !== 'running'){ try{ const p = ac.resume(); if(p && p.catch) p.catch(()=>{}); }catch(e){} }
  if('speechSynthesis' in window && speechSynthesis.paused){ try{ speechSynthesis.resume(); }catch(e){} }
}
function unlockAudio(){
  const c = ctx();
  if(c){ try{
    resumeAudio();
    const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); // 無聲 buffer
  }catch(e){} }
  Object.values(elCache).forEach(a=>{ try{ // 讓退回用的 <audio> 也被「使用者手勢」解鎖
    a.muted = true; const back = ()=>{ a.pause(); try{ a.currentTime = 0; }catch(e){} a.muted = false; };
    const p = a.play(); if(p && p.then) p.then(back, back); else back();
  }catch(e){} });
  if(!unlocked && 'speechSynthesis' in window){ try{
    const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'zh-TW'; speechSynthesis.speak(u);
  }catch(e){} }
  unlocked = true; preloadAudio();
}
async function ensureRunning(){
  const c = ctx(); if(!c) return false;
  if(c.state !== 'running'){ try{ await Promise.race([c.resume(), wait(350)]); }catch(e){} }
  return c.state === 'running';
}
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stopAll(); else resumeAudio(); });
window.addEventListener('pageshow', resumeAudio);
window.addEventListener('focus', resumeAudio);
// iOS 來電/切 App 後 AudioContext 會變成 interrupted，只有手勢中 resume 才有效
document.addEventListener('pointerdown', ()=>{ if(unlocked) resumeAudio(); }, true);

// ---------- 裝置語音 ----------
let zhVoice = null;
const TTS_RATE = 0.85, TTS_PITCH = 1.1;
function pickVoice(){
  if(!('speechSynthesis' in window)) return;
  const v = speechSynthesis.getVoices() || [];
  const tw = v.filter(x=>/zh[-_]TW/i.test(x.lang) || /台灣|臺灣|Taiwan/i.test(x.name));
  zhVoice = tw.find(x=>/Mei-?Jia|美佳/i.test(x.name)) || tw.find(x=>x.localService) || tw[0]
    || v.find(x=>/zh[-_](HK|Hant)/i.test(x.lang)) || v.find(x=>/^(zh|cmn)/i.test(x.lang)) || null;
}
if('speechSynthesis' in window){ pickVoice(); try{ speechSynthesis.addEventListener('voiceschanged', pickVoice); }catch(e){ speechSynthesis.onvoiceschanged = pickVoice; } }
let lastCancel = 0, curUtt = null; // curUtt 保留參照：避免 utterance 被回收導致 onend 不觸發
function ssCancel(){ if('speechSynthesis' in window){ try{ speechSynthesis.cancel(); }catch(e){} lastCancel = Date.now(); } }
async function tts(t, tk){
  if(!('speechSynthesis' in window) || !String(t).trim()) return wait(400);
  const ss = speechSynthesis;
  const gap = 150 - (Date.now() - lastCancel); if(gap > 0) await wait(gap); // iOS：cancel 後立刻 speak 會被吃掉
  if(ss.speaking || ss.pending){ ssCancel(); await wait(150); }
  if(tk !== sayToken) return;
  if(ss.paused) try{ ss.resume(); }catch(e){}
  return new Promise(r=>{
    let done = false, started = false;
    const fin = ()=>{ if(done) return; done = true; clearTimeout(to); clearTimeout(st); if(curStop === stop) curStop = null; curUtt = null; r(); };
    const stop = ()=>{ ssCancel(); fin(); };
    const u = new SpeechSynthesisUtterance(t); curUtt = u;
    u.lang = zhVoice ? zhVoice.lang : 'zh-TW'; if(zhVoice) u.voice = zhVoice;
    u.rate = TTS_RATE; u.pitch = TTS_PITCH; u.volume = 1;
    u.onstart = ()=>{ started = true; }; u.onend = u.onerror = fin;
    curStop = stop;
    const to = setTimeout(stop, 2200 + [...String(t)].length * 420);       // 逾時保護
    const st = setTimeout(()=>{ if(!started && !ss.speaking) stop(); }, 3000); // 卡住沒開始講
    try{ ss.speak(u); }catch(e){ fin(); }
  });
}

// ---------- 錄音播放 ----------
function playBuf(buf){ return new Promise(r=>{
  const c = ctx(), s = c.createBufferSource(); s.buffer = buf; s.connect(c.destination);
  let done = false; const fin = ()=>{ if(done) return; done = true; clearTimeout(to); if(curStop === stop) curStop = null; r(); };
  const stop = ()=>{ try{ s.stop(); }catch(e){} fin(); };
  s.onended = fin; curStop = stop;
  const to = setTimeout(fin, buf.duration * 1000 + 800);
  s.start();
}); }
function playEl(a){ return new Promise((res, rej)=>{
  let done = false;
  const fin = ok=>{ if(done) return; done = true; clearTimeout(to); a.onended = a.onerror = null; if(curStop === stop) curStop = null; ok ? res() : rej(new Error('audio el')); };
  const stop = ()=>{ try{ a.pause(); }catch(e){} fin(true); };
  a.onended = ()=>fin(true); a.onerror = ()=>fin(false); curStop = stop;
  const to = setTimeout(()=>{ try{ a.pause(); }catch(e){} fin(true); }, (a.duration && isFinite(a.duration) ? a.duration * 1000 : 3000) + 1000);
  try{ a.currentTime = 0; }catch(e){}
  const p = a.play(); if(p && p.catch) p.catch(()=>fin(false));
}); }

async function speakOne(p, tk){
  if(AUDIO_FILES.includes(p)){
    if(!bufCache[p] && !elCache[p]) await Promise.race([loadOne(p), wait(1500)]);
    if(tk !== sayToken) return;
    if(bufCache[p] && await ensureRunning()){ if(tk !== sayToken) return; return playBuf(bufCache[p]); }
    if(tk !== sayToken) return;
    try{ await playEl(makeEl(p)); return; }catch(e){}
  }
  if(tk !== sayToken) return;
  return tts(p, tk);
}

// 停掉正在講的（錄音、<audio>、TTS），播新語音前一定先呼叫
function stopAll(){
  sayToken++;
  const s = curStop; curStop = null; if(s) s();
  if('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) ssCancel();
}

// parts：要依序念的內容；回傳 Promise<true=念完 / false=被打斷>
// 防抖：同一句正在念、又在 1.2 秒內被連點 → 不重來；短時間內連續呼叫只念最後一個
let lastKey = '', lastAt = 0, lastPromise = Promise.resolve(true), speaking = false;
function say(parts){
  parts = [].concat(parts).filter(x=>x != null && String(x).trim() !== '');
  const key = parts.join('|'), now = Date.now();
  if(key && key === lastKey && speaking && now - lastAt < 1200) return lastPromise;
  lastKey = key; lastAt = now;
  stopAll(); const tk = sayToken;
  if(!parts.length){ speaking = false; return Promise.resolve(true); }
  speaking = true;
  lastPromise = (async()=>{
    await wait(40); // 連點防抖：40ms 內又有新語音，這段就不念
    for(let i = 0; i < parts.length; i++){
      if(tk !== sayToken) return false;
      await speakOne(parts[i], tk);
      if(i < parts.length - 1) await wait(220);
    }
    return tk === sayToken;
  })().catch(()=>false).finally(()=>{ if(tk === sayToken) speaking = false; });
  return lastPromise;
}
// 等語音念完，但最多等 ms（畫面流程不會被語音卡住）
const sayUpTo = (p, ms)=>Promise.race([p, wait(ms)]);

// 音效（程式產生，不需檔案）
function tone(seq){ try{ const c = ctx(); if(!c) return; resumeAudio(); let t = c.currentTime;
  seq.forEach(([f, d])=>{ const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d); t += d * .8; }); }catch(e){} }
const sfx = { ding:()=>tone([[523,.12],[659,.12],[784,.25]]), boop:()=>tone([[330,.15],[294,.2]]),
  poof:()=>tone([[900,.06],[1200,.08]]), win:()=>tone([[523,.15],[659,.15],[784,.15],[1047,.4]]), clap:()=>tone([[1400,.04]]),
  whoosh:()=>tone([[260,.05],[420,.05],[700,.07],[1100,.09]]), hit:()=>tone([[180,.08],[120,.12]]) };

// 一開頁面就先抓錄音檔（fetch 不需要手勢；decode 在暫停中的 AudioContext 也可以）
preloadAudio();
