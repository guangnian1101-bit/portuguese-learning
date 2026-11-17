// ============================================
// pages/reading.js — 阅读练习
// ============================================

import { router } from '../router.js';

const READINGS = [
  {
    id: 'dia-a-dia',
    level: 'A1',
    title: 'Meu dia a dia',
    text: 'Eu chamo-me João. Tenho 25 anos e vivo em Lisboa. Trabalho numa livraria perto da minha casa. De manhã, tomo café e como pão. Depois, vou para o trabalho a pé. À tarde, encontro os meus amigos para jogar futebol. À noite, janto com a minha família e vejo televisão. Gosto de viver em Lisboa porque é uma cidade bonita e tranquila.',
    questions: [
      { q: "Quantos anos tem o João?", opts: ['20', '25', '30', '35'], ans: 1 },
      { q: "Onde é que o João trabalha?", opts: ['Numa escola', 'Numa livraria', 'Numa fábrica', 'Num restaurante'], ans: 1 },
      { q: "Como é que ele vai para o trabalho?", opts: ['De carro', 'De autocarro', 'A pé', 'De bicicleta'], ans: 2 },
      { q: "O que é que ele faz à tarde?", opts: ['Estuda', 'Joga futebol com os amigos', 'Vê televisão', 'Janta com a família'], ans: 1 },
    ]
  },
  {
    id: 'viagem-porto',
    level: 'A2',
    title: 'Viagem ao Porto',
    text: 'No mês passado, eu e a minha irmã fomos ao Porto passar o fim de semana. Saímos de Lisboa sexta-feira de manhã e chegámos ao Porto ao meio-dia. O tempo estava bom — sol e temperatura agradável. Almoçámos numa tasca típica: comemos bacalhau à brás e provámos vinho verde. À tarde, fomos caminhar pela Ribeira e visitámos a Sé do Porto. No sábado, fomos a uma das caves de vinho do Porto em Vila Nova de Gaia e fizemos uma prova de vinhos. Foi uma experiência muito interessante. No domingo, comprámos presentes para a família e regressámos a Lisboa à tarde.',
    questions: [
      { q: "Quem é que foi ao Porto?", opts: ['O autor e o amigo', 'O autor e a irmã', 'O autor e os pais', 'Só o autor'], ans: 1 },
      { q: "O que é que eles almoçaram?", opts: ['Arroz de marisco', 'Bacalhau à brás', 'Francesinha', 'Caldo verde'], ans: 1 },
      { q: "O que é que eles fizeram em Vila Nova de Gaia?", opts: ['Visitaram o museu', 'Fizeram uma prova de vinhos', 'Caminharam pela praia', 'Comeram um pastel de nata'], ans: 1 },
      { q: "Quando é que regressaram a Lisboa?", opts: ['Sexta-feira à noite', 'Sábado de manhã', 'Domingo à tarde', 'Segunda-feira de manhã'], ans: 2 },
    ]
  },
  {
    id: 'trabalho-remoto',
    level: 'B1',
    title: 'Trabalho remoto: vantagens e desvantagens',
    text: 'Nos últimos anos, o trabalho remoto tornou-se cada vez mais popular. Muitas empresas descobriram que os funcionários podem ser tão produtivos em casa como no escritório. Uma das principais vantagens é a flexibilidade: as pessoas podem organizar o seu horário de acordo com as suas necessidades. Além disso, poupam tempo e dinheiro no transporte diário. No entanto, o trabalho remoto também tem desvantagens. Algumas pessoas sentem-se isoladas e têm dificuldade em separar a vida profissional da vida pessoal. Outras têm problemas de motivação em casa. Por isso, muitos especialistas defendem um modelo híbrido: alguns dias em casa, outros no escritório. Este parece ser o melhor dos dois mundos.',
    questions: [
      { q: "Segundo o texto, qual é uma das principais vantagens do trabalho remoto?", opts: ['O salário é mais alto', 'A flexibilidade de horário', 'As férias são mais longas', 'Os colegas são mais simpáticos'], ans: 1 },
      { q: "Qual é uma desvantagem mencionada no texto?", opts: ['O computador é mais lento', 'O isolamento e a falta de motivação', 'O transporte é caro', 'O escritório é barulhento'], ans: 1 },
      { q: "O que é que os especialistas defendem?", opts: ['Trabalhar sempre em casa', 'Trabalhar sempre no escritório', 'Um modelo híbrido', 'Não trabalhar remotamente'], ans: 2 },
      { q: "Qual é o melhor título para este texto?", opts: ['Como arranjar um emprego', 'Vantagens e desvantagens do trabalho remoto', 'A história do escritório moderno', 'Dicas para ser produtivo'], ans: 1 },
    ]
  },
];

let currentReading = null;
let currentQ = 0;
let score = 0;

export function render() {
  const app = document.getElementById('app');

  if (currentReading) {
    renderReading(app);
  } else {
    renderList(app);
  }
}

function renderList(app) {
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="router.navigate('/')" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0">📖 阅读练习</h1>
      </div>
      <p style="color:var(--c-muted); margin:0 0 20px">Leia o texto e responda às perguntas de compreensão.</p>
      <div style="display:flex; flex-direction:column; gap:12px">
        ${READINGS.map(r => `
          <div class="card" style="padding:16px; cursor:pointer" onclick="window.__openReading('${r.id}')">
            <div style="display:flex; justify-content:space-between; align-items:center">
              <div>
                <div style="font-weight:600">${r.title}</div>
                <div style="font-size:13px; color:var(--c-muted); margin-top:4px">${r.questions.length} perguntas</div>
              </div>
              <span style="background:${r.level === 'A1' ? '#4caf50' : r.level === 'A2' ? '#8bc34a' : '#2196f3'}; color:#fff; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600">${r.level}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/reading')">阅读</button>
        <button class="tabbar__item" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;

  window.__openReading = (id) => {
    currentReading = READINGS.find(r => r.id === id);
    currentQ = 0;
    score = 0;
    render();
  };
}

function renderReading(app) {
  const r = currentReading;
  const q = r.questions[currentQ];

  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backToList()" style="padding:8px 12px">← 列表</button>
        <h1 style="margin:0; font-size:18px">${r.title}</h1>
      </div>

      <div class="card" style="padding:20px; margin-bottom:16px; line-height:1.8; font-size:15px">
        ${r.text}
      </div>

      <div class="card" style="padding:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-weight:600">Pergunta ${currentQ+1}/${r.questions.length}</div>
          <div style="font-size:13px; color:var(--c-muted)">Pontos: ${score}</div>
        </div>
        <div style="font-size:16px; margin-bottom:20px; line-height:1.5">${q.q}</div>
        <div style="display:flex; flex-direction:column; gap:10px">
          ${q.opts.map((o,i) => `
            <button class="btn btn--ghost" style="padding:14px; text-align:left" onclick="window.__answerReading(${i})">
              ${String.fromCharCode(65+i)}. ${o}
            </button>
          `).join('')}
        </div>
        <div id="reading-feedback" style="display:none; margin-top:16px; padding:14px; border-radius:12px; text-align:center"></div>
      </div>

      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/reading')">阅读</button>
        <button class="tabbar__item" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;

  window.__backToList = () => { currentReading = null; render(); };
  window.__answerReading = (i) => {
    const fb = document.getElementById('reading-feedback');
    const correct = i === q.ans;
    if (correct) score++;
    fb.style.display = 'block';
    fb.style.background = correct ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)';
    fb.style.color = correct ? '#4caf50' : '#f44336';
    if (currentQ + 1 >= r.questions.length) {
      fb.innerHTML = (correct ? '✅' : '❌') + ` Fim! Pontuação final: ${score}/${r.questions.length}<div style="margin-top:12px"><button class="btn btn--primary" onclick="window.__backToList()">Voltar à lista</button></div>`;
    } else {
      fb.innerHTML = correct
        ? `✅ Correto!<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextReading()">Próxima →</button></div>`
        : `❌ Resposta correta: ${q.opts[q.ans]}<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextReading()">Próxima →</button></div>`;
    }
  };
  window.__nextReading = () => {
    currentQ++;
    render();
  };
}
