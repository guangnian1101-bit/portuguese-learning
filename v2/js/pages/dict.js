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

// 注入插屏动画样式
if (!document.getElementById('word-detail-anim-style')) {
  const style = document.createElement('style');
  style.id = 'word-detail-anim-style';
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
  `;
  document.head.appendChild(style);
}

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
        showWordDetail(currentResults[index]);
      });
    });
  }
  
  function shortCn(word) {
    if (!word.cn) return '';
    // 去掉括号内容，按分号/逗号/句号取第一段，限8字
    let s = word.cn.replace(/[（(][^）)]*[）)]/g, '');
    s = s.split(/[；;，,。.]/)[0].trim();
    if (s.length > 8) s = s.slice(0, 8) + '…';
    return s;
  }
  
  // 词条详情插屏
  function showWordDetail(word) {
    // 移除已有插屏
    const existing = document.getElementById('word-detail-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'word-detail-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: flex-end; justify-content: center;
      animation: fadeIn 0.2s ease;
    `;
    
    overlay.innerHTML = `
      <div id="word-detail-sheet" style="
        width: 100%; max-width: 600px;
        background: var(--c-surface);
        border-radius: 20px 20px 0 0;
        padding: 12px 24px 40px;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
        animation: slideUp 0.25s ease;
        max-height: 80vh; overflow-y: auto;
      ">
        <div style="width: 40px; height: 4px; background: var(--c-border); border-radius: 2px; margin: 0 auto 20px"></div>
        
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px">
          <div style="flex: 1">
            <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 4px; color: var(--c-ink)">${word.pt}</h2>
            ${word.phonetic ? `<div style="font-size: 15px; color: var(--c-muted); margin-bottom: 8px; font-style: italic">/${word.phonetic}/</div>` : ''}
            <div style="display: flex; gap: 8px; flex-wrap: wrap">
              ${word.level ? `<span style="font-size: 12px; background: var(--c-brand-soft); color: var(--c-ink); padding: 3px 10px; border-radius: 10px; font-weight: 600">${word.level}</span>` : ''}
              ${word.pos ? `<span style="font-size: 12px; background: var(--c-brand-soft); color: var(--c-ink-secondary); padding: 3px 10px; border-radius: 10px">${word.pos}</span>` : ''}
              ${word.cat ? `<span style="font-size: 12px; background: var(--c-brand-soft); color: var(--c-ink-secondary); padding: 3px 10px; border-radius: 10px">${word.cat}</span>` : ''}
            </div>
          </div>
          <button id="word-detail-close" style="
            width: 36px; height: 36px; border-radius: 50%; border: none;
            background: var(--c-surface-hover); cursor: pointer; font-size: 18px; color: var(--c-muted);
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          ">✕</button>
        </div>
        
        <button id="word-detail-audio" style="
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px; border: none;
          background: var(--c-brand); color: var(--c-bg);
          font-size: 14px; cursor: pointer; margin-bottom: 20px; font-weight: 600;
        ">
          <span style="width: 18px; height: 18px">${Icons.sound}</span>
          播放发音
        </button>
        
        <div style="margin-bottom: 16px">
          <div style="font-size: 12px; color: var(--c-muted); margin-bottom: 6px; font-weight: 600">中文释义</div>
          <div style="font-size: 16px; line-height: 1.7; color: var(--c-ink)">${word.cn || '暂无释义'}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 关闭按钮
    overlay.querySelector('#word-detail-close').addEventListener('click', closeSheet);
    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSheet();
    });
    // 发音按钮
    overlay.querySelector('#word-detail-audio').addEventListener('click', () => {
      playAudio(word);
    });
    
    function closeSheet() {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    }
    
    // ESC 关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeSheet();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
}

// 全局函数：按索引播放音频
window.playWordAtIndex = function(index) {
  if (currentResults[index]) {
    playAudio(currentResults[index]);
  }
};
