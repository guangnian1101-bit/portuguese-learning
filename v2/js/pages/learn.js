// ============================================
// pages/learn.js — 单词学习页（翻卡 + 选择题 + 连线 三模式）
// ============================================

import { getRandomWords, getWordsByFilter } from '../data.js';
import { playAudio } from '../audio.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';
import { splitSyllables } from '../syllables.js';

// 学习状态
let currentIndex = 0;
let wordList = [];
let isFlipped = false;
let lastAction = null;
let studyMode = 'flashcard'; // flashcard | quiz | connect

// 选择题状态
let quizOptions = [];
let quizAnswered = false;
let correctCount = 0;
// 每题作答记录（key = wordList 下标），用于回退与完成后的回顾
let answers = {};

// 滑动状态
let touchStartX = 0;
let touchStartY = 0;
let currentTranslateX = 0;
let isDragging = false;

export async function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="page container" style="max-width: 500px; margin: 0 auto">
      <!-- 顶部进度条 -->
      <div style="padding: 24px 0 8px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
          <button onclick="router.navigate('/')" style="background: none; border: none; color: var(--c-muted); font-size: 16px; cursor: pointer">
            ← 返回
          </button>
          <div style="display: flex; align-items: center; gap: 12px">
            <button id="undo-btn" onclick="handleUndo()" style="background: none; border: none; color: var(--c-muted); font-size: 16px; cursor: pointer; opacity: 0.3" disabled>
              ↩ 撤销
            </button>
            <span style="font-size: 14px; color: var(--c-muted)" id="progress-text">0 / 20</span>
          </div>
        </div>
        <div class="progress">
          <div class="progress__bar" id="progress-bar" style="width: 0%"></div>
        </div>
        
        <!-- 模式切换 -->
        <div style="display: flex; gap: 8px; margin-top: 16px">
          <button id="mode-flashcard" onclick="switchMode('flashcard')" class="btn btn--ghost" style="flex: 1; padding: 8px; font-size: 13px">
            🃏 翻卡
          </button>
          <button id="mode-quiz" onclick="switchMode('quiz')" class="btn btn--ghost" style="flex: 1; padding: 8px; font-size: 13px">
            ✅ 选择题
          </button>
          <button id="mode-connect" onclick="switchMode('connect')" class="btn btn--ghost" style="flex: 1; padding: 8px; font-size: 13px">
            🔗 连线
          </button>
        </div>
      </div>
      
      <!-- 加载中 -->
      <div id="loading" style="text-align: center; padding: 100px 0">
        <div style="font-size: 48px; margin-bottom: 16px">📚</div>
        <div style="color: var(--c-muted)">加载单词中...</div>
      </div>
      
      <!-- 翻卡模式区域 -->
      <div id="flashcard-area" style="display: none; position: relative">
        <div id="swipe-left-overlay" style="
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(244, 67, 54, 0.2); border-radius: var(--r-xl);
          opacity: 0; pointer-events: none; z-index: 10;
          display: flex; align-items: center; justify-content: flex-start; padding-left: 24px;
        ">
          <span style="font-size: 24px; font-weight: 700; color: #f44336; transform: rotate(-15deg)">不认识</span>
        </div>
        
        <div id="swipe-right-overlay" style="
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(76, 175, 80, 0.2); border-radius: var(--r-xl);
          opacity: 0; pointer-events: none; z-index: 10;
          display: flex; align-items: center; justify-content: flex-end; padding-right: 24px;
        ">
          <span style="font-size: 24px; font-weight: 700; color: #4caf50; transform: rotate(15deg)">认识</span>
        </div>
        
        <div id="rating-toast" style="
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: var(--c-surface); padding: 12px 24px; border-radius: 12px;
          box-shadow: var(--shadow-lg); font-size: 14px; z-index: 100;
          opacity: 0; transition: opacity 200ms; pointer-events: none;
        ">
          已标记认识
        </div>
        
        <div class="flip-container" id="card-container">
          <div id="flip-swipe-wrapper" style="position: absolute; inset: 0; transform-style: preserve-3d;">
            <div class="flip-card" id="flip-card" onclick="flipCard()">
            <div class="flip-face flip-face--front">
              <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center">
                <span id="word-pos-front" style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background: var(--c-brand-soft); color: var(--c-ink-secondary)"></span>
                <span id="word-level-front" style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background: var(--c-brand-soft); color: var(--c-ink-secondary)"></span>
              </div>
              <div class="flip-face__pt" id="word-pt">casa</div>
              <div class="flip-face__cn" id="word-cn" style="display: none; margin-top: 16px; text-align: center"></div>
              <div style="margin-top: 16px; display: flex; gap: 12px">
                <button class="btn btn--ghost" style="min-height: 44px; padding: 0 16px" onclick="event.stopPropagation(); playCurrentAudio()">
                  <span style="width: 18px; height: 18px">${Icons.sound}</span>
                  发音
                </button>
                <button class="btn btn--ghost" style="min-height: 44px; padding: 0 16px" onclick="event.stopPropagation(); toggleStar()">
                  <span style="width: 18px; height: 18px">${Icons.star}</span>
                  <span id="star-label">收藏</span>
                </button>
              </div>
              <div style="margin-top: 24px; font-size: 13px; color: var(--c-muted)" id="flip-hint">
                点击卡片看释义 · 左右滑动评级
              </div>
            </div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px">
          <button class="btn btn--rate btn--no" onclick="rateCard('no')">❌ 不认识</button>
          <button class="btn btn--rate btn--meh" onclick="rateCard('meh')">⚠️ 模糊</button>
          <button class="btn btn--rate btn--yes" onclick="rateCard('yes')">✅ 认识</button>
        </div>
      </div>
      
      <!-- 选择题模式区域 -->
      <div id="quiz-area" style="display: none">
        <div class="card" style="padding: 24px; margin-bottom: 16px; text-align: center">
          <div style="font-size: 14px; color: var(--c-muted); margin-bottom: 12px">这个单词是什么意思？</div>
          <div style="font-size: 32px; font-weight: 700; margin-bottom: 8px" id="quiz-word-pt">casa</div>
          <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 16px">
            <span id="quiz-pos" style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background: var(--c-brand-soft); color: var(--c-ink-secondary)"></span>
            <span id="quiz-level" style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background: var(--c-brand-soft); color: var(--c-ink-secondary)"></span>
          </div>
          <button class="btn btn--ghost" onclick="playCurrentAudio()">
            <span style="width: 18px; height: 18px">${Icons.sound}</span>
            🔊 听发音
          </button>
        </div>
        
        <div id="quiz-options" style="display: flex; flex-direction: column; gap: 12px">
          <!-- 选项由 JS 渲染 -->
        </div>
        
        <div id="quiz-feedback" style="display: none; margin-top: 16px; padding: 16px; border-radius: 12px; text-align: center">
          <div id="quiz-feedback-text"></div>
          <div style="display:flex; gap:10px; justify-content:center; margin-top:12px">
            <button class="btn btn--ghost" id="quiz-prev-btn" style="display:none" onclick="prevQuestion()">← 上一题</button>
            <button class="btn btn--primary" onclick="nextQuiz()">下一题 →</button>
          </div>
        </div>
      </div>
      
      <!-- 连线模式区域 -->
      <div id="connect-area" style="display: none">
        <div class="card" style="padding: 20px 18px; margin-bottom: 14px; text-align: center">
          <div style="font-size: 13px; color: var(--c-muted); margin-bottom: 8px">按音节顺序连线，把单词拼出来</div>
          <div id="connect-cn" style="font-size: 20px; font-weight: 600; line-height: 1.5; margin-bottom: 12px">casa</div>
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center">
            <span id="connect-pos" style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background: var(--c-brand-soft); color: var(--c-ink-secondary)"></span>
            <span id="connect-level" style="font-size: 12px; padding: 4px 12px; border-radius: 999px; background: var(--c-brand-soft); color: var(--c-ink-secondary)"></span>
            <button class="btn btn--ghost" style="min-height: 38px; padding: 0 14px; font-size: 13px" onclick="playCurrentAudio()">
              <span style="width: 16px; height: 16px">${Icons.sound}</span>
              发音
            </button>
          </div>
        </div>

        <div class="connect-board" id="connect-board">
          <svg id="connect-lines" xmlns="http://www.w3.org/2000/svg"></svg>
          <div class="connect-boxes" id="connect-boxes"></div>
        </div>

        <div id="connect-hint" style="text-align: center; color: var(--c-muted); font-size: 13px; margin-top: 8px; min-height: 18px">
          点一个音节开始，再点相邻的音节连起来
        </div>

        <div id="connect-feedback" style="display: none; margin-top: 14px; padding: 16px; border-radius: 12px; text-align: center">
          <div id="connect-feedback-text"></div>
          <div style="display:flex; gap:10px; justify-content:center; margin-top:12px">
            <button class="btn btn--ghost" id="connect-prev-btn" style="display:none" onclick="prevQuestion()">← 上一题</button>
            <button class="btn btn--primary" onclick="nextConnect()">下一题 →</button>
          </div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div id="done-area" style="display: none; text-align: center; padding: 60px 0">
        <div style="font-size: 64px; margin-bottom: 16px">🎉</div>
        <h2 style="margin-bottom: 8px">太棒了！</h2>
        <p style="color: var(--c-muted); margin-bottom: 8px" id="done-stats">本轮学习完成</p>
        <p style="color: var(--c-muted); margin-bottom: 24px; font-size: 14px" id="quiz-stats"></p>
        <div id="review-wrap" style="display:none; margin-bottom:24px">
          <div style="font-size:14px; color:var(--c-muted); margin-bottom:12px">本轮单词回顾 · 点卡牌看释义</div>
          <div class="review-list" id="review-list"></div>
        </div>
        <button class="btn btn--primary" onclick="router.navigate('/')">返回首页</button>
      </div>
    </div>
  `;
  
  // 加载单词
  await loadWords();
  
  // 渲染第一张卡
  renderCard();
  
  // 绑定滑动手势
  initSwipeGesture();
  
  // 更新模式按钮状态
  updateModeButtons();
}

// 切换学习模式
window.switchMode = function(mode) {
  studyMode = mode;
  updateModeButtons();
  
  document.getElementById('flashcard-area').style.display = mode === 'flashcard' ? 'block' : 'none';
  document.getElementById('quiz-area').style.display = mode === 'quiz' ? 'block' : 'none';
  document.getElementById('connect-area').style.display = mode === 'connect' ? 'block' : 'none';
  
  if (mode === 'quiz') {
    renderQuiz();
  } else if (mode === 'connect') {
    renderConnect();
  }
};

function updateModeButtons() {
  ['flashcard', 'quiz', 'connect'].forEach(mode => {
    const btn = document.getElementById('mode-' + mode);
    if (!btn) return;
    if (studyMode === mode) {
      btn.style.background = 'var(--c-brand)';
      btn.style.color = 'var(--c-bg)';
    } else {
      btn.style.background = '';
      btn.style.color = '';
    }
  });
}

// 加载单词列表
async function loadWords() {
  const count = store.state.dailyCount || 20;
  
  const filterStr = sessionStorage.getItem('studyFilter');
  if (filterStr) {
    const filter = JSON.parse(filterStr);
    wordList = await getWordsByFilter(filter, count);
    sessionStorage.removeItem('studyFilter');
  } else {
    wordList = await getRandomWords(count);
  }
  
  currentIndex = 0;
  lastAction = null;
  correctCount = 0;
  answers = {};
}

// ========== 翻卡模式 ==========

function renderCard() {
  if (currentIndex >= wordList.length) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('flashcard-area').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('connect-area').style.display = 'none';
    document.getElementById('done-area').style.display = 'block';
    document.getElementById('done-stats').textContent = `完成了 ${wordList.length} 个单词`;
    if (studyMode === 'quiz') {
      document.getElementById('quiz-stats').textContent = `选择题答对 ${correctCount} / ${wordList.length}`;
    } else if (studyMode === 'connect') {
      document.getElementById('quiz-stats').textContent = `连线拼对 ${correctCount} / ${wordList.length}`;
    } else {
      document.getElementById('quiz-stats').textContent = '';
    }
    renderReviewList();
    return;
  }
  
  const word = wordList[currentIndex];
  isFlipped = false;
  
  document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${wordList.length}`;
  document.getElementById('progress-bar').style.width = `${(currentIndex / wordList.length) * 100}%`;
  
  document.getElementById('word-pt').textContent = word.pt;
  document.getElementById('word-cn').textContent = word.cn || '';
  
  updateTag('word-pos-front', word.pos);
  updateTag('word-level-front', word.level);
  
  const isStarred = !!store.state.starred[word.id];
  document.getElementById('star-label').textContent = isStarred ? '已收藏' : '收藏';
  
  // 重置为显示单词视图
  isFlipped = false;
  document.getElementById('word-pt').style.display = 'block';
  document.getElementById('word-cn').style.display = 'none';
  document.getElementById('flip-hint').textContent = '点击卡片看释义 · 左右滑动评级';
  resetCardPosition();
  
  document.getElementById('loading').style.display = 'none';
  document.getElementById('flashcard-area').style.display = studyMode === 'flashcard' ? 'block' : 'none';
  document.getElementById('quiz-area').style.display = studyMode === 'quiz' ? 'block' : 'none';
  document.getElementById('connect-area').style.display = studyMode === 'connect' ? 'block' : 'none';
  
  updateUndoButton();
  
  if (studyMode === 'quiz') {
    renderQuiz();
  } else if (studyMode === 'connect') {
    renderConnect();
  }
}

function updateTag(id, value) {
  const el = document.getElementById(id);
  if (value) {
    el.textContent = value;
    el.style.display = 'inline-block';
  } else {
    el.style.display = 'none';
  }
}

function resetCardPosition() {
  const wrapper = document.getElementById('flip-swipe-wrapper');
  wrapper.style.transition = 'transform 200ms ease';
  wrapper.style.transform = 'translateX(0) rotate(0deg)';
  document.getElementById('swipe-left-overlay').style.opacity = '0';
  document.getElementById('swipe-right-overlay').style.opacity = '0';
  setTimeout(() => { wrapper.style.transition = ''; }, 200);
}

function updateUndoButton() {
  const undoBtn = document.getElementById('undo-btn');
  let can = false;
  if (studyMode === 'flashcard') {
    can = !!lastAction;
  } else {
    // 找最近一个已作答的下标（连线模式会跳过脏词，下标可能不连续）
    let p = currentIndex - 1;
    while (p >= 0 && !answers[p]) p--;
    can = p >= 0;
  }
  undoBtn.disabled = !can;
  undoBtn.style.opacity = can ? '1' : '0.3';
}

window.flipCard = function() {
  if (isDragging) return;
  isFlipped = !isFlipped;
  
  const word = wordList[currentIndex];
  if (!word) return;
  
  const ptEl = document.getElementById('word-pt');
  const cnEl = document.getElementById('word-cn');
  const backHint = document.getElementById('flip-hint');
  
  if (isFlipped) {
    // 切换到释义视图
    ptEl.style.display = 'none';
    cnEl.style.display = 'block';
    cnEl.textContent = word.cn || '（无释义）';
    backHint.textContent = '点击卡片返回单词';
  } else {
    // 切换回单词视图
    ptEl.style.display = 'block';
    cnEl.style.display = 'none';
    backHint.textContent = '点击卡片看释义 · 左右滑动评级';
  }
};

window.playCurrentAudio = function() {
  const word = wordList[currentIndex];
  if (word) playAudio(word);
};

window.toggleStar = function() {
  const word = wordList[currentIndex];
  if (word) {
    store.toggleStar(word.id);
    const isStarred = !!store.state.starred[word.id];
    document.getElementById('star-label').textContent = isStarred ? '已收藏' : '收藏';
  }
};

function showRatingToast(message) {
  const toast = document.getElementById('rating-toast');
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 800);
}

window.rateCard = function(rating) {
  const word = wordList[currentIndex];
  if (!word) return;
  
  lastAction = { index: currentIndex, word, rating };
  
  if (rating === 'no') {
    store.addWrong(word.id);
    showRatingToast('❌ 已加入错词本');
  } else if (rating === 'meh') {
    store.addWrong(word.id);
    showRatingToast('⚠️ 标记模糊');
  } else {
    store.markLearned(word.id);
    showRatingToast('✅ 已标记认识');
  }
  
  currentIndex++;
  setTimeout(() => renderCard(), 300);
};

window.undoLastAction = function() {
  if (!lastAction) return;
  const { index, word, rating } = lastAction;
  
  if (rating === 'no' || rating === 'meh') {
    store.removeWrong(word.id);
  }
  
  currentIndex = index;
  lastAction = null;
  renderCard();
  showRatingToast('↩ 已撤销');
};

// ========== 选择题模式 ==========

function renderQuiz() {
  const word = wordList[currentIndex];
  if (!word) return;
  
  quizAnswered = false;
  
  document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${wordList.length}`;
  document.getElementById('progress-bar').style.width = `${(currentIndex / wordList.length) * 100}%`;
  
  document.getElementById('quiz-word-pt').textContent = word.pt;
  updateTag('quiz-pos', word.pos);
  updateTag('quiz-level', word.level);
  
  // 生成 4 个选项（1 个正确 + 3 个干扰）
  generateQuizOptions(word);
  
  // 渲染选项
  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = quizOptions.map((opt, i) => `
    <button 
      class="btn btn--quiz-option" 
      style="padding: 16px; text-align: left; font-size: 15px"
      onclick="selectQuizOption(${i})"
      id="quiz-option-${i}"
    >
      ${String.fromCharCode(65 + i)}. ${opt.display}
    </button>
  `).join('');
  
  document.getElementById('quiz-feedback').style.display = 'none';
}

function generateQuizOptions(correctWord) {
  // 从 wordList 里随机找 3 个干扰项
  const distractors = [];
  const pool = wordList.filter(w => w.id !== correctWord.id);
  
  // 随机打乱
  const shuffled = pool.sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    distractors.push(shuffled[i]);
  }
  
  // 组合选项：正确答案 + 干扰项
  const options = [correctWord, ...distractors];
  
  // 打乱顺序
  options.sort(() => 0.5 - Math.random());
  
  // 提取最简短翻译（只显示核心释义，不带搭配、引申义等）
  function shortCn(cn) {
    if (!cn) return '（无释义）';
    // 先去掉括号里的内容
    let clean = cn.replace(/[（(].*?[）)]/g, '').trim();
    // 按分号、逗号、顿号分割，取第一个部分
    const parts = clean.split(/[；;，,、。]/);
    let result = parts[0].trim();
    // 限制最多 8 个字，太长就截断
    if (result.length > 8) {
      result = result.substring(0, 8) + '…';
    }
    return result || '（无释义）';
  }
  
  // 保存选项和正确答案索引
  quizOptions = options.map(w => ({
    word: w,
    display: shortCn(w.cn)
  }));
  
  quizCorrectIndex = options.findIndex(w => w.id === correctWord.id);
}

let quizCorrectIndex = 0;

window.selectQuizOption = function(index) {
  if (quizAnswered) return;
  quizAnswered = true;
  
  const isCorrect = index === quizCorrectIndex;
  const correctWord = wordList[currentIndex];
  
  // 标记选项颜色
  for (let i = 0; i < quizOptions.length; i++) {
    const btn = document.getElementById(`quiz-option-${i}`);
    btn.disabled = true;
    
    if (i === quizCorrectIndex) {
      btn.style.background = '#4caf50';
      btn.style.color = 'white';
    } else if (i === index && !isCorrect) {
      btn.style.background = '#f44336';
      btn.style.color = 'white';
    }
  }
  
  // 更新统计
  if (isCorrect) {
    correctCount++;
  } else {
    // 答错加入错词本
    store.addWrong(correctWord.id);
  }
  answers[currentIndex] = { correct: isCorrect };
  
  // 显示反馈
  const feedbackEl = document.getElementById('quiz-feedback');
  const feedbackText = document.getElementById('quiz-feedback-text');
  
  if (isCorrect) {
    feedbackEl.style.background = 'rgba(76, 175, 80, 0.1)';
    feedbackEl.style.color = '#4caf50';
    feedbackText.innerHTML = `✅ 回答正确！<br><small>${correctWord.pt} = ${correctWord.cn}</small>`;
  } else {
    feedbackEl.style.background = 'rgba(244, 67, 54, 0.1)';
    feedbackEl.style.color = '#f44336';
    feedbackText.innerHTML = `❌ 正确答案是：${quizOptions[quizCorrectIndex].word.pt}<br><small>${quizOptions[quizCorrectIndex].display}</small>`;
  }
  
  feedbackEl.style.display = 'block';
  const prevBtn = document.getElementById('quiz-prev-btn');
  if (prevBtn) prevBtn.style.display = currentIndex > 0 ? '' : 'none';
};

window.nextQuiz = function() {
  currentIndex++;
  renderCard();
};

// ========== 连线模式 ==========

let connectSyllables = [];
let connectBoxes = [];   // { syl, order }
let connectEdges = [];   // 已连的框索引对 { from, to }
let connectSelected = -1;
let connectAnswered = false;
let connectResizeBound = false;

function shortMeaning(cn, limit = 14) {
  if (!cn) return '（无释义）';
  const clean = cn.replace(/[（(].*?[）)]/g, '').trim();
  const parts = clean.split(/[；;，,、。]/);
  let result = (parts[0] || '').trim();
  if (result.length > limit) result = result.substring(0, limit) + '…';
  return result || '（无释义）';
}

// 连线题只处理单个纯字母单词（短语、含数字或标点的词条跳过）
function isConnectableWord(word) {
  if (!word || !word.pt) return false;
  if (!/^[A-Za-zÀ-ÿ]+$/.test(word.pt)) return false;
  return splitSyllables(word.pt).length >= 2;
}

function renderConnect() {
  // 跳过短语 / 非纯字母词条，连线题只出单个单词
  while (currentIndex < wordList.length && !isConnectableWord(wordList[currentIndex])) {
    currentIndex++;
  }
  if (currentIndex >= wordList.length) {
    renderCard();
    return;
  }

  const word = wordList[currentIndex];
  if (!word) return;

  bindConnectResize();

  connectAnswered = false;
  connectSelected = -1;
  connectEdges = [];

  document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${wordList.length}`;
  document.getElementById('progress-bar').style.width = `${(currentIndex / wordList.length) * 100}%`;

  document.getElementById('connect-cn').textContent = shortMeaning(word.cn);
  updateTag('connect-pos', word.pos);
  updateTag('connect-level', word.level);

  const svg = document.getElementById('connect-lines');
  const boxesEl = document.getElementById('connect-boxes');
  const hintEl = document.getElementById('connect-hint');
  const feedbackEl = document.getElementById('connect-feedback');
  const feedbackText = document.getElementById('connect-feedback-text');
  if (svg) svg.innerHTML = '';
  feedbackEl.style.display = 'none';

  connectSyllables = splitSyllables(word.pt);

  // 单音节词没有可连部分，直接给出答案
  if (connectSyllables.length < 2) {
    boxesEl.innerHTML = `<div class="syl-box syl-box--whole">${word.pt}</div>`;
    hintEl.textContent = '这个词只有一个音节，不需要连线';
    feedbackEl.style.display = 'block';
    feedbackEl.style.background = 'var(--c-brand-soft)';
    feedbackEl.style.color = 'var(--c-ink-secondary)';
    feedbackText.innerHTML = `${word.pt} = ${shortMeaning(word.cn, 24)}`;
    connectAnswered = true;
    return;
  }

  // 音节方框按正确顺序排列：从左到右串起来就是单词
  connectBoxes = connectSyllables.map((syl, order) => ({ syl, order }));

  boxesEl.innerHTML = connectBoxes.map((b, i) => `
    <button class="syl-box" data-idx="${i}" onclick="clickSyllable(${i})">${b.syl}</button>
  `).join('');

  hintEl.textContent = '点一个音节开始，再点相邻的音节连起来';
}

window.clickSyllable = function(idx) {
  if (connectAnswered) return;
  const el = document.querySelector(`.syl-box[data-idx="${idx}"]`);
  if (!el) return;

  // 再点一次 → 取消选中
  if (connectSelected === idx) {
    el.classList.remove('is-source');
    connectSelected = -1;
    return;
  }

  // 选起点
  if (connectSelected === -1) {
    el.classList.add('is-source');
    connectSelected = idx;
    document.getElementById('connect-hint').textContent =
      `已选中「${connectBoxes[idx].syl}」，点相邻的音节连线`;
    return;
  }

  const from = connectSelected;
  const adjacency = Math.abs(connectBoxes[from].order - connectBoxes[idx].order) === 1;
  const alreadyLinked = connectEdges.some(e =>
    (e.from === from && e.to === idx) || (e.from === idx && e.to === from));

  if (!adjacency || alreadyLinked) {
    flashWrongSyllable(el, alreadyLinked ? '这两段已经连过了' : '这两个音节不相邻');
    const fromEl = document.querySelector(`.syl-box[data-idx="${from}"]`);
    if (fromEl) fromEl.classList.remove('is-source');
    connectSelected = -1;
    return;
  }

  // 连线成功
  drawConnectLine(from, idx, false);
  connectEdges.push({ from, to: idx });
  markSyllableLinked(from);
  markSyllableLinked(idx);

  const fromEl = document.querySelector(`.syl-box[data-idx="${from}"]`);
  if (fromEl) fromEl.classList.remove('is-source');

  // 刚连上的方框成为新的起点，方便顺着往下连
  el.classList.add('is-source');
  connectSelected = idx;

  const needed = connectSyllables.length - 1;
  if (connectEdges.length >= needed) {
    finishConnect();
  } else {
    document.getElementById('connect-hint').textContent =
      `已连 ${connectEdges.length} / ${needed} 条，继续点相邻的音节`;
  }
};

function flashWrongSyllable(el, message) {
  el.classList.add('is-wrong');
  document.getElementById('connect-hint').textContent = message;
  setTimeout(() => el.classList.remove('is-wrong'), 420);
  if (navigator.vibrate) navigator.vibrate(25);
}

function markSyllableLinked(idx) {
  const el = document.querySelector(`.syl-box[data-idx="${idx}"]`);
  if (el) el.classList.add('is-linked');
}

function drawConnectLine(fromIdx, toIdx, wrong) {
  const svg = document.getElementById('connect-lines');
  const board = document.getElementById('connect-board');
  const a = document.querySelector(`.syl-box[data-idx="${fromIdx}"]`);
  const b = document.querySelector(`.syl-box[data-idx="${toIdx}"]`);
  if (!svg || !board || !a || !b) return;

  const br = board.getBoundingClientRect();
  const ar = a.getBoundingClientRect();
  const bR = b.getBoundingClientRect();

  // 取两个方框中心，算出方向，再把端点收到方框边缘外一点，线不穿过框内
  const ax = ar.left - br.left + ar.width / 2;
  const ay = ar.top - br.top + ar.height / 2;
  const bx = bR.left - br.left + bR.width / 2;
  const by = bR.top - br.top + bR.height / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  const edgePoint = (cx, cy, w, h, sign) => {
    const hw = w / 2 + 2;
    const hh = h / 2 + 2;
    const tx = Math.abs(ux) < 1e-6 ? Infinity : hw / Math.abs(ux);
    const ty = Math.abs(uy) < 1e-6 ? Infinity : hh / Math.abs(uy);
    const t = Math.min(tx, ty);
    return [cx + sign * ux * t, cy + sign * uy * t];
  };

  const p1 = edgePoint(ax, ay, ar.width, ar.height, 1);
  const p2 = edgePoint(bx, by, bR.width, bR.height, -1);
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  if (wrong) line.classList.add('is-wrong');
  svg.appendChild(line);

  if (!wrong) {
    // 线从一端“划”到另一端
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    line.style.strokeDasharray = `${len}`;
    line.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      line.style.transition = 'stroke-dashoffset 260ms ease-out';
      line.style.strokeDashoffset = '0';
    });
  } else {
    setTimeout(() => line.remove(), 500);
  }
}

function redrawConnectLines() {
  const svg = document.getElementById('connect-lines');
  if (!svg) return;
  svg.innerHTML = '';
  connectEdges.forEach(e => drawConnectLine(e.from, e.to, false));
}

function bindConnectResize() {
  if (connectResizeBound) return;
  connectResizeBound = true;
  window.addEventListener('resize', () => {
    if (studyMode === 'connect' && connectEdges.length) redrawConnectLines();
  });
}

function finishConnect() {
  connectAnswered = true;
  connectSelected = -1;

  const word = wordList[currentIndex];
  document.querySelectorAll('.syl-box').forEach(box => {
    box.classList.remove('is-source');
    box.classList.add('is-done');
  });
  document.querySelectorAll('#connect-lines line').forEach(line => line.classList.add('is-done'));

  correctCount++;
  answers[currentIndex] = { correct: true };
  document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / wordList.length) * 100}%`;
  document.getElementById('connect-hint').textContent = '音节顺序正确，单词拼出来了';

  const feedbackEl = document.getElementById('connect-feedback');
  feedbackEl.style.display = 'block';
  feedbackEl.style.background = 'rgba(76, 175, 80, 0.12)';
  feedbackEl.style.color = '#4caf50';
  document.getElementById('connect-feedback-text').innerHTML = `
    ✅ 拼对了！<br>
    <span style="font-size: 24px; font-weight: 700; color: var(--c-ink)">${word.pt}</span><br>
    <small style="color: var(--c-muted)">${word.cn || ''}</small>
  `;
  const prevBtn = document.getElementById('connect-prev-btn');
  if (prevBtn) prevBtn.style.display = currentIndex > 0 ? '' : 'none';
}

window.nextConnect = function() {
  currentIndex++;
  renderCard();
};

// 回到上一题重新作答（选择题 / 连线模式）
window.prevQuestion = function() {
  let prev = currentIndex - 1;
  while (prev >= 0 && !answers[prev]) prev--;
  if (prev < 0) return;
  const prevAns = answers[prev];
  if (prevAns.correct) {
    correctCount--;
  } else {
    // 上一题答错进了错词本，先撤掉，重答后按新结果重新记
    store.removeWrong(wordList[prev].id);
  }
  delete answers[prev];
  currentIndex = prev;
  renderCard();
};

// 顶部撤销按钮：翻卡走原撤销，选择题/连线走回上一题
window.handleUndo = function() {
  if (studyMode === 'flashcard') {
    undoLastAction();
  } else {
    prevQuestion();
  }
};

// 完成页：本轮单词卡牌回顾
function renderReviewList() {
  const wrap = document.getElementById('review-wrap');
  const listEl = document.getElementById('review-list');
  if (!wrap || !listEl) return;
  wrap.style.display = 'block';
  listEl.innerHTML = wordList.map((w, i) => {
    const ans = answers[i];
    let mark = '';
    if (studyMode !== 'flashcard' && ans) mark = ans.correct ? '✅' : '❌';
    return `
      <div class="review-card" onclick="toggleReview(this)">
        <div class="review-head">
          <span class="review-pt">${i + 1}. ${w.pt}</span>
          <span class="review-mark">${mark}</span>
        </div>
        <div class="review-detail">
          <div class="review-cn">${w.cn || '（无释义）'}</div>
          <div class="review-meta">${[w.pos, w.level].filter(Boolean).join(' · ')}</div>
          <button class="btn btn--ghost" style="min-height:38px; padding:0 14px; font-size:13px" onclick="event.stopPropagation(); playReviewAudio(${i})">
            🔊 发音
          </button>
        </div>
      </div>`;
  }).join('');
}

window.toggleReview = function(el) {
  el.classList.toggle('is-open');
};

window.playReviewAudio = function(i) {
  const w = wordList[i];
  if (w) playAudio(w);
};

// ========== 滑动手势 ==========

function initSwipeGesture() {
  const cardContainer = document.getElementById('card-container');
  if (!cardContainer) return;
  
  cardContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
  cardContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
  cardContainer.addEventListener('touchend', handleTouchEnd);
  
  cardContainer.addEventListener('mousedown', handleMouseStart);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseEnd);
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isDragging = false;
}

function handleTouchMove(e) {
  if (!touchStartX) return;
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const diffX = currentX - touchStartX;
  const diffY = currentY - touchStartY;
  
  if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 30) return;
  
  if (Math.abs(diffX) > 10) {
    isDragging = true;
    currentTranslateX = diffX;
    
    const wrapper = document.getElementById('flip-swipe-wrapper');
    const rotation = diffX / 20;
    wrapper.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
    
    const overlayOpacity = Math.min(Math.abs(diffX) / 150, 1);
    
    if (diffX > 0) {
      document.getElementById('swipe-right-overlay').style.opacity = overlayOpacity;
      document.getElementById('swipe-left-overlay').style.opacity = '0';
    } else {
      document.getElementById('swipe-left-overlay').style.opacity = overlayOpacity;
      document.getElementById('swipe-right-overlay').style.opacity = '0';
    }
  }
}

function handleTouchEnd() {
  if (!isDragging) { touchStartX = 0; return; }
  
  const threshold = 100;
  
  if (currentTranslateX > threshold) {
    rateCard('yes');
  } else if (currentTranslateX < -threshold) {
    rateCard('no');
  } else {
    resetCardPosition();
  }
  
  touchStartX = 0;
  currentTranslateX = 0;
  isDragging = false;
}

let mouseStartX = 0;

function handleMouseStart(e) {
  if (e.target.closest('button')) return;
  mouseStartX = e.clientX;
  touchStartX = e.clientX;
  touchStartY = e.clientY;
  isDragging = false;
}

function handleMouseMove(e) {
  if (!mouseStartX) return;
  const diffX = e.clientX - mouseStartX;
  
  if (Math.abs(diffX) > 10) {
    isDragging = true;
    currentTranslateX = diffX;
    
    const wrapper = document.getElementById('flip-swipe-wrapper');
    const rotation = diffX / 20;
    wrapper.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
    
    const overlayOpacity = Math.min(Math.abs(diffX) / 150, 1);
    
    if (diffX > 0) {
      document.getElementById('swipe-right-overlay').style.opacity = overlayOpacity;
      document.getElementById('swipe-left-overlay').style.opacity = '0';
    } else {
      document.getElementById('swipe-left-overlay').style.opacity = overlayOpacity;
      document.getElementById('swipe-right-overlay').style.opacity = '0';
    }
  }
}

function handleMouseEnd() {
  if (!mouseStartX) return;
  
  if (isDragging) {
    const threshold = 100;
    if (currentTranslateX > threshold) {
      rateCard('yes');
    } else if (currentTranslateX < -threshold) {
      rateCard('no');
    } else {
      resetCardPosition();
    }
  }
  
  mouseStartX = 0;
  touchStartX = 0;
  currentTranslateX = 0;
  isDragging = false;
}
