// ============================================
// pages/learn.js — 单词卡学习页
// ============================================

import { loadWordsByLetter } from '../data.js';
import { playAudio } from '../audio.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

// 学习状态
let currentIndex = 0;
let wordList = [];
let isFlipped = false;
let lastAction = null; // 保存上一次操作，用于撤销

// 滑动状态
let touchStartX = 0;
let touchStartY = 0;
let currentTranslateX = 0;
let isDragging = false;

export async function render() {
  const app = document.getElementById('app');
  
  // 加载 A1 等级的单词（先做简单版：加载 a 开头的前 20 个）
  app.innerHTML = `
    <div class="page container" style="max-width: 500px; margin: 0 auto">
      <!-- 顶部进度条 -->
      <div style="padding: 24px 0 8px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
          <button onclick="router.navigate('/')" style="background: none; border: none; color: var(--c-muted); font-size: 16px; cursor: pointer">
            ← 返回
          </button>
          <div style="display: flex; align-items: center; gap: 16px">
            <button id="undo-btn" onclick="undoLastAction()" style="background: none; border: none; color: var(--c-muted); font-size: 16px; cursor: pointer; opacity: 0.3" disabled>
              ↩ 撤销
            </button>
            <span style="font-size: 14px; color: var(--c-muted)" id="progress-text">0 / 20</span>
          </div>
        </div>
        <div class="progress">
          <div class="progress__bar" id="progress-bar" style="width: 0%"></div>
        </div>
      </div>
      
      <!-- 加载中 -->
      <div id="loading" style="text-align: center; padding: 100px 0">
        <div style="font-size: 48px; margin-bottom: 16px">📚</div>
        <div style="color: var(--c-muted)">加载单词中...</div>
      </div>
      
      <!-- 单词卡区域（初始隐藏） -->
      <div id="card-area" style="display: none; position: relative">
        <!-- 左滑遮罩（不认识） -->
        <div id="swipe-left-overlay" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(244, 67, 54, 0.2);
          border-radius: var(--r-xl);
          opacity: 0;
          pointer-events: none;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 24px;
        ">
          <span style="font-size: 24px; font-weight: 700; color: #f44336; transform: rotate(-15deg)">不认识</span>
        </div>
        
        <!-- 右滑遮罩（认识） -->
        <div id="swipe-right-overlay" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(76, 175, 80, 0.2);
          border-radius: var(--r-xl);
          opacity: 0;
          pointer-events: none;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 24px;
        ">
          <span style="font-size: 24px; font-weight: 700; color: #4caf50; transform: rotate(15deg)">认识</span>
        </div>
        
        <!-- 评级提示（初始隐藏） -->
        <div id="rating-toast" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--c-surface);
          padding: 12px 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          font-size: 14px;
          z-index: 100;
          opacity: 0;
          transition: opacity 200ms;
          pointer-events: none;
        ">
          已标记认识
        </div>
        
        <!-- 单词卡 -->
        <div class="flip-container" id="card-container" onclick="flipCard()">
          <div class="flip-card" id="flip-card">
            <!-- 正面（葡语） -->
            <div class="flip-face flip-face--front">
              <div class="flip-face__pt" id="word-pt">casa</div>
              <div style="margin-top: 16px; display: flex; gap: 12px">
                <button 
                  class="btn btn--ghost" 
                  style="min-height: 44px; padding: 0 16px"
                  onclick="event.stopPropagation(); playCurrentAudio()"
                >
                  <span style="width: 18px; height: 18px">${Icons.sound}</span>
                  发音
                </button>
                <button 
                  class="btn btn--ghost" 
                  style="min-height: 44px; padding: 0 16px"
                  onclick="event.stopPropagation(); toggleStar()"
                >
                  <span style="width: 18px; height: 18px">${Icons.star}</span>
                  <span id="star-label">收藏</span>
                </button>
              </div>
              <div style="margin-top: 24px; font-size: 13px; color: var(--c-muted)">
                点击卡片看释义 · 左右滑动评级
              </div>
            </div>
            
            <!-- 背面（中文） -->
            <div class="flip-face flip-face--back">
              <div style="font-size: 12px; color: var(--c-muted); margin-bottom: 8px" id="word-level">A2</div>
              <div class="flip-face__cn" id="word-cn">房子，家</div>
              <div style="margin-top: 16px; font-size: 14px; color: var(--c-muted)" id="word-pt-back">casa</div>
            </div>
          </div>
        </div>
        
        <!-- 三档评级按钮 -->
        <div style="display: flex; gap: 12px; margin-top: 24px">
          <button class="btn btn--rate btn--no" onclick="rateCard('no')">
            ❌ 不认识
          </button>
          <button class="btn btn--rate btn--meh" onclick="rateCard('meh')">
            ⚠️ 模糊
          </button>
          <button class="btn btn--rate btn--yes" onclick="rateCard('yes')">
            ✅ 认识
          </button>
        </div>
      </div>
      
      <!-- 完成状态（初始隐藏） -->
      <div id="done-area" style="display: none; text-align: center; padding: 80px 0">
        <div style="font-size: 64px; margin-bottom: 16px">🎉</div>
        <h2 style="margin-bottom: 8px">太棒了！</h2>
        <p style="color: var(--c-muted); margin-bottom: 24px">本轮学习完成</p>
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
}

// 加载单词列表
async function loadWords() {
  // 先加载 a 开头的，取前 20 个（临时测试用）
  const words = await loadWordsByLetter('a');
  wordList = words.slice(0, 20);
  currentIndex = 0;
  lastAction = null;
}

// 渲染当前卡片
function renderCard() {
  if (currentIndex >= wordList.length) {
    // 完成
    document.getElementById('loading').style.display = 'none';
    document.getElementById('card-area').style.display = 'none';
    document.getElementById('done-area').style.display = 'block';
    return;
  }
  
  const word = wordList[currentIndex];
  isFlipped = false;
  
  // 更新进度
  document.getElementById('progress-text').textContent = `${currentIndex + 1} / ${wordList.length}`;
  document.getElementById('progress-bar').style.width = `${(currentIndex / wordList.length) * 100}%`;
  
  // 更新单词内容
  document.getElementById('word-pt').textContent = word.pt;
  document.getElementById('word-pt-back').textContent = word.pt;
  document.getElementById('word-cn').textContent = word.cn || '';
  document.getElementById('word-level').textContent = word.level || '';
  
  // 更新收藏状态
  const isStarred = !!store.state.starred[word.id];
  document.getElementById('star-label').textContent = isStarred ? '已收藏' : '收藏';
  
  // 翻回正面
  document.getElementById('flip-card').classList.remove('is-flipped');
  
  // 重置卡片位置
  resetCardPosition();
  
  // 显示卡片区域
  document.getElementById('loading').style.display = 'none';
  document.getElementById('card-area').style.display = 'block';
  
  // 更新撤销按钮状态
  updateUndoButton();
}

// 重置卡片位置
function resetCardPosition() {
  const card = document.getElementById('flip-card');
  card.style.transition = 'transform 200ms ease';
  card.style.transform = 'translateX(0) rotate(0deg)';
  
  // 隐藏遮罩
  document.getElementById('swipe-left-overlay').style.opacity = '0';
  document.getElementById('swipe-right-overlay').style.opacity = '0';
  
  setTimeout(() => {
    card.style.transition = '';
  }, 200);
}

// 更新撤销按钮状态
function updateUndoButton() {
  const undoBtn = document.getElementById('undo-btn');
  if (lastAction) {
    undoBtn.disabled = false;
    undoBtn.style.opacity = '1';
  } else {
    undoBtn.disabled = true;
    undoBtn.style.opacity = '0.3';
  }
}

// 翻卡
window.flipCard = function() {
  // 如果正在拖拽，不翻卡
  if (isDragging) return;
  
  isFlipped = !isFlipped;
  const card = document.getElementById('flip-card');
  card.classList.toggle('is-flipped', isFlipped);
};

// 播放发音
window.playCurrentAudio = function() {
  const word = wordList[currentIndex];
  if (word) {
    playAudio(word);
  }
};

// 切换收藏
window.toggleStar = function() {
  const word = wordList[currentIndex];
  if (word) {
    store.toggleStar(word.id);
    const isStarred = !!store.state.starred[word.id];
    document.getElementById('star-label').textContent = isStarred ? '已收藏' : '收藏';
  }
};

// 显示评级提示
function showRatingToast(message) {
  const toast = document.getElementById('rating-toast');
  toast.textContent = message;
  toast.style.opacity = '1';
  
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 800);
}

// 评级
window.rateCard = function(rating) {
  const word = wordList[currentIndex];
  if (!word) return;
  
  // 保存上一次操作（用于撤销）
  lastAction = {
    index: currentIndex,
    word: word,
    rating: rating
  };
  
  if (rating === 'no') {
    // 不认识 → 加入错词本
    store.addWrong(word.id);
    showRatingToast('❌ 已加入错词本');
  } else if (rating === 'meh') {
    // 模糊 → 也加入错词本（暂时）
    store.addWrong(word.id);
    showRatingToast('⚠️ 标记模糊');
  } else if (rating === 'yes') {
    // 认识 → 标记已学
    store.markLearned(word.id);
    showRatingToast('✅ 已标记认识');
  }
  
  // 下一张
  currentIndex++;
  setTimeout(() => {
    renderCard();
  }, 300);
};

// 撤销上一次操作
window.undoLastAction = function() {
  if (!lastAction) return;
  
  const { index, word, rating } = lastAction;
  
  // 撤销操作
  if (rating === 'no' || rating === 'meh') {
    // 从错词本移除
    store.removeWrong(word.id);
  } else if (rating === 'yes') {
    // 从已学移除（暂时不做，因为 store 没有 removeLearned 方法）
    // delete store.state.learned[word.id];
    // store.emit();
  }
  
  // 回到上一张
  currentIndex = index;
  lastAction = null;
  renderCard();
  
  showRatingToast('↩ 已撤销');
};

// 初始化滑动手势
function initSwipeGesture() {
  const cardContainer = document.getElementById('card-container');
  const card = document.getElementById('flip-card');
  
  cardContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
  cardContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
  cardContainer.addEventListener('touchend', handleTouchEnd);
  
  // 鼠标事件（桌面测试用）
  cardContainer.addEventListener('mousedown', handleMouseStart);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseEnd);
}

// 触摸开始
function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isDragging = false;
}

// 触摸移动
function handleTouchMove(e) {
  if (!touchStartX) return;
  
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const diffX = currentX - touchStartX;
  const diffY = currentY - touchStartY;
  
  // 如果垂直滑动距离大于水平，不处理（可能是滚动）
  if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 30) {
    return;
  }
  
  if (Math.abs(diffX) > 10) {
    isDragging = true;
    currentTranslateX = diffX;
    
    // 更新卡片位置和旋转角度
    const card = document.getElementById('flip-card');
    const rotation = diffX / 20; // 根据滑动距离计算旋转角度
    card.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
    
    // 更新遮罩透明度
    const overlayOpacity = Math.min(Math.abs(diffX) / 150, 1);
    
    if (diffX > 0) {
      // 右滑 → 认识
      document.getElementById('swipe-right-overlay').style.opacity = overlayOpacity;
      document.getElementById('swipe-left-overlay').style.opacity = '0';
    } else {
      // 左滑 → 不认识
      document.getElementById('swipe-left-overlay').style.opacity = overlayOpacity;
      document.getElementById('swipe-right-overlay').style.opacity = '0';
    }
  }
}

// 触摸结束
function handleTouchEnd(e) {
  if (!isDragging) {
    touchStartX = 0;
    return;
  }
  
  const threshold = 100; // 滑动阈值
  
  if (currentTranslateX > threshold) {
    // 右滑 → 认识
    rateCard('yes');
  } else if (currentTranslateX < -threshold) {
    // 左滑 → 不认识
    rateCard('no');
  } else {
    // 回弹
    resetCardPosition();
  }
  
  // 重置状态
  touchStartX = 0;
  currentTranslateX = 0;
  isDragging = false;
}

// 鼠标事件（桌面测试用）
let mouseStartX = 0;

function handleMouseStart(e) {
  // 只在卡片上按下时才触发
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
    
    const card = document.getElementById('flip-card');
    const rotation = diffX / 20;
    card.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
    
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

function handleMouseEnd(e) {
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
