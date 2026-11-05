// ============================================
// pages/fav.js — 收藏夹页
// ============================================

import { playAudio } from '../audio.js';
import { getWordById } from '../data.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

// 收藏列表（带完整信息）
let favList = [];

export async function render() {
  const app = document.getElementById('app');
  
  const starredIds = store.getStarredList();
  
  app.innerHTML = `
    <div class="page container" style="max-width: 600px; margin: 0 auto">
      <h1 style="margin: 24px 0 8px">收藏夹</h1>
      <p style="color: var(--c-muted); margin-bottom: 24px">你收藏的单词</p>
      
      <!-- 统计卡片 -->
      <div class="card" style="margin-bottom: 24px; text-align: center">
        <div style="font-size: 32px; font-weight: 700">${starredIds.length}</div>
        <div style="font-size: 14px; color: var(--c-muted); margin-top: 4px">个收藏单词</div>
      </div>
      
      <!-- 收藏列表 -->
      <div id="fav-list">
        <div class="empty-state">
          <div class="empty-state__icon">⭐</div>
          <div class="empty-state__title">还没有收藏</div>
          <div class="empty-state__desc">在学习或搜索时点击星星按钮收藏单词</div>
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
        <button class="tabbar__item" onclick="router.navigate('/wrong')">
          ${Icons.alert}
          错词
        </button>
        <button class="tabbar__item is-active" onclick="router.navigate('/stats')">
          ${Icons.chart}
          统计
        </button>
      </nav>
    </div>
  `;
  
  // 加载收藏数据
  await loadFavList();
}

async function loadFavList() {
  const starredIds = store.getStarredList();
  
  if (starredIds.length === 0) {
    // 空状态
    return;
  }
  
  // 加载每个收藏词的详细信息
  favList = [];
  for (const id of starredIds) {
    const word = await getWordById(id);
    if (word) {
      favList.push(word);
    }
  }
  
  // 渲染列表
  const listEl = document.getElementById('fav-list');
  listEl.innerHTML = favList.map((word, index) => `
    <div class="word-item" data-index="${index}">
      <div style="flex: 1">
        <div class="word-item__pt">${word.pt}</div>
        <div class="word-item__cn">${word.cn || '暂无释义'}</div>
      </div>
      <button 
        class="btn btn--ghost" 
        style="min-height: 36px; padding: 0 12px"
        onclick="event.stopPropagation(); playFavWord(${index})"
      >
        <span style="width: 16px; height: 16px">${Icons.sound}</span>
      </button>
      <button 
        class="btn btn--ghost" 
        style="min-height: 36px; padding: 0 12px; color: #ffc107"
        onclick="event.stopPropagation(); removeFav(${index})"
      >
        取消收藏
      </button>
    </div>
  `).join('');
}

// 播放收藏词发音
window.playFavWord = function(index) {
  if (favList[index]) {
    playAudio(favList[index]);
  }
};

// 取消收藏
window.removeFav = function(index) {
  const word = favList[index];
  if (word) {
    store.toggleStar(word.id);
    loadFavList(); // 重新加载
  }
};
