// ============================================
// pages/conj.js — 动词变位练习（4 时态）
// ============================================

import { router } from '../router.js';
import { ALL_VERBS } from '../data/conj-data.js';

const TENSES = [
  { id: 'presente', label: '现在时', cn: 'Presente do Indicativo' },
  { id: 'imperfeito', label: '过去未完成', cn: 'Pretérito Imperfeito' },
  { id: 'perfeito', label: '过去完成', cn: 'Pretérito Perfeito' },
  { id: 'futuro', label: '将来时', cn: 'Futuro do Indicativo' },
];

// 常用动词（变位表页面显示）
const COMMON_VERBS = ['ser','estar','ter','ir','fazer','querer','poder','falar','comer','viver','beber','aprender'];
const VERBS = ALL_VERBS;

const PRONOUNS = [
  { pt: 'eu', cn: '我', idx: 0 },
  { pt: 'tu', cn: '你', idx: 1 },
  { pt: 'ele/ela', cn: '他/她', idx: 2 },
  { pt: 'nós', cn: '我们', idx: 3 },
  { pt: 'vós', cn: '你们', idx: 4 },
  { pt: 'eles/elas', cn: '他们', idx: 5 },
];

let quizList = [];
let quizIdx = 0;
let score = 0;
let tableVerb = null;
let tableTense = 'presente';

function buildQuiz() {
  const verbs = Object.keys(VERBS);
  quizList = [];
  for (let i = 0; i < 10; i++) {
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const t = TENSES[Math.floor(Math.random() * TENSES.length)];
    const p = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
    const correct = VERBS[v].tenses[t.id][p.idx];

    // 收集该动词所有时态的所有人称变位，去重
    const allForms = [];
    for (const tid of Object.keys(VERBS[v].tenses)) {
      for (let pi = 0; pi < 6; pi++) {
        const form = VERBS[v].tenses[tid][pi];
        if (!allForms.includes(form)) allForms.push(form);
      }
    }

    // 干扰项：从同一动词的其他变位中选
    const others = allForms.filter(f => f !== correct);
    const distractors = [];
    let guard = 0;
    while (distractors.length < 3 && guard < 50 && others.length > 0) {
      guard++;
      const d = others[Math.floor(Math.random() * others.length)];
      if (!distractors.includes(d)) distractors.push(d);
    }

    // 不够3个时，从其他动词补
    if (distractors.length < 3) {
      const otherVerbs = verbs.filter(x => x !== v);
      while (distractors.length < 3 && guard < 100) {
        guard++;
        const ov = otherVerbs[Math.floor(Math.random() * otherVerbs.length)];
        const ot = TENSES[Math.floor(Math.random() * TENSES.length)];
        const op = Math.floor(Math.random() * 6);
        const d = VERBS[ov].tenses[ot.id][op];
        if (d !== correct && !distractors.includes(d)) distractors.push(d);
      }
    }

    const opts = [correct, ...distractors].sort(() => 0.5 - Math.random());
    quizList.push({ verb: v, verbCn: VERBS[v].cn, tense: t, pronoun: p, correct, opts, ans: opts.indexOf(correct) });
  }
  quizIdx = 0;
  score = 0;
}

export function render() {
  const app = document.getElementById('app');
  if (tableVerb) renderTable(app);
  else if (quizList.length === 0) renderHome(app);
  else renderQuiz(app);
}

function renderHome(app) {
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="router.navigate('/')" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0">🔄 动词变位</h1>
      </div>
      <p style="color:var(--c-muted); margin:0 0 20px">${Object.keys(VERBS).length} 个动词 · 4 个时态 · 六人称变位表与随机练习。</p>

      <button class="btn btn--primary btn--block" style="margin-bottom:20px" onclick="window.__startConjQuiz()">🚀 开始变位练习（10 题）</button>

      <div style="font-weight:600; margin-bottom:12px">📋 常用动词变位表</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
        ${COMMON_VERBS.filter(v => VERBS[v]).map(v => `
          <div class="card" style="padding:12px; cursor:pointer; text-align:center" onclick="window.__showTable('${v}')">
            <div style="font-weight:600">${v}</div>
            <div style="font-size:12px; color:var(--c-muted)">${VERBS[v].cn}</div>
          </div>
        `).join('')}
      </div>

      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/grammar')">语法</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;
  window.__startConjQuiz = () => { buildQuiz(); render(); };
  window.__showTable = (v) => { tableVerb = v; tableTense = 'presente'; render(); };
}

function renderTable(app) {
  const v = tableVerb;
  const data = VERBS[v];
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backConjHome()" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0; font-size:20px">${v} <span style="color:var(--c-muted); font-size:14px; font-weight:400">${data.cn}</span></h1>
      </div>

      <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap">
        ${TENSES.map(t => `
          <button class="btn ${t.id === tableTense ? 'btn--primary' : 'btn--ghost'}" style="padding:8px 14px; font-size:13px" onclick="window.__setTense('${t.id}')">${t.label}</button>
        `).join('')}
      </div>

      <div class="card" style="padding:0; overflow:hidden">
        <table style="width:100%; border-collapse:collapse; font-size:15px">
          <thead>
            <tr style="background:var(--c-brand-soft)">
              <th style="padding:12px; text-align:left">代词</th>
              <th style="padding:12px; text-align:left">变位</th>
            </tr>
          </thead>
          <tbody>
            ${PRONOUNS.map((p,i) => `
              <tr style="border-top:1px solid var(--c-border)">
                <td style="padding:12px; color:var(--c-muted)">${p.pt} <small>(${p.cn})</small></td>
                <td style="padding:12px; font-weight:600">${data.tenses[tableTense][i]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:12px; font-size:13px; color:var(--c-muted)">${TENSES.find(t=>t.id===tableTense).cn}</div>

      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/grammar')">语法</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;
  window.__backConjHome = () => { tableVerb = null; render(); };
  window.__setTense = (tid) => { tableTense = tid; render(); };
}

function renderQuiz(app) {
  const q = quizList[quizIdx];
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backConjHome()" style="padding:8px 12px">← 退出</button>
        <h1 style="margin:0; font-size:18px">变位练习 ${quizIdx+1}/${quizList.length}</h1>
      </div>

      <div class="card" style="padding:24px; text-align:center; margin-bottom:16px">
        <div style="font-size:13px; color:var(--c-brand); margin-bottom:8px; font-weight:600">${q.tense.label} · ${q.tense.cn}</div>
        <div style="font-size:28px; font-weight:700; margin-bottom:8px">${q.pronoun.pt} <span style="color:var(--c-muted); font-size:18px">(${q.pronoun.cn})</span></div>
        <div style="font-size:20px">${q.verb} <small style="color:var(--c-muted)">（${q.verbCn}）</small></div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px">
        ${q.opts.map((o,i) => `
          <button class="btn btn--ghost" style="padding:16px; font-size:16px" onclick="window.__answerConj(${i})">${o}</button>
        `).join('')}
      </div>

      <div id="conj-feedback" style="display:none; margin-top:16px; padding:16px; border-radius:12px; text-align:center"></div>

      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/grammar')">语法</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;
  window.__backConjHome = () => { quizList = []; tableVerb = null; render(); };
  window.__answerConj = (i) => {
    const fb = document.getElementById('conj-feedback');
    const correct = i === q.ans;
    if (correct) score++;
    fb.style.display = 'block';
    fb.style.background = correct ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)';
    fb.style.color = correct ? '#4caf50' : '#f44336';
    if (quizIdx + 1 >= quizList.length) {
      fb.innerHTML = `${correct ? '✅' : '❌'} 完成！得分 ${score}/${quizList.length}<div style="margin-top:12px"><button class="btn btn--primary" onclick="window.__backConjHome()">返回</button></div>`;
    } else {
      fb.innerHTML = correct
        ? `✅ 正确！<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextConj()">下一题 →</button></div>`
        : `❌ 正确：${q.correct}<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextConj()">下一题 →</button></div>`;
    }
  };
  window.__nextConj = () => { quizIdx++; render(); };
}
