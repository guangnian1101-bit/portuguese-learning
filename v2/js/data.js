// ============================================
// data.js — 数据加载器（按需加载）
// ============================================

// 缓存已加载的数据
const cache = new Map();

// ID 索引缓存
let idIndex = null;

// 加载 ID 索引
async function loadIdIndex() {
  if (idIndex) return idIndex;
  
  try {
    const response = await fetch('data/id-index.json');
    if (!response.ok) {
      console.warn('未找到 ID 索引文件');
      return {};
    }
    idIndex = await response.json();
    return idIndex;
  } catch (e) {
    console.error('加载 ID 索引失败:', e);
    return {};
  }
}

// 加载某个首字母的所有词
export async function loadWordsByLetter(letter) {
  // 归一化首字母（小写）
  const l = letter.toLowerCase();
  
  // 从缓存取
  if (cache.has(l)) {
    return cache.get(l);
  }
  
  // 加载 JSON 文件
  try {
    const response = await fetch(`data/dict-${l}.json`);
    if (!response.ok) {
      console.warn(`未找到 ${l} 开头的词条文件`);
      return [];
    }
    const words = await response.json();
    cache.set(l, words);
    return words;
  } catch (e) {
    console.error(`加载 ${l} 开头词条失败:`, e);
    return [];
  }
}

// 搜索（葡语前缀 + 中文子串）
export async function searchWords(query, limit = 20) {
  if (!query || query.length < 1) return [];
  
  const q = query.toLowerCase().trim();
  const results = [];
  
  // 葡语搜索：按首字母加载
  const firstLetter = q[0];
  const words = await loadWordsByLetter(firstLetter);
  
  // 匹配：葡语前缀
  const ptMatches = words
    .filter(w => w.pt.toLowerCase().startsWith(q))
    .slice(0, limit);
  
  results.push(...ptMatches);
  
  // 如果结果不够，再搜中文（简单版：只搜 a-e 开头的高频词）
  if (results.length < limit) {
    // 中文搜索需要加载更多文件，暂时只做葡语前缀搜索
    // TODO: 后续优化中文搜索
  }
  
  return results;
}

// 按 ID 找单词（从索引中快速查找）
export async function getWordById(id) {
  const index = await loadIdIndex();
  const info = index[id];
  
  if (!info) return null;
  
  // 返回预览信息（从索引中）
  return {
    id: parseInt(id),
    pt: info.pt,
    cn: info.cn,
    letter: info.letter
  };
}
