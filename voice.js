"use strict";
/* 幸逢 · 我方语音与实时语音转文字系统 voice.js */

let voiceMediaRecorder = null;
let voiceAudioChunks = [];
let voiceRecordStartTime = 0;
let voiceRecordTimer = null;
let voiceSpeechRecognition = null;
let isVoiceRecording = false;
let currentPlayingVoiceAudio = null;
let currentPlayingVoiceIdx = -1;

window.initVoiceSystem = function() {
  // Check SpeechRecognition support
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

// ── 播放 / 暂停语音消息 ──
window.playVoiceMessage = function(idx) {
  const msg = (window.chats && window.chats[idx]) || null;
  if (!msg || !msg.voiceData) return;

  const bubbleEl = document.querySelector(`#msg-row-${idx} .voice-bubble`);

  // If already playing this one, toggle pause/stop
  if (currentPlayingVoiceIdx === idx && currentPlayingVoiceAudio) {
    if (!currentPlayingVoiceAudio.paused) {
      currentPlayingVoiceAudio.pause();
      if (bubbleEl) bubbleEl.classList.remove("playing");
      currentPlayingVoiceIdx = -1;
      return;
    }
  }

  // Stop previous playing audio
  window.stopAllVoicePlayback();

  try {
    const audio = new Audio(msg.voiceData);
    currentPlayingVoiceAudio = audio;
    currentPlayingVoiceIdx = idx;

    if (bubbleEl) bubbleEl.classList.add("playing");

    audio.onended = () => {
      if (bubbleEl) bubbleEl.classList.remove("playing");
      currentPlayingVoiceIdx = -1;
      currentPlayingVoiceAudio = null;
    };
    audio.onerror = () => {
      if (bubbleEl) bubbleEl.classList.remove("playing");
      currentPlayingVoiceIdx = -1;
      currentPlayingVoiceAudio = null;
      if (window.toast) window.toast("语音播放失败", "warn");
    };

    audio.play().catch(() => {
      if (bubbleEl) bubbleEl.classList.remove("playing");
      currentPlayingVoiceIdx = -1;
      currentPlayingVoiceAudio = null;
    });
  } catch (err) {
    console.warn(err);
  }
};

window.stopAllVoicePlayback = function() {
  if (currentPlayingVoiceAudio) {
    try {
      currentPlayingVoiceAudio.pause();
      currentPlayingVoiceAudio.currentTime = 0;
    } catch (e) {}
    currentPlayingVoiceAudio = null;
  }
  document.querySelectorAll(".voice-bubble.playing").forEach(el => el.classList.remove("playing"));
  currentPlayingVoiceIdx = -1;
};

// ── 录音 / 语音输入触发 ──
window.handleVoiceButtonTap = async function() {
  if (isVoiceRecording) {
    window.stopVoiceRecording(true);
    return;
  }
  const mode = (window.cfg && window.cfg.voiceMode) || "audio";
  if (mode === "stt") {
    window.startSpeechToText();
  } else {
    window.startVoiceRecording();
  }
};

// ── 录制原语音 (MediaRecorder) ──
window.startVoiceRecording = async function() {
  if (isVoiceRecording) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (window.toast) window.toast("当前浏览器环境不支持麦克风录音", "warn");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceAudioChunks = [];
    
    // Choose optimal mimeType
    let mimeType = "";
    if (typeof MediaRecorder.isTypeSupported === "function") {
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) mimeType = "audio/ogg;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
    }

    voiceMediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    voiceMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) voiceAudioChunks.push(e.data);
    };

    voiceMediaRecorder.onstop = async () => {
      const tracks = stream.getTracks();
      tracks.forEach(t => t.stop());

      if (window._voiceCancelled) {
        window._voiceCancelled = false;
        voiceAudioChunks = [];
        return;
      }

      const recordedType = voiceMediaRecorder.mimeType || "audio/webm";
      const blob = new Blob(voiceAudioChunks, { type: recordedType });
      const durationSec = Math.max(1, Math.round((Date.now() - voiceRecordStartTime) / 1000));

      if (blob.size < 200 || durationSec < 1) {
        if (window.toast) window.toast("说话时间太短了", "warn");
        return;
      }

      // Convert to Base64 data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        await window.sendVoiceMessage(base64Data, durationSec);
      };
      reader.readAsDataURL(blob);
    };

    voiceMediaRecorder.start(100);
    voiceRecordStartTime = Date.now();
    isVoiceRecording = true;
    window._voiceCancelled = false;

    updateVoiceUI(true, "原语音录制中", true);
    startVoiceTimer();
  } catch (err) {
    console.error("Mic error:", err);
    if (window.toast) window.toast("麦克风权限未开启或设备受限", "warn");
  }
};

// ── 实时转换文字 (Web Speech API) ──
window.startSpeechToText = function() {
  if (isVoiceRecording) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    // Fallback: notice and offer to record audio directly
    if (window.toast) window.toast("浏览器不支持实时听写，已切换原语音录制", "warn");
    window.startVoiceRecording();
    return;
  }

  try {
    voiceSpeechRecognition = new SpeechRecognition();
    voiceSpeechRecognition.lang = "zh-CN";
    voiceSpeechRecognition.continuous = true;
    voiceSpeechRecognition.interimResults = true;

    let finalTranscript = "";
    const activeInp = window.getActiveInput ? window.getActiveInput() : document.querySelector(".msg-in");
    const initialText = activeInp ? activeInp.value : "";

    voiceSpeechRecognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const combined = (initialText ? initialText + " " : "") + (finalTranscript || interim);
      document.querySelectorAll(".msg-in").forEach(el => {
        el.value = combined;
      });
      const recTextEl = document.getElementById("voiceRecText");
      if (recTextEl) recTextEl.textContent = (finalTranscript || interim || "正在倾听...") + " ...";
    };

    voiceSpeechRecognition.onerror = (e) => {
      console.warn("STT Error:", e);
      if (e.error === "not-allowed") {
        if (window.toast) window.toast("麦克风权限未开启", "warn");
      }
      window.stopVoiceRecording(false);
    };

    voiceSpeechRecognition.onend = () => {
      if (isVoiceRecording) {
        window.stopVoiceRecording(true);
      }
    };

    voiceSpeechRecognition.start();
    isVoiceRecording = true;
    voiceRecordStartTime = Date.now();
    updateVoiceUI(true, "语音识别中，请说话...", false);
    startVoiceTimer();
  } catch (err) {
    console.error("STT init error:", err);
    window.startVoiceRecording();
  }
};

function startVoiceTimer() {
  if (voiceRecordTimer) clearInterval(voiceRecordTimer);
  voiceRecordTimer = setInterval(() => {
    if (!isVoiceRecording) {
      clearInterval(voiceRecordTimer);
      return;
    }
    const sec = Math.floor((Date.now() - voiceRecordStartTime) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    const timeDisp = document.getElementById("voiceRecTime");
    if (timeDisp) timeDisp.textContent = `${mm}:${ss}`;

    // Auto stop if reaches 60s
    if (sec >= 60) {
      window.stopVoiceRecording(true);
    }
  }, 500);
}

window.stopVoiceRecording = function(send = true) {
  if (!isVoiceRecording) return;
  isVoiceRecording = false;
  clearInterval(voiceRecordTimer);
  voiceRecordTimer = null;

  if (!send) window._voiceCancelled = true;

  if (voiceMediaRecorder && voiceMediaRecorder.state !== "inactive") {
    try { voiceMediaRecorder.stop(); } catch (e) {}
  }
  if (voiceSpeechRecognition) {
    try { voiceSpeechRecognition.stop(); } catch (e) {}
    voiceSpeechRecognition = null;
  }

  updateVoiceUI(false);
};

window.cancelVoiceRecording = function() {
  window._voiceCancelled = true;
  window.stopVoiceRecording(false);
  if (window.toast) window.toast("已取消语音录制");
};

function updateVoiceUI(recording, labelText = "录音中", isAudio = true) {
  const overlay = document.getElementById("voiceRecOverlay");
  const recText = document.getElementById("voiceRecText");
  const recTime = document.getElementById("voiceRecTime");

  if (overlay) {
    overlay.classList.toggle("on", recording);
    if (recText) recText.textContent = labelText;
    if (recTime && recording) recTime.textContent = "00:00";
  }

  document.querySelectorAll(".in-btn.voice, .i2-voice-btn, .i3-send.voice, .i4-send.voice").forEach(btn => {
    btn.classList.toggle("recording", recording);
  });
}

// ── 发送原语音消息 ──
window.sendVoiceMessage = async function(base64Audio, durationSec) {
  const now = new Date();
  const fmtTime = window.fmtTime ? window.fmtTime(now) : now.toTimeString().slice(0, 5);
  const fmtTimeWithSec = window.fmtTime ? window.fmtTime(now, true) : now.toTimeString().slice(0, 8);
  const fmtDate = window.fmtDate ? window.fmtDate(now) : now.toISOString().slice(0, 10);

  const msgObj = {
    sender: "self",
    text: `[语音 ${durationSec}"]`,
    voice: true,
    voiceData: base64Audio,
    duration: durationSec,
    time: fmtTime,
    timeWithSec: fmtTimeWithSec,
    date: fmtDate,
    ts: now.getTime()
  };

  if (window.pendingQuote) msgObj.quote = window.pendingQuote;
  if (window.chats) window.chats.push(msgObj);
  if (window.clearPendingQuote) window.clearPendingQuote();

  if (window.cfg && window.cfg.soundOn && window.playSoundById) {
    window.playSoundById(window.cfg.activeSoundId || "__builtin_thud1__");
  }
  if (navigator.vibrate) navigator.vibrate(18);

  if (window.appendNewChats) window.appendNewChats();
  if (window.saveChats) await window.saveChats();
};

// ── 语音模式快速切换弹窗 ──
window.openVoiceModeSwitcher = function() {
  const curMode = (window.cfg && window.cfg.voiceMode) || "audio";
  if (window.modal) {
    window.modal("我方语音模式", `
      <div class="fld-tip" style="margin-bottom:12px;">选择点击语音按钮时的默认行为：</div>
      <div class="pill-btn-group" style="gap:8px;">
        <button class="pill-btn ${curMode==='audio'?'confirm':''}" onclick="setVoiceMode('audio')">
          原语音录制发送（带声波气泡播放）${curMode==='audio'?' ✓':''}
        </button>
        <button class="pill-btn ${curMode==='stt'?'confirm':''}" onclick="setVoiceMode('stt')">
          实时转换文字（边说边转为文字）${curMode==='stt'?' ✓':''}
        </button>
      </div>
    `);
  }
};

window.setVoiceMode = async function(mode) {
  if (window.cfg) window.cfg.voiceMode = mode;
  if (window.saveAll) await window.saveAll();
  if (window.closeModal) window.closeModal();
  if (window.syncUI) window.syncUI();
  if (window.toast) window.toast(mode === "audio" ? "已设为：原语音发送" : "已设为：实时转换文字");
};
