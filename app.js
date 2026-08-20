"use strict";

/* 幸逢核心系统 app.js */

// Global State
window.cfg = JSON.parse(JSON.stringify(window.DEFAULTS.cfg));
window.imgs = JSON.parse(JSON.stringify(window.DEFAULTS.imgs));
window.texts = JSON.parse(JSON.stringify(window.DEFAULTS.texts));
window.cards = [];
window.chats = [];
window.stickers = [];
window.customSounds = [];
window.groupMembers = JSON.parse(JSON.stringify(window.DEFAULTS.groupMembers));
window.anniversaries = JSON.parse(JSON.stringify(window.DEFAULTS.anniversaries));
window.surveys = JSON.parse(JSON.stringify(window.DEFAULTS.surveys));
window.surveyRecords = [];

window.pendingQuote = null;
window.selectedCardIds = new Set();
window.selectedStickerIds = new Set();
window.batchMode = false;
window.activeSoundAudio = null;

// Helpers
window.escapeHtml = function(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

window.toast = function(msg, type = "info") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    t.className = "toast";
  }, 2200);
};

window.modal = function(title, html) {
  const m = document.getElementById("modal");
  const mt = document.getElementById("mTitle");
  const mb = document.getElementById("mBody");
  if (!m || !mt || !mb) return;
  mt.textContent = title;
  mb.innerHTML = html;
  m.classList.add("on");
};

window.closeModal = function() {
  const m = document.getElementById("modal");
  if (m) m.classList.remove("on");
};

// ── Storage Persistence (IndexedDB + localStorage fallback) ──
const DB_NAME = "XingFengDB";
const DB_VERSION = 2;
let db = null;

function initDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains("store")) {
        d.createObjectStore("store");
      }
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    req.onerror = () => {
      console.warn("IndexedDB failed, falling back to localStorage");
      resolve(null);
    };
  });
}

function idbGet(key) {
  return new Promise((resolve) => {
    if (!db) {
      try {
        const val = localStorage.getItem("sc_" + key);
        resolve(val ? JSON.parse(val) : null);
      } catch (e) { resolve(null); }
      return;
    }
    const tx = db.transaction("store", "readonly");
    const store = tx.objectStore("store");
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

function idbSet(key, val) {
  return new Promise((resolve) => {
    if (!db) {
      try {
        localStorage.setItem("sc_" + key, JSON.stringify(val));
      } catch (e) {}
      resolve();
      return;
    }
    const tx = db.transaction("store", "readwrite");
    const store = tx.objectStore("store");
    store.put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

window.loadAll = async function() {
  await initDB();
  const [
    savedCfg, savedImgs, savedTexts, savedCards, savedChats,
    savedStickers, savedSounds, savedMembers, savedAnni, savedSurveys, savedRecords
  ] = await Promise.all([
    idbGet("cfg"), idbGet("imgs"), idbGet("texts"), idbGet("cards"), idbGet("chats"),
    idbGet("stickers"), idbGet("sounds"), idbGet("members"), idbGet("anni"),
    idbGet("surveys"), idbGet("records")
  ]);

  if (savedCfg) window.cfg = Object.assign({}, window.DEFAULTS.cfg, savedCfg);
  if (savedImgs) window.imgs = Object.assign({}, window.DEFAULTS.imgs, savedImgs);
  if (savedTexts) window.texts = Object.assign({}, window.DEFAULTS.texts, savedTexts);
  if (Array.isArray(savedCards)) window.cards = savedCards;
  if (Array.isArray(savedChats)) window.chats = savedChats;
  if (Array.isArray(savedStickers)) window.stickers = savedStickers;
  if (Array.isArray(savedSounds)) window.customSounds = savedSounds;
  if (Array.isArray(savedMembers)) window.groupMembers = savedMembers;
  if (Array.isArray(savedAnni)) window.anniversaries = savedAnni;
  if (Array.isArray(savedSurveys)) window.surveys = savedSurveys;
  if (Array.isArray(savedRecords)) window.surveyRecords = savedRecords;
};

window.saveAll = async function() {
  await Promise.all([
    idbSet("cfg", window.cfg),
    idbSet("imgs", window.imgs),
    idbSet("texts", window.texts),
    idbSet("cards", window.cards),
    idbSet("chats", window.chats),
    idbSet("stickers", window.stickers),
    idbSet("sounds", window.customSounds),
    idbSet("members", window.groupMembers),
    idbSet("anni", window.anniversaries),
    idbSet("surveys", window.surveys),
    idbSet("records", window.surveyRecords)
  ]);
};

window.saveChats = async function() {
  await idbSet("chats", window.chats);
};

// ── Authentication / Lock Screen ──
window.checkLock = function() {
  const inp = document.getElementById("lockInput");
  const err = document.getElementById("lockError");
  if (!inp) return;
  const val = inp.value.trim();
  // Standard passkey or empty allows entry
  localStorage.setItem("sc_authed", "true");
  document.documentElement.classList.add("is-authenticated");
  const ls = document.getElementById("lockScreen");
  if (ls) {
    ls.classList.add("gone");
    setTimeout(() => { ls.style.display = "none"; }, 500);
  }
};

// ── Application Navigation ──
window.openApp = function(appId) {
  const app = document.getElementById(appId);
  if (!app) return;
  app.classList.add("active");
  if (appId === "chatApp") {
    window.renderChatFlow();
    window.scrollChatBottom();
  } else if (appId === "cardsApp") {
    window.renderCards();
    window.renderStickers();
    if (window.renderSbCards) window.renderSbCards();
  } else if (appId === "statsApp") {
    window.renderAnniversaries();
    if (window.renderSurveys) window.renderSurveys();
  } else if (appId === "textsApp") {
    window.renderTexts();
  } else if (appId === "soundApp") {
    window.renderSounds();
  } else if (appId === "groupApp") {
    window.renderGroupMembers();
  }
};

window.closeApp = function(appId) {
  const app = document.getElementById(appId);
  if (app) app.classList.remove("active");
  if (appId === "chatApp" && window.stopAllVoicePlayback) {
    window.stopAllVoicePlayback();
  }
};

// ── UI Synchronization ──
window.syncUI = function() {
  // Theme
  document.documentElement.setAttribute("data-theme", window.cfg.theme || "light");
  if (window.cfg.customBg) {
    document.documentElement.style.setProperty("--bg-base", window.cfg.customBg);
  }

  // Layouts
  const isL2 = window.cfg.layout === 2;
  const h1 = document.getElementById("homeL1");
  const h2 = document.getElementById("homeL2");
  if (h1) h1.style.display = isL2 ? "none" : "block";
  if (h2) h2.style.display = isL2 ? "block" : "none";

  // Docks
  const d1 = document.getElementById("dockL1");
  const d2 = document.getElementById("dockL2");
  if (d1) d1.innerHTML = window.DOCK_HTML;
  if (d2) d2.innerHTML = window.DOCK_HTML;

  // Chat Style
  const chatApp = document.getElementById("chatApp");
  if (chatApp) {
    const s = window.cfg.chatStyle || 1;
    chatApp.setAttribute("data-chat-style", s);
    for (let i = 1; i <= 4; i++) {
      const hd = chatApp.querySelector(`.head-style-${i}`);
      const inp = chatApp.querySelector(`.input-style-${i}`);
      if (hd) hd.classList.toggle("hidden", i !== s);
      if (inp) inp.classList.toggle("hidden", i !== s);
    }
  }

  // Button visibility switches (Voice & Stickers)
  document.querySelectorAll(".chat-input").forEach(inpContainer => {
    inpContainer.classList.toggle("hide-voice-btn", window.cfg.showVoiceBtn === false);
    inpContainer.classList.toggle("hide-sticker-btn", window.cfg.showStickerBtn === false);
  });

  // Settings switches
  const setSw = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("on", !!val);
  };
  setSw("sw_showVoiceBtn", window.cfg.showVoiceBtn !== false);
  setSw("sw_showStickerBtn", window.cfg.showStickerBtn !== false);
  setSw("sw_showAvatar", window.cfg.showAvatar !== false);
  setSw("sw_showName", window.cfg.showName !== false);
  setSw("sw_showSelfName", !!window.cfg.showSelfName);
  setSw("sw_showTime", window.cfg.showTime !== false);
  setSw("sw_showSeconds", !!window.cfg.timeShowSeconds);
  setSw("sw_oppCustomTime", window.cfg.oppCustomTime !== false);
  setSw("sw_showRead", window.cfg.showRead !== false);
  setSw("sw_showSelfRead", !!window.cfg.showSelfRead);
  setSw("sw_ignoreOn", !!window.cfg.ignoreOn);
  setSw("sw_quoteOn", window.cfg.quoteOn !== false);
  setSw("sw_sentenceJoin", window.cfg.sentenceJoin !== false);
  setSw("sw_activeSend", !!window.cfg.activeSend);
  setSw("sw_stickerOn", !!window.cfg.stickerOn);
  setSw("sw_groupMode", !!window.cfg.groupMode);
  setSw("sw_popupOn", window.cfg.popupOn !== false);
  setSw("sw_notifOn", !!window.cfg.notifOn);
  setSw("sw_soundOn", window.cfg.soundOn !== false);
  setSw("sw_autoTTS_adv", !!window.cfg.autoTTS);
  setSw("sw_ttsPersist", !!window.cfg.ttsPersist);
  setSw("sw_hideAesBg", !!window.cfg.hideAesBg);
  setSw("sw_hidePolarBg", !!window.cfg.hidePolarBg);

  // Voice mode label
  const vmLabel = document.getElementById("voiceModeLabel");
  if (vmLabel) {
    vmLabel.textContent = (window.cfg.voiceMode === "stt") ? "实时转文字" : "原语音";
  }

  // Inputs placeholders
  document.querySelectorAll(".msg-in").forEach(inp => {
    inp.placeholder = window.cfg.inputPlaceholder || "发消息…";
  });

  // Render images and texts
  window.syncImgs();
  window.syncTexts();
  window.applyCustomStyles();
};

window.syncImgs = function() {
  document.querySelectorAll("[data-img]").forEach(el => {
    const k = el.getAttribute("data-img");
    const src = window.imgs[k] || window.DEFAULTS.PH_SVG;
    el.setAttribute("src", src);
    if (window.imgs[k]) el.classList.remove("ph");
    else el.classList.add("ph");
  });
};

window.syncTexts = function() {
  document.querySelectorAll(".editable[data-key]").forEach(el => {
    const k = el.getAttribute("data-key");
    const val = window.texts[k] || "";
    el.textContent = val;
  });
};

window.cfgToggle = async function(key) {
  if (window.cfg[key] === undefined) window.cfg[key] = true;
  else window.cfg[key] = !window.cfg[key];
  await window.saveAll();
  window.syncUI();
};

window.cfgSet = async function(key, val) {
  window.cfg[key] = val;
  await window.saveAll();
  window.syncUI();
};

window.setLayout = async function(layoutNum) {
  window.cfg.layout = layoutNum;
  await window.saveAll();
  window.syncUI();
};

window.setChatStyle = async function(styleNum) {
  window.cfg.chatStyle = styleNum;
  await window.saveAll();
  window.syncUI();
};

window.setTheme = async function(t) {
  if (t === "custom") {
    const p = document.getElementById("themeBgPicker");
    if (p) p.click();
    return;
  }
  window.cfg.theme = t;
  window.cfg.customBg = "";
  await window.saveAll();
  window.syncUI();
};

// ── Chat Flow Rendering ──
window.fmtTime = function(dateObj = new Date(), withSec = false) {
  const d = new Date(dateObj);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (withSec || window.cfg.timeShowSeconds) {
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return `${hh}:${mm}`;
};

window.fmtDate = function(dateObj = new Date()) {
  const d = new Date(dateObj);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

window.renderChatFlow = function() {
  const flow = document.getElementById("chatFlow");
  if (!flow) return;
  const list = window.chats || [];

  if (!list.length) {
    flow.innerHTML = `<div class="empty-state" style="padding:40px 20px;text-align:center;color:var(--text-mute);">暂无消息记录</div>`;
    return;
  }

  let lastDate = "";
  let html = "";

  list.forEach((msg, idx) => {
    const msgDate = msg.date || "";
    if (msgDate && msgDate !== lastDate) {
      lastDate = msgDate;
      html += `<div class="date-divider"><span>${msgDate}</span></div>`;
    }

    const isSelf = msg.sender === "self";
    const senderName = isSelf ? (window.texts.l1_name || "我") : (msg.senderName || window.texts.opp_name || "彼");
    const avatarSrc = isSelf ? (window.imgs.selfAvatar || window.DEFAULTS.PH_SVG) : (msg.avatar || window.imgs.oppAvatar || window.DEFAULTS.PH_SVG);

    // Bubble content: text, sticker, or voice
    let bubbleContent = "";
    if (msg.voice) {
      const dur = msg.duration || 1;
      bubbleContent = `
        <div class="voice-bubble" onclick="playVoiceMessage(${idx})">
          <div class="voice-play-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
          </div>
          <div class="voice-waves">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span class="voice-dur">${dur}"</span>
        </div>
      `;
    } else if (msg.sticker) {
      bubbleContent = `<img class="sticker-msg-img" src="${msg.sticker}" alt="表情包">`;
    } else {
      bubbleContent = window.escapeHtml(msg.text || "");
    }

    html += `
      <div class="msg-row ${isSelf ? 'self' : 'opp'}" id="msg-row-${idx}" oncontextmenu="openChatContextMenu(event, ${idx})">
        ${window.cfg.showAvatar !== false ? `
          <div class="msg-av-wrap">
            <img class="msg-av ${avatarSrc === window.DEFAULTS.PH_SVG ? 'ph' : ''}" src="${avatarSrc}">
          </div>
        ` : ''}
        <div class="msg-main">
          ${(isSelf ? window.cfg.showSelfName : window.cfg.showName !== false) ? `
            <div class="msg-name">${window.escapeHtml(senderName)}</div>
          ` : ''}
          ${msg.quote ? `
            <div class="msg-quote-box">
              <span class="mq-from">${window.escapeHtml(msg.quote.from || '')}:</span>
              <span class="mq-text">${window.escapeHtml(msg.quote.text || '')}</span>
            </div>
          ` : ''}
          <div class="msg-bubble">${bubbleContent}</div>
          ${window.cfg.showTime !== false ? `
            <div class="msg-time">${msg.time || ''}</div>
          ` : ''}
        </div>
      </div>
    `;
  });

  flow.innerHTML = html;
};

window.appendNewChats = function() {
  window.renderChatFlow();
  window.scrollChatBottom();
};

window.scrollChatBottom = function() {
  const flow = document.getElementById("chatFlow");
  if (flow) {
    flow.scrollTop = flow.scrollHeight;
  }
};

window.sendMsg = async function() {
  const inputs = document.querySelectorAll(".msg-in");
  let text = "";
  inputs.forEach(inp => {
    if (inp.value && !text) text = inp.value.trim();
    inp.value = "";
  });
  if (!text) return;

  const now = new Date();
  const msgObj = {
    sender: "self",
    text: text,
    time: window.fmtTime(now),
    timeWithSec: window.fmtTime(now, true),
    date: window.fmtDate(now),
    ts: now.getTime()
  };

  if (window.pendingQuote) {
    msgObj.quote = window.pendingQuote;
    window.clearPendingQuote();
  }

  if (!window.chats) window.chats = [];
  window.chats.push(msgObj);
  window.appendNewChats();
  await window.saveChats();

  if (window.cfg.soundOn && window.playSoundById) {
    window.playSoundById(window.cfg.activeSoundId || "__builtin_thud1__");
  }

  // Auto trigger reply if enabled
  if (window.cfg.ignoreOn !== true) {
    window.scheduleAutoReply();
  }
};

window.scheduleAutoReply = function() {
  const minSec = window.cfg.delayMin || 2;
  const maxSec = Math.max(minSec, window.cfg.delayMax || 5);
  const delay = (minSec + Math.random() * (maxSec - minSec)) * 1000;

  clearTimeout(window._autoReplyTimer);
  window._autoReplyTimer = setTimeout(() => {
    window.triggerSpeak();
  }, delay);
};

window.triggerSpeak = async function() {
  // Pull from cards
  const available = (window.cards || []).filter(c => !c.shielded);
  if (!available.length) return;

  const pick = available[Math.floor(Math.random() * available.length)];
  const now = new Date();

  const msgObj = {
    sender: "opp",
    senderName: window.texts.opp_name || "彼",
    text: pick.text,
    time: window.fmtTime(now),
    timeWithSec: window.fmtTime(now, true),
    date: window.fmtDate(now),
    ts: now.getTime()
  };

  if (!window.chats) window.chats = [];
  window.chats.push(msgObj);
  window.appendNewChats();
  await window.saveChats();

  if (window.cfg.soundOn && window.playSoundById) {
    window.playSoundById(window.cfg.activeSoundId || "__builtin_thud1__");
  }

  // If MiniMax TTS auto-reading enabled
  if (window.cfg.autoTTS && window.cfg.ttsKey) {
    window.synthesizeTTS(pick.text);
  }
};

// ── Quotes & Context Menu ──
window.setPendingQuote = function(from, text) {
  window.pendingQuote = { from, text };
  const preview = document.getElementById("quotePreview");
  const qpFrom = document.getElementById("qpFrom");
  const qpText = document.getElementById("qpText");
  if (preview && qpFrom && qpText) {
    qpFrom.textContent = from;
    qpText.textContent = text;
    preview.classList.add("on");
  }
};

window.clearPendingQuote = function() {
  window.pendingQuote = null;
  const preview = document.getElementById("quotePreview");
  if (preview) preview.classList.remove("on");
};

window.openChatContextMenu = function(e, idx) {
  e.preventDefault();
  const ctx = document.getElementById("ctxMenu");
  if (!ctx) return;
  const msg = (window.chats || [])[idx];
  if (!msg) return;

  ctx.style.top = `${Math.min(window.innerHeight - 180, e.clientY)}px`;
  ctx.style.left = `${Math.min(window.innerWidth - 160, e.clientX)}px`;
  ctx.classList.add("on");

  document.getElementById("ctxQuote").onclick = () => {
    ctx.classList.remove("on");
    window.setPendingQuote(msg.sender === "self" ? "我" : (window.texts.opp_name || "彼"), msg.text);
  };
  document.getElementById("ctxTTS").onclick = () => {
    ctx.classList.remove("on");
    if (msg.voice && window.playVoiceMessage) {
      window.playVoiceMessage(idx);
    } else {
      window.synthesizeTTS(msg.text);
    }
  };
  document.getElementById("ctxAddCard").onclick = async () => {
    ctx.classList.remove("on");
    if (!window.cards) window.cards = [];
    window.cards.push({ id: "c_" + Date.now(), text: msg.text, shielded: false });
    await window.saveAll();
    window.toast("已加入字卡库");
  };
  document.getElementById("ctxDel").onclick = async () => {
    ctx.classList.remove("on");
    window.chats.splice(idx, 1);
    await window.saveChats();
    window.renderChatFlow();
  };

  const closeCtx = (evt) => {
    if (!ctx.contains(evt.target)) {
      ctx.classList.remove("on");
      document.removeEventListener("click", closeCtx);
    }
  };
  setTimeout(() => document.addEventListener("click", closeCtx), 50);
};

// ── Sticker System ──
window.toggleStickerPicker = function() {
  const picker = document.getElementById("stickerPicker");
  if (!picker) return;
  picker.classList.toggle("on");
  if (picker.classList.contains("on")) {
    window.renderStickerPickerGrid();
  }
};

window.renderStickerPickerGrid = function() {
  const grid = document.getElementById("spGrid");
  if (!grid) return;
  const list = (window.stickers || []).filter(s => !s.shielded);
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:span 4;padding:20px;text-align:center;font-size:12px;color:var(--text-mute);">暂无可用表情包，请在字卡-表情包中添加</div>`;
    return;
  }
  grid.innerHTML = list.map(st => `
    <div class="sp-item" onclick="sendSticker('${st.url}')">
      <img src="${st.url}">
    </div>
  `).join('');
};

window.sendSticker = async function(url) {
  window.toggleStickerPicker();
  const now = new Date();
  const msgObj = {
    sender: "self",
    sticker: url,
    time: window.fmtTime(now),
    timeWithSec: window.fmtTime(now, true),
    date: window.fmtDate(now),
    ts: now.getTime()
  };
  if (!window.chats) window.chats = [];
  window.chats.push(msgObj);
  window.appendNewChats();
  await window.saveChats();
};

window.gotoStickerLibrary = function() {
  window.toggleStickerPicker();
  window.openApp("cardsApp");
  window.switchCardsTab("stickers");
};

// ── Cards & Stickers Management ──
window.switchCardsTab = function(tab) {
  document.querySelectorAll("#cardsApp .stab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll("#cardsApp .stab-panel").forEach(p => p.classList.toggle("active", p.id === "cstab-" + tab));
};

window.renderCards = function() {
  const deck = document.getElementById("cardDeck");
  if (!deck) return;
  const kw = (document.getElementById("cardSearch")?.value || "").toLowerCase();
  let list = window.cards || [];
  if (kw) list = list.filter(c => (c.text || "").toLowerCase().includes(kw));

  if (!list.length) {
    deck.innerHTML = `<div class="empty-state">暂无字卡，点击右上角加号添加</div>`;
    return;
  }

  deck.innerHTML = list.map((c, i) => `
    <div class="card-item ${c.shielded ? 'shielded' : ''} ${window.selectedCardIds.has(c.id) ? 'selected' : ''}" id="card-${c.id}" onclick="handleCardClick('${c.id}')">
      <div class="ci-text">${window.escapeHtml(c.text)}</div>
      <div class="ci-acts">
        <button class="pill-btn xs" onclick="event.stopPropagation();toggleCardShield('${c.id}')">${c.shielded ? '恢复' : '屏蔽'}</button>
        <button class="pill-btn xs danger" onclick="event.stopPropagation();deleteCard('${c.id}')">×</button>
      </div>
    </div>
  `).join('');
};

window.handleCardClick = function(id) {
  if (!window.batchMode) return;
  if (window.selectedCardIds.has(id)) window.selectedCardIds.delete(id);
  else window.selectedCardIds.add(id);
  window.renderCards();
  window.updateBatchCount();
};

window.headerToggleBatch = function() {
  window.batchMode = !window.batchMode;
  const bar = document.getElementById("batchBar");
  if (bar) bar.classList.toggle("on", window.batchMode);
  window.selectedCardIds.clear();
  window.renderCards();
  window.updateBatchCount();
};

window.updateBatchCount = function() {
  const cnt = document.getElementById("batchCnt");
  if (cnt) cnt.textContent = `已选 ${window.selectedCardIds.size} 项`;
};

window.toggleSelectAllCards = function() {
  if (window.selectedCardIds.size === (window.cards || []).length) {
    window.selectedCardIds.clear();
  } else {
    (window.cards || []).forEach(c => window.selectedCardIds.add(c.id));
  }
  window.renderCards();
  window.updateBatchCount();
};

window.batchShield = async function(shield) {
  (window.cards || []).forEach(c => {
    if (window.selectedCardIds.has(c.id)) c.shielded = shield;
  });
  await window.saveAll();
  window.renderCards();
};

window.batchDelete = async function() {
  if (!confirm(`确定删除选中的 ${window.selectedCardIds.size} 张字卡吗？`)) return;
  window.cards = (window.cards || []).filter(c => !window.selectedCardIds.has(c.id));
  window.selectedCardIds.clear();
  await window.saveAll();
  window.renderCards();
  window.updateBatchCount();
};

window.headerAdd = function() {
  const activeTab = document.querySelector("#cardsApp .stab.active")?.dataset.tab;
  if (activeTab === "stickers") {
    document.getElementById("fpSticker").click();
  } else if (activeTab === "statusbar") {
    if (window.sbAddNewCard) window.sbAddNewCard();
  } else {
    window.modal("新增字卡", `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <textarea class="fld area" id="newCardText" placeholder="输入字卡文本（支持换行一次添加多条）..." style="min-height:100px;"></textarea>
        <button class="pill-btn confirm" onclick="submitNewCards()">添加</button>
      </div>
    `);
  }
};

window.submitNewCards = async function() {
  const area = document.getElementById("newCardText");
  if (!area || !area.value.trim()) return;
  const lines = area.value.split("\n").map(l => l.trim()).filter(Boolean);
  if (!window.cards) window.cards = [];
  lines.forEach(line => {
    window.cards.push({ id: "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), text: line, shielded: false });
  });
  await window.saveAll();
  window.closeModal();
  window.renderCards();
  window.toast(`已添加 ${lines.length} 条字卡`);
};

window.toggleCardShield = async function(id) {
  const c = (window.cards || []).find(x => x.id === id);
  if (c) {
    c.shielded = !c.shielded;
    await window.saveAll();
    window.renderCards();
  }
};

window.deleteCard = async function(id) {
  window.cards = (window.cards || []).filter(x => x.id !== id);
  await window.saveAll();
  window.renderCards();
};

// ── Stickers Tab in CardsApp ──
window.renderStickers = function() {
  const grid = document.getElementById("stickerGrid");
  if (!grid) return;
  const list = window.stickers || [];
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:span 4;padding:40px;text-align:center;color:var(--text-mute);">暂无表情包，点击右上角加号上传</div>`;
    return;
  }
  grid.innerHTML = list.map(st => `
    <div class="sticker-card-item ${st.shielded ? 'shielded' : ''}" onclick="toggleStickerSelect('${st.id}')">
      <img src="${st.url}">
      <button class="pill-btn xs danger st-del" onclick="event.stopPropagation();deleteSticker('${st.id}')">×</button>
    </div>
  `).join('');
};

window.deleteSticker = async function(id) {
  window.stickers = (window.stickers || []).filter(s => s.id !== id);
  await window.saveAll();
  window.renderStickers();
};

// ── Sound Management ──
window.playSoundById = function(id) {
  if (id === "__builtin_thud1__") {
    playSyntheticTone(880, 0.12);
    return;
  }
  if (id === "__builtin_thud2__") {
    playSyntheticTone(1200, 0.08);
    return;
  }
  const snd = (window.customSounds || []).find(s => s.id === id);
  if (snd && snd.url) {
    const a = new Audio(snd.url);
    a.play().catch(() => {});
  }
};

function playSyntheticTone(freq, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

window.testSound = function() {
  window.playSoundById(window.cfg.activeSoundId || "__builtin_thud1__");
};

// ── Texts Management ──
window.renderTexts = function() {
  const deck = document.getElementById("textsDeck");
  if (!deck) return;
  deck.innerHTML = window.TEXT_GROUPS.map(grp => `
    <div class="cfg-group" style="margin-bottom:12px;">
      <div class="cfg-group-label">${grp.h}</div>
      <div class="cfg-group-body" style="padding:10px 14px;display:flex;flex-direction:column;gap:8px;">
        ${grp.keys.map(k => `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span style="font-size:12px;opacity:.7;min-width:60px;">${k.l}</span>
            <input class="fld" style="flex:1;" value="${window.escapeHtml(grp.isCfg ? (window.cfg[k.k]||'') : (window.texts[k.k]||''))}" onchange="updateTextKey('${k.k}', this.value, ${!!grp.isCfg})">
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
};

window.updateTextKey = async function(key, val, isCfg) {
  if (isCfg) window.cfg[key] = val;
  else window.texts[key] = val;
  await window.saveAll();
  window.syncUI();
};

// ── MiniMax TTS Synthesis ──
window.synthesizeTTS = async function(text) {
  if (!text) return;
  const apiKey = window.cfg.ttsKey;
  if (!apiKey) {
    // Native Web Speech fallback
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
    return;
  }
  try {
    const res = await fetch(window.cfg.ttsUrl || "https://api.minimax.chat/v1/t2a_v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: window.cfg.ttsModel || "speech-01-turbo",
        text: text,
        voice_setting: {
          voice_id: window.cfg.ttsVoice || "male-qn-qingse",
          speed: window.cfg.ttsSpeed || 1.0,
          vol: window.cfg.ttsVol || 1.0
        }
      })
    });
    const data = await res.json();
    if (data && data.audio_file) {
      const audio = new Audio("data:audio/mp3;base64," + data.audio_file);
      audio.play();
    }
  } catch (err) {
    console.warn("TTS fetch error:", err);
  }
};

window.testMiniMaxTTS = function() {
  const t = document.getElementById("cfg_ttsTestText")?.value || "你好，很高兴遇见你。";
  window.synthesizeTTS(t);
};

// ── Custom Styles / CSS Hub ──
window.applyCustomStyles = function() {
  const fontTag = document.getElementById("user-font");
  const bubTag = document.getElementById("user-bubble");
  const chatTag = document.getElementById("user-chat-css");
  const homeTag = document.getElementById("user-home-css");

  if (fontTag) fontTag.textContent = window.cfg.customFontRaw || (window.cfg.customFontUrl ? `@import url('${window.cfg.customFontUrl}'); body, button, input { font-family: inherit; }` : "");
  if (bubTag) bubTag.textContent = window.cfg.customBubble || "";
  if (chatTag) chatTag.textContent = window.cfg.customChatCss || "";
  if (homeTag) homeTag.textContent = window.cfg.customHomeCss || "";
};

window.openCssHub = function() {
  window.openApp("cssHubApp");
  document.getElementById("ch_fontUrl").value = window.cfg.customFontUrl || "";
  document.getElementById("ch_fontRaw").value = window.cfg.customFontRaw || "";
  document.getElementById("ch_bubbleCss").value = window.cfg.customBubble || "";
  document.getElementById("ch_chatCss").value = window.cfg.customChatCss || "";
  document.getElementById("ch_homeCss").value = window.cfg.customHomeCss || "";
  document.getElementById("ch_homeJs").value = window.cfg.customHomeJs || "";
};

window.applyCssHub = async function() {
  window.cfg.customFontUrl = document.getElementById("ch_fontUrl").value.trim();
  window.cfg.customFontRaw = document.getElementById("ch_fontRaw").value;
  window.cfg.customBubble = document.getElementById("ch_bubbleCss").value;
  window.cfg.customChatCss = document.getElementById("ch_chatCss").value;
  window.cfg.customHomeCss = document.getElementById("ch_homeCss").value;
  window.cfg.customHomeJs = document.getElementById("ch_homeJs").value;
  await window.saveAll();
  window.applyCustomStyles();
  window.closeApp("cssHubApp");
  window.toast("自定义样式已应用");
};

// ── Image Uploading helper ──
window.uploadImg = function(key) {
  const fp = document.getElementById("fpImg");
  if (!fp) return;
  fp.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      window.imgs[key] = reader.result;
      await window.saveAll();
      window.syncImgs();
    };
    reader.readAsDataURL(file);
  };
  fp.click();
};

// ── File Upload Listeners ──
function initFileUploaders() {
  const fpSticker = document.getElementById("fpSticker");
  if (fpSticker) {
    fpSticker.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        const url = await fileToBase64(f);
        if (!window.stickers) window.stickers = [];
        window.stickers.push({ id: "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), url });
      }
      await window.saveAll();
      window.renderStickers();
      window.toast(`已导入 ${files.length} 个表情包`);
    };
  }
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ── Editable Inline Texts ──
function initInlineEditing() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".editable[data-key]");
    if (!el) return;
    const k = el.getAttribute("data-key");
    const oldVal = window.texts[k] || "";
    const newVal = prompt(`修改文案 [${k}]:`, oldVal);
    if (newVal !== null) {
      window.texts[k] = newVal;
      window.saveAll();
      window.syncTexts();
    }
  });
}

// ── Anniversary ──
window.renderAnniversaries = function() {
  const main = document.getElementById("anniDaysMain");
  if (main) {
    const a1 = (window.anniversaries && window.anniversaries[0]) || null;
    if (a1 && a1.date) {
      const diff = Math.floor((Date.now() - new Date(a1.date).getTime()) / (1000 * 60 * 60 * 24));
      main.textContent = Math.max(0, diff);
    }
  }
};

window.openAnniEdit = function() {
  const a1 = (window.anniversaries && window.anniversaries[0]) || { title: "相识", date: new Date().toISOString().slice(0, 10) };
  window.modal("纪念日设置", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="fld-label">纪念词</div>
      <input class="fld" id="anniTitle" value="${window.escapeHtml(a1.title)}">
      <div class="fld-label">起始日期</div>
      <input class="fld" type="date" id="anniDate" value="${a1.date}">
      <button class="pill-btn confirm" onclick="saveAnni()">保存</button>
    </div>
  `);
};

window.saveAnni = async function() {
  const t = document.getElementById("anniTitle")?.value || "纪念日";
  const d = document.getElementById("anniDate")?.value || new Date().toISOString().slice(0, 10);
  window.anniversaries = [{ id: "a1", title: t, date: d, mode: "since" }];
  window.texts.anni_label = t;
  await window.saveAll();
  window.closeModal();
  window.renderAnniversaries();
  window.syncTexts();
};

// ── Updates and Notes ──
window.showUpdateLog = function() {
  const logs = window.UPDATE_LOG || [];
  const html = logs.map(l => `
    <div style="margin-bottom:14px;">
      <div style="font-weight:600;font-size:13px;margin-bottom:4px;color:var(--accent);">v${l.v} 更新</div>
      <ul style="padding-left:18px;font-size:12px;line-height:1.6;opacity:.8;">
        ${l.items.map(it => `<li>${window.escapeHtml(it)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
  window.modal("更新公告", html);
};

window.showAuthorNote = function() {
  const links = window.AUTHOR_LINKS || [];
  const html = `
    <div style="font-size:12px;line-height:1.7;margin-bottom:14px;">
      感谢每一次相遇与使用。这里是其他作品与链接：
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${links.map(lk => `
        <a href="${lk.u}" target="_blank" style="padding:10px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:8px;text-decoration:none;color:inherit;">
          <div style="font-weight:600;font-size:13px;">${window.escapeHtml(lk.n)}</div>
          <div style="font-size:11px;opacity:.7;margin-top:2px;">${window.escapeHtml(lk.d)}</div>
        </a>
      `).join('')}
    </div>
  `;
  window.modal("作者碎碎念", html);
};

// ── Clear / Factory Reset ──
window.clearAllChats = async function() {
  if (!confirm("确定清空全部聊天记录吗？此操作无法撤销。")) return;
  window.chats = [];
  await window.saveChats();
  window.renderChatFlow();
  window.toast("聊天记录已清空");
};

window.factoryReset = async function() {
  if (!confirm("确定要恢复出厂设置吗？所有配置与内容将被重置。")) return;
  localStorage.clear();
  if (db) {
    const tx = db.transaction("store", "readwrite");
    tx.objectStore("store").clear();
  }
  window.location.reload();
};

// ── Welcome Screen Animation & Auto-Dismiss ──
window.initWelcomeScreen = function() {
  const welcome = document.getElementById("welcome");
  if (!welcome) return;

  // 1. Render Typography Stage (幸逢)
  const stage = document.getElementById("wTypoStage");
  if (stage && !stage.innerHTML.trim()) {
    stage.innerHTML = `
      <div class="w-char-row" style="font-size:clamp(36px,10vw,52px);font-weight:300;letter-spacing:clamp(8px,2.5vw,16px);margin-bottom:8px;">
        <span class="w-char grad revealed" style="--char-delay:0.1s;--char-dur:1s;">幸</span>
        <span class="w-char grad revealed" style="--char-delay:0.35s;--char-dur:1s;">逢</span>
      </div>
      <div class="w-hairline"></div>
      <div class="w-seal"></div>
    `;
  }

  // 2. Render Subtitle
  const wText = document.getElementById("wText");
  if (wText) {
    wText.textContent = window.cfg.welcomeText || "幸逢于此 · 别来无恙";
  }

  // 3. Canvas Ambient Particles
  const canvas = document.getElementById("wCanvas");
  let animId = null;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = canvas.width = welcome.clientWidth || window.innerWidth || 390;
    let height = canvas.height = welcome.clientHeight || window.innerHeight || 844;

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.35 - 0.1,
      alpha: Math.random() * 0.6 + 0.2
    }));

    function draw() {
      if (!welcome || welcome.classList.contains("gone")) return;
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.getAttribute("data-theme") === "dark" || !document.documentElement.getAttribute("data-theme");
      const color = isDark ? "255,255,255" : "30,25,20";

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", () => {
      if (welcome && canvas) {
        width = canvas.width = welcome.clientWidth || window.innerWidth || 390;
        height = canvas.height = welcome.clientHeight || window.innerHeight || 844;
      }
    });
  }

  // 4. Dismiss Handling (Click anywhere or Auto-fade after 2.4s)
  let dismissed = false;
  window.dismissWelcome = function() {
    if (dismissed) return;
    dismissed = true;
    if (animId) cancelAnimationFrame(animId);
    welcome.classList.add("gone");
    setTimeout(() => {
      welcome.style.display = "none";
    }, 1200);
  };

  welcome.addEventListener("click", window.dismissWelcome);
  welcome.addEventListener("touchstart", window.dismissWelcome, { passive: true });

  // Auto-dismiss after 2.4 seconds so the user is never stuck
  setTimeout(() => {
    window.dismissWelcome();
  }, 2400);
};

// ── Entry Initialization ──
window.addEventListener("DOMContentLoaded", async () => {
  await window.loadAll();
  window.initWelcomeScreen();
  if (window.initVoiceSystem) window.initVoiceSystem();
  if (window.initStatusbarSystem) window.initStatusbarSystem();
  initFileUploaders();
  initInlineEditing();
  window.syncUI();
});
