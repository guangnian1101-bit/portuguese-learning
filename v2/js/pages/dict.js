// ============================================
// pages/dict.js — 词典搜索页
// ============================================

import { searchWords } from '../data.js';
import { playAudio } from '../audio.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

// 当前搜索结果
let currentResults = [];

export function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="page container">
      <h1 style="margin: 24px 0 16px">词典搜索</h1>
      
      <!-- 搜索框 -->
      <div style="position: relative; margin-bottom: 16px">
        <input 
          type="text" 
          id="search-input" 
          placeholder="输入葡语单词..." 
          style="
            width: 100%;
            padding: 14px 16px 14px 48px;
            border-radius: 14px;
            border: none;
            background: var(--c-surface);
            box-shadow: var(--shadow-sm);
            font-size: 16px;
            outline: none;
          "
        >
        <div style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--c-muted); width: 20px; height: 20px">
          ${Icons.search}
        </div>
      </div>
      
      <!-- 搜索结果 -->
      <div id="search-results">
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__title">搜索葡语单词</div>
          <div class="empty-state__desc">输入葡语单词查看释义和发音</div>
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
        <button class="tabbar__item is-active" onclick="router.navigate('/dict')">
          ${Icons.search}
          词典
        </button>
        <button class="tabbar__item" onclick="router.navigate('/wrong')">
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
  
  // 绑定搜索事件
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  
  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(e.target.value), 300);
  });
  
  async function doSearch(query) {
    if (!query.trim()) {
      currentResults = [];
      resultsEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__title">搜索葡语单词</div>
          <div class="empty-state__desc">输入葡语单词查看释义和发音</div>
        </div>
      `;
      return;
    }
    
    resultsEl.innerHTML = '<div class="empty-state"><div class="empty-state__desc">搜索中...</div></div>';
    
    const results = await searchWords(query, 20);
    currentResults = results;
    
    if (results.length === 0) {
      resultsEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">😕</div>
          <div class="empty-state__title">未找到单词</div>
          <div class="empty-state__desc">试试输入其他葡语单词</div>
        </div>
      `;
      return;
    }
    
    // 渲染结果列表
    resultsEl.innerHTML = results.map((word, index) => `
      <div class="word-item" data-index="${index}">
        <div style="flex: 1">
          <div class="word-item__pt">${word.pt} 
            ${word.level ? `<span style="font-size: 11px; background: var(--c-brand-soft); padding: 2px 8px; border-radius: 8px; margin-left: 6px">${word.level}</span>` : ''}
          </div>
          <div class="word-item__cn">${shortCn(word)}</div>
        </div>
        <button 
          class="btn btn--ghost" 
          style="min-height: 36px; padding: 0 12px"
          onclick="event.stopPropagation(); playWordAtIndex(${index})"
        >
          <span style="width: 16px; height: 16px">${Icons.sound}</span>
        </button>
      </div>
    `).join('');
    
    // 绑定点击事件
    resultsEl.querySelectorAll('.word-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index'));
        console.log('点击单词:', currentResults[index]);
      });
    });
  }
  
  function shortCn(word) {
    if (!word.cn) return '';
    return word.cn.split('；')[0].split(';')[0];
  }
}

// 全局函数：按索引播放音频
window.playWordAtIndex = function(index) {
  if (currentResults[index]) {
    playAudio(currentResults[index]);
  }
};
