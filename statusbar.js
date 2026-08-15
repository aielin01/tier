"use strict";
/* 幸逢 · 状态栏系统 statusbar.js（依赖 app.js 的顶层绑定：dbGet/dbSet/cards/imgs/modal/closeModal/toast/escapeHtml/escapeAttr，须在 app.js 之后加载）*/

const SB_SELF_BUILTIN_HTML = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>观测终端</title>\n<style>\n  :root{\n    --sb-accent:#7dd3fc;\n    --sb-text:#f5f7fa;\n    --sb-text-dim:rgba(245,247,250,.62);\n    --sb-panel:rgba(16,20,28,.55);\n    --sb-line:rgba(255,255,255,.14);\n    --sb-radius:20px;\n    --sb-font:\"PingFang SC\",\"Microsoft YaHei\",\"Helvetica Neue\",Arial,sans-serif;\n  }\n  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}\n  html,body{width:100%;min-height:100%;}\n  body{\n    font-family:var(--sb-font);color:var(--sb-text);\n    background:radial-gradient(circle at 28% 18%,#243350,#0b0e15 72%);\n    display:flex;padding:6vw 6vw 8vw;\n  }\n  .sb-wrap{width:100%;max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:4vw;}\n  .sb-photo{position:relative;width:100%;aspect-ratio:4/5;border-radius:var(--sb-radius);overflow:hidden;background:linear-gradient(160deg,#1b2333,#0c0f16);box-shadow:0 10px 30px rgba(0,0,0,.35);}\n  .sb-photo img{width:100%;height:100%;object-fit:cover;display:block;}\n  .sb-photo-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78) 0%,rgba(0,0,0,0) 48%);}\n  .sb-photo-tag{position:absolute;left:5%;top:5%;font-size:11px;letter-spacing:2px;color:var(--sb-accent);background:rgba(0,0,0,.35);padding:4px 10px;border-radius:999px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}\n  .sb-photo-name{position:absolute;left:5%;right:5%;bottom:5%;font-size:clamp(20px,5.4vw,30px);font-weight:700;letter-spacing:.5px;text-shadow:0 2px 12px rgba(0,0,0,.5);}\n  .sb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3vw;}\n  .sb-stat{background:var(--sb-panel);border:1px solid var(--sb-line);border-radius:14px;padding:3.4vw 2vw;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);text-align:center;}\n  .sb-stat-lbl{font-size:11px;color:var(--sb-text-dim);letter-spacing:1px;margin-bottom:5px;}\n  .sb-stat-val{font-size:clamp(13px,3.6vw,16px);font-weight:600;word-break:break-all;}\n  .sb-panel{background:var(--sb-panel);border:1px solid var(--sb-line);border-radius:16px;padding:4.4vw;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;flex-direction:column;gap:3vw;}\n  .sb-row{display:flex;justify-content:space-between;align-items:baseline;gap:3vw;}\n  .sb-row+.sb-row{padding-top:3vw;border-top:1px solid var(--sb-line);}\n  .sb-row-lbl{font-size:12px;color:var(--sb-accent);letter-spacing:1px;flex:0 0 auto;}\n  .sb-row-val{font-size:14px;text-align:right;flex:1;}\n  .sb-loc{display:grid;grid-template-columns:repeat(2,1fr);gap:3vw;}\n  .sb-loc .sb-row{justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:4px;}\n  .sb-loc .sb-row+.sb-row{padding-top:0;border-top:none;}\n  .sb-loc .sb-row-val{text-align:left;}\n</style>\n</head>\n<body>\n  <div class=\"sb-wrap\">\n    <div class=\"sb-photo\">\n      <img src=\"{{avatar}}\">\n      <div class=\"sb-photo-scrim\"></div>\n      <div class=\"sb-photo-tag\">STATUS</div>\n      <div class=\"sb-photo-name\">{{name}}</div>\n    </div>\n    <div class=\"sb-grid\">\n      <div class=\"sb-stat\"><div class=\"sb-stat-lbl\">年龄</div><div class=\"sb-stat-val\">{{age}}</div></div>\n      <div class=\"sb-stat\"><div class=\"sb-stat-lbl\">身高</div><div class=\"sb-stat-val\">{{height}}</div></div>\n      <div class=\"sb-stat\"><div class=\"sb-stat-lbl\">体重</div><div class=\"sb-stat-val\">{{weight}}</div></div>\n    </div>\n    <div class=\"sb-panel\">\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">心情</span><span class=\"sb-row-val\">{{mood}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">想法</span><span class=\"sb-row-val\">{{thought}}</span></div>\n    </div>\n    <div class=\"sb-panel sb-loc\">\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">现居地</span><span class=\"sb-row-val\">{{location}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">位置</span><span class=\"sb-row-val\">{{position}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">季节</span><span class=\"sb-row-val\">{{season}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">天气</span><span class=\"sb-row-val\">{{weather}}</span></div>\n    </div>\n  </div>\n</body>\n</html>\n";
const SB_OPP_BUILTIN_HTML  = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>感应档案</title>\n<style>\n  :root{\n    --sb-accent:#fbbf75;\n    --sb-text:#fbf3ee;\n    --sb-text-dim:rgba(251,243,238,.62);\n    --sb-panel:rgba(32,22,26,.55);\n    --sb-line:rgba(255,255,255,.14);\n    --sb-radius:14px;\n    --sb-font:\"PingFang SC\",\"Microsoft YaHei\",\"Helvetica Neue\",Arial,sans-serif;\n  }\n  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}\n  html,body{width:100%;min-height:100%;}\n  body{\n    font-family:var(--sb-font);color:var(--sb-text);\n    background:radial-gradient(circle at 72% 14%,#3c2a35,#150e13 72%);\n    display:flex;padding:6vw 6vw 8vw;\n  }\n  .sb-wrap{width:100%;max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:4vw;}\n  .sb-photo{position:relative;width:100%;aspect-ratio:4/5;border-radius:var(--sb-radius);overflow:hidden;background:linear-gradient(160deg,#2c1f24,#130d10);box-shadow:0 10px 30px rgba(0,0,0,.35);}\n  .sb-photo img{width:100%;height:100%;object-fit:cover;display:block;}\n  .sb-photo-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78) 0%,rgba(0,0,0,0) 48%);}\n  .sb-photo-dot{position:absolute;left:5%;top:5%;width:9px;height:9px;border-radius:50%;background:var(--sb-accent);box-shadow:0 0 10px var(--sb-accent);}\n  .sb-photo-name{position:absolute;left:5%;right:5%;bottom:5%;font-size:clamp(20px,5.4vw,30px);font-weight:700;letter-spacing:.5px;text-shadow:0 2px 12px rgba(0,0,0,.5);}\n  .sb-panel{background:var(--sb-panel);border:1px solid var(--sb-line);border-radius:var(--sb-radius);padding:4.4vw;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;flex-direction:column;gap:3vw;}\n  .sb-row{display:flex;justify-content:space-between;align-items:baseline;gap:3vw;}\n  .sb-row+.sb-row{padding-top:3vw;border-top:1px solid var(--sb-line);}\n  .sb-row-lbl{font-size:12px;color:var(--sb-accent);letter-spacing:1px;flex:0 0 auto;}\n  .sb-row-val{font-size:14px;text-align:right;flex:1;}\n  .sb-loc{display:grid;grid-template-columns:repeat(2,1fr);gap:3vw;}\n  .sb-loc .sb-row{justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:4px;}\n  .sb-loc .sb-row+.sb-row{padding-top:0;border-top:none;}\n  .sb-loc .sb-row-val{text-align:left;}\n  .sb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3vw;}\n  .sb-stat{background:var(--sb-panel);border:1px solid var(--sb-line);border-radius:var(--sb-radius);padding:3.4vw 2vw;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);text-align:center;}\n  .sb-stat-lbl{font-size:11px;color:var(--sb-text-dim);letter-spacing:1px;margin-bottom:5px;}\n  .sb-stat-val{font-size:clamp(13px,3.6vw,16px);font-weight:600;word-break:break-all;}\n</style>\n</head>\n<body>\n  <div class=\"sb-wrap\">\n    <div class=\"sb-photo\">\n      <img src=\"{{avatar}}\">\n      <div class=\"sb-photo-scrim\"></div>\n      <div class=\"sb-photo-dot\"></div>\n      <div class=\"sb-photo-name\">{{name}}</div>\n    </div>\n    <div class=\"sb-panel\">\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">心情</span><span class=\"sb-row-val\">{{mood}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">想法</span><span class=\"sb-row-val\">{{thought}}</span></div>\n    </div>\n    <div class=\"sb-panel sb-loc\">\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">现居地</span><span class=\"sb-row-val\">{{location}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">位置</span><span class=\"sb-row-val\">{{position}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">季节</span><span class=\"sb-row-val\">{{season}}</span></div>\n      <div class=\"sb-row\"><span class=\"sb-row-lbl\">天气</span><span class=\"sb-row-val\">{{weather}}</span></div>\n    </div>\n    <div class=\"sb-grid\">\n      <div class=\"sb-stat\"><div class=\"sb-stat-lbl\">年龄</div><div class=\"sb-stat-val\">{{age}}</div></div>\n      <div class=\"sb-stat\"><div class=\"sb-stat-lbl\">身高</div><div class=\"sb-stat-val\">{{height}}</div></div>\n      <div class=\"sb-stat\"><div class=\"sb-stat-lbl\">体重</div><div class=\"sb-stat-val\">{{weight}}</div></div>\n    </div>\n  </div>\n</body>\n</html>\n";

const SB_VAR_LABELS = {
  name:"姓名", mood:"心情", thought:"想法", age:"年龄", height:"身高", weight:"体重",
  location:"现居地", position:"位置", season:"季节", weather:"天气"
};
const SB_RESERVED_VARS = new Set(["avatar"]);
const SB_MIN_INTERVAL = 3600000, SB_MAX_INTERVAL = 86400000;
const SB_VAR_RE = /\{\{\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*\}\}/g;

let sbState = null;
let sbCards = [];
let sbSettingsSide = "self";
let sbViewerTicker = null;
let _sbSaveTimer = null, _sbSettingsRenderTimer = null;

function sbDefaultState(){
  return {
    activePreset: { self:"p_self_default", opp:"p_opp_default" },
    presets: {
      self: [{ id:"p_self_default", name:"默认", html:SB_SELF_BUILTIN_HTML, bg:"" }],
      opp:  [{ id:"p_opp_default",  name:"默认", html:SB_OPP_BUILTIN_HTML,  bg:"" }]
    },
    fields: { self:{}, opp:{} },
    bindings: { opp:{} },
    picked: { opp:{} },
    updateIntervalMs: SB_MIN_INTERVAL,
    lastRefresh: 0
  };
}
function sbClampInterval(ms){ ms=+ms||SB_MIN_INTERVAL; return Math.min(SB_MAX_INTERVAL, Math.max(SB_MIN_INTERVAL, ms)); }
function sbExtractVars(html){
  const set = new Set(); let m; SB_VAR_RE.lastIndex = 0;
  while((m = SB_VAR_RE.exec(html))){ if(!SB_RESERVED_VARS.has(m[1])) set.add(m[1]); }
  return [...set];
}
function sbActivePreset(side){
  const list = sbState.presets[side];
  const id = sbState.activePreset[side];
  return list.find(p=>p.id===id) || list[0];
}

async function sbSave(){ try{ await dbSet("statusbar", sbState); }catch(e){} }
function sbSaveDebounced(){ clearTimeout(_sbSaveTimer); _sbSaveTimer=setTimeout(sbSave,300); }
async function sbSaveCards(){ try{ await dbSet("sbCards", sbCards); }catch(e){} }

window.initStatusbar = async function(){
  let saved=null; try{ saved=await dbGet("statusbar",null); }catch(e){ saved=null; }
  const def = sbDefaultState();
  sbState = {
    activePreset: Object.assign({}, def.activePreset, saved && saved.activePreset || {}),
    presets: {
      self: (saved && saved.presets && saved.presets.self && saved.presets.self.length) ? saved.presets.self : def.presets.self,
      opp:  (saved && saved.presets && saved.presets.opp  && saved.presets.opp.length)  ? saved.presets.opp  : def.presets.opp
    },
    fields: {
      self: Object.assign({}, saved && saved.fields && saved.fields.self || {}),
      opp:  Object.assign({}, saved && saved.fields && saved.fields.opp  || {})
    },
    bindings: { opp: Object.assign({}, saved && saved.bindings && saved.bindings.opp || {}) },
    picked:   { opp: Object.assign({}, saved && saved.picked   && saved.picked.opp   || {}) },
    updateIntervalMs: sbClampInterval(saved && saved.updateIntervalMs),
    lastRefresh: (saved && saved.lastRefresh) || 0
  };
  if(!sbState.presets.self.find(p=>p.id===sbState.activePreset.self)) sbState.activePreset.self = sbState.presets.self[0].id;
  if(!sbState.presets.opp.find(p=>p.id===sbState.activePreset.opp))   sbState.activePreset.opp  = sbState.presets.opp[0].id;

  try{ sbCards = (await dbGet("sbCards",[])) || []; }catch(e){ sbCards = []; }

  const fpBg = document.getElementById("fpStatusbarBg");
  if(fpBg && !fpBg._sbBound){ fpBg._sbBound=true; fpBg.addEventListener("change", sbHandleBgUpload); }
  const fp = document.getElementById("fpStatusbar");
  if(fp && !fp._sbBound){ fp._sbBound=true; fp.addEventListener("change", sbHandleImport); }
};

// ─── 取值 / 抽字卡库 ───
function sbResolveValue(side, key){
  if(side==="opp"){
    const cat = sbState.bindings.opp[key];
    if(cat){ const v=sbState.picked.opp[key]; return (v!==undefined && v!=="") ? v : "未定义"; }
  }
  const v = sbState.fields[side][key];
  return (v!==undefined && v!=="") ? v : "未定义";
}
function sbRollField(key){
  const cat = sbState.bindings.opp[key]; if(!cat) return;
  const pool = sbCards.filter(c=>c.cat===cat);
  sbState.picked.opp[key] = pool.length ? pool[Math.floor(Math.random()*pool.length)].text : "";
}
function sbRollAllBound(){ Object.keys(sbState.bindings.opp).forEach(sbRollField); }
function sbMaybeAutoRefresh(){
  if(!sbState) return;
  const now = Date.now();
  if(now - sbState.lastRefresh >= sbState.updateIntervalMs){
    sbRollAllBound(); sbState.lastRefresh = now; sbSaveDebounced();
  }
}

// ─── 渲染 ───
function sbBuildVarsMap(side, html){
  const vars = {};
  sbExtractVars(html).forEach(k=>{ vars[k]=sbResolveValue(side,k); });
  vars.avatar = imgs[side==="self"?"selfAvatar":"oppAvatar"] || window.DEFAULTS.PH_SVG;
  return vars;
}
function sbRenderHtml(side){
  const preset = sbActivePreset(side);
  const vars = sbBuildVarsMap(side, preset.html);
  let html = preset.html.replace(SB_VAR_RE, (m,k)=>escapeHtml(vars[k]!==undefined?vars[k]:"未定义"));
  if(preset.bg){
    const bg = `<style>html,body{background-image:url("${preset.bg.replace(/"/g,"&quot;")}") !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;}</style>`;
    html = html.includes("</head>") ? html.replace("</head>", bg+"</head>") : bg+html;
  }
  return html;
}
function sbMountFrame(wrap, side){
  if(!wrap) return;
  wrap.innerHTML = `<iframe class="sb-frame" sandbox="allow-scripts" loading="lazy"></iframe>`;
  wrap.querySelector("iframe").srcdoc = sbRenderHtml(side);
}

// ─── 聊天头像：观赏性弹层（不经过 App 切换，独立挂载单个 iframe）───
window.openStatusbarViewer = function(side){
  if(!sbState) return;
  window.sbCloseViewer();
  sbMaybeAutoRefresh();
  const mask = document.createElement("div");
  mask.className = "sb-viewer-mask";
  mask.addEventListener("click", e=>{ if(e.target===mask) window.sbCloseViewer(); });
  mask.innerHTML = `
    <div class="sb-viewer-card">
      <button class="sb-viewer-close" onclick="window.sbCloseViewer()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
      </button>
      <div class="sb-viewer-frame-wrap"></div>
    </div>`;
  (document.getElementById("vp") || document.body).appendChild(mask);
  sbMountFrame(mask.querySelector(".sb-viewer-frame-wrap"), side);
  requestAnimationFrame(()=>mask.classList.add("on"));
  sbViewerTicker = setInterval(()=>sbMaybeAutoRefresh(), 60000);
};
window.sbCloseViewer = function(){
  const mask = document.querySelector(".sb-viewer-mask");
  if(sbViewerTicker){ clearInterval(sbViewerTicker); sbViewerTicker=null; }
  if(!mask) return;
  mask.classList.remove("on");
  setTimeout(()=>mask.remove(), 220);
};

// ─── 年鉴内设置面板 ───
window.renderStatusbarSettings = function(){
  const root = document.getElementById("sbSettingsRoot");
  if(!root || !sbState) return;
  const side = sbSettingsSide;
  const preset = sbActivePreset(side);
  const presetChips = sbState.presets[side].map(p=>`
    <button class="sb-chip ${p.id===preset.id?'on':''}" onclick="window.sbSetActivePreset('${side}','${p.id}')">${escapeHtml(p.name)}</button>
  `).join("") + `<button class="sb-chip sb-chip-add" onclick="window.sbCreatePreset('${side}')">＋</button>`;

  root.innerHTML = `
    <div class="sb-side-switch">
      <button class="sb-side-opt ${side==='self'?'on':''}" onclick="window.sbSwitchSettingsSide('self')">我方</button>
      <button class="sb-side-opt ${side==='opp'?'on':''}" onclick="window.sbSwitchSettingsSide('opp')">对方</button>
    </div>

    <div class="sb-preview-wrap"><div class="sb-frame-wrap" id="sbSettingsPreview"></div></div>

    <div class="sb-chip-row">${presetChips}</div>
    <div class="sb-preset-ops">
      <input class="fld sb-preset-name" id="sbPresetName" value="${escapeAttr(preset.name)}" onchange="window.sbRenamePreset('${side}',this.value)">
      <button class="pill-btn ghost" onclick="window.sbDuplicatePreset('${side}')">复制</button>
      <button class="pill-btn danger" onclick="window.sbDeletePreset('${side}')">删除</button>
    </div>

    <div class="sb-bg-row">
      <div class="sb-bg-thumb" style="${preset.bg?`background-image:url('${preset.bg}')`:''}" onclick="document.getElementById('fpStatusbarBg').click()"></div>
      <div class="sb-bg-ops">
        <button class="pill-btn" onclick="document.getElementById('fpStatusbarBg').click()">换背景</button>
        ${preset.bg?`<button class="pill-btn ghost" onclick="window.sbClearBg()">去除背景</button>`:''}
      </div>
    </div>

    <div class="sb-field-list">${sbFieldRowsHtml(side, preset)}</div>

    <textarea id="sbHtmlArea" class="sb-html-area" spellcheck="false">${escapeHtml(preset.html)}</textarea>
    <div class="sb-editor-actions">
      <button class="pill-btn" onclick="window.sbSaveHtml()">保存 HTML</button>
      <button class="pill-btn ghost" onclick="window.sbResetTemplate()">恢复内置</button>
    </div>

    <div class="sb-set-row">
      <span>换卡间隔</span>
      <div class="sb-set-ctl">
        <input type="range" min="1" max="24" step="1" value="${Math.round(sbState.updateIntervalMs/3600000)}" oninput="window.sbSetInterval(this.value)">
        <span id="sbIntervalDisp">${Math.round(sbState.updateIntervalMs/3600000)}h</span>
      </div>
    </div>
    <div class="sb-set-row sb-set-actions">
      <button class="pill-btn" onclick="window.sbExport()">导出</button>
      <button class="pill-btn" onclick="document.getElementById('fpStatusbar').click()">导入</button>
      <button class="pill-btn danger" onclick="window.sbResetAll()">重置</button>
    </div>
  `;
  sbMountFrame(document.getElementById("sbSettingsPreview"), side);
};

function sbFieldRowsHtml(side, preset){
  const keys = sbExtractVars(preset.html);
  if(!keys.length) return `<div class="sb-empty-tip">—</div>`;
  return keys.map(key=>{
    const label = SB_VAR_LABELS[key] || key;
    if(side==="self"){
      const val = sbState.fields.self[key] || "";
      return `<div class="sb-field-row">
        <span class="sb-field-lbl">${escapeHtml(label)}</span>
        <input class="fld sb-field-input" value="${escapeAttr(val)}" placeholder="未定义" oninput="window.sbSetField('self','${key}',this.value)">
      </div>`;
    }
    const bound = sbState.bindings.opp[key];
    const val = sbState.fields.opp[key] || "";
    return `<div class="sb-field-row">
      <span class="sb-field-lbl">${escapeHtml(label)}</span>
      <div class="sb-field-ctl">
        <select class="fld sb-mode-select" onchange="window.sbSetBindMode('${key}', this.value)">
          <option value="" ${!bound?"selected":""}>自定义</option>
          <option value="__cat__" ${bound?"selected":""}>字卡库</option>
        </select>
        ${bound
          ? `<select class="fld sb-cat-select" onchange="window.sbSetBindCat('${key}', this.value)">${sbCatOptions(bound)}</select>
             <button class="sb-reroll-btn" onclick="window.sbRerollField('${key}')">⟳</button>`
          : `<input class="fld sb-field-input" value="${escapeAttr(val)}" placeholder="未定义" oninput="window.sbSetField('opp','${key}',this.value)">`
        }
      </div>
    </div>`;
  }).join("");
}
function sbCatOptions(selected){
  const cats = [...new Set(sbCards.map(c=>c.cat))];
  if(!cats.length) return `<option value="">—</option>`;
  return cats.map(c=>`<option value="${escapeAttr(c)}" ${c===selected?"selected":""}>${escapeHtml(c)}</option>`).join("");
}

function sbScheduleSettingsRerender(){
  clearTimeout(_sbSettingsRenderTimer);
  _sbSettingsRenderTimer = setTimeout(()=>window.renderStatusbarSettings(), 350);
}

window.sbSwitchSettingsSide = function(side){ sbSettingsSide=side; window.renderStatusbarSettings(); };

window.sbSetActivePreset = function(side, id){
  sbState.activePreset[side]=id; sbSave(); window.renderStatusbarSettings();
};
window.sbCreatePreset = function(side){
  const name = prompt("方案名称","新方案"); if(name===null) return;
  const base = sbActivePreset(side);
  const id = "p_"+side+"_"+Date.now();
  sbState.presets[side].push({ id, name: name.trim()||"新方案", html: base.html, bg:"" });
  sbState.activePreset[side]=id; sbSave(); window.renderStatusbarSettings();
};
window.sbDuplicatePreset = function(side){
  const base = sbActivePreset(side);
  const id = "p_"+side+"_"+Date.now();
  sbState.presets[side].push({ id, name: base.name+" 副本", html: base.html, bg: base.bg });
  sbState.activePreset[side]=id; sbSave(); window.renderStatusbarSettings();
};
window.sbRenamePreset = function(side, name){
  const preset = sbActivePreset(side);
  preset.name = (name||"").trim() || preset.name;
  sbSaveDebounced();
};
window.sbDeletePreset = function(side){
  if(sbState.presets[side].length<=1) { toast("至少保留一个方案"); return; }
  if(!confirm("删除当前方案？")) return;
  const preset = sbActivePreset(side);
  sbState.presets[side] = sbState.presets[side].filter(p=>p.id!==preset.id);
  sbState.activePreset[side] = sbState.presets[side][0].id;
  sbSave(); window.renderStatusbarSettings();
};

window.sbSetField = function(side, key, val){
  sbState.fields[side][key]=val; sbSaveDebounced();
  clearTimeout(_sbSettingsRenderTimer);
  _sbSettingsRenderTimer = setTimeout(()=>{ const w=document.getElementById("sbSettingsPreview"); if(w) sbMountFrame(w, side); }, 350);
};
window.sbSetBindMode = function(key, mode){
  if(mode==="__cat__"){
    const cats=[...new Set(sbCards.map(c=>c.cat))];
    sbState.bindings.opp[key]=cats[0]||""; sbRollField(key);
  } else { delete sbState.bindings.opp[key]; delete sbState.picked.opp[key]; }
  sbSave(); window.renderStatusbarSettings();
};
window.sbSetBindCat = function(key, cat){
  sbState.bindings.opp[key]=cat; sbRollField(key); sbSave(); window.renderStatusbarSettings();
};
window.sbRerollField = function(key){ sbRollField(key); sbSave(); window.renderStatusbarSettings(); };

window.sbSetInterval = function(hours){
  sbState.updateIntervalMs = sbClampInterval((+hours||1)*3600000);
  const disp=document.getElementById("sbIntervalDisp"); if(disp) disp.innerText=hours+"h";
  sbSaveDebounced();
};

window.sbSaveHtml = function(){
  const el=document.getElementById("sbHtmlArea"); if(!el) return;
  sbActivePreset(sbSettingsSide).html = el.value;
  sbSave(); window.renderStatusbarSettings();
};
window.sbResetTemplate = function(){
  if(!confirm("恢复内置模板？当前 HTML 将被覆盖。")) return;
  const preset = sbActivePreset(sbSettingsSide);
  preset.html = sbSettingsSide==="self" ? SB_SELF_BUILTIN_HTML : SB_OPP_BUILTIN_HTML;
  sbSave(); window.renderStatusbarSettings();
};
window.sbClearBg = function(){
  sbActivePreset(sbSettingsSide).bg=""; sbSave(); window.renderStatusbarSettings();
};
function sbHandleBgUpload(e){
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{
    sbActivePreset(sbSettingsSide).bg = ev.target.result;
    sbSave(); window.renderStatusbarSettings();
  };
  r.readAsDataURL(f);
}

window.sbResetAll = function(){
  if(!confirm("重置状态栏系统？所有方案、绑定与自定义内容都会被清空。")) return;
  sbState = sbDefaultState(); sbSave(); window.renderStatusbarSettings(); toast("已重置");
};
window.sbExport = function(){
  const data = JSON.stringify({ presets:sbState.presets, activePreset:sbState.activePreset, fields:sbState.fields, bindings:sbState.bindings, updateIntervalMs:sbState.updateIntervalMs });
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([data],{type:"application/json;charset=utf-8"}));
  a.download=`状态栏_${Date.now()}.json`; a.click();
};
function sbHandleImport(e){
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const r=new FileReader();
  r.onload=async ev=>{
    try{
      const obj=JSON.parse(ev.target.result);
      if(obj.presets){
        if(obj.presets.self && obj.presets.self.length) sbState.presets.self = obj.presets.self;
        if(obj.presets.opp  && obj.presets.opp.length)  sbState.presets.opp  = obj.presets.opp;
      }
      if(obj.activePreset) Object.assign(sbState.activePreset, obj.activePreset);
      if(!sbState.presets.self.find(p=>p.id===sbState.activePreset.self)) sbState.activePreset.self=sbState.presets.self[0].id;
      if(!sbState.presets.opp.find(p=>p.id===sbState.activePreset.opp))   sbState.activePreset.opp =sbState.presets.opp[0].id;
      if(obj.fields){
        if(obj.fields.self) Object.assign(sbState.fields.self, obj.fields.self);
        if(obj.fields.opp)  Object.assign(sbState.fields.opp,  obj.fields.opp);
      }
      if(obj.bindings && obj.bindings.opp) Object.assign(sbState.bindings.opp, obj.bindings.opp);
      if(obj.updateIntervalMs) sbState.updateIntervalMs = sbClampInterval(obj.updateIntervalMs);
      sbRollAllBound();
      await sbSave();
      toast("导入成功");
      window.renderStatusbarSettings();
    }catch(err){ toast("文件格式有误"); }
  };
  r.readAsText(f,"utf-8");
}

// ─── 字卡库：状态栏专属标签栏 ───
window.renderSbCards = function(){
  const deck = document.getElementById("sbCardDeck"); if(!deck) return;
  const q = (document.getElementById("sbCardSearch")?.value||"").trim().toLowerCase();
  const m = {};
  sbCards.forEach(c=>{ (m[c.cat]=m[c.cat]||[]).push(c); });
  const catList = Object.keys(m);
  if(!catList.length){ deck.innerHTML=`<div class="empty-tip" style="padding:40px;text-align:center;">状态栏字卡库此时空空如也</div>`; return; }
  deck.innerHTML = "";
  catList.forEach(cat=>{
    const filtered = m[cat].filter(c=>!q||c.text.toLowerCase().includes(q)||cat.toLowerCase().includes(q));
    if(!filtered.length) return;
    const card = document.createElement("div"); card.className="cat-card";
    let h = `<div class="cat-h" data-cat="${escapeHtml(cat)}">
      <div class="n">${escapeHtml(cat)}<span style="opacity:.4;font-weight:400;margin-left:4px;font-size:10px;">${filtered.length}</span></div>
      <div class="ops" onclick="event.stopPropagation()"><span class="danger" onclick="window.sbDeleteCat('${escapeAttr(cat)}')">删</span></div>
    </div><div class="cat-body">`;
    filtered.forEach(c=>{
      h += `<div class="card-item">
        <div class="text">${escapeHtml(c.text)}</div>
        <div class="ops"><span class="danger" onclick="window.sbDeleteCard('${c.id}')">删</span></div>
      </div>`;
    });
    h += `</div>`;
    card.innerHTML = h; deck.appendChild(card);
  });
};
window.sbOpenAddCard = function(){
  const cats = [...new Set(sbCards.map(c=>c.cat))];
  const opts = cats.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("");
  modal("状态栏字卡", `
    <textarea class="fld area" id="sb_ac_text" placeholder="内容"></textarea>
    <select class="fld" id="sb_ac_cat"><option value="">— 选择分类 —</option>${opts}</select>
    <input class="fld" id="sb_ac_new" placeholder="或新建分类（如 心情 / 季节）">
    <button class="pill-btn" onclick="window.sbAddCardConfirm()">加入</button>
  `);
};
window.sbAddCardConfirm = async function(){
  const text = document.getElementById("sb_ac_text").value.trim();
  const cat = (document.getElementById("sb_ac_new").value.trim() || document.getElementById("sb_ac_cat").value || "未命名");
  if(!text) return;
  sbCards.push({ id:"sbc"+Date.now(), text, cat });
  await sbSaveCards();
  window.renderSbCards();
  closeModal();
};
window.sbDeleteCard = async function(id){
  sbCards = sbCards.filter(c=>c.id!==id);
  await sbSaveCards();
  window.renderSbCards();
};
window.sbDeleteCat = async function(cat){
  if(!confirm("删除该分类下的全部状态栏字卡？")) return;
  sbCards = sbCards.filter(c=>c.cat!==cat);
  await sbSaveCards();
  window.renderSbCards();
};
