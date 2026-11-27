// 第 3 關（鷹愁澗）E2E：第 3 站解鎖 → 開場旁白 → 教學 8 步 → 過河（8 片荷葉）＋小島 2 題＋念經挑戰 → 水水變白龍馬結局 → 地圖唐僧騎白龍馬
// 只測第 3 關（不跑 e2e.mjs 全套）。用法：SHOT_DIR=… node tests/e2e-level3.mjs
//   需要 playwright：專案外安裝即可，例如  npm i -g playwright  或  PLAYWRIGHT_MODULE=/某處/node_modules/playwright node tests/e2e.mjs
//   瀏覽器：預設用 playwright 內建 chromium；找不到時改用 CHROME_PATH 或系統的 google-chrome / chromium
// 產出：SHOT_DIR（預設 screenshots/）下的 l3-*.png、level3-flow.png（過河中：荷葉河面、悟空、水水）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.SHOT_DIR || path.join(ROOT, "screenshots");
fs.mkdirSync(OUT, { recursive: true });

// ---------- 找 playwright ----------
async function loadPlaywright(){
  for(const t of [process.env.PLAYWRIGHT_MODULE, 'playwright']){ if(!t) continue; try{ return await import(t); }catch(e){} }
  const req = createRequire(import.meta.url);
  const dirs = [path.join(os.tmpdir(), 'pw'), '/usr/local/lib', '/usr/lib', path.join(os.homedir(), '.npm-global/lib')];
  try{ dirs.push(req('child_process').execSync('npm root -g').toString().trim()); }catch(e){}
  for(const d of dirs){ for(const name of ['playwright', 'playwright-core']){
    for(const base of [path.join(d, 'node_modules', name), path.join(d, name)]){
      if(fs.existsSync(base)){ try{ return req(base); }catch(e){} }
    } } }
  try{ return await import('playwright-core'); }catch(e){}
  throw new Error('找不到 playwright，請先 npm i -g playwright，或設定 PLAYWRIGHT_MODULE');
}
const pw = await loadPlaywright();
const chromium = pw.chromium || (pw.default && pw.default.chromium);

async function launch(){
  try{ return await chromium.launch({ headless: true }); }catch(e){ /* 版本對不上的話改用系統瀏覽器 */ }
  const cands = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const cache = path.join(os.homedir(), '.cache/ms-playwright');
  if(fs.existsSync(cache)) for(const d of fs.readdirSync(cache).filter(x=>/^chromium-\d+/.test(x)).sort().reverse())
    cands.push(path.join(cache, d, 'chrome-linux64/chrome'), path.join(cache, d, 'chrome-linux/chrome'));
  for(const p of cands){ if(p && fs.existsSync(p)){ try{ return await chromium.launch({ headless: true, executablePath: p }); }catch(e){} } }
  throw new Error('無法啟動 chromium');
}

// ---------- 靜態伺服器（audio 要用 http 才能 fetch）----------
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.mp3':'audio/mpeg', '.json':'application/json' };
const server = http.createServer((req, res)=>{
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if(p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r=>server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;

// ---------- 小工具 ----------
const errors = [];
const log = (...a)=>console.log('  ·', ...a);
function watch(page, tag){
  page.on('console', m=>{ if(m.type() === 'error' && !/audio\//.test(m.location().url || '') && !/status of 404/.test(m.text())) errors.push(`[${tag}] console.error: ${m.text()}`); });
  page.on('pageerror', e=>errors.push(`[${tag}] pageerror: ${e.message}`));
  // ERR_ABORTED = 圖片切換時瀏覽器自己取消舊請求，不算錯誤
  page.on('requestfailed', r=>{ if(!/favicon/.test(r.url()) && !/ERR_ABORTED/.test(r.failure()?.errorText || '')) errors.push(`[${tag}] requestfailed: ${r.url()} ${r.failure()?.errorText}`); });
  // 例外：audio/（沒檔退回 TTS）、img/map|shop|cards/（<img data-fb/data-emo> 缺圖備援，美術未到）
  page.on('response', r=>{ if(r.status() >= 400 && !/\/audio\//.test(r.url()) && !/\/img\/(map|shop|cards)\//.test(r.url())) errors.push(`[${tag}] HTTP ${r.status()}: ${r.url()}`); });
}
const phase = (page, p, timeout = 30000)=>page.waitForFunction(x=>document.body.dataset.phase === x, p, { timeout });
const shot = (page, name)=>page.screenshot({ path: path.join(OUT, name) }).then(()=>log('截圖', name));
async function tapNext(page){
  await page.waitForSelector('#next', { state: 'visible', timeout: 40000 });
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#next')).visibility === 'visible', null, { timeout: 40000 });
  await page.click('#next');
}
async function answer(page, correct){
  const ans = await page.evaluate(()=>window.__ans);
  const btn = await page.$(correct ? `.choice[data-o="${ans}"]` : `.choice:not([data-o="${ans}"])`);
  await btn.click();
}
async function intoBattle(page){
  await page.click('#fight'); await phase(page, 'battle-intro');
  await page.waitForTimeout(400); await page.click('#go'); await phase(page, 'battle-q');
}
async function finishBattle(page, from, onEach){
  for(let k = from; k < 10; k++){
    await phase(page, 'battle-q');
    await page.waitForFunction(n=>document.querySelector('#cnt')?.textContent === String(n), k);
    await answer(page, true);
    if(onEach) await onEach(k);
    if(k < 9) await page.waitForFunction(n=>document.querySelector('#cnt')?.textContent === String(n + 1) && document.body.dataset.phase === 'battle-q', k, { timeout: 20000 });
  }
}

// 分身重疊檢查：任兩隻分身框的重疊面積 / 自身面積 的最大值
async function checkOverlap(page, tag){
  const r = await page.evaluate(()=>{ const bs = [...document.querySelectorAll('.clone:not(.hide)')].map(c=>{ const s = c.style; return { x: parseFloat(s.left), y: parseFloat(s.top), w: parseFloat(s.width), h: parseFloat(s.height) }; });
    let m = 0; for(let i = 0; i < bs.length; i++) for(let j = i + 1; j < bs.length; j++){ const a = bs[i], b = bs[j];
      const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)), oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      m = Math.max(m, ox * oy / (a.w * a.h)); }
    return { n: bs.length, max: m, size: bs[0] && Math.round(bs[0].h) }; });
  log(`[${tag}] 分身 ${r.n} 隻，高 ${r.size}px，最大重疊 ${(r.max * 100).toFixed(1)}%`);
  if(r.max > .15) errors.push(`[${tag}] 分身重疊過多 ${(r.max * 100).toFixed(1)}%`);
}

const SAVE = 'xiyou-zhuyin-v1';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, hasTouch: true, locale: 'zh-TW' });
const page = await ctx.newPage(); watch(page, 'L3');
const check = (c, msg)=>{ if(!c) errors.push('FAIL ' + msg); else log('OK', msg); };
const setSave = o=>page.evaluate(([k, v])=>localStorage.setItem(k, v), [SAVE, JSON.stringify(o)]);
await page.goto(URL0); await phase(page, 'start');

// 1) 只過第 1 關：第 3 站鎖住；10 站地圖用 SVG
await page.evaluate(()=>localStorage.clear());
await setSave({ levels: { 1: { learned: true, cleared: true, stamps: 2 } }, stickers: [] });
await page.reload(); await phase(page, 'start'); await page.click('#go'); await phase(page, 'map');
check(await page.$$eval('.station.open', n=>n.length) === 2, '只過第1關：第 3 站仍鎖住');
check(await page.$$eval('.station', n=>n.length) === 10, '地圖 10 站');
check((await page.$eval('.mapimg', n=>n.style.backgroundImage)).includes('map-10.svg'), '地圖底圖是 map-10.svg');
// 2) 過第 2 關：第 3 站解鎖並發亮
await setSave({ levels: { 1: { learned: true, cleared: true, stamps: 2 }, 2: { learned: true, cleared: true, stamps: 2 } }, stickers: [] });
await page.reload(); await phase(page, 'start'); await page.click('#go'); await phase(page, 'map');
check(await page.$$eval('.station.open', n=>n.length) === 3, '過第2關後第 3 站開啟');
check((await page.textContent('.station.target')).includes('鷹愁澗'), '發亮的是鷹愁澗');
check(await page.$$eval('.pm.tang:not(.horse)', n=>n.length) === 1, '還沒收白龍馬：唐僧用走路版');
await page.click('.station.target'); await phase(page, 'menu');
check((await page.textContent('h1')).includes('鷹愁澗'), '關卡標題鷹愁澗');
const INTRO = '這一關，你和悟空一起過河。';
check((await page.textContent('#intro')) === INTRO, '選單出現開場旁白句（畫面）');
check(await page.evaluate(t=>LEVEL3.intro === t && AUDIO_FILES.includes(t), INTRO), '旁白句在 LEVEL3.intro 與 AUDIO_FILES');
await page.click('#learn');

// 3) 教學 8 步
for(let i = 1; i <= 8; i++){
  await phase(page, 'teach-' + i);
  if(i === 1) await page.waitForTimeout(500);
  if(i === 2) await page.waitForTimeout(800);
  if(i === 3) check((await page.$$eval('.card', n=>n.map(x=>x.textContent).join())).includes('大象'), '找詞：大象／老虎');
  if(i === 3 || i === 4 || i === 5){ for(const c of await page.$$('.card')){ await c.click(); await page.waitForTimeout(250); } }
  if(i === 5){ const lab = await page.$$eval('.card small', n=>n.map(x=>x.textContent));
    check(['大象', '兔子', '牛奶', '老虎'].every(w=>lab.includes(w)), 'ㄉㄊㄋㄌ 記憶圖：' + lab.join('/')); await shot(page, 'l3-05-symbols.png'); }
  if(i === 6){ await page.click('.choice[data-s="ㄊ"]'); await page.waitForTimeout(300); await page.click('.choice[data-s="ㄉ"]'); }
  if(i === 7){ for(let k = 0; k < 3; k++){ await page.waitForSelector('#da'); await page.click('#da'); await page.click('#db'); await page.waitForTimeout(2100); } await shot(page, 'l3-07-blend.png'); }
  if(i === 8) await shot(page, 'l3-08-song.png');
  await tapNext(page);
}
await phase(page, 'rest');
check((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).levels[3].learned, SAVE)) === true, '第3關 learned 存檔');
await page.click('#fight'); await phase(page, 'battle-intro'); await page.waitForTimeout(300); await page.click('#go'); await phase(page, 'battle-q');
// 4) 對戰：過河 8 片荷葉（答對浮上一片、悟空跳一格；答錯不掉水）→ 小島 2 題 → 念經挑戰
const wkBox = ()=>page.evaluate(()=>{ const r = document.querySelector('#rwk').getBoundingClientRect(); return { y: Math.round(r.top), pos: document.querySelector('#rwk').dataset.pos }; });
let prev = null;
for(let k = 0; k < 10; k++){
  await phase(page, 'battle-q');
  await page.waitForFunction(n=>document.querySelector('#cnt')?.textContent === String(n) && document.body.dataset.qi === String(n), k);
  const t = await wkBox(), pos = k < 8 ? k : 9;
  check(t.pos === String(pos), `第 ${k + 1} 題悟空在第 ${pos} 格`);
  check(await page.$$eval('.rv-leaf.on', n=>n.length) === Math.min(k, 8), `第 ${k + 1} 題已浮上 ${Math.min(k, 8)} 片荷葉`);
  if(prev && k <= 8) check(t.y < prev.y, `第 ${k} 格悟空比上一格靠前（${prev.y} → ${t.y}）`);
  check((await page.textContent('.count')).includes(k < 8 ? '過河' : '小島'), '計數文字：' + (await page.textContent('.count')).replace(/\s+/g, ''));
  check(await page.$eval('#mon', n=>n.getBoundingClientRect().height > 20), '水水可見');
  if(k === 6) check((await page.textContent('#say')).includes('老虎'), 'T5 題幹是老虎的 ㄌ');
  if(k === 0) await shot(page, 'l3-battle.png');
  if(k === 1){ // 答錯一次：悟空站穩不掉水、荷葉晃一下
    await answer(page, false); await page.waitForTimeout(300);
    const w = await wkBox(); check(w.pos === t.pos && w.y === t.y, '答錯：悟空原地站穩，沒有掉進水裡');
    check(await page.$$eval('.rv-p.wob', n=>n.length) >= 1, '答錯：腳下荷葉晃一下');
    await phase(page, 'battle-q');
  }
  if(k === 5){ await page.waitForTimeout(700); await shot(page, 'level3-flow.png'); } // 過河中：荷葉河面、悟空、水水
  if(k === 8){ await page.waitForTimeout(500); await shot(page, 'l3-island.png'); }
  prev = await wkBox();
  await answer(page, true);
  await page.waitForFunction(n=>document.querySelector('#cnt')?.textContent === String(n + 1), k, { timeout: 20000 });
  if(k < 9) await page.waitForFunction(n=>document.body.dataset.qi === String(n + 1) && document.body.dataset.phase === 'battle-q', k, { timeout: 25000 });
}
// 4b) 念經挑戰（第 11 題）
await phase(page, 'monk-q', 25000);
check((await page.textContent('.count')).includes('念經挑戰') && (await page.textContent('#cnt')) === '10', '念經挑戰是第 11 題（已答對 10）');
await shot(page, 'l3-monk.png');
for(const sym of await page.evaluate(()=>window.__seq)){ await page.click(`.choice[data-o="${sym}"]`); await page.waitForTimeout(250); }
// 5) 結局：水水認輸 → 變白龍馬 → 唐僧騎上去 → 過關
await phase(page, 'baima', 70000); await page.waitForTimeout(600); await shot(page, 'l3-baima-1.png');
await page.waitForFunction(()=>document.querySelector('#rdts')?.classList.contains('up'), null, { timeout: 20000 });
await phase(page, 'victory', 40000); await page.waitForTimeout(500); await shot(page, 'screenshot-level3.png');
check((await page.textContent('#vt')) === '鷹愁澗過關！', '結局標題');
check((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).levels[3].cleared, SAVE)) === true, '第3關 cleared 存檔');
check((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).stickers, SAVE)).includes('鷹愁澗過關了'), '貼紙存檔');
// 6) 回地圖：白龍馬加入隊伍（唐僧騎白龍馬）
await page.click('#map'); await phase(page, 'map');
check(await page.$$eval('.pm.tang.horse', n=>n.length) === 1, '第3關過關後地圖上唐僧騎白龍馬（.pm.tang.horse）');
check(await page.$$eval('.station.open', n=>n.length) === 3, '第 4 站（高老莊）還沒有資料，仍鎖住');
await shot(page, 'l3-map-after.png');
// 7) 水簾洞：水水出現（存檔裡第 1、2、3 關都過關 → 石頭頭、岩岩、水水）
await page.click('#cavego'); await phase(page, 'cave');
check((await page.$$eval('.cmon b', n=>n.map(x=>x.textContent))).includes('水水'), '水簾洞裡有水水');
await browser.close(); server.close();
if(errors.length){ console.log('\n❌', errors.length, '個問題'); errors.forEach(e=>console.log(' -', e)); process.exit(1); }
console.log('\n✅ 第3關測試通過');
