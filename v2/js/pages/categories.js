// ============================================
// pages/categories.js — 单词分类页
// ============================================

import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

// 分类数据
const CATEGORIES = {
  level: {
    title: '按等级',
    icon: '📊',
    items: [
      { key: 'A1', label: 'A1 入门', count: 1455, color: '#4caf50' },
      { key: 'A2', label: 'A2 基础', count: 2280, color: '#8bc34a' },
      { key: 'B1', label: 'B1 中级', count: 1203, color: '#ffc107' },
      { key: 'B2', label: 'B2 中高级', count: 68143, color: '#ff9800' },
      { key: 'C1', label: 'C1 高级', count: 1626, color: '#f44336' },
      { key: 'C2', label: 'C2 精通', count: 1279, color: '#9c27b0' },
    ]
  },
  pos: {
    title: '按词性',
    icon: '📝',
    items: [
      { key: '名词', label: '名词', count: 4346, color: '#2196f3' },
      { key: '动词', label: '动词', count: 2324, color: '#f44336' },
      { key: '形容词', label: '形容词', count: 1232, color: '#ff9800' },
      { key: '副词', label: '副词', count: 572, color: '#9c27b0' },
      { key: '短语', label: '短语', count: 147, color: '#00bcd4' },
      { key: '感叹词', label: '感叹词', count: 16, color: '#e91e63' },
    ]
  },
  topic: {
    title: '按主题',
    icon: '🎯',
    items: [
      { key: '食物', label: '食物', count: 1073, color: '#ff9800' },
      { key: '动物', label: '动物', count: 1589, color: '#4caf50' },
      { key: '身体', label: '身体', count: 1286, color: '#e91e63' },
      { key: '家庭', label: '家庭', count: 1007, color: '#9c27b0' },
      { key: '职业', label: '职业', count: 2208, color: '#2196f3' },
      { key: '情绪情感', label: '情绪情感', count: 3022, color: '#f44336' },
      { key: '医疗', label: '医疗', count: 2471, color: '#00bcd4' },
      { key: '经济', label: '经济', count: 2213, color: '#ffc107' },
      { key: '教育', label: '教育', count: 1386, color: '#3f51b5' },
      { key: '植物', label: '植物', count: 1237, color: '#8bc34a' },
      { key: '日用品', label: '日用品', count: 891, color: '#795548' },
      { key: '地理', label: '地理', count: 3321, color: '#607d8b' },
    ]
  }
};

export function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="page container" style="max-width: 600px; margin: 0 auto">
      <h1 style="margin: 24px 0 8px">单词分类</h1>
      <p style="color: var(--c-muted); margin-bottom: 24px">按等级、词性或主题选择学习内容</p>
      
      <!-- 按等级 -->
      <div style="margin-bottom: 32px">
        <h2 style="font-size: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px">
          <span>📊</span> 按等级
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          ${CATEGORIES.level.items.map(item => `
            <div 
              class="card" 
              style="padding: 16px; cursor: pointer; transition: transform 200ms"
              onclick="startCategoryStudy('level', '${item.key}')"
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${item.color}; margin-bottom: 8px"></div>
              <div style="font-weight: 600; margin-bottom: 4px">${item.label}</div>
              <div style="font-size: 13px; color: var(--c-muted)">${item.count} 词</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- 按词性 -->
      <div style="margin-bottom: 32px">
        <h2 style="font-size: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px">
          <span>📝</span> 按词性
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px">
          ${CATEGORIES.pos.items.map(item => `
            <div 
              class="card" 
              style="padding: 16px; cursor: pointer; text-align: center; transition: transform 200ms"
              onclick="startCategoryStudy('pos', '${item.key}')"
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              <div style="font-size: 24px; margin-bottom: 8px">${getPosIcon(item.key)}</div>
              <div style="font-weight: 600; margin-bottom: 4px">${item.label}</div>
              <div style="font-size: 12px; color: var(--c-muted)">${item.count}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- 按主题 -->
      <div style="margin-bottom: 32px">
        <h2 style="font-size: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px">
          <span>🎯</span> 按主题
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px">
          ${CATEGORIES.topic.items.map(item => `
            <div 
              class="card" 
              style="padding: 16px; cursor: pointer; text-align: center; transition: transform 200ms"
              onclick="startCategoryStudy('cat', '${item.key}')"
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              <div style="font-size: 24px; margin-bottom: 8px">${getTopicIcon(item.key)}</div>
              <div style="font-size: 13px; font-weight: 600">${item.label}</div>
            </div>
          `).join('')}
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
        <button class="tabbar__item is-active" onclick="router.navigate('/categories')">
          📂
          分类
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

// 获取词性图标
function getPosIcon(pos) {
  const icons = {
    '名词': '🔤',
    '动词': '⚡',
    '形容词': '🎨',
    '副词': '💨',
    '短语': '💬',
    '感叹词': '❗',
  };
  return icons[pos] || '📝';
}

// 获取主题图标
function getTopicIcon(topic) {
  const icons = {
    '食物': '🍕',
    '动物': '🐶',
    '身体': '👤',
    '家庭': '👨‍👩‍👧‍👦',
    '职业': '💼',
    '情绪情感': '😊',
    '医疗': '🏥',
    '经济': '💰',
    '教育': '📚',
    '植物': '🌳',
    '日用品': '🛒',
    '地理': '🌍',
  };
  return icons[topic] || '🎯';
}

// 开始分类学习
window.startCategoryStudy = function(type, value) {
  // 保存到 sessionStorage，让学习页读取
  sessionStorage.setItem('studyFilter', JSON.stringify({ type, value }));
  
  // 跳转到学习页
  router.navigate('/learn');
};
