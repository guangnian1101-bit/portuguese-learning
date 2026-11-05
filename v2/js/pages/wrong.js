// ============================================
// pages/wrong.js — 错词本页
// ============================================

import { playAudio } from '../audio.js';
import { getWordById } from '../data.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

// 错词列表（带完整信息）
let wrongList = [];

export async function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="page container" style="max-width: 600px; margin: 0 auto">
      <h1 style="margin: 24px 0 8px">错词本</h1>
      <p style="color: var(--c-muted); margin-bottom: 24px">复习你不认识的单词</p>
      
      <!-- 统计卡片 -->
      <div class="card" style="margin-bottom: 24px; display: flex; justify-content: space-around; text-align: center">
        <div>
          <div style="font-size: 24px; font-weight: 700" id="wrong-count">0</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-top: 4px">总错词</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700" id="today-count">0</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-top: 4px">今天新增</div>
        </div>
      </div>
      
      <!-- 开始复习按钮 -->
      <button class="btn btn--primary btn--block" style="margin-bottom: 24px" onclick="startReview()">
        开始复习错词
      </button>
      
      <!-- 错词列表 -->
      <div id="wrong-list">
        <div class="empty-state">
          <div class="empty-state__icon">🎉</div>
          <div class="empty-state__title">太棒了！</div>
          <div class="empty-state__desc">你还没有错词，继续保持！</div>
        </div>
      </div>
      
      <!-- 底部 Tab Bar -->
      <nav class="tabbar">
        <button class="tabbar__item" onclick="router.navigate('/')">
          ${Icons.home}
          首页
        </button>
        <button class="tabbar__item" onclick="router.navigate('/learn')">
          ${Icons.book}
          学习
        </button>
        <button class="tabbar__item" onclick="router.navigate('/dict')">
          ${Icons.search}
          词典
        </button>
        <button class="tabbar__item is-active" onclick="router.navigate('/wrong')">
          ${Icons.alert}
          错词
        </button>
        <button class="tabbar__item" onclick="router.navigate('/stats')">
          ${Icons.chart}
          统计
        </button>
      </nav>
    </div>
  `;
  
  // 加载错词数据
  await loadWrongList();
}

async function loadWrongList() {
  // 获取错词 ID 列表
  const wrongIds = store.getWrongList();
  
  // 更新统计
  document.getElementById('wrong-count').textContent = wrongIds.length;
  
  // 今天新增的数量
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = wrongIds.filter(w => w.last === today).length;
  document.getElementById('today-count').textContent = todayCount;
  
  if (wrongIds.length === 0) {
    // 空状态
    return;
  }
  
  // 加载每个错词的详细信息
  wrongList = [];
  for (const w of wrongIds) {
    const word = await getWordById(w.id);
    if (word) {
      wrongList.push({
        ...word,
        wrongCount: w.count,
        lastWrong: w.last
      });
    }
  }
  
  // 渲染列表
  const listEl = document.getElementById('wrong-list');
  listEl.innerHTML = wrongList.map((word, index) => `
    <div class="word-item" data-index="${index}">
      <div style="flex: 1">
        <div class="word-item__pt">${word.pt}</div>
        <div class="word-item__cn">${word.cn || '暂无释义'}</div>
        <div style="font-size: 11px; color: var(--c-muted); margin-top: 4px">
          错 ${word.wrongCount} 次 · 最后: ${word.lastWrong || '未知'}
        </div>
      </div>
      <button 
        class="btn btn--ghost" 
        style="min-height: 36px; padding: 0 12px"
        onclick="event.stopPropagation(); playWrongWord(${index})"
      >
        <span style="width: 16px; height: 16px">${Icons.sound}</span>
      </button>
      <button 
        class="btn btn--ghost" 
        style="min-height: 36px; padding: 0 12px; color: var(--c-danger)"
        onclick="event.stopPropagation(); removeWrong(${index})"
      >
        移除
      </button>
    </div>
  `).join('');
}

// 播放错词发音
window.playWrongWord = function(index) {
  if (wrongList[index]) {
    playAudio(wrongList[index]);
  }
};

// 开始复习错词
window.startReview = function() {
  // TODO: 跳转到学习页，只学习错词
  alert('复习功能开发中...');
};

// 移出错词
window.removeWrong = function(index) {
  const word = wrongList[index];
  if (word) {
    store.removeWrong(word.id);
    loadWrongList(); // 重新加载
  }
};
