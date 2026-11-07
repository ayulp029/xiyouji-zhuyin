// 第 1 關完整流程 E2E 測試（可重複執行）
// 用法：node tests/e2e.mjs
//   需要 playwright：專案外安裝即可，例如  npm i -g playwright  或  PLAYWRIGHT_MODULE=/某處/node_modules/playwright node tests/e2e.mjs
//   瀏覽器：預設用 playwright 內建 chromium；找不到時改用 CHROME_PATH 或系統的 google-chrome / chromium
// 產出：screenshots/01-start.png … 08-victory.png、flow.webm（橫向 1024x768），以及直向 768x1024 的補充截圖
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'screenshots');
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
  page.on('console', m=>{ if(m.type() === 'error') errors.push(`[${tag}] console.error: ${m.text()}`); });
  page.on('pageerror', e=>errors.push(`[${tag}] pageerror: ${e.message}`));
  // ERR_ABORTED = 圖片切換時瀏覽器自己取消舊請求，不算錯誤
  page.on('requestfailed', r=>{ if(!/favicon/.test(r.url()) && !/ERR_ABORTED/.test(r.failure()?.errorText || '')) errors.push(`[${tag}] requestfailed: ${r.url()} ${r.failure()?.errorText}`); });
  page.on('response', r=>{ if(r.status() >= 400) errors.push(`[${tag}] HTTP ${r.status()}: ${r.url()}`); });
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

const t0 = Date.now();
const browser = await launch();
log('browser', browser.version());

// ================= A. 橫向 1024x768：完整流程 + 錄影 =================
{
  const vdir = fs.mkdtempSync(path.join(os.tmpdir(), 'xyj-video-'));
  const opts = { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2, hasTouch: true, isMobile: false, locale: 'zh-TW' };
  let ctx, page;
  try{ ctx = await browser.newContext({ ...opts, recordVideo: { dir: vdir, size: { width: 1024, height: 768 } } }); page = await ctx.newPage(); }
  catch(e){ log('無法錄影（缺 ffmpeg？可執行 npx playwright install ffmpeg），改成不錄影繼續'); if(ctx) await ctx.close().catch(()=>{}); ctx = await browser.newContext(opts); page = await ctx.newPage(); }
  watch(page, 'landscape');
  await page.goto(URL0); await phase(page, 'start');
  await page.evaluate(()=>localStorage.clear()); await page.reload(); await phase(page, 'start');
  await page.waitForTimeout(800); await shot(page, '01-start.png');

  // 開始 → 地圖 → 第 1 關 → 教學
  await page.click('#go'); await phase(page, 'map');
  await page.click('.station.open'); await phase(page, 'menu');
  await page.click('#learn'); await phase(page, 'teach-1');
  await page.waitForTimeout(900); await shot(page, '02-teach.png');
  await tapNext(page);                                                        // 1 看圖說話
  await phase(page, 'teach-2'); await tapNext(page);                          // 2 認句子
  await phase(page, 'teach-3'); for(const c of await page.$$('.card')) await c.click(); await tapNext(page); // 3 找詞
  await phase(page, 'teach-4'); for(const c of await page.$$('.card')) await c.click(); await tapNext(page); // 4 找字
  await phase(page, 'teach-5'); for(const c of await page.$$('.card')){ await c.click(); await page.waitForTimeout(150); } await tapNext(page); // 5 認符號
  await phase(page, 'teach-6'); await page.click('.choice[data-s="ㄅ"]'); await page.waitForTimeout(500); // 6 比一比：先答錯再答對
  await page.click('.choice[data-s="ㄇ"]'); await tapNext(page);
  await phase(page, 'teach-7');                                               // 7 拼一拼：第 1 個用拖曳，其餘用「點 a 再點 b」
  { const a = await (await page.$('#da')).boundingBox(), b = await (await page.$('#db')).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up(); }
  for(let i = 0; i < 2; i++){ await page.waitForFunction(n=>document.querySelector('#bz .step')?.textContent.startsWith(`第 ${n}`), i + 2, { timeout: 8000 });
    await page.click('#da'); await page.click('#db'); }
  await tapNext(page);
  await phase(page, 'teach-8'); await page.click('#song'); await tapNext(page); // 8 兒歌
  await phase(page, 'rest');

  // 對戰
  await intoBattle(page);
  await page.waitForTimeout(700); await shot(page, '03-battle.png');
  await answer(page, false); await page.waitForTimeout(450); await shot(page, '05-wrong-anim.png');
  await page.waitForTimeout(1400);
  await answer(page, true); await page.waitForTimeout(420); await shot(page, '04-correct-anim.png');
  await page.waitForTimeout(1000); await shot(page, '04b-pluck-anim.png');
  await page.waitForFunction(()=>document.querySelector('#cnt')?.textContent === '1' && document.body.dataset.phase === 'battle-q', null, { timeout: 20000 });
  await finishBattle(page, 1, async k=>{ if(k === 6){ await page.waitForTimeout(2600); await shot(page, '06a-clones-battle.png'); await checkOverlap(page, 'landscape 對戰'); } });

  // 勝利：分身包圍 → 打敗妖怪 → 勝利畫面
  await phase(page, 'clones', 40000); await page.waitForTimeout(500); await shot(page, '06-clones.png'); await checkOverlap(page, 'landscape 勝利');
  await phase(page, 'defeat', 40000); await page.waitForTimeout(450); await shot(page, '07-defeat.png');
  await phase(page, 'victory', 20000); await page.waitForTimeout(1200); await shot(page, '08-victory.png');
  const cleared = await page.evaluate(()=>JSON.parse(localStorage.getItem('xiyou-zhuyin-v1')).levels[1].cleared);
  if(!cleared) errors.push('存檔沒有記錄過關');

  const video = page.video(); await ctx.close();
  try{ if(!video) throw new Error('沒有錄影'); await video.saveAs(path.join(OUT, 'flow.webm')); log('錄影 flow.webm'); }catch(e){ log('錄影失敗（不影響測試）：', e.message); }
  fs.rmSync(vdir, { recursive: true, force: true });
}

// ================= B. 直向 768x1024：檢查分身排列 =================
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, hasTouch: true, locale: 'zh-TW' });
  const page = await ctx.newPage(); watch(page, 'portrait');
  await page.goto(URL0); await phase(page, 'start');
  await page.evaluate(()=>localStorage.setItem('xiyou-zhuyin-v1', JSON.stringify({ levels: { 1: { learned: true, cleared: false, stamps: 0 } }, stickers: [] })));
  await page.reload(); await phase(page, 'start');
  await page.click('#go'); await phase(page, 'map'); await page.click('.station.open'); await phase(page, 'menu');
  await intoBattle(page);
  await finishBattle(page, 0, async k=>{ if(k === 6){ await page.waitForTimeout(2600); await shot(page, 'portrait-06a-clones-battle.png'); await checkOverlap(page, 'portrait 對戰'); } });
  await phase(page, 'clones', 40000); await page.waitForTimeout(500); await shot(page, 'portrait-06-clones.png'); await checkOverlap(page, 'portrait 勝利');
  await phase(page, 'victory', 40000); await page.waitForTimeout(1200); await shot(page, 'portrait-08-victory.png');
  await ctx.close();
}

// ================= C. 減少動態（prefers-reduced-motion）快速跑一次對戰 =================
{
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce', hasTouch: true, locale: 'zh-TW' });
  const page = await ctx.newPage(); watch(page, 'reduced-motion');
  await page.goto(URL0); await phase(page, 'start');
  await page.evaluate(()=>localStorage.setItem('xiyou-zhuyin-v1', JSON.stringify({ levels: { 1: { learned: true } }, stickers: [] })));
  await page.reload(); await phase(page, 'start');
  await page.click('#go'); await phase(page, 'map'); await page.click('.station.open'); await phase(page, 'menu');
  await intoBattle(page); await answer(page, false); await finishBattle(page, 0);
  await phase(page, 'victory', 40000);
  await ctx.close();
}

await browser.close(); server.close();
console.log(`\n耗時 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if(errors.length){ console.log(`❌ ${errors.length} 個錯誤：`); errors.forEach(e=>console.log('   ', e)); process.exit(1); }
console.log('✅ console error / pageerror / 失敗請求：0');
