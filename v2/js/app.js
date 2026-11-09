// ============================================
// app.js — 应用入口
// ============================================

import { router } from './router.js';
import { store } from './store.js';
import { render as renderHome } from './pages/home.js?v=23';
import { render as renderLearn } from './pages/learn.js?v=23';
import { render as renderDict } from './pages/dict.js?v=23';
import { render as renderWrong } from './pages/wrong.js?v=23';
import { render as renderFav } from './pages/fav.js?v=23';
import { render as renderStats } from './pages/stats.js?v=23';
import { render as renderSettings } from './pages/settings.js?v=23';
import { render as renderCategories } from './pages/categories.js?v=23';

// 注册路由
router.register('/', () => renderHome());
router.register('/learn', () => renderLearn());
router.register('/dict', () => renderDict());
router.register('/wrong', () => renderWrong());
router.register('/fav', () => renderFav());
router.register('/stats', () => renderStats());
router.register('/settings', () => renderSettings());
router.register('/categories', () => renderCategories());

// 暴露到全局
window.router = router;
window.store = store;

// 应用主题（黑 / 白）
store.applyTheme();

// 启动
router.start();

console.log('✅ App 启动完成');
console.log('当前路由:', router.current);
