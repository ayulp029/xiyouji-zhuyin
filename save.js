// 存檔：只存在這台裝置的瀏覽器（localStorage）
const SAVE_KEY = 'xiyou-zhuyin-v1';
function loadSave(){ try{ return JSON.parse(localStorage.getItem(SAVE_KEY)) || {levels:{}, stickers:[]}; }catch(e){ return {levels:{}, stickers:[]}; } }
function saveData(d){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(d)); }catch(e){} }
function levelState(id){ const d=loadSave(); return d.levels[id] || {learned:false, cleared:false, stamps:0}; }
function setLevel(id, patch){ const d=loadSave(); d.levels[id]=Object.assign(levelState(id), patch); saveData(d); }
function addSticker(name){ const d=loadSave(); if(!d.stickers.includes(name)) d.stickers.push(name); saveData(d); }
