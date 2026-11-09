// ============================================
// pages/daily.js — 每日必背单词（当天固定 20 个日常词）
// ============================================

import { loadWordsByLetter } from '../data.js';
import { playAudio } from '../audio.js';
import { store } from '../store.js';
import { router } from '../router.js';

const PICK_COUNT = 20;
const STORAGE_KEY = 'pt-learn-v2.daily-picks';

function todayStr() {
  // 用本地日期，避免 UTC 跨天
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 日期种子伪随机（同一天内结果固定）
function seededRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const BAD_POS = ['人名', '地名'];
// pos 为空时靠 cn 关键词兜底：人名 / 地名 / 姓氏 / 屈折变化 / 旧拼写 / 巴葡
const BAD_CN = [
  '人名', '姓氏', '城市', '地名', '专有名词', '小镇', '村庄',
  '公爵', '伯爵', '国王', '女王', '教皇', '圣人',
  '变位', '过去将来时', '过去完成时', '未完成时', '虚拟式',
  '第三人称复数', '第三人称单数', '第一人称单数',
  '的复数形式', '的阴性形式', '的阳性形式', '阴性复数形式', '阳性复数形式',
  '旧拼写', '巴西'
];
function isEligible(w) {
  if (!w || !w.pt || !w.cn) return false;
  if (!w.level || !/^[ABC][12]$/.test(w.level)) return false;
  if (w.pt.includes(' ')) return false;            // 排除短语（até logo 这类）
  if (!w.pos) return false;                        // 必须有明确词性标注（空 pos 多为屈折形式/旧拼写/未清洗词）
  if (BAD_POS.some(b => w.pos.includes(b))) return false;
  if (BAD_CN.some(b => w.cn.includes(b))) return false;
  return true;
}

async function getDailyPicks() {
  const today = todayStr();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj.date === today && Array.isArray(obj.words) && obj.words.length) {
        return obj.words;
      }
    }
  } catch (e) {}

  // 采样：随机抽若干首字母文件，累积候选
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v'];
  const rand = seededRand('daily-' + today);
  const shuffled = [...letters].sort(() => rand() - 0.5);
  const pool = [];
  for (const l of shuffled) {
    if (pool.length >= 1500) break;
    try {
      const words = await loadWordsByLetter(l);
      pool.push(...words.filter(isEligible));
    } catch (e) {}
  }
  pool.sort(() => rand() - 0.5);
  const picks = pool.slice(0, PICK_COUNT);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, words: picks }));
  } catch (e) {}
  return picks;
}

export async function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page container" style="max-width: 500px; margin: 0 auto; padding-bottom: 80px">
      <div style="padding: 24px 0 8px">
        <button onclick="router.navigate('/')" style="background: none; border: none; color: var(--c-muted); font-size: 16px; cursor: pointer">
          ← 返回
        </button>
      </div>
      <h2 style="margin: 8px 0 4px">📅 今日必背</h2>
      <p style="color: var(--c-muted); font-size: 14px; margin-bottom: 20px">${todayStr()} · 随机 20 个日常词（A1–C2）</p>
      <div id="daily-list" style="display: flex; flex-direction: column; gap: 10px">
        <div style="color: var(--c-muted)">加载中…</div>
      </div>
    </div>`;

  const words = await getDailyPicks();
  const listEl = document.getElementById('daily-list');
  if (!listEl) return;
  if (!words.length) {
    listEl.innerHTML = '<div style="color: var(--c-muted)">今日词库加载失败，稍后再试</div>';
    return;
  }

  listEl.innerHTML = words.map((w, i) => {
    const starred = !!store.state.starred[w.id];
    return `
    <div class="daily-card" style="background: var(--c-brand-soft); border: 1px solid var(--c-border); border-radius: 16px; padding: 14px 16px">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px">
        <div style="min-width: 0">
          <div style="font-size: 18px; font-weight: 600; color: var(--c-ink)">${i + 1}. ${w.pt}</div>
          <div style="font-size: 12px; color: var(--c-muted); margin-top: 2px">${[w.pos, w.level].filter(Boolean).join(' · ')}</div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0">
          <button class="btn btn--ghost" style="min-height: 36px; padding: 0 10px; font-size: 14px" onclick="playDailyAudio(${i})">🔊</button>
          <button class="btn btn--ghost" style="min-height: 36px; padding: 0 10px; font-size: 14px" onclick="toggleDailyStar(${i})">${starred ? '⭐' : '☆'}</button>
        </div>
      </div>
      <div style="margin-top: 8px; font-size: 14px; color: var(--c-ink-secondary); line-height: 1.5">${w.cn || ''}</div>
    </div>`;
  }).join('');

  window.__dailyWords = words;
  window.playDailyAudio = function (i) {
    const w = window.__dailyWords[i];
    if (w) playAudio(w);
  };
  window.toggleDailyStar = function (i) {
    const w = window.__dailyWords[i];
    if (!w) return;
    store.toggleStar(w.id);
    // 刷新当前按钮
    const list = document.getElementById('daily-list');
    if (!list) return;
    const btns = list.querySelectorAll('.daily-card button');
    // 每张卡两个按钮：0=发音 1=星标
    btns[i * 2 + 1].textContent = store.state.starred[w.id] ? '⭐' : '☆';
  };
}
