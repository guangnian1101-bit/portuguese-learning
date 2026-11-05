// ============================================
// pages/home.js — 首页
// ============================================

import { store } from '../store.js';
import { router } from '../router.js';
import { Icons, iconAnimations } from '../icons.js';

export function render() {
  const app = document.getElementById('app');
  const state = store.state;
  
  // 注入动画样式
  const styleEl = document.getElementById('icon-styles');
  if (!styleEl) {
    const style = document.createElement('style');
    style.id = 'icon-styles';
    style.textContent = iconAnimations;
    document.head.appendChild(style);
  }
  
  app.innerHTML = `
    <div class="page container">
      <h1 style="margin: 24px 0 8px">Olá!</h1>
      <p style="color: var(--c-muted); margin-bottom: 24px">欧洲葡萄牙语学习</p>
      
      <!-- 打卡卡片 -->
      <div class="card" style="margin-bottom: 16px">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div>
            <div style="font-size: 14px; color: var(--c-muted)">连续打卡</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px">
              <span style="width: 28px; height: 28px; color: #ff9800">${Icons.flame}</span>
              <span style="font-size: 28px; font-weight: 700">${state.streak} 天</span>
            </div>
          </div>
          <div style="text-align: right">
            <div style="font-size: 14px; color: var(--c-muted)">已学单词</div>
            <div style="font-size: 28px; font-weight: 700; margin-top: 4px">
              ${store.learnedCount}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 开始学习按钮 -->
      <button class="btn btn--primary btn--block" style="margin-bottom: 16px" onclick="router.navigate('/learn')">
        <span style="width: 20px; height: 20px">${Icons.card}</span>
        开始背单词
      </button>
      
      <!-- 功能入口 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <div class="card feature-card" style="text-align: center; cursor: pointer" onclick="router.navigate('/dict')">
          <div style="width: 32px; height: 32px; margin: 0 auto 8px; color: var(--c-ink)">${Icons.search}</div>
          <div style="font-weight: 600">词典搜索</div>
        </div>
        <div class="card feature-card" style="text-align: center; cursor: pointer" onclick="router.navigate('/wrong')">
          <div style="width: 32px; height: 32px; margin: 0 auto 8px; color: #f44336">${Icons.alert}</div>
          <div style="font-weight: 600">错词本</div>
          <div style="font-size: 12px; color: var(--c-muted)">${store.getWrongList().length} 个</div>
        </div>
        <div class="card feature-card" style="text-align: center; cursor: pointer" onclick="router.navigate('/fav')">
          <div style="width: 32px; height: 32px; margin: 0 auto 8px; color: #ffc107">${Icons.star}</div>
          <div style="font-weight: 600">收藏夹</div>
          <div style="font-size: 12px; color: var(--c-muted)">${store.getStarredList().length} 个</div>
        </div>
        <div class="card feature-card" style="text-align: center; cursor: pointer" onclick="router.navigate('/stats')">
          <div style="width: 32px; height: 32px; margin: 0 auto 8px; color: #4caf50">${Icons.chart}</div>
          <div style="font-weight: 600">学习统计</div>
        </div>
      </div>
      
      <!-- 底部 Tab Bar -->
      <nav class="tabbar">
        <button class="tabbar__item is-active" onclick="router.navigate('/')">
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
        <button class="tabbar__item" onclick="router.navigate('/stats')">
          ${Icons.chart}
          统计
        </button>
      </nav>
    </div>
  `;
}
