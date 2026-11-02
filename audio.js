// 聲音：真人錄音優先（audio/xxx.mp3），沒有就用裝置語音；iOS 需先點一下「開始」才會出聲
let ac = null, curSrc = null, sayToken = 0;
const bufCache = {};
function ctx(){ if(!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); return ac; }
function unlockAudio(){
  try{ const c=ctx(); c.resume(); const b=c.createBuffer(1,1,22050), s=c.createBufferSource(); s.buffer=b; s.connect(c.destination); s.start(0); }catch(e){}
  if('speechSynthesis' in window){ try{ const u=new SpeechSynthesisUtterance(' '); u.volume=0; speechSynthesis.speak(u);}catch(e){} }
}
let zhVoice=null;
function pickVoice(){ const v=speechSynthesis.getVoices(); zhVoice=v.find(x=>/zh[-_]TW/i.test(x.lang))||v.find(x=>/zh/i.test(x.lang))||null; }
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }

async function getBuf(k){
  if(bufCache[k]) return bufCache[k];
  const r = await fetch('audio/'+encodeURIComponent(k)+'.mp3'); if(!r.ok) throw new Error('no file');
  const ab = await r.arrayBuffer();
  bufCache[k] = await new Promise((res,rej)=>ctx().decodeAudioData(ab,res,rej));
  return bufCache[k];
}
function playBuf(buf){ return new Promise(r=>{ const c=ctx(); c.resume(); const s=c.createBufferSource(); s.buffer=buf; s.connect(c.destination); curSrc=s; s.onended=r; s.start(); }); }
function tts(t){ return new Promise(r=>{
  if(!('speechSynthesis' in window)) return setTimeout(r,600);
  let done=false; const fin=()=>{ if(!done){done=true; clearTimeout(to); r();} };
  const u=new SpeechSynthesisUtterance(t); u.lang='zh-TW'; if(zhVoice) u.voice=zhVoice; u.rate=.85;
  u.onend=u.onerror=fin; speechSynthesis.speak(u);
  const to=setTimeout(()=>{ speechSynthesis.cancel(); fin(); }, 1500+t.length*450); // 逾時就取消，避免和下一句重疊
}); }
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function stopAll(){ sayToken++; try{ if(curSrc) curSrc.stop(); }catch(e){} if('speechSynthesis' in window) speechSynthesis.cancel(); }
// parts：要依序念的內容；有真人錄音就用錄音
async function say(parts){
  stopAll(); const tk=sayToken;
  for(const p of [].concat(parts)){
    if(tk!==sayToken) return false;
    if(AUDIO_FILES.includes(p)){ try{ await playBuf(await getBuf(p)); }catch(e){ await tts(p); } }
    else await tts(p);
    await wait(250);
  }
  return tk===sayToken;
}
// 音效（程式產生，不需檔案）
function tone(seq){ try{ const c=ctx(); c.resume(); let t=c.currentTime;
  seq.forEach(([f,d])=>{ const o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f;
    g.gain.setValueAtTime(.22,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(c.destination); o.start(t); o.stop(t+d); t+=d*.8; }); }catch(e){} }
const sfx = { ding:()=>tone([[523,.12],[659,.12],[784,.25]]), boop:()=>tone([[330,.15],[294,.2]]),
  poof:()=>tone([[900,.06],[1200,.08]]), win:()=>tone([[523,.15],[659,.15],[784,.15],[1047,.4]]), clap:()=>tone([[1400,.04]]) };
