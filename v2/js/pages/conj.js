// ============================================
// pages/conj.js — 动词变位练习
// ============================================

import { router } from '../router.js';

// 常用动词现在时变位表（eu/tu/ele/nós/vós/eles）
const VERBS = {
  // 规则 -ar
  'falar': { cn: '说', type: '-ar', forms: ['falo','falas','fala','falamos','falais','falam'] },
  'cantar': { cn: '唱', type: '-ar', forms: ['canto','cantas','canta','cantamos','cantais','cantam'] },
  'estudar': { cn: '学习', type: '-ar', forms: ['estudo','estudas','estuda','estudamos','estudais','estudam'] },
  'andar': { cn: '走', type: '-ar', forms: ['ando','andas','anda','andamos','andais','andam'] },
  'chamar': { cn: '叫', type: '-ar', forms: ['chamo','chamas','chama','chamamos','chamais','chamam'] },
  // 规则 -er
  'comer': { cn: '吃', type: '-er', forms: ['como','comes','come','comemos','comeis','comem'] },
  'beber': { cn: '喝', type: '-er', forms: ['bebo','bebes','bebe','bebemos','bebeis','bebem'] },
  'correr': { cn: '跑', type: '-er', forms: ['corro','corres','corre','corremos','correis','correm'] },
  'ler': { cn: '读', type: '-er', forms: ['leio','lês','lê','lemos','ledes','leem'] },
  'vender': { cn: '卖', type: '-er', forms: ['vendo','vendes','vende','vendemos','vendeis','vendem'] },
  // 规则 -ir
  'partir': { cn: '出发', type: '-ir', forms: ['parto','partes','parte','partimos','partis','partem'] },
  'abrir': { cn: '打开', type: '-ir', forms: ['abro','abres','abre','abrimos','abris','abrem'] },
  'escrever': { cn: '写', type: '-er', forms: ['escrevo','escreves','escreve','escrevemos','escreveis','escrevem'] },
  'ir': { cn: '去', type: '不规则', forms: ['vou','vais','vai','vamos','ides','vão'] },
  'ser': { cn: '是（本质）', type: '不规则', forms: ['sou','és','é','somos','sois','são'] },
  'estar': { cn: '是（状态）', type: '不规则', forms: ['estou','estás','está','estamos','estais','estão'] },
  'ter': { cn: '有', type: '不规则', forms: ['tenho','tens','tem','temos','tendes','têm'] },
  'haver': { cn: '有（无人称）', type: '不规则', forms: ['hei','hás','há','havemos','haveis','hão'] },
  'poder': { cn: '能', type: '不规则', forms: ['posso','podes','pode','podemos','podeis','podem'] },
  'fazer': { cn: '做', type: '不规则', forms: ['faço','fazes','faz','fazemos','fazeis','fazem'] },
  'dizer': { cn: '说', type: '不规则', forms: ['digo','dizes','diz','dizemos','dizeis','dizem'] },
  'ver': { cn: '看见', type: '不规则', forms: ['vejo','vês','vê','vemos','vedes','veem'] },
  'saber': { cn: '知道', type: '不规则', forms: ['sei','sabes','sabe','sabemos','sabeis','sabem'] },
  'querer': { cn: '想要', type: '不规则', forms: ['quero','queres','querer','queremos','quereis','querem'] },
  'dar': { cn: '给', type: '不规则', forms: ['dou','dás','dá','damos','dais','dão'] },
};

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
let showTableVerb = null;

function buildQuiz() {
  const verbs = Object.keys(VERBS);
  quizList = [];
  for (let i = 0; i < 10; i++) {
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const p = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
    const correct = VERBS[v].forms[p.idx];
    // 生成3个干扰项
    const others = verbs.filter(x => x !== v).map(x => VERBS[x].forms[p.idx]);
    const distractors = [];
    while (distractors.length < 3) {
      const d = others[Math.floor(Math.random() * others.length)];
      if (d !== correct && !distractors.includes(d)) distractors.push(d);
    }
    const opts = [correct, ...distractors].sort(() => 0.5 - Math.random());
    quizList.push({ verb: v, verbCn: VERBS[v].cn, pronoun: p, correct, opts, ans: opts.indexOf(correct) });
  }
  quizIdx = 0;
  score = 0;
}

export function render() {
  const app = document.getElementById('app');

  if (showTableVerb) {
    renderTable(app);
  } else if (quizList.length === 0) {
    renderHome(app);
  } else {
    renderQuiz(app);
  }
}

function renderHome(app) {
  const verbs = Object.keys(VERBS);
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="router.navigate('/')" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0">🔄 动词变位</h1>
      </div>
      <p style="color:var(--c-muted); margin:0 0 20px">选一个动词查看变位表，或直接开始变位练习。</p>

      <button class="btn btn--primary btn--block" style="margin-bottom:20px" onclick="window.__startConjQuiz()">🚀 开始变位练习（10题）</button>

      <div style="font-weight:600; margin-bottom:12px">📋 变位表</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
        ${verbs.map(v => `
          <div class="card" style="padding:12px; cursor:pointer; text-align:center" onclick="window.__showTable('${v}')">
            <div style="font-weight:600">${v}</div>
            <div style="font-size:12px; color:var(--c-muted)">${VERBS[v].cn} · ${VERBS[v].type}</div>
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
  window.__showTable = (v) => { showTableVerb = v; render(); };
}

function renderTable(app) {
  const v = showTableVerb;
  const data = VERBS[v];
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backConjHome()" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0; font-size:20px">${v} <span style="color:var(--c-muted); font-size:14px; font-weight:40px">${data.cn}</span></h1>
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
                <td style="padding:12px; font-weight:600">${data.forms[i]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:16px; font-size:13px; color:var(--c-muted)">时态：现在时（Presente do Indicativo）</div>
      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/grammar')">语法</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;
  window.__backConjHome = () => { showTableVerb = null; render(); };
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
        <div style="font-size:14px; color:var(--c-muted); margin-bottom:12px">选择正确的变位形式</div>
        <div style="font-size:28px; font-weight:700; margin-bottom:8px">${q.pronoun.pt} <span style="color:var(--c-muted); font-size:18px">(${q.pronoun.cn})</span></div>
        <div style="font-size:20px; color:var(--c-ink-secondary)">${q.verb} <small style="color:var(--c-muted)">（${q.verbCn}）</small></div>
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

  window.__backConjHome = () => { quizList = []; showTableVerb = null; render(); };
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
