// ============================================
// storage.js — localStorage 封装 + 数据迁移
// ============================================

const STORAGE_KEY = 'pt-learn-v2';
const LEGACY_KEY = 'pt-learn-state';

// 默认状态
const defaultState = {
  version: 2,
  learned: {},      // { wordId: 'YYYY-MM-DD' }
  starred: {},      // { wordId: true }
  wrong: {},        // { wordId: { count: n, last: 'YYYY-MM-DD' } }
  streak: 0,        // 连续打卡天数
  lastActive: null, // 上次活跃日期
  tests: [],        // 测试记录
  settings: {
    dailyGoal: 20,
    autoPlayAudio: true,
  }
};

// 从旧版本迁移数据
function migrateFromLegacy() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    
    const old = JSON.parse(legacy);
    console.log('发现旧版本数据，开始迁移...', old);
    
    // 映射旧字段到新结构
    const migrated = {
      ...defaultState,
      learned: old.learned || {},
      starred: old.starred || {},
      wrong: old.wrong || {},
      streak: old.streak || 0,
      lastActive: old.lastActive || null,
      tests: old.tests || [],
    };
    
    console.log('迁移完成:', migrated);
    return migrated;
  } catch (e) {
    console.error('迁移失败:', e);
    return null;
  }
}

// 加载状态
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultState, ...JSON.parse(raw) };
    }
    
    // 尝试从旧版本迁移
    const migrated = migrateFromLegacy();
    if (migrated) {
      saveState(migrated);
      return migrated;
    }
    
    return { ...defaultState };
  } catch (e) {
    console.error('加载状态失败:', e);
    return { ...defaultState };
  }
}

// 保存状态
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存状态失败:', e);
  }
}

// 导出数据（备份用）
export function exportData() {
  const state = loadState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pt-learn-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
