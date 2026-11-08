// ============================================
// store.js — 全局状态管理
// ============================================

import { loadState, saveState } from './storage.js';

class Store {
  constructor() {
    this.state = loadState();
    this.listeners = [];
  }

  // 订阅状态变化
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  // 通知所有订阅者
  emit() {
    saveState(this.state);
    this.listeners.forEach(fn => fn(this.state));
  }

  // 标记已学
  markLearned(wordId, date = new Date().toISOString().slice(0, 10)) {
    this.state.learned[wordId] = date;
    this.emit();
  }

  // 切换收藏
  toggleStar(wordId) {
    if (this.state.starred[wordId]) {
      delete this.state.starred[wordId];
    } else {
      this.state.starred[wordId] = true;
    }
    this.emit();
  }

  // 添加错词
  addWrong(wordId) {
    const today = new Date().toISOString().slice(0, 10);
    if (!this.state.wrong[wordId]) {
      this.state.wrong[wordId] = { count: 0, last: null };
    }
    this.state.wrong[wordId].count += 1;
    this.state.wrong[wordId].last = today;
    this.emit();
  }

  // 移出错词
  removeWrong(wordId) {
    delete this.state.wrong[wordId];
    this.emit();
  }

  // 更新打卡
  updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    
    if (this.state.lastActive === today) return;
    
    if (this.state.lastActive === yesterday) {
      this.state.streak += 1;
    } else if (this.state.lastActive !== today) {
      this.state.streak = 1;
    }
    
    this.state.lastActive = today;
    this.emit();
  }

  // 获取收藏列表
  getStarredList() {
    return Object.keys(this.state.starred);
  }

  // 获取错词列表
  getWrongList() {
    return Object.entries(this.state.wrong).map(([id, info]) => ({
      id,
      ...info
    }));
  }

  // 已学单词数
  get learnedCount() {
    return Object.keys(this.state.learned).length;
  }

  // 同步浏览器顶部/状态栏颜色
  syncThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', this.state.darkMode ? '#121212' : '#fafafa');
    }
  }

  // 把当前主题应用到 DOM
  applyTheme() {
    document.documentElement.classList.toggle('dark', !!this.state.darkMode);
    this.syncThemeColor();
  }

  // 设置主题：true = 黑（深色），false = 白（浅色）
  setDarkMode(on) {
    this.state.darkMode = !!on;
    this.applyTheme();
    this.emit();
  }

  // 切换黑白主题
  toggleDarkMode() {
    this.setDarkMode(!this.state.darkMode);
  }

  // 设置每天学习数量
  setDailyCount(count) {
    this.state.dailyCount = count;
    this.emit();
  }
}

export const store = new Store();
