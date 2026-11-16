// ============================================
// pages/stats.js — 学习统计页
// ============================================

import { store } from '../store.js';
import { router } from '../router.js';
import { Icons } from '../icons.js';

export function render() {
  const app = document.getElementById('app');
  const state = store.state;
  
  const learnedCount = Object.keys(state.learned).length;
  const wrongCount = Object.keys(state.wrong).length;
  const favCount = Object.keys(state.starred).length;
  
  // 变位模块统计
  const conjDaily = JSON.parse(localStorage.getItem('conj_daily') || '{}');
  const conjStreak = getConjStreak(conjDaily);
  const conjFavs = JSON.parse(localStorage.getItem('conj_favorites') || '[]');
  const tenseStats = JSON.parse(localStorage.getItem('conj_tense_stats') || '{}');
  
  // 语法模块统计
  const grammarStats = JSON.parse(localStorage.getItem('grammar_stats') || '{}');
  let grammarTotal = 0, grammarCorrect = 0, grammarWrongTopics = 0;
  for (const s of Object.values(grammarStats)) {
    grammarTotal += s.total;
    grammarCorrect += s.correct;
    if (s.wrongQuestions && s.wrongQuestions.length > 0) grammarWrongTopics++;
  }
  const grammarRate = grammarTotal > 0 ? Math.round(grammarCorrect / grammarTotal * 100) : null;
  
  // 统计最近 12 周的学习数据
  const heatmapData = generateHeatmapData(state.learned);
  
  app.innerHTML = `
    <div class="page container" style="max-width: 600px; margin: 0 auto">
      <h1 style="margin: 24px 0 8px">学习统计</h1>
      <p style="color: var(--c-muted); margin-bottom: 24px">你的学习进度</p>
      
      <!-- 核心数据卡片 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px">
        <div class="card" style="text-align: center">
          <div style="font-size: 28px; font-weight: 700; color: var(--c-success)">${learnedCount}</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-top: 4px">已学单词</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 28px; font-weight: 700; color: #ff9800">${state.streak}</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-top: 4px">连续打卡（天）</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 28px; font-weight: 700; color: var(--c-danger)">${wrongCount}</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-top: 4px">错词本</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 28px; font-weight: 700; color: #ffc107">${favCount}</div>
          <div style="font-size: 13px; color: var(--c-muted); margin-top: 4px">收藏单词</div>
        </div>
      </div>
      
      <!-- 活动热力图 -->
      <div class="section-title">学习热力图（最近 12 周）</div>
      <div class="card" style="margin-bottom: 24px; padding: 16px; overflow-x: auto">
        ${renderHeatmap(heatmapData)}
      </div>
      
      <!-- 最近学习记录 -->
      <div class="section-title">最近学习</div>
      <div class="card" style="margin-bottom: 24px">
        <div style="color: var(--c-muted); font-size: 14px">
          上次学习：${state.lastActive || '还没开始学习'}
        </div>
      </div>

      <!-- 变位模块统计 -->
      <div class="section-title">🔤 变位练习</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px">
        <div class="card" style="text-align: center">
          <div style="font-size: 24px; font-weight: 700; color: #667eea">${conjStreak}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 4px">连续打卡</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 24px; font-weight: 700; color: #ffc107">${conjFavs.length}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 4px">收藏动词</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 24px; font-weight: 700; color: #f44336">${Object.keys(tenseStats).length}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 4px">已练时态</div>
        </div>
      </div>

      <!-- 各时态正确率 -->
      ${Object.keys(tenseStats).length > 0 ? `
        <div class="card" style="margin-bottom: 24px; padding: 16px">
          <div style="font-weight: 600; margin-bottom: 12px">各时态正确率</div>
          ${Object.entries(tenseStats).map(([tid, s]) => {
            const rate = Math.round(s.correct / s.total * 100);
            const color = rate >= 80 ? '#4caf50' : rate >= 60 ? '#ff9800' : '#f44336';
            return `
              <div style="margin-bottom: 10px">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px">
                  <span>${tid}</span>
                  <span style="color: ${color}; font-weight: 600">${rate}% (${s.correct}/${s.total})</span>
                </div>
                <div style="height: 6px; background: #f0f0f0; border-radius: 3px">
                  <div style="height: 100%; width: ${rate}%; background: ${color}; border-radius: 3px"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- 语法模块统计 -->
      <div class="section-title">📖 语法练习</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px">
        <div class="card" style="text-align: center">
          <div style="font-size: 24px; font-weight: 700; color: #9c27b0">${grammarRate !== null ? grammarRate + '%' : '-'}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 4px">总正确率</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 24px; font-weight: 700; color: #2196f3">${grammarTotal}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 4px">已答题数</div>
        </div>
        <div class="card" style="text-align: center">
          <div style="font-size: 24px; font-weight: 700; color: #ff9800">${grammarWrongTopics}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 4px">待复习点</div>
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
}

// 计算变位打卡连续天数
function getConjStreak(daily) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (daily[key] && daily[key].done) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// 生成热力图数据（最近 12 周）
function generateHeatmapData(learned) {
  const weeks = 12;
  const days = weeks * 7;
  
  // 每天学了多少单词
  const dailyCounts = {};
  
  // 从 learned 里统计
  Object.values(learned).forEach(date => {
    if (!dailyCounts[date]) {
      dailyCounts[date] = 0;
    }
    dailyCounts[date] += 1;
  });
  
  // 生成最近 N 天的日期
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    
    result.push({
      date: dateStr,
      count: dailyCounts[dateStr] || 0,
      dayOfWeek: date.getDay()
    });
  }
  
  return result;
}

// 渲染热力图
function renderHeatmap(data) {
  // 找最大值，用来计算颜色深浅
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  // 分成 7 列（周），每列 7 行（天）
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  
  // 生成 HTML
  let html = '<div style="display: flex; gap: 3px; justify-content: center">';
  
  weeks.forEach(week => {
    html += '<div style="display: flex; flex-direction: column; gap: 3px">';
    
    week.forEach(day => {
      // 计算颜色深度
      let color = 'var(--c-brand-soft)'; // 没学习
      if (day.count > 0) {
        const intensity = day.count / maxCount;
        if (intensity > 0.75) color = '#4caf50';
        else if (intensity > 0.5) color = '#66bb6a';
        else if (intensity > 0.25) color = '#81c784';
        else color = '#a5d6a7';
      }
      
      html += `
        <div 
          style="
            width: 12px; 
            height: 12px; 
            border-radius: 2px;
            background: ${color};
          "
          title="${day.date}: 学了 ${day.count} 个单词"
        ></div>
      `;
    });
    
    html += '</div>';
  });
  
  html += '</div>';
  
  // 图例
  html += `
    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-top: 12px; font-size: 11px; color: var(--c-muted)">
      少
      <div style="width: 10px; height: 10px; border-radius: 2px; background: var(--c-brand-soft)"></div>
      <div style="width: 10px; height: 10px; border-radius: 2px; background: #a5d6a7"></div>
      <div style="width: 10px; height: 10px; border-radius: 2px; background: #81c784"></div>
      <div style="width: 10px; height: 10px; border-radius: 2px; background: #66bb6a"></div>
      <div style="width: 10px; height: 10px; border-radius: 2px; background: #4caf50"></div>
      多
    </div>
  `;
  
  return html;
}
