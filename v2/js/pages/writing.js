// ============================================
// pages/writing.js — 写作练习（中译葡句子）
// ============================================

import { router } from '../router.js';

const SENTENCES = [
  {
    id: 'apresentacao',
    level: 'A1',
    title: '自我介绍',
    cn: '我叫玛丽亚，我是葡萄牙人，我住在里斯本。我是老师，我在一所中学工作。我喜欢看书和听音乐。',
    pt: 'Eu chamo-me Maria. Sou portuguesa e vivo em Lisboa. Sou professora e trabalho numa escola secundária. Gosto de ler e de ouvir música.',
    tip: 'chamar-se = 叫...名字；ser + 职业 = 是...；gostar de + 动词 = 喜欢做某事'
  },
  {
    id: 'dia-a-dia',
    level: 'A1',
    title: '日常生活',
    cn: '我每天早上七点起床，喝咖啡吃面包。然后我开车去上班。中午在公司吃午饭。下午六点下班，回家做晚饭。晚上看电视，十点睡觉。',
    pt: 'Eu acordo todos os dias às sete da manhã. Tomo café e como pão. Depois vou de carro para o trabalho. Ao meio-dia almoço na empresa. Saio do trabalho às seis da tarde e vou para casa jantar. À noite vejo televisão e deito-me às dez.',
    tip: 'acordar = 起床；deitar-se = 睡觉；ir de carro = 开车去'
  },
  {
    id: 'viagem',
    level: 'A2',
    title: '旅行经历',
    cn: '去年夏天我和家人去了西班牙。我们开车去的，路上花了八个小时。我们在巴塞罗那待了一个星期。我们参观了圣家堂，去了海滩，吃了很多海鲜。那是一次很棒的旅行。',
    pt: 'No verão passado, eu e a minha família fomos a Espanha. Fomos de carro e demorámos oito horas no caminho. Ficámos em Barcelona durante uma semana. Visitámos a Sagrada Família, fomos à praia e comemos muitos mariscos. Foi uma viagem maravilhosa.',
    tip: 'no verão passado = 去年夏天；ficar = 待（停留）；demorar = 花费（时间）'
  },
  {
    id: 'opiniao',
    level: 'B1',
    title: '表达观点',
    cn: '我认为学习一门外语非常重要。首先，它能帮助我们认识不同的文化。其次，找工作的时候会有更多机会。当然，学习语言需要时间和努力，但结果是值得的。我建议大家每天练习一点，不要害怕犯错。',
    pt: 'Eu acho que aprender uma língua estrangeira é muito importante. Em primeiro lugar, ajuda-nos a conhecer diferentes culturas. Em segundo lugar, temos mais oportunidades quando procuramos emprego. Claro que aprender uma língua requer tempo e esforço, mas o resultado vale a pena. Aconselho todos a praticar um pouco todos os dias e a não ter medo de cometer erros.',
    tip: 'em primeiro lugar = 首先；em segundo lugar = 其次；valer a pena = 值得；ter medo de = 害怕'
  },
  {
    id: 'restaurante',
    level: 'A1',
    title: '在餐厅',
    cn: '我想预订一张两个人的桌子，晚上七点。我要一份鱼，配沙拉和土豆。请来一杯白葡萄酒。请给我账单，谢谢。',
    pt: 'Quero reservar uma mesa para duas pessoas, às sete da noite. Quero um peixe com salada e batatas. Traga-me um copo de vinho branco. Traga-me a conta, por favor.',
    tip: 'quero = 我想要；trazer = 带来；por favor = 请'
  },
  {
    id: 'saude',
    level: 'A2',
    title: '健康与习惯',
    cn: '为了保持健康，我每天早上跑步三十分钟。我很少吃垃圾食品，多吃水果和蔬菜。我每天睡八个小时，因为充足的睡眠很重要。我不抽烟，也不怎么喝酒。我觉得健康的生活方式能让人更快乐。',
    pt: 'Para manter a saúde, eu corro trinta minutos todas as manhãs. Raramente como comida lixo e como muitas frutas e legumes. Durmo oito horas por dia, porque o sono suficiente é muito importante. Não fumo e quase não bebo álcool. Acho que um estilo de vida saudável nos faz mais felizes.',
    tip: 'para + 动词 = 为了...；raramente = 很少；manter a saúde = 保持健康'
  },
  {
    id: 'tecnologia',
    level: 'B1',
    title: '科技与生活',
    cn: '现在智能手机已经成为我们生活中不可或缺的一部分。我们用它来通讯、工作、学习和娱乐。然而，专家警告说过度使用手机会影响我们的健康和人际关系。建议大家每天减少屏幕时间，多花时间和家人朋友面对面交流。',
    pt: 'Hoje em dia, os smartphones tornaram-se uma parte indispensável das nossas vidas. Nós usamo-los para comunicar, trabalhar, estudar e entreter. No entanto, os especialistas alertam que o uso excessivo do telemóvel afeta a nossa saúde e as nossas relações interpessoais. Aconselham-nos a reduzir o tempo de ecrã todos os dias e a passar mais tempo com a família e os amigos pessoalmente.',
    tip: 'hoje em dia = 如今；tornar-se = 变成；alertar que = 警告说；aconselhar alguém a = 建议某人做某事'
  },
  {
    id: 'sonho',
    level: 'B2',
    title: '梦想与未来',
    cn: '从小我就梦想着有一天能环游世界。我想参观欧洲所有的国家，体验不同的文化，品尝当地美食。虽然这需要很多钱和时间，但我相信只要努力工作，总有一天能实现这个梦想。现在我每天都在存钱，为未来的旅行做准备。',
    pt: 'Desde pequeno, sonhava que um dia iria dar a volta ao mundo. Quero visitar todos os países da Europa, experimentar culturas diferentes e provar a gastronomia local. Embora isto exija muito dinheiro e tempo, acredito que, trabalhando arduamente, um dia conseguirei realizar este sonho. Agora, estou a poupar dinheiro todos os dias para preparar a viagem do futuro.',
    tip: 'desde pequeno = 从小；sonhar que = 梦想着；embora = 虽然（接虚拟式）；realizar um sonho = 实现梦想'
  },
];

let currentSentence = null;
let userAnswer = '';
let showAnswer = false;

export function render() {
  const app = document.getElementById('app');

  if (currentSentence) {
    renderWriting(app);
  } else {
    renderList(app);
  }
}

function renderList(app) {
  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="router.navigate('/')" style="padding:8px 12px">← 返回</button>
        <h1 style="margin:0">✍️ 写作练习</h1>
      </div>
      <p style="color:var(--c-muted); margin:0 0 20px">Traduza a frase do chinês para o português e compare com a resposta.</p>
      <div style="display:flex; flex-direction:column; gap:12px">
        ${SENTENCES.map(s => `
          <div class="card" style="padding:16px; cursor:pointer" onclick="window.__openWriting('${s.id}')">
            <div style="display:flex; justify-content:space-between; align-items:center">
              <div>
                <div style="font-weight:600">${s.title}</div>
                <div style="font-size:13px; color:var(--c-muted); margin-top:4px">中文 → 葡语翻译</div>
              </div>
              <span style="background:${s.level === 'A1' ? '#4caf50' : s.level === 'A2' ? '#8bc34a' : '#2196f3'}; color:#fff; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600">${s.level}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/reading')">阅读</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/writing')">写作</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;

  window.__openWriting = (id) => {
    currentSentence = SENTENCES.find(s => s.id === id);
    userAnswer = '';
    showAnswer = false;
    render();
  };
}

function renderWriting(app) {
  const s = currentSentence;

  app.innerHTML = `
    <div class="page container">
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0 16px">
        <button class="btn btn--ghost" onclick="window.__backToList()" style="padding:8px 12px">← 列表</button>
        <h1 style="margin:0; font-size:18px">${s.title}</h1>
      </div>

      <div class="card" style="padding:20px; margin-bottom:16px">
        <div style="font-size:13px; color:var(--c-muted); margin-bottom:8px">📝 中文句子</div>
        <div style="font-size:16px; line-height:1.6; margin-bottom:20px">${s.cn}</div>
        
        <div style="font-size:13px; color:var(--c-muted); margin-bottom:8px">✍️ 你的葡语翻译</div>
        <textarea id="writing-input" style="width:100%; min-height:120px; padding:12px; border:1px solid var(--c-border); border-radius:8px; font-size:15px; font-family:inherit; resize:vertical" placeholder="Escreva a sua tradução aqui..." oninput="window.__updateAnswer(this.value)">${userAnswer}</textarea>
        
        <button class="btn btn--primary btn--block" style="margin-top:12px" onclick="window.__showAnswer()">👀 查看参考答案</button>
      </div>

      ${showAnswer ? `
      <div class="card" style="padding:20px; margin-bottom:16px; background:#e8f5e9; border-left:4px solid #4caf50">
        <div style="font-size:13px; color:#4caf50; font-weight:600; margin-bottom:8px">✅ 参考答案</div>
        <div style="font-size:15px; line-height:1.6; margin-bottom:16px">${s.pt}</div>
        <div style="font-size:13px; color:var(--c-muted); padding-top:12px; border-top:1px solid #c8e6c9">
          💡 <strong>提示：</strong>${s.tip}
        </div>
      </div>
      ` : ''}

      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">首页</button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">学习</button>
        <button class="tabbar__item" onclick="router.navigate('/reading')">阅读</button>
        <button class="tabbar__item is-active" onclick="router.navigate('/writing')">写作</button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">统计</button>
      </nav>
    </div>
  `;

  window.__backToList = () => { currentSentence = null; render(); };
  window.__updateAnswer = (val) => { userAnswer = val; };
  window.__showAnswer = () => { showAnswer = true; render(); };
}
