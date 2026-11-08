// ============================================
// data.js — 数据加载器（按需加载）
// ============================================

// 缓存已加载的数据
const cache = new Map();

// ID 索引缓存
let idIndex = null;

// 首字母索引缓存
let letterIndex = null;

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

// 加载首字母索引
async function loadLetterIndex() {
  if (letterIndex) return letterIndex;
  
  try {
    const response = await fetch('data/index.json');
    if (!response.ok) {
      console.warn('未找到首字母索引文件');
      return {};
    }
    letterIndex = await response.json();
    return letterIndex;
  } catch (e) {
    console.error('加载首字母索引失败:', e);
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

// 随机抽取单词（用于学习）
export async function getRandomWords(count = 20) {
  // 加载首字母索引
  const index = await loadLetterIndex();
  const letters = Object.keys(index);
  
  // 随机选一个首字母
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  
  // 加载该首字母的所有单词
  const allWords = await loadWordsByLetter(randomLetter);
  
  // 随机打乱并取前 N 个
  const shuffled = allWords.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 按分类筛选单词
export async function getWordsByFilter(filter, count = 20) {
  const { type, value } = filter;
  const index = await loadLetterIndex();
  const letters = Object.keys(index);
  
  const matchedWords = [];
  
  // 遍历所有首字母的单词（限制遍历数量以提高速度）
  for (const letter of letters.slice(0, 10)) { // 先遍历前 10 个首字母
    const words = await loadWordsByLetter(letter);
    
    const filtered = words.filter(w => {
      if (type === 'level') return w.level === value;
      if (type === 'pos') return w.pos === value;
      if (type === 'cat') return w.cat === value;
      return false;
    });
    
    matchedWords.push(...filtered);
    
    // 如果已经够了就停止
    if (matchedWords.length >= count * 3) break;
  }
  
  // 随机打乱并取前 N 个
  const shuffled = matchedWords.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 去掉重音符号（用于模糊搜索）
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// 搜索（葡语前缀 + 中文子串，忽略重音）
export async function searchWords(query, limit = 20) {
  if (!query || query.length < 1) return [];
  
  const q = query.toLowerCase().trim();
  const qNorm = removeAccents(q);  // 去重音后的搜索词
  const results = [];
  
  // 葡语搜索：按首字母加载（用去重音后的首字母）
  const firstLetter = qNorm[0];
  const words = await loadWordsByLetter(firstLetter);
  
  // 匹配：葡语前缀（同时匹配原始和去重音形式）
  const ptMatches = words
    .filter(w => {
      const ptLower = w.pt.toLowerCase();
      const ptNorm = removeAccents(w.pt);
      return ptLower.startsWith(q) || ptNorm.startsWith(qNorm);
    })
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
