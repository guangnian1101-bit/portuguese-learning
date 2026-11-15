// ============================================
// pages/conj.js — 动词变位练习（6 时态）
// ============================================

import { router } from '../router.js';
import { ALL_VERBS } from '../data/conj-data.js?v=34';

const TENSES = [
  { id: 'presente', label: '现在式', cn: 'Presente do Indicativo', desc: '表示现在经常性的动作或状态' },
  { id: 'perfeito', label: '过去式', cn: 'Pretérito Perfeito', desc: '表示过去已完成的动作' },
  { id: 'imperfeito', label: '过去未完成式', cn: 'Pretérito Imperfeito', desc: '表示过去习惯性动作或背景描述' },
  { id: 'futuro', label: '将来式', cn: 'Futuro do Indicativo', desc: '表示将来要发生的动作' },
  { id: 'conj_presente', label: '虚拟式现在', cn: 'Presente do Conjuntivo', desc: '表示愿望、怀疑、可能性' },
  { id: 'condicional', label: '条件式', cn: 'Condicional', desc: '表示"将会、可能会"，相当于过去将来时' },
  { id: 'conj_imperfeito', label: '虚拟式过去未完成', cn: 'Pretérito Imperfeito do Conjuntivo', desc: '表示过去的假设、条件，相当于"如果我当时…"' },
];

const COMMON_VERBS = ['ser','estar','ter','ir','fazer','querer','poder','dizer','saber','ver','dar','vir'];
const VERBS = ALL_VERBS;

const PRONOUNS = [
  { pt: 'eu', cn: '我', idx: 0 },
  { pt: 'tu', cn: '你', idx: 1 },
  { pt: 'ele/ela', cn: '他/她', idx: 2 },
  { pt: 'nós', cn: '我们', idx: 3 },
  { pt: 'vós', cn: '你们', idx: 4 },
  { pt: 'eles/elas', cn: '他们', idx: 5 },
];

// 等级分组
const LEVELS = {
  A1: ['ser','estar','ter','ir','falar','comer','viver','estar','haver','dar','ver','saber'],
  A2: ['fazer','querer','poder','dizer','vir','sair','chegar','passar','ficar','olhar','virar','mandar'],
  B1: ['começar','acabar','perder','ganhar','levar','trazer','pagar','contar','responder','acreditar','parecer','conhecer'],
};

let quizList = [];
let quizIdx = 0;
let score = 0;
let tableVerb = null;
let tableTense = 'presente';
let searchResult = null;
let showAllVerbs = false;
let allVerbsFilter = '';
let quizLevel = 'all'; // all / A1 / A2 / B1 / wrongbook
let quizMode = 'choice'; // choice / input

// 错词本
function getWrongBook() {
  try { return JSON.parse(localStorage.getItem('conj_wrongbook') || '[]'); }
  catch { return []; }
}
function addToWrongBook(item) {
  const wb = getWrongBook();
  const key = item.verb + '|' + item.tense + '|' + item.pronoun;
  const existing = wb.find(x => x.key === key);
  if (existing) {
    existing.count++;
    existing.lastWrong = Date.now();
  } else {
    wb.push({ key, verb: item.verb, tense: item.tense, pronoun: item.pronoun, answer: item.answer, count: 1, lastWrong: Date.now() });
  }
  localStorage.setItem('conj_wrongbook', JSON.stringify(wb));
}
function removeFromWrongBook(key) {
  const wb = getWrongBook().filter(x => x.key !== key);
  localStorage.setItem('conj_wrongbook', JSON.stringify(wb));
}

// 构建变位反查索引（变位形式 -> 动词原形）
let formIndex = null;
function buildFormIndex() {
  if (formIndex) return formIndex;
  formIndex = {};
  for (const [verb, data] of Object.entries(VERBS)) {
    for (const tense of Object.values(data.tenses)) {
      for (const form of tense) {
        if (!formIndex[form]) formIndex[form] = [];
        if (!formIndex[form].includes(verb)) formIndex[form].push(verb);
      }
    }
  }
  return formIndex;
}

function searchVerb(q) {
  q = q.trim().toLowerCase();
  if (!q) return null;
  
  // 1. 直接匹配动词原形
  if (VERBS[q]) return { verb: q, matchedBy: 'lemma' };
  
  // 2. 模糊匹配动词原形（开头匹配）
  const lemmas = Object.keys(VERBS).filter(v => v.startsWith(q));
  if (lemmas.length === 1) return { verb: lemmas[0], matchedBy: 'lemma' };
  if (lemmas.length > 1) return { suggestions: lemmas.slice(0, 8) };
  
  // 3. 反查变位形式
  buildFormIndex();
  if (formIndex[q]) {
    const verbs = formIndex[q];
    if (verbs.length === 1) return { verb: verbs[0], matchedBy: 'form', form: q };
    return { suggestions: verbs.slice(0, 8), matchedBy: 'form' };
  }
  
  // 4. 部分匹配变位形式
  const partial = Object.keys(formIndex).filter(f => f.includes(q));
  if (partial.length > 0) {
    const verbs = [...new Set(partial.flatMap(f => formIndex[f]))].slice(0, 8);
    return { suggestions: verbs };
  }
  
  return null;
}

function buildQuiz() {
  quizList = [];
  
  // 错词本模式：从错词本里出题
  if (quizLevel === 'wrongbook') {
    const wb = getWrongBook();
    if (wb.length === 0) {
      alert('错词本是空的！先去练习吧。');
      quizLevel = 'all';
      return;
    }
    for (let i = 0; i < Math.min(10, wb.length); i++) {
      const w = wb[Math.floor(Math.random() * wb.length)];
      const t = TENSES.find(x => x.id === w.tense);
      const p = PRONOUNS[w.pronoun];
      const v = w.verb;
      const correct = w.answer;
      
      const allForms = [];
      for (const tid of Object.keys(VERBS[v].tenses)) {
        for (let pi = 0; pi < 6; pi++) {
          const form = VERBS[v].tenses[tid][pi];
          if (!allForms.includes(form)) allForms.push(form);
        }
      }
      const others = allForms.filter(f => f !== correct);
      const distractors = [];
      let guard = 0;
      while (distractors.length < 3 && guard < 50 && others.length > 0) {
        guard++;
        const d = others[Math.floor(Math.random() * others.length)];
        if (!distractors.includes(d)) distractors.push(d);
      }
      const opts = [correct, ...distractors].sort(() => 0.5 - Math.random());
      quizList.push({ verb: v, verbCn: VERBS[v].cn, tense: t, pronoun: p, correct, opts, ans: opts.indexOf(correct), wrongKey: w.key });
    }
  } else {
    let pool;
    if (quizLevel === 'A1') pool = LEVELS.A1.filter(v => VERBS[v]);
    else if (quizLevel === 'A2') pool = LEVELS.A2.filter(v => VERBS[v]);
    else if (quizLevel === 'B1') pool = LEVELS.B1.filter(v => VERBS[v]);
    else pool = Object.keys(VERBS);
    
    for (let i = 0; i < 10; i++) {
      const v = pool[Math.floor(Math.random() * pool.length)];
      const t = TENSES[Math.floor(Math.random() * TENSES.length)];
      const p = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
      const correct = VERBS[v].tenses[t.id][p.idx];

      const allForms = [];
      for (const tid of Object.keys(VERBS[v].tenses)) {
        for (let pi = 0; pi < 6; pi++) {
          const form = VERBS[v].tenses[tid][pi];
          if (!allForms.includes(form)) allForms.push(form);
        }
      }

      const others = allForms.filter(f => f !== correct);
      const distractors = [];
      let guard = 0;
      while (distractors.length < 3 && guard < 50 && others.length > 0) {
        guard++;
        const d = others[Math.floor(Math.random() * others.length)];
        if (!distractors.includes(d)) distractors.push(d);
      }

      if (distractors.length < 3) {
        const otherVerbs = pool.filter(x => x !== v);
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
      quizList.push({ verb: v, verbCn: VERBS[v].cn, tense: t, pronoun: p, correct, opts, ans: opts.indexOf(correct), wrongKey: null });
    }
  }
  
  quizIdx = 0;
  score = 0;
}

export function render() {
  const app = document.getElementById('app');
  if (searchResult) renderSearchResult(app);
  else if (showAllVerbs) renderAllVerbs(app);
  else if (tableVerb) renderTable(app);
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
      <p style="color:var(--c-muted); margin:0 0 16px">${Object.keys(VERBS).length} 个动词 · 7 个时态 · 六人称变位表与随机练习。</p>

      <div style="display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap">
        <button class="btn ${quizLevel==='all'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px" onclick="window.__setLevel('all')">全部</button>
        <button class="btn ${quizLevel==='A1'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px" onclick="window.__setLevel('A1')">A1 入门</button>
        <button class="btn ${quizLevel==='A2'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px" onclick="window.__setLevel('A2')">A2 基础</button>
        <button class="btn ${quizLevel==='B1'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px" onclick="window.__setLevel('B1')">B1 中级</button>
        <button class="btn ${quizLevel==='wrongbook'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px; background:#f44336; color:#fff" onclick="window.__setLevel('wrongbook')">📕 错词本 (${getWrongBook().length})</button>
      </div>

      <div style="display:flex; gap:6px; margin-bottom:16px">
        <button class="btn ${quizMode==='choice'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px" onclick="window.__setMode('choice')">📝 选择题</button>
        <button class="btn ${quizMode==='input'?'btn--primary':'btn--ghost'}" style="padding:6px 12px; font-size:12px" onclick="window.__setMode('input')">✏️ 填空</button>
      </div>

      <button class="btn btn--primary btn--block" style="margin-bottom:12px" onclick="window.__startConjQuiz()">🚀 开始变位练习（10 题）</button>

      <button class="btn btn--ghost btn--block" style="margin-bottom:16px" onclick="window.__showAllVerbs()">📚 浏览全部动词</button>

      <div style="position:relative; margin-bottom:24px">
        <input id="conj-search" type="text" placeholder="搜索动词或变位形式，如 falar / falei" 
          style="width:100%; padding:14px 16px; border-radius:12px; border:1px solid var(--c-border); background:var(--c-card); font-size:15px; box-sizing:border-box"
          onkeydown="if(event.key==='Enter') window.__doConjSearch()" />
        <button onclick="window.__doConjSearch()" 
          style="position:absolute; right:6px; top:50%; transform:translateY(-50%); padding:8px 14px; border:none; border-radius:8px; background:var(--c-brand); color:#fff; cursor:pointer; font-size:13px">
          搜索
        </button>
      </div>

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
  window.__setLevel = (lvl) => { quizLevel = lvl; render(); };
  window.__setMode = (m) => { quizMode = m; render(); };
  window.__showTable = (v) => { tableVerb = v; tableTense = 'presente'; render(); };
  window.__showAllVerbs = () => { showAllVerbs = true; allVerbsFilter = ''; render(); };
  window.__doConjSearch = () => {
    const q = document.getElementById('conj-search').value;
    const result = searchVerb(q);
    if (result && result.verb) {
      searchResult = { verb: result.verb, tense: 'presente' };
      render();
    } else if (result && result.suggestions) {
      alert('你是不是要找：\n' + result.suggestions.join('\n'));
    } else {
      alert('未找到该动词');
    }
  };
}

function renderAllVerbs(app) {
  const allVerbs = Object.keys(VERBS).sort();
  const filtered = allVerbs.filter(v => v.toLowerCase().includes(allVerbsFilter.toLowerCase()));
  
  // 按首字母分组
  const groups = {};
  for (const v of filtered) {
    const letter = v[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(v);
  }

  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backConjHome()" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0; font-size:20px">📚 全部动词 (${filtered.length})</h1>
      </div>

      <input id="all-verbs-filter" type="text" placeholder="筛选动词..." value="${allVerbsFilter}"
        style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--c-border); background:var(--c-card); font-size:15px; box-sizing:border-box; margin-bottom:20px"
        oninput="window.__filterAllVerbs(this.value)" />

      <div style="display:flex; flex-direction:column; gap:16px">
        ${Object.entries(groups).sort((a,b) => a[0].localeCompare(b[0])).map(([letter, verbs]) => `
          <div>
            <div style="font-weight:700; font-size:18px; color:var(--c-brand); margin-bottom:8px">${letter}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
              ${verbs.map(v => `
                <div class="card" style="padding:10px 12px; cursor:pointer" onclick="window.__showFromAll('${v}')">
                  <div style="font-weight:600; font-size:14px">${v}</div>
                  <div style="font-size:12px; color:var(--c-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${VERBS[v].cn}</div>
                </div>
              `).join('')}
            </div>
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
  window.__backConjHome = () => { showAllVerbs = false; searchResult = null; tableVerb = null; render(); };
  window.__filterAllVerbs = (q) => { allVerbsFilter = q; render(); };
  window.__showFromAll = (v) => { showAllVerbs = false; searchResult = { verb: v, tense: 'presente' }; render(); };
}

function renderSearchResult(app) {
  const v = searchResult.verb;
  const data = VERBS[v];
  const tense = searchResult.tense;
  
  // 计算词干和词尾
  function splitStemEnding(form, lemma) {
    // 简单规则：找到词干（原形去掉-ar/er/ir），变位形式减去词干就是词尾
    let lemmaStem = lemma;
    if (lemma.endsWith('ar')) lemmaStem = lemma.slice(0, -2);
    else if (lemma.endsWith('er')) lemmaStem = lemma.slice(0, -2);
    else if (lemma.endsWith('ir')) lemmaStem = lemma.slice(0, -2);
    
    // 如果变位形式以词干开头，词尾就是剩下的部分
    if (form.startsWith(lemmaStem)) {
      return { stem: lemmaStem, ending: form.slice(lemmaStem.length) };
    }
    // 不规则变位，整词显示
    return { stem: '', ending: form };
  }

  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backConjHome()" style="padding:8px 12px">← 返回</button>
      </div>

      <div style="text-align:center; margin-bottom:24px">
        <div style="font-size:14px; color:var(--c-muted); margin-bottom:8px">动词变位</div>
        <div style="font-size:32px; font-weight:700; margin-bottom:8px">${v}</div>
        <div style="font-size:14px; color:var(--c-muted)">${data.cn}</div>
      </div>

      <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; justify-content:center">
        ${TENSES.map(t => `
          <button class="btn ${t.id === tense ? 'btn--primary' : 'btn--ghost'}" 
            style="padding:8px 16px; font-size:13px" 
            onclick="window.__setSearchTense('${t.id}')">${t.label}</button>
        `).join('')}
      </div>

      <button class="btn btn--primary btn--block" style="margin-bottom:20px" onclick="window.__practiceThisVerb('${v}')">✏️ 练这个动词（10题填空）</button>

      <div class="card" style="padding:0; overflow:hidden">
        <table style="width:100%; border-collapse:collapse; font-size:14px">
          <thead>
            <tr style="background:var(--c-brand-soft)">
              <th style="padding:10px 12px; text-align:left">人称</th>
              <th style="padding:10px 12px; text-align:left">词干</th>
              <th style="padding:10px 12px; text-align:left">词尾</th>
              <th style="padding:10px 12px; text-align:left">完整形式</th>
            </tr>
          </thead>
          <tbody>
            ${PRONOUNS.map((p, i) => {
              const form = data.tenses[tense][i];
              const { stem, ending } = splitStemEnding(form, v);
              return `
                <tr style="border-top:1px solid var(--c-border)">
                  <td style="padding:10px 12px; color:var(--c-muted)">${p.pt} <small>(${p.cn})</small></td>
                  <td style="padding:10px 12px; color:var(--c-muted)">${stem || '—'}</td>
                  <td style="padding:10px 12px; color:var(--c-brand)">${ending || '—'}</td>
                  <td style="padding:10px 12px; font-weight:600">
                    ${form}
                    <button onclick="window.__speak('${form}')" style="margin-left:8px; border:none; background:none; cursor:pointer; font-size:14px; padding:2px 4px">🔊</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
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
  window.__backConjHome = () => { searchResult = null; tableVerb = null; render(); };
  window.__setSearchTense = (tid) => { searchResult.tense = tid; render(); };
  window.__practiceThisVerb = (verb) => {
    // 针对指定动词出10道填空题
    quizMode = 'input';
    quizList = [];
    const allForms = [];
    for (const tid of Object.keys(VERBS[verb].tenses)) {
      const t = TENSES.find(x => x.id === tid);
      for (let pi = 0; pi < 6; pi++) {
        allForms.push({ verb, verbCn: VERBS[verb].cn, tense: t, pronoun: PRONOUNS[pi], correct: VERBS[verb].tenses[tid][pi] });
      }
    }
    // 随机抽10个
    for (let i = 0; i < Math.min(10, allForms.length); i++) {
      const idx = Math.floor(Math.random() * allForms.length);
      const item = allForms.splice(idx, 1)[0];
      quizList.push({ ...item, opts: [item.correct], ans: 0, wrongKey: null });
    }
    searchResult = null;
    tableVerb = null;
    quizIdx = 0;
    score = 0;
    render();
  };
  window.__speak = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-PT';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  };
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
  const isInput = quizMode === 'input';
  
  const optionsHtml = isInput ? `
    <input id="conj-input" type="text" placeholder="输入变位形式..." 
      style="width:100%; padding:16px; border-radius:12px; border:2px solid var(--c-border); background:var(--c-card); font-size:18px; text-align:center; box-sizing:border-box"
      onkeydown="if(event.key==='Enter') window.__answerInput()" />
    <button class="btn btn--primary btn--block" style="margin-top:12px" onclick="window.__answerInput()">确认答案</button>
  ` : `
    <div style="display:flex; flex-direction:column; gap:10px">
      ${q.opts.map((o,i) => `
        <button class="btn btn--ghost" style="padding:16px; font-size:16px" onclick="window.__answerConj(${i})">${o}</button>
      `).join('')}
    </div>
  `;
  
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backConjHome()" style="padding:8px 12px">← 退出</button>
        <h1 style="margin:0; font-size:18px">变位练习 ${quizIdx+1}/${quizList.length}</h1>
      </div>

      <div class="card" style="padding:24px; text-align:center; margin-bottom:16px">
        <div style="font-size:13px; color:var(--c-brand); margin-bottom:4px; font-weight:600">${q.tense.label} · ${q.tense.cn}</div>
        <div style="font-size:12px; color:var(--c-muted); margin-bottom:12px">${q.tense.desc}</div>
        <div style="font-size:28px; font-weight:700; margin-bottom:8px">${q.pronoun.pt} <span style="color:var(--c-muted); font-size:18px">(${q.pronoun.cn})</span></div>
        <div style="font-size:20px">${q.verb} <small style="color:var(--c-muted)">（${q.verbCn}）</small></div>
      </div>

      ${optionsHtml}

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
  
  function showResult(correct) {
    const fb = document.getElementById('conj-feedback');
    if (correct) score++;
    
    if (!correct) {
      addToWrongBook({ verb: q.verb, tense: q.tense.id, pronoun: q.pronoun.idx, answer: q.correct });
    } else if (q.wrongKey) {
      removeFromWrongBook(q.wrongKey);
    }
    
    fb.style.display = 'block';
    fb.style.background = correct ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)';
    fb.style.color = correct ? '#4caf50' : '#f44336';
    if (quizIdx + 1 >= quizList.length) {
      fb.innerHTML = `${correct ? '✅' : '❌'} 完成！得分 ${score}/${quizList.length}<div style="margin-top:12px"><button class="btn btn--primary" onclick="window.__backConjHome()">返回</button></div>`;
    } else {
      fb.innerHTML = correct
        ? `✅ 正确！<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextConj()">下一题 →</button></div>`
        : `❌ 正确：${q.correct}<div style="margin-top:10px; font-size:12px; color:var(--c-muted)">已加入错词本</div><div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextConj()">下一题 →</button></div>`;
    }
  }
  
  window.__answerConj = (i) => showResult(i === q.ans);
  window.__answerInput = () => {
    const val = document.getElementById('conj-input').value.trim().toLowerCase();
    showResult(val === q.correct.toLowerCase());
  };
  window.__nextConj = () => { quizIdx++; render(); };
}
