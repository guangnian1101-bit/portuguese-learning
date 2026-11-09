// ============================================
// pages/grammar.js — 语法学习（A1-C2）+ 练习
// ============================================

import { router } from '../router.js';

// 语法知识点数据库
const GRAMMAR = [
  // ===== A1 =====
  { level: 'A1', id: 'artigo', title: '定冠词与不定冠词',
    rule: '定冠词：o/a/os/as（这/那）；不定冠词：um/uma/uns/umas（一个/一些）。名词阴阳性决定冠词形式。',
    examples: ['o livro（这本书） / a casa（这栋房子）', 'um carro（一辆车） / uma mesa（一张桌子）'],
    quiz: [
      { q: "__ casa é grande.（这栋房子很大）", opts: ['o', 'a', 'os', 'as'], ans: 1 },
      { q: "Tenho __ livro.（我有一本书）", opts: ['o', 'um', 'uma', 'uns'], ans: 1 },
      { q: "__ livros são novos.（这些书是新的）", opts: ['o', 'a', 'os', 'as'], ans: 2 },
    ]},
  { level: 'A1', id: 'genero', title: '名词阴阳性',
    rule: '通常 -o 结尾为阳性，-a 结尾为阴性。但有例外：o dia（白天）、a mão（手）、a letra（字母）。',
    examples: ['o gato（猫，阳） / a gata（母猫，阴）', 'o problema（问题，阳性） / a mão（手，阴性）'],
    quiz: [
      { q: "O menino e __ menina.", opts: ['o', 'a', 'os', 'as'], ans: 1 },
      { q: "__ mão direita.", opts: ['o', 'a', 'os', 'as'], ans: 1 },
      { q: "__ problema é difícil.", opts: ['o', 'a', 'os', 'as'], ans: 0 },
    ]},
  { level: 'A1', id: 'ser-estar', title: 'ser 与 estar',
    rule: 'ser：本质、身份、永久属性（Eu sou professor）；estar：位置、状态、暂时感受（Eu estou em Lisboa）。',
    examples: ['Eu sou português.（我是葡萄牙人）', 'Eu estou cansado.（我累了）'],
    quiz: [
      { q: "Eu __ estudante.", opts: ['sou', 'estou', 'é', 'está'], ans: 0 },
      { q: "O café __ quente.", opts: ['é', 'está', 'sou', 'estou'], ans: 1 },
      { q: "Nós __ em casa.", opts: ['somos', 'estamos', 'é', 'são'], ans: 1 },
    ]},
  { level: 'A1', id: 'presente-ar', title: '现在时：-ar 动词变位',
    rule: '去掉 -ar 词尾，加：-o, -as, -a, -amos, -am。falar：falo, falas, fala, falamos, falam。',
    examples: ['Eu falo português.（我说葡语）', 'Ela fala espanhol.（她说西语）'],
    quiz: [
      { q: "Eu __ português.（falar）", opts: ['falo', 'fala', 'falas', 'falamos'], ans: 0 },
      { q: "Ela __ francês.", opts: ['falo', 'fala', 'falam', 'falas'], ans: 1 },
      { q: "Nós __ em português.", opts: ['fala', 'falamos', 'falo', 'falam'], ans: 1 },
    ]},
  { level: 'A1', id: 'presente-er-ir', title: '现在时：-er / -ir 动词',
    rule: '-er：-o, -es, -e, -emos, -em（comer：como, comes, come...）；-ir：-o, -es, -e, -imos, -em（partir：parto, partes, parte...）。',
    examples: ['Eu como pão.（我吃面包）', 'Ela parte às oito.（她八点出发）'],
    quiz: [
      { q: "Eu __ pão.（comer）", opts: ['como', 'come', 'comes', 'comemos'], ans: 0 },
      { q: "Você __ arroz.", opts: ['como', 'come', 'comem', 'comes'], ans: 1 },
      { q: "Nós __ para o trabalho.（partir）", opts: ['parte', 'partimos', 'parto', 'partem'], ans: 1 },
    ]},
  { level: 'A1', id: 'demonstrativo', title: '指示代词',
    rule: 'este/esta（这个，近我）；esse/essa（那个，近你）；aquele/aquela（那个，近他/远处）。',
    examples: ['Este livro é meu.（这本书是我的）', 'Aquele carro é caro.（那辆车很贵）'],
    quiz: [
      { q: "__ casa aqui é minha.（近我）", opts: ['Este', 'Essa', 'Aquela', 'Aquele'], ans: 2 },
      { q: "__ carro ali é teu.（近你）", opts: ['Este', 'Esse', 'Aquele', 'Esta'], ans: 1 },
      { q: "__ livros aqui são nossos.", opts: ['Estes', 'Esses', 'Aqueles', 'Estas'], ans: 0 },
    ]},

  // ===== A2 =====
  { level: 'A2', id: 'perfeito', title: '过去完成时（Pretérito Perfeito）',
    rule: '表示已完成的动作。-ar：-ei, -aste, -ou, -ámos, -aram；-er/-ir：-i, -este, -eu, -emos, -eram。',
    examples: ['Eu falei com ela ontem.（我昨天和她说了话）', 'Ele comeu uma maçã.（他吃了一个苹果）'],
    quiz: [
      { q: "Eu __ ontem.（falar）", opts: ['falei', 'falo', 'falava', 'falarei'], ans: 0 },
      { q: "Ela __ uma carta.", opts: ['escreve', 'escreveu', 'escrevia', 'escreverá'], ans: 1 },
      { q: "Nós __ em Lisboa.", opts: ['estamos', 'estivemos', 'estávamos', 'estaremos'], ans: 1 },
    ]},
  { level: 'A2', id: 'imperfeito', title: '过去未完成时（Pretérito Imperfeito）',
    rule: '表示过去习惯、背景描述、正在进行的动作。-ar：-ava, -avas, -ava, -ávamos, -avam。',
    examples: ['Eu falava inglês quando era jovem.（我年轻时说英语）', 'Ele comia pão todas as manhãs.（他每天早上吃面包）'],
    quiz: [
      { q: "Eu __ muito quando era criança.", opts: ['chorei', 'chorava', 'choro', 'chorarei'], ans: 1 },
      { q: "Nós __ na praia no verão.", opts: ['estivemos', 'estávamos', 'estamos', 'estaremos'], ans: 1 },
      { q: "Ele __ televisão à noite.", opts: ['viu', 'via', 'vê', 'verá'], ans: 1 },
    ]},
  { level: 'A2', id: 'futuro-ir', title: '将来时：ir + 不定式',
    rule: '口语中常用 ir + a + 不定式表示将来：Eu vou comer（我要吃）。正式将来时加 -ei/-ás/-á 词尾。',
    examples: ['Eu vou estudar amanhã.（我明天要学习）', 'Nós vamos viajar.（我们要去旅行）'],
    quiz: [
      { q: "Eu __ estudar amanhã.", opts: ['vou', 'vou a', 'ido', 'ia'], ans: 1 },
      { q: "Ela __ viajar semana que vem.", opts: ['vai', 'vai a', 'foi', 'ia'], ans: 1 },
      { q: "Nós __ ao cinema.", opts: ['vamos', 'vamos a', 'fomos', 'íamos'], ans: 1 },
    ]},
  { level: 'A2', id: 'pronome-obj', title: '宾语代词',
    rule: '直接宾语：o/a/os/as（lo/la/los/las 在动词后）；间接宾语：me/te/lhe/nos/vos/lhes。',
    examples: ['Eu o vi.（我看见他）', 'Dei-lhe o livro.（我给了他书）'],
    quiz: [
      { q: "Eu __ vi ontem.（我看见她）", opts: ['a', 'o', 'lhe', 'lha'], ans: 0 },
      { q: "Dei __ o presente.（我给他礼物）", opts: ['o', 'lhe', 'a', 'lo'], ans: 1 },
      { q: "Nós __ vemos sempre.", opts: ['nos', 'te', 'lhe', 'os'], ans: 0 },
    ]},
  { level: 'A2', id: 'possessivo', title: '物主代词',
    rule: 'meu/minha/meus/minhas（我的）；teu/tua（你的）；seu/sua（他/她的）；nosso/nossa（我们的）。',
    examples: ['O meu livro está aqui.（我的书在这）', 'A nossa casa é grande.（我们的房子大）'],
    quiz: [
      { q: "__ livro é novo.（我的）", opts: ['O meu', 'O teu', 'O seu', 'O nosso'], ans: 0 },
      { q: "__ casa é em Lisboa.（我们的）", opts: ['A minha', 'A tua', 'A nossa', 'A sua'], ans: 2 },
      { q: "__ carro é vermelho.（他的）", opts: ['O meu', 'O teu', 'O seu', 'O nosso'], ans: 2 },
    ]},

  // ===== B1 =====
  { level: 'B1', id: 'conjunto', title: '复合过去时（ter + 过去分词）',
    rule: 'ter/haver + 过去分词：Eu tenho falado（我一直在说）。过去分词规则：-ar → -ado，-er/-ir → -ido。',
    examples: ['Eu tenho estudado muito.（我一直在学习）', 'Ele tinha comido quando cheguei.（我到时他已经吃了）'],
    quiz: [
      { q: "Eu tenho __ muito.（estudar）", opts: ['estudado', 'estudei', 'estudava', 'estudarei'], ans: 0 },
      { q: "Ele tinha __ antes de sair.", opts: ['comer', 'comido', 'comeu', 'comia'], ans: 1 },
      { q: "Nós temos __ o trabalho.", opts: ['terminar', 'terminado', 'terminámos', 'terminávamos'], ans: 1 },
    ]},
  { level: 'B1', id: 'subj-presente', title: '虚拟式现在时',
    rule: '表示愿望、怀疑、命令。-ar：-e, -es, -e, -emos, -em；-er/-ir：-a, -as, -a, -amos, -am。',
    examples: ['Quero que ele vá.（我希望他去）', 'É importante que você estude.（你学习很重要）'],
    quiz: [
      { q: "Quero que ele __.", opts: ['vai', 'vá', 'ia', 'foi'], ans: 1 },
      { q: "É preciso que nós __ cedo.", opts: ['chegamos', 'cheguemos', 'chegámos', 'chegávamos'], ans: 1 },
      { q: "Duvido que ele __ a verdade.", opts: ['sabe', 'saiba', 'soube', 'sabia'], ans: 1 },
    ]},
  { level: 'B1', id: 'passiva', title: '被动语态',
    rule: 'ser + 过去分词 + por：O livro foi escrito por Camões（这本书是卡蒙斯写的）。',
    examples: ['A casa foi construída em 1900.（房子建于1900年）', 'Os livros foram lidos pelos alunos.（书被学生读了）'],
    quiz: [
      { q: "O poema __ por Camões.", opts: ['escreveu', 'foi escrito', 'escrevia', 'escreverá'], ans: 1 },
      { q: "As cartas __ pelo secretário.", opts: ['foram enviadas', 'enviaram', 'enviavam', 'enviarão'], ans: 0 },
      { q: "O prato __ pela mãe.", opts: ['fez', 'foi feito', 'fazia', 'fará'], ans: 1 },
    ]},
  { level: 'B1', id: 'relativo', title: '关系代词 que / onde / quem',
    rule: 'que：物/事（主语或直接宾语）；onde：地点；quem：人（介词后）。',
    examples: ['O livro que li é bom.（我读的那本书很好）', 'A casa onde moro é velha.（我住的房子很旧）'],
    quiz: [
      { q: "O homem __ lá está é meu pai.", opts: ['que', 'onde', 'quem', 'o qual'], ans: 0 },
      { q: "A cidade __ nasci é o Porto.", opts: ['que', 'onde', 'quem', 'donde'], ans: 1 },
      { q: "A pessoa com __ falei é professora.", opts: ['que', 'onde', 'quem', 'a qual'], ans: 2 },
    ]},

  // ===== B2 =====
  { level: 'B2', id: 'subj-imperfeito', title: '虚拟式过去未完成时',
    rule: '用于过去语境中的愿望/假设：Eu queria que ele fosse（我希望他去，但他没去）。',
    examples: ['Eu queria que você viesse.（我希望你来——但你没来）', 'Se eu fosse rico, viajava.（如果我有钱，我就旅行）'],
    quiz: [
      { q: "Eu queria que ele __.", opts: ['vem', 'viesse', 'virá', 'veio'], ans: 1 },
      { q: "Se eu __ você, estudava mais.", opts: ['sou', 'fosse', 'seria', 'fui'], ans: 1 },
      { q: "Éramos para que eles __ cedo.", opts: ['chegamos', 'chegassem', 'chegarão', 'chegaram'], ans: 1 },
    ]},
  { level: 'B2', id: 'conectivos', title: '连接词：embora / apesar de / porque',
    rule: 'embora + 虚拟式（虽然）；apesar de + 不定式/名词（尽管）；porque（因为）；por isso（所以）。',
    examples: ['Embora esteja cansado, trabalha.（虽然累，他还是工作）', 'Apesar do calor, saí.（尽管热，我还是出门了）'],
    quiz: [
      { q: "__ esteja cansado, estuda muito.", opts: ['Porque', 'Embora', 'Por isso', 'Como'], ans: 1 },
      { q: "Apesar __ o frio, fui à praia.", opts: ['de', 'do', 'da', 'dos'], ans: 1 },
      { q: "Estudei muito; __ passei no exame.", opts: ['embora', 'por isso', 'apesar de', 'porque'], ans: 1 },
    ]},
  { level: 'B2', id: 'gerundio', title: '副动词（gerund）',
    rule: '-ar → -ando，-er/-ir → -endo/-indo。表示方式/同时进行：Ele chegou correndo（他跑着来的）。',
    examples: ['Trabalhamos estudando.（我们边工作边学习）', 'Ela comeu lendo.（她边吃边读）'],
    quiz: [
      { q: "Ele chegou __.（correr）", opts: ['correu', 'correndo', 'corre', 'correr'], ans: 1 },
      { q: "Ela está __ o livro.", opts: ['lendo', 'lido', 'leu', 'ler'], ans: 0 },
      { q: "Nós passamos o dia __.", opts: ['conversa', 'conversando', 'conversámos', 'conversar'], ans: 1 },
    ]},

  // ===== C1 =====
  { level: 'C1', id: 'subj-futuro', title: '虚拟式将来时',
    rule: '表示将来的不确定/条件：Quando ele chegar, avise-me（他到了请通知我）。-ar → -ar/-ares/-ar...',
    examples: ['Se tiver dinheiro, compro.（如果我有钱，我就买——将来不确定）', 'Quando chegar, ligo.（我到了打电话）'],
    quiz: [
      { q: "Quando ele __, avise-me.", opts: ['chega', 'chegar', 'chegou', 'chegará'], ans: 1 },
      { q: "Se eu __ tempo, vou.", opts: ['tenho', 'tiver', 'tinha', 'tive'], ans: 1 },
      { q: 'Caso não __, não esperes.', opts: ['puder', 'pode', 'podia', 'pôde'], ans: 0 },
    ]},
  { level: 'C1', id: 'condicao', title: '条件句（条件式）',
    rule: '条件式：-ia/-ias/-ia/-íamos/-iam。Si + 未完成虚拟式, 条件式：Se eu tivesse, teria（如果我有，我就会）。',
    examples: ['Se eu tivesse dinheiro, compraria.（如果我有钱，我就买了——但我没有）', 'Eu viajaria se pudesse.（如果可以我就旅行了）'],
    quiz: [
      { q: "Se eu __ tempo, viajaria.", opts: ['tenho', 'tivesse', 'tivera', 'tiver'], ans: 1 },
      { q: "Eu __ se soubesse.", opts: ['vim', 'viria', 'viera', 'viesse'], ans: 1 },
      { q: "Se eles soubessem, __.", opts: ['vem', 'viriam', 'vieram', 'virão'], ans: 1 },
    ]},
  { level: 'C1', id: 'preposicao', title: '介词搭配',
    rule: '形容词+介词：interessado em（对...感兴趣）；chateado com（对...生气）；ansioso por（渴望）。动词+介词：contar com（指望）。',
    examples: ['Estou interessado em aprender.（我对学习感兴趣）', 'Conto com você.（我指望你）'],
    quiz: [
      { q: "Estou interessado __ aprender português.", opts: ['em', 'por', 'com', 'a'], ans: 0 },
      { q: "Ela está chateada __ o atraso.", opts: ['em', 'com', 'por', 'de'], ans: 1 },
      { q: "Conto __ você para ajudar.", opts: ['em', 'com', 'por', 'a'], ans: 1 },
    ]},

  // ===== C2 =====
  { level: 'C2', id: 'infinitivo-pessoal', title: '人称不定式',
    rule: '不定式可带人称：É preciso estudarmos（我们需要学习）。正式语体中常见，相当于从句。',
    examples: ['É importante estudarmos muito.（我们多学习很重要）', 'Para conseguires, tens de trabalhar.（为了成功，你得努力）'],
    quiz: [
      { q: "É preciso __ cedo.", opts: ['partir', 'partirmos', 'partimos', 'partíamos'], ans: 1 },
      { q: "Para __, tens de estudar.", opts: ['passar', 'passares', 'passas', 'passaste'], ans: 1 },
      { q: "É melhor __ logo.", opts: ['sair', 'saírmos', 'saímos', 'saíamos'], ans: 1 },
    ]},
  { level: 'C2', id: 'concordancia', title: '主谓一致的特殊情况',
    rule: '集合名词+形容词时形容词与所指一致：A maioria dos alunos estão presentes（大多数学生都在）。',
    examples: ['A maioria dos problemas foram resolvidos.（大多数问题已解决）', 'Uma dúzia de ovos estão na mesa.（一打鸡蛋在桌上）'],
    quiz: [
      { q: "A maioria dos alunos __ presentes.", opts: ['está', 'estão', 'estava', 'estive'], ans: 1 },
      { q: 'Uma série de problemas __ surgido.', opts: ['tem', 'têm', 'teve', 'tinha'], ans: 1 },
      { q: 'Metade dos livros __ novos.', opts: ['é', 'são', 'era', 'foi'], ans: 1 },
    ]},
];

// 状态
let currentTopic = null;
let quizIndex = 0;
let quizScore = 0;

export function render() {
  const app = document.getElementById('app');

  if (currentTopic) {
    renderTopic(app);
  } else {
    renderList(app);
  }
}

function renderList(app) {
  const levels = ['A1','A2','B1','B2','C1','C2'];
  const levelColors = { A1:'#4caf50', A2:'#8bc34a', B1:'#2196f3', B2:'#9c27b0', C1:'#ff9800', C2:'#f44336' };

  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="router.navigate('/')" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0">📖 语法练习</h1>
      </div>
      <p style="color:var(--c-muted); margin:0 0 20px">按级别选择知识点，每个知识点配选择题练习。</p>
      ${levels.map(lv => {
        const topics = GRAMMAR.filter(t => t.level === lv);
        if (!topics.length) return '';
        return `
          <div style="margin-bottom:20px">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px">
              <span style="background:${levelColors[lv]}; color:#fff; padding:3px 10px; border-radius:999px; font-size:13px; font-weight:600">${lv}</span>
              <span style="color:var(--c-muted); font-size:14px">${topics.length} 个知识点</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px">
              ${topics.map((t,i) => `
                <div class="card" style="padding:14px 16px; cursor:pointer; display:flex; justify-content:space-between; align-items:center" onclick="window.__openTopic('${t.id}')">
                  <div>
                    <div style="font-weight:600">${t.title}</div>
                    <div style="font-size:12px; color:var(--c-muted); margin-top:2px">${t.rule.slice(0,50)}…</div>
                  </div>
                  <span style="color:var(--c-muted)">›</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">${''}首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/grammar')">语法</button>
        <button class="tabbar__item" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;

  window.__openTopic = (id) => {
    currentTopic = GRAMMAR.find(t => t.id === id);
    quizIndex = 0;
    quizScore = 0;
    render();
  };
}

function renderTopic(app) {
  const t = currentTopic;
  const q = t.quiz[quizIndex];

  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backToList()" style="padding:8px 12px">← 列表</button>
        <h1 style="margin:0; font-size:20px">${t.title}</h1>
      </div>

      <div class="card" style="padding:20px; margin-bottom:16px">
        <div style="font-size:13px; color:var(--c-muted); margin-bottom:8px">📌 规则</div>
        <p style="margin:0 0 12px; line-height:1.6">${t.rule}</p>
        <div style="font-size:13px; color:var(--c-muted); margin-bottom:6px">📝 例句</div>
        ${t.examples.map(e => `<div style="padding:6px 0; border-bottom:1px solid var(--c-border); font-size:14px">${e}</div>`).join('')}
      </div>

      <div class="card" style="padding:20px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
          <div style="font-weight:600">练习 ${quizIndex+1}/${t.quiz.length}</div>
          <div style="font-size:13px; color:var(--c-muted)">得分 ${quizScore}</div>
        </div>
        <div style="font-size:18px; margin-bottom:20px; line-height:1.5">${q.q}</div>
        <div style="display:flex; flex-direction:column; gap:10px">
          ${q.opts.map((o,i) => `
            <button class="btn btn--ghost" style="padding:14px; text-align:left" onclick="window.__answerGrammar(${i})">
              ${String.fromCharCode(65+i)}. ${o}
            </button>
          `).join('')}
        </div>
        <div id="grammar-feedback" style="display:none; margin-top:16px; padding:14px; border-radius:12px; text-align:center"></div>
      </div>

      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/grammar')">语法</button>
        <button class="tabbar__item" onclick="router.navigate('/conj')">变位</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;

  window.__backToList = () => { currentTopic = null; render(); };
  window.__answerGrammar = (i) => {
    const fb = document.getElementById('grammar-feedback');
    const correct = i === q.ans;
    if (correct) quizScore++;
    fb.style.display = 'block';
    fb.style.background = correct ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)';
    fb.style.color = correct ? '#4caf50' : '#f44336';
    fb.innerHTML = correct
      ? `✅ 正确！<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextGrammar()">下一题 →</button></div>`
      : `❌ 正确答案：${q.opts[q.ans]}<div style="margin-top:10px"><button class="btn btn--primary" onclick="window.__nextGrammar()">下一题 →</button></div>`;
  };
  window.__nextGrammar = () => {
    quizIndex++;
    if (quizIndex >= t.quiz.length) {
      currentTopic = null;
    }
    render();
  };
}
