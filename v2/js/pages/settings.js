// ============================================
// pages/settings.js — 设置页
// ============================================

import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

export function render() {
  const app = document.getElementById('app');
  const state = store.state;
  
  app.innerHTML = `
    <div class="page container" style="max-width: 600px; margin: 0 auto; padding-bottom: 80px">
      <h1 style="margin: 24px 0 24px">设置</h1>
      
      <!-- 外观设置 -->
      <div class="section-title">外观</div>
      <div class="card" style="margin-bottom: 24px">
        <div style="padding: 16px">
          <div style="font-weight: 500; margin-bottom: 4px">主题颜色</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-bottom: 12px">在白色与黑色主题之间切换</div>
          <div class="theme-toggle">
            <button class="theme-toggle__btn" id="theme-toggle-btn" aria-label="切换主题">
              <span class="theme-toggle__icon theme-toggle__icon--sun">${Icons.sun}</span>
              <span class="theme-toggle__icon theme-toggle__icon--moon">${Icons.moon}</span>
            </button>
            <div style="font-size:13px;color:var(--c-muted)" id="theme-toggle-label">${state.darkMode ? '深色模式' : '浅色模式'}</div>
          </div>
        </div>
      </div>
      
      <!-- 学习设置 -->
      <div class="section-title">学习</div>
      <div class="card" style="margin-bottom: 24px">
        <div style="padding: 16px; border-bottom: 1px solid var(--c-border)">
          <div style="font-weight: 500; margin-bottom: 4px">每天学习数量</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-bottom: 12px">每次学习的单词卡片数量</div>
          <div style="display: flex; gap: 8px">
            ${[10, 20, 30, 50].map(n => `
              <button 
                class="btn btn--ghost daily-count-btn ${state.dailyCount === n ? 'is-active' : ''}"
                data-count="${n}"
                style="flex: 1"
              >
                ${n}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div style="padding: 16px">
          <div style="font-weight: 500; margin-bottom: 4px">发音自动播放</div>
          <div style="font-size: 13px; color: var(--c-muted)">切换卡片时自动播放单词发音</div>
        </div>
      </div>
      
      <!-- 关于 -->
      <div class="section-title">关于</div>
      <div class="card" style="margin-bottom: 24px">
        <div style="padding: 16px; border-bottom: 1px solid var(--c-border)">
          <div style="font-weight: 500; margin-bottom: 4px">版本</div>
          <div style="font-size: 13px; color: var(--c-muted)">v2.0.0</div>
        </div>
        <div style="padding: 16px; border-bottom: 1px solid var(--c-border)">
          <div style="font-weight: 500; margin-bottom: 4px">词库数量</div>
          <div style="font-size: 13px; color: var(--c-muted)">90,138 条欧葡词条</div>
        </div>
        <div style="padding: 16px">
          <div style="font-weight: 500; margin-bottom: 4px">技术架构</div>
          <div style="font-size: 13px; color: var(--c-muted)">纯静态 HTML + CSS + JS（ES Module）</div>
        </div>
      </div>
      
      <!-- 危险操作 -->
      <div class="section-title">数据管理</div>
      <div class="card" style="margin-bottom: 24px">
        <button 
          class="btn btn--ghost" 
          style="width: 100%; color: var(--c-danger); justify-content: center"
          onclick="if(confirm('确定要清空所有学习数据吗？此操作不可撤销！')) { localStorage.clear(); location.reload(); }"
        >
          清空所有数据
        </button>
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
        <button class="tabbar__item is-active" onclick="router.navigate('/settings')">
          ${Icons.chart}
          设置
        </button>
      </nav>
    </div>
  `;
  
  // 绑定主题切换按钮：太阳/月亮旋转 + 圆形扩散转场
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      const wantDark = !store.state.darkMode;
      const rect = themeBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const apply = () => {
        store.setDarkMode(wantDark);
        render();
      };

      // View Transitions API：以按钮为圆心扩散
      if (document.startViewTransition) {
        const transition = document.startViewTransition(apply);
        transition.ready.then(() => {
          const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
          );
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' }
          );
        });
      } else {
        apply();
      }
    });
  }
  
  // 绑定每天学习数量
  document.querySelectorAll('.daily-count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count);
      store.setDailyCount(count);
      render(); // 重新渲染
    });
  });
}
