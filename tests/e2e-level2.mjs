// 第 2 關（五指山）E2E：10 站地圖鎖定／解鎖 → 開場旁白 → 教學 8 步 → 爬山 8 格＋山頂 2 題＋念經挑戰 → 救出悟空結局 → 地圖唐僧加入
// 用法：node tests/e2e.mjs
//   需要 playwright：專案外安裝即可，例如  npm i -g playwright  或  PLAYWRIGHT_MODULE=/某處/node_modules/playwright node tests/e2e.mjs
//   瀏覽器：預設用 playwright 內建 chromium；找不到時改用 CHROME_PATH 或系統的 google-chrome / chromium
// 產出：SHOT_DIR（預設 screenshots/）下的 l2-*.png、level2-flow.png（爬山中：唐僧在山路上、岩岩可見）、screenshot-level2.png
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
  '.png':'image/png', '.jpg':'image/jpeg', '.mp3':'audio/mpeg', '.json':'application/json' };
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
const page = await ctx.newPage(); watch(page, 'L2');
const check = (c, msg)=>{ if(!c) errors.push('FAIL ' + msg); else log('OK', msg); };
const setSave = o=>page.evaluate(([k, v])=>localStorage.setItem(k, v), [SAVE, JSON.stringify(o)]);
await page.goto(URL0); await phase(page, 'start');

// 1) 未過第 1 關：第 2 站鎖住
await page.evaluate(()=>localStorage.clear()); await page.reload(); await phase(page, 'start');
await page.click('#go'); await phase(page, 'map');
check(await page.$$eval('.station.open', n=>n.length) === 1, '未過第1關只有 1 站開啟');
const stTxt = await page.$$eval('.station', n=>n.map(x=>x.textContent));
check(stTxt.length === 10, '地圖共 10 站（實際 ' + stTxt.length + '）');
check(stTxt.some(t=>t.includes('號山')) && !stTxt.some(t=>/黃風嶺|平頂山/.test(t)), '有號山、沒有黃風嶺／平頂山');
// 2) 過第 1 關：第 2 站可進並發亮
await setSave({ levels: { 1: { learned: true, cleared: true, stamps: 2 } }, stickers: [] });
await page.reload(); await phase(page, 'start'); await page.click('#go'); await phase(page, 'map');
check(await page.$$eval('.station.open', n=>n.length) === 2, '過第1關後第 2 站開啟');
check((await page.textContent('.station.target')).includes('五指山'), '發亮的是五指山');
await page.click('.station.target'); await phase(page, 'menu');
check((await page.textContent('h1')).includes('五指山'), '關卡標題五指山');
const INTRO = '這一關，你陪唐僧去救悟空。';
check((await page.textContent('#intro')) === INTRO, '選單出現開場旁白句（畫面）');
check(await page.evaluate(t=>LEVEL2.intro === t && AUDIO_FILES.includes(t), INTRO), '旁白句在 LEVEL2.intro 與 AUDIO_FILES');
await page.click('#learn');

// 3) 教學 8 步
for(let i = 1; i <= 8; i++){
  await phase(page, 'teach-' + i);
  if(i === 1) await page.waitForTimeout(500);
  if(i === 2) await page.waitForTimeout(800);
  if(i === 3) check((await page.$$eval('.card', n=>n.map(x=>x.textContent).join())).includes('佛祖'), '找詞：佛祖／葡萄');
  if(i === 3 || i === 4 || i === 5){ for(const c of await page.$$('.card')){ await c.click(); await page.waitForTimeout(250); } }
  if(i === 5){ const lab = await page.$$eval('.card small', n=>n.map(x=>x.textContent));
    check(lab.includes('葡萄') && !lab.includes('盤子') && lab.includes('摩托車'), 'ㄆ 記憶圖是葡萄（不是盤子）、ㄛ 是摩托車：' + lab.join('/')); await shot(page, 'l2-05-symbols.png'); }
  if(i === 6){ await page.click('.choice[data-s="ㄅ"]'); await page.waitForTimeout(300); await page.click('.choice[data-s="ㄆ"]'); }
  if(i === 7){ for(let k = 0; k < 3; k++){ await page.waitForSelector('#da'); await page.click('#da'); await page.click('#db'); await page.waitForTimeout(2100); } await shot(page, 'l2-07-blend.png'); }
  if(i === 8) await shot(page, 'l2-08-song.png');
  await tapNext(page);
}
await phase(page, 'rest'); await shot(page, 'l2-rest.png');
check((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).levels[2].learned, SAVE)) === true, '第2關 learned 存檔');
await page.click('#fight'); await phase(page, 'battle-intro'); await page.waitForTimeout(300); await page.click('#go'); await phase(page, 'battle-q');
// 4) 對戰：爬山 8 格（唐僧每答對往上一格，答錯不倒退）→ 山頂 2 題 → 念經挑戰
const tsBox = ()=>page.evaluate(()=>{ const r = document.querySelector('#cts').getBoundingClientRect(); return { y: Math.round(r.top), pos: document.querySelector('#cts').dataset.pos }; });
let prev = null;
for(let k = 0; k < 10; k++){
  await phase(page, 'battle-q');
  await page.waitForFunction(n=>document.querySelector('#cnt')?.textContent === String(n) && document.body.dataset.qi === String(n), k);
  const t = await tsBox(), pos = Math.min(k, 8);
  check(t.pos === String(pos), `第 ${k + 1} 題唐僧在第 ${pos} 格`);
  if(prev && k <= 8) check(t.y < prev.y, `第 ${k} 格唐僧比上一格高（${prev.y} → ${t.y}）`);
  if(k >= 9) check(prev && t.y === prev.y, `山頂第 ${k - 7} 題唐僧已在頂、不再移動`);
  check((await page.textContent('.count')).includes(k < 8 ? '往上爬' : '山頂第'), '計數文字：' + (await page.textContent('.count')).replace(/\s+/g, ''));
  check(await page.$eval('#mon', n=>n.getBoundingClientRect().height > 20), '岩岩可見');
  if(k === 6) check((await page.textContent('#say')).includes('飛機'), 'T5 題幹是飛機的 ㄈ');
  if(k === 0) await shot(page, 'l2-battle.png');
  if(k === 1){ // 答錯一次：唐僧站穩不倒退
    await answer(page, false); await page.waitForTimeout(300);
    const w = await tsBox(); check(w.pos === t.pos && w.y === t.y, '答錯：唐僧原地站穩不倒退');
    await phase(page, 'battle-q');
  }
  if(k === 5){ await page.waitForTimeout(700); await shot(page, 'level2-flow.png'); } // 爬山中：唐僧在山路上、岩岩看得見
  prev = await tsBox();
  await answer(page, true);
  await page.waitForFunction(n=>document.querySelector('#cnt')?.textContent === String(n + 1), k, { timeout: 20000 });
  if(k < 9) await page.waitForFunction(n=>document.body.dataset.qi === String(n + 1) && document.body.dataset.phase === 'battle-q', k, { timeout: 25000 });
}
// 4b) 念經挑戰（第 11 題）：照 window.__seq 順序點
await phase(page, 'monk-q', 25000);
check((await page.textContent('.count')).includes('念經挑戰') && (await page.textContent('#cnt')) === '10' && await page.evaluate(()=>document.body.dataset.qi) === '10', '念經挑戰是第 11 題（已答對 10）');
await shot(page, 'l2-monk.png');
for(const sym of await page.evaluate(()=>window.__seq)){ await page.click(`.choice[data-o="${sym}"]`); await page.waitForTimeout(250); }
// 5) 結局
await phase(page, 'rescue', 60000); await page.waitForTimeout(600); await shot(page, 'l2-rescue-1.png');
await page.waitForFunction(()=>document.querySelector('#fu')?.classList.contains('off'), null, { timeout: 20000 });
await phase(page, 'victory', 40000); await page.waitForTimeout(500); await shot(page, 'screenshot-level2.png');
check((await page.textContent('#vt')) === '五指山過關！', '結局標題');
check(!(await page.textContent('#say')).includes('乖猴子'), '不含第1關結局句');
check((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).levels[2].cleared, SAVE)) === true, '第2關 cleared 存檔');
// 6) 回地圖：唐僧加入隊伍
await page.click('#map'); await phase(page, 'map');
check(await page.$$eval('.pm.tang', n=>n.length) === 1, '第2關過關後地圖上唐僧出現（.pm.tang）');
await shot(page, 'l2-map-after.png');
await browser.close(); server.close();
if(errors.length){ console.log('\n❌', errors.length, '個問題'); errors.forEach(e=>console.log(' -', e)); process.exit(1); }
console.log('\n✅ 第2關測試通過');
