// v1.4.0 水簾洞＋成長系統 E2E（只測新增的地方：洞、兌換、地圖隊伍、連擊、念經挑戰、蟠桃；不重跑完整第 1、2 關）
// 用法：SHOT_DIR=/tmp/xiyouji-cards node tests/e2e-cave.mjs
//   需要 playwright：專案外安裝即可，例如  npm i -g playwright  或  PLAYWRIGHT_MODULE=/某處/node_modules/playwright node tests/e2e.mjs
//   瀏覽器：預設用 playwright 內建 chromium；找不到時改用 CHROME_PATH 或系統的 google-chrome / chromium
// 產出：SHOT_DIR/screenshot-cave.png、screenshot-map.png（1180x820 @2x）
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
const errors = [], fails = [];
const ok = (c, m)=>{ if(c) console.log('  ✓', m); else { fails.push(m); console.log('  ✗ FAIL', m); } };
const SAVE = 'xiyou-zhuyin-v1';
const CTX = { viewport:{ width:1180, height:820 }, deviceScaleFactor:2, hasTouch:true, isMobile:false, locale:'zh-TW' };
function watch(page, tag){
  page.on('pageerror', e=>errors.push(`[${tag}] pageerror: ${e.message}`));
  page.on('console', m=>{ if(m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(`[${tag}] console.error: ${m.text()}`); });
}
const ALL = [...'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ'];
const lv = (peaches, extra={})=>({ learned:true, cleared:true, stamps:2, peaches, ...extra });
async function newPage(browser, seed, opts={}){
  const ctx = await browser.newContext({ ...CTX, ...opts });
  const page = await ctx.newPage(); watch(page, 'p');
  await page.addInitScript(([k, v])=>{ if(v && !localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); }, [SAVE, seed]);
  await page.goto(URL0);
  return { ctx, page };
}
// 測試用：說話改成只記錄、立刻回傳（不用等錄音播完）
const stubSay = page=>page.evaluate(()=>{ window.__said = []; window.say = p=>{ window.__said.push([].concat(p).join('|')); return Promise.resolve(true); }; });
const phase = page=>page.evaluate(()=>document.body.dataset.phase);
const waitPhase = (page, p, t=15000)=>page.waitForFunction(x=>document.body.dataset.phase===x, p, { timeout:t });
const readSave = page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)), SAVE);
async function enterBattle(page, i){
  await page.click('#go'); await page.waitForSelector('.station.open');
  await page.click(`.station[data-i="${i}"]`); await page.click('#fight'); await page.click('#go'); await waitPhase(page, 'battle-q');
}
// 答一題；wrongFirst=true 先按錯的
async function answer(page, wrongFirst=false){
  await waitPhase(page, 'battle-q');
  const ans = await page.evaluate(()=>window.__ans);
  if(wrongFirst){ const w = await page.evaluate(a=>[...document.querySelectorAll('.choice')].find(c=>c.dataset.o!==a).dataset.o, ans);
    await page.click(`.choice[data-o="${w}"]`); await page.waitForTimeout(1600); await waitPhase(page, 'battle-q'); }
  await page.click(`.choice[data-o="${ans}"]`);
}

const browser = await launch();
const t0 = Date.now();
try{
  // ===== A. 截圖：已過第 1、2 關、有蟠桃、已兌換帽子與燈籠、聽過 23 音 =====
  console.log('A. 截圖');
  const seedA = { levels:{ 1:lv(3), 2:lv(3) }, stickers:['五指山過關了'], cave:{ heard:Object.fromEntries(ALL.slice(0,23).map(s=>[s, 1])), spent:4, owned:['hat','lantern'], allHeard:false } };
  { const { ctx, page } = await newPage(browser, seedA);
    await page.click('#go'); await page.waitForSelector('.party .wk-m img'); await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 'screenshot-map.png') });
    await page.click('#cavego'); await waitPhase(page, 'cave'); await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, 'screenshot-cave.png'), fullPage:true });
    await ctx.close(); }

  // ===== B. 空存檔：水簾洞隨時可進、37 音全開、缺圖退回 emoji、猴子朋友與全部聽過 =====
  console.log('B. 空存檔進水簾洞');
  { const { ctx, page } = await newPage(browser, null, { reducedMotion:'reduce' }); await stubSay(page);
    await page.click('#cave0'); await waitPhase(page, 'cave'); await page.waitForTimeout(1200);
    ok(await page.locator('.cc').count() === 37, '37 個注音全開放');
    ok(await page.locator('.cmon').count() === 0, '還沒收服：洞裡沒有妖怪');
    ok(await page.locator('.staff-bar').count() === 0, '還沒拿到金箍棒：洞裡悟空沒拿棒');
    ok(await page.locator('.friend').count() === 0, '一開始沒有猴子朋友');
    const noImg = await page.evaluate(()=>[...document.querySelectorAll('.cc')].filter(c=>c.querySelector('.cw .emo-fb')).map(c=>c.dataset.s));
    ok(noImg.join('') === 'ㄓㄢ', 'ㄓ、ㄢ 缺圖退回表情符號（實際：' + noImg.join('') + '）');
    ok(await page.evaluate(()=>[...document.querySelectorAll('.cw img')].every(i=>i.naturalWidth>0)), '其餘 35 張卡片圖都載入成功');
    for(let i=0;i<5;i++) await page.click(`.cc[data-s="${ALL[i]}"] .cs`);
    ok(await page.locator('.friend').count() === 1, '聽過 5 個不同注音 → 1 隻猴子');
    await page.click(`.cc[data-s="${ALL[0]}"] .cs`); await page.click(`.cc[data-s="${ALL[0]}"] .cs`);
    ok(await page.locator('.friend').count() === 1 && await page.locator('.splash').count() >= 1, '重複聽：閃水花、不加猴子');
    await page.click('.cc[data-s="ㄛ"] .cw');
    ok((await page.evaluate(()=>window.__said)).includes('喔喔叫'), '點 ㄛ 的卡片 → say(喔喔叫)');
    ok((await page.evaluate(()=>window.__said)).includes('ㄅ'), '點 ㄅ → say(ㄅ)');
    for(const s of ALL) await page.click(`.cc[data-s="${s}"] .cs`);
    ok(await page.locator('.friend').count() === 7, '37 音聽完：猴子最多 7 隻');
    ok(await page.locator('.lant.lit').count() === 2, '全部聽過：洞口燈籠亮');
    await page.waitForTimeout(300);
    ok((await page.evaluate(()=>window.__said)).includes('水簾洞好熱鬧！'), '稱讚：水簾洞好熱鬧！');
    const sv = await readSave(page);
    ok(Object.keys(sv.cave.heard).length === 37 && sv.cave.allHeard, '存檔 cave.heard 有 37 個、allHeard');
    await page.click('#back'); await waitPhase(page, 'map');
    ok(await page.locator('.party').count() === 0, '沒過關：地圖沒有悟空拿棒／唐僧');
    await ctx.close(); }

  // ===== C. 兌換、妖怪複習、地圖隊伍（第 1、2 關都過，蟠桃 3 + 2 = 5）=====
  console.log('C. 兌換／妖怪／地圖');
  { const seed = { levels:{ 1:lv(3), 2:lv(2) }, stickers:[] };
    const { ctx, page } = await newPage(browser, seed, { reducedMotion:'reduce' }); await stubSay(page);
    await page.click('#go'); await page.waitForSelector('.party');
    ok(await page.locator('.party .tang').count() === 1 && await page.locator('.party .wk-m').count() === 1, '地圖：悟空拿棒＋唐僧跟在後面');
    const pcs = await page.evaluate(()=>[...document.querySelectorAll('.station .peaches')].map(x=>x.dataset.n).join(','));
    ok(pcs === '3,2', '地圖關卡旁蟠桃 3,2（實際 ' + pcs + '）');
    ok(await page.locator('.station.open .peaches .pc.on').count() === 5, '亮著的蟠桃共 5 顆');
    await page.click('#cavego'); await waitPhase(page, 'cave');
    ok(await page.locator('.cmon').count() === 2 && await page.locator('.staff-bar').count() === 1, '洞裡有石頭頭、岩岩，悟空拿棒');
    await page.click('#shopbtn'); await waitPhase(page, 'shop');
    ok((await page.locator('#shop .modal-box h2 b').textContent()) === '5', '錢包 5 顆');
    await page.click('.shop-item[data-id="hat"]'); await page.click('#buy'); await waitPhase(page, 'cave');
    let sv = await readSave(page);
    ok(sv.cave.owned.includes('hat') && sv.cave.spent === 2, '買帽子：owned、spent=2');
    ok(await page.locator('#cavewk .gear.hat').count() === 1, '洞裡悟空戴上帽子');
    ok((await page.textContent('#wallet')) === '3', '錢包剩 3');
    await page.click('#shopbtn'); await waitPhase(page, 'shop');
    await page.click('.shop-item[data-id="lantern"]'); await page.click('#buy'); await waitPhase(page, 'cave');
    await page.click('#shopbtn'); await waitPhase(page, 'shop');
    await page.click('.shop-item[data-id="flowers"]');
    ok(await page.locator('#buy').count() === 0, '蟠桃不夠：不能買花叢');
    await page.click('#shopx'); await waitPhase(page, 'cave');
    sv = await readSave(page);
    ok(sv.levels[1].peaches === 3 && sv.levels[2].peaches === 2, '兌換不會減少各關蟠桃紀錄');
    ok(sv.cave.spent === 4 && sv.cave.owned.join() === 'hat,lantern', 'spent=4、owned=hat,lantern');
    await page.click('.cmon[data-m="rock"]'); await waitPhase(page, 'mq');
    const q = await page.evaluate(()=>window.__mq);
    ok('ㄚㄛㄆㄈ'.includes(q.ans), '岩岩的題只從 ㄚㄛㄆㄈ 出（' + q.ans + '）');
    if(q.kind==='hear') await page.click(`#mq .choice[data-o="${q.ans}"]`); else await page.click(`#mq .choice[data-o="${q.ans}"]`);
    await page.waitForSelector('#mq', { state:'detached', timeout:8000 });
    ok(await phase(page) === 'cave', '答完留在洞裡');
    await page.click('#back'); await waitPhase(page, 'map');
    ok(await page.locator('.party .gear.hat').count() === 1, '地圖悟空也戴帽子');
    await ctx.close(); }

  // ===== D. 對戰：連擊、念經挑戰、蟠桃 =====
  console.log('D. 重玩第 2 關（有棒＋有唐僧）');
  { const seed = { levels:{ 1:lv(1), 2:lv(1) }, stickers:[] };
    const { ctx, page } = await newPage(browser, seed, { reducedMotion:'reduce' }); await stubSay(page);
    await enterBattle(page, 1);
    ok(await page.locator('#smini').count() === 1, '有金箍棒：戰場悟空旁有小棒');
    await page.evaluate(()=>{ window.__h = []; new MutationObserver(()=>window.__h.push(document.body.dataset.phase)).observe(document.body, { attributes:true, attributeFilter:['data-phase'] }); });
    for(let i=0;i<10;i++) await answer(page, i===3);   // 第 4 題先錯一次
    await waitPhase(page, 'monk-q');
    const bursts = (await page.evaluate(()=>window.__h)).filter(x=>x==='staff-burst').length;
    ok(bursts === 3, `連擊特效 3 次：第 3 題、第 7 題、第 10 題（第 4 題先答錯歸零；實際 ${bursts}）`);
    await waitPhase(page, 'monk-q');
    ok(await page.locator('.slot').count() >= 2, '10 題後唐僧念經挑戰出場');
    const seq = await page.evaluate(()=>window.__seq);
    ok(seq.length >= 2 && seq.length <= 3 && seq.every(s=>'ㄧㄨㄅㄇㄚㄛㄆㄈ'.includes(s)), '念經符號只用已學的：' + seq.join(''));
    const said = await page.evaluate(()=>window.__said); ok(said.some(x=>x.endsWith(seq.join('|'))), '念經：依序播單音');
    const wrong = await page.evaluate(s=>[...document.querySelectorAll('.choice')].find(c=>c.dataset.o!==s[0]).dataset.o, seq);
    await page.click(`.choice[data-o="${wrong}"]`); await page.waitForTimeout(200);
    ok(await page.locator('.slot.fill').count() === 0, '第一次錯：重來（可再聽一次）');
    await page.click(`.choice[data-o="${wrong}"]`);
    await waitPhase(page, 'monk-reveal'); ok(true, '第二次仍錯：依序發光');
    await waitPhase(page, 'rescue', 20000).catch(()=>{});
    await page.waitForSelector('#peachrow', { timeout:30000 });
    // 10 題中 9 題第一輪答對 + 念經沒過 = 9/11 → 2 顆
    const sv = await readSave(page);
    ok(sv.levels[2].peaches === 2, `9/11 → 2 顆蟠桃（存檔 ${sv.levels[2].peaches}）`);
    ok(sv.levels[1].peaches === 1 && sv.levels[2].cleared, '第 1 關蟠桃不受影響');
    await ctx.close(); }
  console.log('D2. 全對＋念經一次過 → 3 顆；較低成績不降');
  { const seed = { levels:{ 1:lv(3), 2:lv(1) }, stickers:[] };
    const { ctx, page } = await newPage(browser, seed, { reducedMotion:'reduce' }); await stubSay(page);
    await enterBattle(page, 1);
    for(let i=0;i<10;i++) await answer(page);
    await waitPhase(page, 'monk-q');
    const seq = await page.evaluate(()=>window.__seq);
    for(const s of seq){ await page.click(`.choice[data-o="${s}"]`); }
    await page.waitForSelector('#peachrow', { timeout:30000 });
    ok((await readSave(page)).levels[2].peaches === 3, '11/11 → 3 顆');
    ok(await page.locator('#peachrow .pc.on').count() === 3, '過關畫面顯示 3 顆蟠桃');
    await ctx.close(); }
  console.log('D3. 第一次打（沒棒、沒唐僧）不加掛鉤；第 1 關重玩沒有念經');
  { const { ctx, page } = await newPage(browser, { levels:{ 1:{ learned:true } }, stickers:[] }, { reducedMotion:'reduce' }); await stubSay(page);
    await enterBattle(page, 0);
    ok(await page.locator('#smini').count() === 0, '第 1 關第一次打：沒有金箍棒');
    await ctx.close(); }
  { const { ctx, page } = await newPage(browser, { levels:{ 1:lv(1), 2:{ learned:true } }, stickers:[] }, { reducedMotion:'reduce' }); await stubSay(page);
    await enterBattle(page, 1);
    ok(await page.locator('#smini').count() === 1, '第 2 關第一次打：有棒（第 1 關已過）');
    for(let i=0;i<10;i++) await answer(page);
    await waitPhase(page, 'rescue', 30000);
    ok(await page.locator('.slot').count() === 0, '第 2 關第一次打：不出現念經挑戰（還沒有唐僧）');
    await page.waitForSelector('#peachrow', { timeout:30000 });
    ok((await readSave(page)).levels[2].peaches === 3, '10/10 → 3 顆');
    await ctx.close(); }
  { const seed = { levels:{ 1:lv(2) }, stickers:[], cave:{ spent:1 } };
    const { ctx, page } = await newPage(browser, seed, { reducedMotion:'reduce' }); await stubSay(page);
    await enterBattle(page, 0);
    for(let i=0;i<10;i++) await answer(page);
    await page.waitForSelector('#peachrow', { timeout:30000 });
    ok(await page.locator('.slot').count() === 0, '第 1 關重玩：沒有念經挑戰');
    ok((await readSave(page)).levels[1].peaches === 3 && (await readSave(page)).cave.spent === 1, '10/10 → 3 顆，舊存檔的 cave 欄位保留');
    await ctx.close(); }
} finally { await browser.close(); server.close(); }
console.log(`\n耗時 ${((Date.now()-t0)/1000).toFixed(0)} 秒`);
if(errors.length){ console.log('頁面錯誤：'); errors.forEach(e=>console.log('  ', e)); }
if(fails.length || errors.length){ console.log(`失敗 ${fails.length} 項、錯誤 ${errors.length} 則`); process.exit(1); }
console.log('全部通過');
