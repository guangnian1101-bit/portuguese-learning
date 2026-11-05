// ============================================
// audio.js — 发音播放
// ============================================

// 音频缓存
const audioCache = new Map();

// 播放发音（传单词对象，包含 id 和 pt）
export function playAudio(word) {
  if (!word) return;
  
  const wordId = word.id;
  const wordText = word.pt;
  
  // 尝试播放本地音频
  const audioPath = `../audio/${wordId}.mp3`;
  
  let audio = audioCache.get(wordId);
  if (!audio) {
    audio = new Audio(audioPath);
    audioCache.set(wordId, audio);
  }
  
  audio.currentTime = 0;
  audio.volume = 0.95;
  audio.playbackRate = 0.75;
  
  audio.play().catch(err => {
    console.warn(`本地音频加载失败: id=${wordId}, 使用 TTS 降级`, err);
    fallbackTTS(wordText);
  });
}

// 降级方案：浏览器 TTS（传单词文本）
function fallbackTTS(text) {
  if (!text) return;
  
  if ('speechSynthesis' in window) {
    // 停止之前的播放
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }
}

// 播放葡语文本（TTS）
export function speak(text) {
  fallbackTTS(text);
}
