// ============================================
// syllables.js — 葡语（PT-PT）单词音节切分
// 供「连线」题型使用：olá → o / lá
// ============================================

// 带重音/波浪号的元音 → 基础元音
const ACCENT_MAP = {
  'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a',
  'é': 'e', 'ê': 'e',
  'í': 'i',
  'ó': 'o', 'ô': 'o', 'õ': 'o',
  'ú': 'u', 'ü': 'u'
};

const VOWELS = 'aeiou';

// 二重元音（按原拼写匹配，含重音与波浪号形式）
const DIPHTHONGS = new Set([
  'ai', 'ei', 'oi', 'ui', 'au', 'eu', 'iu', 'ou', 'ao',
  'ão', 'ãe', 'õe', 'ãi',
  'ái', 'éi', 'ói', 'úi', 'êu', 'éu', 'êi', 'ôi'
]);

// 不可分辅音群（双辅音整体归入后一音节）
const INSEPARABLE = new Set([
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr',
  'pl', 'pr', 'tl', 'tr', 'vr', 'ch', 'lh', 'nh', 'qu', 'gu'
]);

function baseChar(c) {
  return ACCENT_MAP[c] || c;
}

/**
 * 判断第 i 个字符是否充当音节核（元音）
 * gu / qu 里的 u 不发音，不算音节核
 */
function isVowelAt(bare, i) {
  const c = bare[i];
  if (VOWELS.indexOf(c) === -1) return false;
  if (c === 'u' && i > 0 && (bare[i - 1] === 'q' || bare[i - 1] === 'g')) {
    // q/g + u + 元音 → u 是二合字母的一部分
    if (i + 1 < bare.length && VOWELS.indexOf(bare[i + 1]) !== -1) return false;
  }
  return true;
}

/**
 * 切分音节
 * @param {string} word 葡语单词（可带重音符号）
 * @returns {string[]} 音节数组，切不开时返回 [word]
 */
export function splitSyllables(word) {
  if (!word) return [];
  const chars = Array.from(word);
  if (chars.length < 2) return [word];

  const lower = chars.map(c => c.toLowerCase());
  const bare = lower.map(baseChar);

  // 1. 收集元音连读段
  const runs = [];
  let i = 0;
  while (i < chars.length) {
    if (isVowelAt(bare, i)) {
      let j = i;
      while (j + 1 < chars.length && isVowelAt(bare, j + 1)) j++;
      runs.push([i, j]);
      i = j + 1;
    } else {
      i++;
    }
  }
  if (runs.length === 0) return [word];

  // 2. 把每段元音按二重元音拆成音节核
  const nuclei = [];
  for (const [start, end] of runs) {
    let k = start;
    while (k <= end) {
      if (k + 1 <= end) {
        const pair = lower[k] + lower[k + 1];
        if (DIPHTHONGS.has(pair)) {
          nuclei.push([k, k + 1]);
          k += 2;
          continue;
        }
      }
      nuclei.push([k, k]);
      k += 1;
    }
  }
  if (nuclei.length < 2) return [word];

  // 3. 计算音节切点
  const cuts = [];
  for (let n = 0; n < nuclei.length - 1; n++) {
    const endPrev = nuclei[n][1];
    const startNext = nuclei[n + 1][0];
    const gap = startNext - endPrev - 1;

    if (gap <= 0) {
      cuts.push(startNext); // 元音相邻（hiato）
      continue;
    }
    if (gap === 1) {
      cuts.push(startNext - 1); // 单辅音归后一音节
      continue;
    }
    if (gap === 2) {
      const pair = bare[endPrev + 1] + bare[endPrev + 2];
      cuts.push(INSEPARABLE.has(pair) ? startNext - 2 : startNext - 1);
      continue;
    }
    // 3 个以上辅音：末尾两辅音若能成不可分群则整体归后，否则只把最后一辅音归后
    const tail = bare[startNext - 2] + bare[startNext - 1];
    cuts.push(INSEPARABLE.has(tail) ? startNext - 2 : startNext - 1);
  }

  // 4. 依切点产出音节
  const out = [];
  let from = 0;
  for (const cut of cuts) {
    if (cut > from) {
      out.push(chars.slice(from, cut).join(''));
      from = cut;
    }
  }
  if (from < chars.length) out.push(chars.slice(from).join(''));

  return out.filter(Boolean);
}
