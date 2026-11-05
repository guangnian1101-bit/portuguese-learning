// ============================================
// pages/placeholder.js — 占位页面（建设中）
// ============================================

import { router } from '../router.js';

export function render(title, icon) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page container">
      <div style="text-align: center; padding-top: 80px">
        <div style="font-size: 64px; margin-bottom: 16px">${icon || '🚧'}</div>
        <h2 style="margin-bottom: 8px">${title || '建设中'}</h2>
        <p style="color: var(--c-muted); margin-bottom: 24px">这个页面还在开发中</p>
        <button class="btn btn--ghost" onclick="router.navigate('/')">返回首页</button>
      </div>
    </div>
  `;
}
