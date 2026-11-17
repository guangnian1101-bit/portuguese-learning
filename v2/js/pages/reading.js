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
  {
    id: 'restaurante-tipico',
    level: 'A2',
    title: 'Um restaurante típico em Lisboa',
    text: 'Ontem à noite, fomos jantar a um restaurante típico no Bairro Alto, em Lisboa. O restaurante é pequeno mas muito acolhedor, com paredes de pedra e mesas de madeira. O empregado foi muito simpático e recomendou-nos os pratos do dia. Eu pediu um bacalhau à brás, que é um prato tradicional português feito com bacalhau, batatas e ovos. O meu amigo pediu carne de porco à alentejana. A comida estava deliciosa e as porções eram bem servidas. Para beber, pedimos uma garrafa de vinho verde, que é leve e refrescante. No fim, pedimos a sobremesa: um pastéis de nata com café. A conta foi de 25 euros por pessoa, o que é um preço razoável para a qualidade da comida. Recomendo este restaurante a todos os que visitam Lisboa.',
    questions: [
      { q: "Onde fica o restaurante?", opts: ['Na Baixa', 'No Bairro Alto', 'Em Belém', 'No Alfama'], ans: 1 },
      { q: "O que é que o autor pediu para jantar?", opts: ['Carne de porco', 'Bacalhau à brás', 'Caldo verde', 'Francesinha'], ans: 1 },
      { q: "O que é que eles beberam?", opts: ['Vinho tinto', 'Vinho verde', 'Cerveja', 'Água'], ans: 1 },
      { q: "Quanto custou por pessoa?", opts: ['15 euros', '20 euros', '25 euros', '30 euros'], ans: 2 },
    ]
  },
  {
    id: 'clima-portugal',
    level: 'B1',
    title: 'O clima em Portugal',
    text: 'Portugal tem um dos climas mais agradáveis da Europa. No inverno, as temperaturas são suaves, raramente descem abaixo de 5 graus em Lisboa. No verão, faz calor, sobretudo no sul do país, onde as temperaturas podem chegar aos 35 ou 40 graus. A chuva concentra-se principalmente nos meses de novembro a março. O Algarve, no sul, tem mais de 300 dias de sol por ano, o que o torna um destino popular para turistas de todo o mundo. No norte do país, o clima é mais húmido e fresco, com mais chuva e invernos mais rigorosos. As serras, como a Serra da Estrela, têm neve no inverno e são um local popular para a prática de esqui. Em geral, o clima português é mediterrâneo, com verões secos e quentes e invernos chuvosos e amenos.',
    questions: [
      { q: "Como é o inverno em Lisboa?", opts: ['Muito frio, com neve', 'Suave, raramente abaixo de 5 graus', 'Muito chuvoso', 'Igual ao verão'], ans: 1 },
      { q: "Quando é que chove mais em Portugal?", opts: ['De junho a agosto', 'De abril a junho', 'De novembro a março', 'De setembro a novembro'], ans: 2 },
      { q: "Porque é que o Algarve é popular para turistas?", opts: ['Tem muitas montanhas', 'Tem mais de 300 dias de sol por ano', 'Tem neve no inverno', 'É muito barato'], ans: 1 },
      { q: "O que é a Serra da Estrela?", opts: ['Uma praia', 'Uma serra com neve no inverno', 'Uma cidade', 'Um rio'], ans: 1 },
    ]
  },
  {
    id: 'educacao-portugal',
    level: 'B2',
    title: 'O sistema educativo em Portugal',
    text: 'O sistema educativo português é dividido em vários níveis. A educação pré-escolar é opcional e destina-se a crianças dos 0 aos 5 anos. O ensino básico é obrigatório e dura 9 anos, dividido em três ciclos: o primeiro ciclo (1º-4º ano), o segundo ciclo (5º-6º ano) e o terceiro ciclo (7º-9º ano). Depois, o ensino secundário dura 3 anos (10º-12º ano) e é dividido em vias: científica-humanística, que prepara para o ensino superior, e profissional, que prepara para o mercado de trabalho. O ensino superior inclui licenciaturas (3 anos), mestrados (2 anos) e doutoramentos. As universidades mais conhecidas são a de Lisboa, a do Porto e a de Coimbra, que é a mais antiga do país, fundada em 1290. Em Portugal, a educação é gratuita no setor público, desde o ensino básico até ao ensino superior. No entanto, existem também muitas escolas e universidades privadas.',
    questions: [
      { q: "Até que idade é a educação obrigatória em Portugal?", opts: ['Até aos 12 anos', 'Até aos 15 anos (9º ano)', 'Até aos 18 anos (12º ano)', 'Não é obrigatória'], ans: 1 },
      { q: "Quanto dura o ensino secundário?", opts: ['2 anos', '3 anos', '4 anos', '5 anos'], ans: 1 },
      { q: "Qual é a universidade mais antiga de Portugal?", opts: ['Universidade de Lisboa', 'Universidade do Porto', 'Universidade de Coimbra', 'Universidade Nova de Lisboa'], ans: 2 },
      { q: "O que é a via profissional do ensino secundário?", opts: ['Prepara para a universidade', 'Prepara para o mercado de trabalho', 'É apenas para desporto', 'É gratuita'], ans: 1 },
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
