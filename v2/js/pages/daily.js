// ============================================
// pages/daily.js — 每日必背单词（当天固定 20 个日常词）
// ============================================

import { loadWordsByLetter } from '../data.js';
import { playAudio } from '../audio.js';
import { store } from '../store.js';
import { router } from '../router.js';

const PICK_COUNT = 20;
const STORAGE_KEY = 'pt-learn-v2.daily-picks.v2';

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

const BAD_POS = ['人名', '地名', '动词变位', '复数形式', '阴性形式', '阳性形式', '旧拼写'];
// 标准词性白名单：pos 必须包含其中之一
const GOOD_POS = ['名词', '动词', '形容词', '副词', '介词', '连词', '代词', '冠词', '感叹词', '数词'];
// pos 里出现这些组合直接判为脏数据
const DIRTY_POS = ['变位', '/', '或', '又称', '古', '旧'];
// pos 为空时靠 cn 关键词兜底：人名 / 地名 / 姓氏 / 屈折变化 / 旧拼写 / 巴葡
const BAD_CN = [
  '人名', '姓氏', '城市', '地名', '专有名词', '小镇', '村庄',
  '公爵', '伯爵', '国王', '女王', '教皇', '圣人',
  '变位', '过去将来时', '过去完成时', '未完成时', '虚拟式',
  '第三人称复数', '第三人称单数', '第一人称单数',
  '的复数形式', '的阴性形式', '的阳性形式', '阴性复数形式', '阳性复数形式',
  '旧拼写', '巴西'
];

// 清理 cn 开头的词性说明："可数名词 xxx" / "动词，xxx" / "名词：xxx"
function cleanCn(cn) {
  if (!cn) return cn;
  return cn
    .replace(/^(可数|不可数|集合)名词[，,：:\s]*/, '')
    .replace(/^(及物|不及物|反身|助|系|情态)?动词[，,：:\s]*/, '')
    .replace(/^(形容|副|介|连|代|冠|感叹|数)词[，,：:\s]*/, '')
    .trim();
}

function isEligible(w) {
  if (!w || !w.pt || !w.cn) return false;
  if (!w.level || !/^[ABC][12]$/.test(w.level)) return false;
  if (w.pt.includes(' ')) return false;            // 排除短语
  if (!w.pos) return false;
  // 词性白名单：必须包含标准词性
  if (!GOOD_POS.some(g => w.pos.includes(g))) return false;
  // 词性脏数据：变位、斜杠、古旧拼写
  if (DIRTY_POS.some(d => w.pos.includes(d))) return false;
  if (BAD_POS.some(b => w.pos.includes(b))) return false;
  if (BAD_CN.some(b => w.cn.includes(b))) return false;
  // 排除 id > 90000 的后段生僻词（医学/化学/矿业术语）
  if (w.id > 90000) return false;
  return true;
}

// 按 CEFR 等级分配名额：日常词为主
const LEVEL_QUOTA = {
  'A1': 5, 'A2': 6, 'B1': 5, 'B2': 3, 'C1': 1, 'C2': 0
};

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

  // 所有字母分片，打乱顺序
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v'];
  const rand = seededRand('daily-' + today);
  const shuffled = [...letters].sort(() => rand() - 0.5);

  // 每个字母分片各取一部分候选，避免全压在一个字母上
  const byLevel = { 'A1': [], 'A2': [], 'B1': [], 'B2': [], 'C1': [], 'C2': [] };
  const PER_LETTER_LIMIT = 120; // 每个字母最多取多少 eligible 词

  for (const l of shuffled) {
    try {
      const words = await loadWordsByLetter(l);
      const eligible = words.filter(isEligible);
      // 每个字母分片内打乱，只取前 PER_LETTER_LIMIT 个
      eligible.sort(() => rand() - 0.5);
      const limited = eligible.slice(0, PER_LETTER_LIMIT);
      for (const w of limited) {
        if (byLevel[w.level]) byLevel[w.level].push(w);
      }
    } catch (e) {}
  }

  // 按等级配额抽取，每个等级内打乱
  const picks = [];
  for (const [level, quota] of Object.entries(LEVEL_QUOTA)) {
    const pool = byLevel[level] || [];
    pool.sort(() => rand() - 0.5);
    picks.push(...pool.slice(0, quota));
  }

  // 如果配额没凑够 20 个（比如 C2 没有词），从 B1/B2 补
  if (picks.length < PICK_COUNT) {
    const rest = [...byLevel['B1'], ...byLevel['B2'], ...byLevel['A2']]
      .filter(w => !picks.find(p => p.id === w.id));
    rest.sort(() => rand() - 0.5);
    picks.push(...rest.slice(0, PICK_COUNT - picks.length));
  }

  // 最终打乱顺序
  picks.sort(() => rand() - 0.5);
  const finalPicks = picks.slice(0, PICK_COUNT).map(w => ({
    ...w,
    cn: cleanCn(w.cn)
  }));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, words: finalPicks }));
  } catch (e) {}
  return finalPicks;
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
