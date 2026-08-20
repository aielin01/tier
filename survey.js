"use strict";

window.curSurveyFill = null;

window.renderSurveys = function() {
  const deck = document.getElementById("surveyDeck");
  if (!deck) return;
  const list = window.surveys || [];
  if (!list.length) {
    deck.innerHTML = `<div class="empty-state">暂无问卷，可点击上方新建或导入</div>`;
    return;
  }
  deck.innerHTML = list.map((s, idx) => {
    const records = (window.surveyRecords || []).filter(r => r.surveyId === s.id);
    return `
      <div class="survey-card" id="survey-card-${s.id}">
        <div class="sc-head">
          <div class="sc-title">${window.escapeHtml(s.title || "未命名问卷")}</div>
          <div class="sc-acts">
            <button class="pill-btn xs" onclick="fillSurvey('${s.id}')">填写</button>
            <button class="pill-btn xs" onclick="openSurveyEdit('${s.id}')">编辑</button>
            <button class="pill-btn xs" onclick="exportSurvey('${s.id}')">导出</button>
            ${!s.builtin ? `<button class="pill-btn xs danger" onclick="deleteSurvey('${s.id}')">删除</button>` : ''}
          </div>
        </div>
        <div class="sc-meta">共 ${(s.questions||[]).length} 题 · 已填写 ${records.length} 次</div>
        ${records.length > 0 ? `
          <div class="sc-records">
            ${records.slice(-3).reverse().map(r => `
              <div class="sc-rec-item" onclick="viewSurveyRecord('${r.id}')">
                <span>${r.date || '未知时间'}</span>
                <span>查看详情 ›</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};

window.openNewSurvey = function() {
  const newS = {
    id: "survey_" + Date.now(),
    title: "新建问卷",
    questions: [
      { text: "问题 1", options: ["接受", "中立", "拒绝"], needComment: true }
    ]
  };
  if (!window.surveys) window.surveys = [];
  window.surveys.push(newS);
  if (window.saveAll) window.saveAll();
  window.renderSurveys();
  window.openSurveyEdit(newS.id);
};

window.openSurveyEdit = function(id) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (!s) return;
  const qHtml = (s.questions || []).map((q, i) => `
    <div class="sq-edit-row" style="padding:8px 0;border-bottom:1px solid var(--border-color);">
      <div style="display:flex;gap:6px;margin-bottom:4px;">
        <span style="font-size:12px;opacity:.6;">${i+1}.</span>
        <input class="fld" style="flex:1;" value="${window.escapeHtml(q.text)}" onchange="updateSurveyQuestion('${id}',${i},'text',this.value)">
        <button class="pill-btn xs danger" onclick="removeSurveyQuestion('${id}',${i})">×</button>
      </div>
      <div style="display:flex;gap:6px;align-items:center;font-size:11px;">
        <span style="opacity:.6;">选项:</span>
        <input class="fld" style="flex:1;font-size:11px;" value="${window.escapeHtml((q.options||[]).join(','))}" onchange="updateSurveyQuestion('${id}',${i},'options',this.value.split(','))">
        <label style="display:flex;align-items:center;gap:3px;"><input type="checkbox" ${q.needComment?'checked':''} onchange="updateSurveyQuestion('${id}',${i},'needComment',this.checked)">备注</label>
      </div>
    </div>
  `).join('');

  if (window.modal) {
    window.modal("编辑问卷", `
      <div style="display:flex;flex-direction:column;gap:10px;max-height:65vh;overflow-y:auto;">
        <div class="fld-label">问卷标题</div>
        <input class="fld" value="${window.escapeHtml(s.title)}" onchange="updateSurveyTitle('${id}',this.value)">
        <div class="fld-label" style="display:flex;justify-content:space-between;">
          <span>问题列表</span>
          <span style="cursor:pointer;color:var(--accent);" onclick="addSurveyQuestion('${id}')">+ 加题</span>
        </div>
        <div id="surveyQList">${qHtml}</div>
      </div>
    `);
  }
};

window.updateSurveyTitle = async function(id, val) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (s) { s.title = val; if (window.saveAll) await window.saveAll(); window.renderSurveys(); }
};

window.updateSurveyQuestion = async function(id, qIdx, field, val) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (s && s.questions && s.questions[qIdx]) {
    s.questions[qIdx][field] = val;
    if (window.saveAll) await window.saveAll();
  }
};

window.addSurveyQuestion = async function(id) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (s) {
    if (!s.questions) s.questions = [];
    s.questions.push({ text: "新问题", options: ["接受", "中立", "拒绝"], needComment: true });
    if (window.saveAll) await window.saveAll();
    window.openSurveyEdit(id);
  }
};

window.removeSurveyQuestion = async function(id, qIdx) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (s && s.questions) {
    s.questions.splice(qIdx, 1);
    if (window.saveAll) await window.saveAll();
    window.openSurveyEdit(id);
  }
};

window.deleteSurvey = async function(id) {
  if (!confirm("确定删除此问卷吗？")) return;
  window.surveys = (window.surveys || []).filter(x => x.id !== id);
  window.surveyRecords = (window.surveyRecords || []).filter(x => x.surveyId !== id);
  if (window.saveAll) await window.saveAll();
  window.renderSurveys();
};

window.fillSurvey = function(id) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (!s) return;
  window.curSurveyFill = { surveyId: id, answers: (s.questions || []).map(() => ({ opt: "", note: "" })) };

  const full = document.getElementById("surveyFull");
  const fullTitle = document.getElementById("sfFullTitle");
  const fullBody = document.getElementById("sfFullBody");

  if (!full || !fullTitle || !fullBody) return;
  fullTitle.textContent = s.title;

  fullBody.innerHTML = `
    <div style="padding:16px;max-width:540px;margin:0 auto;">
      ${(s.questions || []).map((q, idx) => `
        <div class="sf-q-box" style="margin-bottom:20px;padding:14px;background:var(--card-bg, rgba(255,255,255,.6));border-radius:12px;border:1px solid var(--border-color);">
          <div style="font-weight:600;font-size:14px;margin-bottom:10px;">${idx+1}. ${window.escapeHtml(q.text)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            ${(q.options || []).map(opt => `
              <button class="pill-btn sm survey-opt-btn" data-qid="${idx}" data-opt="${window.escapeHtml(opt)}" onclick="chooseSurveyOpt(${idx}, '${window.escapeHtml(opt)}')">
                ${window.escapeHtml(opt)}
              </button>
            `).join('')}
          </div>
          ${q.needComment ? `
            <input class="fld" placeholder="备注..." style="font-size:12px;" onchange="window.curSurveyFill.answers[${idx}].note=this.value">
          ` : ''}
        </div>
      `).join('')}
      <button class="pill-btn confirm" style="width:100%;margin-top:10px;padding:12px;" onclick="submitSurveyFill()">提交问卷</button>
    </div>
  `;

  full.classList.add("on");
};

window.chooseSurveyOpt = function(qIdx, opt) {
  if (!window.curSurveyFill || !window.curSurveyFill.answers[qIdx]) return;
  window.curSurveyFill.answers[qIdx].opt = opt;
  document.querySelectorAll(`.survey-opt-btn[data-qid="${qIdx}"]`).forEach(btn => {
    btn.classList.toggle("confirm", btn.getAttribute("data-opt") === opt);
  });
};

window.submitSurveyFill = async function() {
  if (!window.curSurveyFill) return;
  const s = (window.surveys || []).find(x => x.id === window.curSurveyFill.surveyId);
  const rec = {
    id: "rec_" + Date.now(),
    surveyId: window.curSurveyFill.surveyId,
    title: s ? s.title : "问卷记录",
    date: new Date().toLocaleString(),
    answers: window.curSurveyFill.answers
  };
  if (!window.surveyRecords) window.surveyRecords = [];
  window.surveyRecords.push(rec);
  if (window.saveAll) await window.saveAll();
  window.closeSurveyFull();
  window.renderSurveys();
  if (window.toast) window.toast("问卷提交成功");
};

window.closeSurveyFull = function() {
  const full = document.getElementById("surveyFull");
  if (full) full.classList.remove("on");
  window.curSurveyFill = null;
};

window.viewSurveyRecord = function(recId) {
  const rec = (window.surveyRecords || []).find(r => r.id === recId);
  if (!rec) return;
  const s = (window.surveys || []).find(x => x.id === rec.surveyId);

  const html = `
    <div style="max-height:65vh;overflow-y:auto;">
      <div style="font-size:12px;opacity:.6;margin-bottom:10px;">提交时间：${rec.date}</div>
      ${(rec.answers || []).map((ans, idx) => {
        const qText = s && s.questions && s.questions[idx] ? s.questions[idx].text : `问题 ${idx+1}`;
        return `
          <div style="padding:8px 0;border-bottom:1px solid var(--border-color);">
            <div style="font-size:13px;font-weight:500;">${idx+1}. ${window.escapeHtml(qText)}</div>
            <div style="font-size:12px;color:var(--accent);margin-top:2px;">选择：${window.escapeHtml(ans.opt || "未选")}</div>
            ${ans.note ? `<div style="font-size:11px;opacity:.7;margin-top:2px;">备注：${window.escapeHtml(ans.note)}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  if (window.modal) window.modal(rec.title || "问卷记录", html);
};

window.exportSurvey = function(id) {
  const s = (window.surveys || []).find(x => x.id === id);
  if (!s) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(s, null, 2));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download = (s.title || "survey") + ".json";
  a.click();
};
