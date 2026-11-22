// 存檔：只存在這台裝置的瀏覽器（localStorage）。鍵不變，只在原結構上擴充（舊存檔沒有的欄位都有預設值）
const SAVE_KEY = 'xiyou-zhuyin-v1';
function loadSave(){ let d=null; try{ d=JSON.parse(localStorage.getItem(SAVE_KEY)); }catch(e){}
  if(!d||typeof d!=='object') d={}; if(!d.levels||typeof d.levels!=='object') d.levels={}; if(!Array.isArray(d.stickers)) d.stickers=[]; return d; }
function saveData(d){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(d)); }catch(e){} }
function levelState(id){ const d=loadSave(); return Object.assign({learned:false, cleared:false, stamps:0, peaches:0}, d.levels[id]); }
function setLevel(id, patch){ const d=loadSave(); d.levels[id]=Object.assign(levelState(id), patch); saveData(d); }
function addSticker(name){ const d=loadSave(); if(!d.stickers.includes(name)) d.stickers.push(name); saveData(d); }
// ---- 蟠桃：每關 peaches（歷史最高，只升不降）；錢包＝各關最高加總 − 已花掉的 ----
function setPeaches(id, n){ const cur=levelState(id).peaches||0; setLevel(id,{peaches:Math.max(cur, n)}); return Math.max(cur, n); }
function peachWallet(){ const d=loadSave(); const total=Object.values(d.levels).reduce((a,l)=>a+((l&&l.peaches)|0),0); return Math.max(0, total-((d.cave&&d.cave.spent)|0)); }
// ---- 水簾洞：heard 每個注音聽過幾次、spent 已花蟠桃、owned 已換到的東西、allHeard 是否已慶祝過 ----
function caveState(){ const d=loadSave(); return Object.assign({heard:{}, spent:0, owned:[], allHeard:false}, d.cave); }
function setCave(patch){ const d=loadSave(); d.cave=Object.assign(caveState(), patch); saveData(d); }
