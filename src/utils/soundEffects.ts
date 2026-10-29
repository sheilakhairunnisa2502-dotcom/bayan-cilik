import confetti from 'canvas-confetti';

// Web Audio API AudioContext synthesizer
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play friendly sound effects using pure Web Audio API synthesis
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio effect error:', err);
  }
}

export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.warn('Audio effect error:', err);
  }
}

export function playFanfareSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  } catch (err) {
    console.warn('Fanfare error:', err);
  }
}

export function playPopSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (err) {
    // ignore
  }
}

// Client-side memory cache for native Arabic audio
const clientAudioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

// Clean text to keep ONLY Arabic Unicode characters and tashkeel
export function extractPureArabic(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove text inside parentheses (e.g., "(Kelinci)")
    .replace(/\([^)]*\)/g, ' ')
    // Remove any English / Latin / Indonesian letters and numbers
    .replace(/[a-zA-Z0-9_\-–—:;,\.\!\?\"\'\[\]]/g, ' ')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speaks pure Arabic using Native Arabic Human Voice from Gemini 3.8 Flash Lite TTS,
 * with fast in-memory client caching and SpeechSynthesis fallback.
 */
export async function speakArabic(text: string, onEnd?: () => void): Promise<void> {
  const cleanArabic = extractPureArabic(text) || text.trim();
  if (!cleanArabic) {
    if (onEnd) onEnd();
    return;
  }

  // Stop any currently playing audio or speech
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // 1. Check in-memory audio cache for zero latency
  if (clientAudioCache.has(cleanArabic)) {
    try {
      const audio = new Audio(clientAudioCache.get(cleanArabic));
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        currentAudio = null;
        fallbackSpeechSynthesis(cleanArabic, onEnd);
      };
      await audio.play();
      return;
    } catch {
      // If cached playback fails, proceed to fetch or fallback
    }
  }

  // 2. Fetch Native Arabic Human Voice from Server (Gemini 3.8 Flash Lite TTS)
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanArabic }),
    });
    const data = await res.json();

    if (data.audioBase64) {
      const dataUrl = `data:audio/wav;base64,${data.audioBase64}`;
      clientAudioCache.set(cleanArabic, dataUrl);

      const audio = new Audio(dataUrl);
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        currentAudio = null;
        fallbackSpeechSynthesis(cleanArabic, onEnd);
      };
      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Server TTS fetch failed, using Web Speech API fallback:', err);
  }

  // 3. Fallback to Web Speech API with strict Arabic voice selection
  fallbackSpeechSynthesis(cleanArabic, onEnd);
}

function fallbackSpeechSynthesis(cleanArabic: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanArabic);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.85;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith('ar') ||
      v.lang.toLowerCase().includes('ar-') ||
      v.name.toLowerCase().includes('arabic') ||
      v.name.toLowerCase().includes('tarek') ||
      v.name.toLowerCase().includes('maged') ||
      v.name.toLowerCase().includes('laila')
  );

  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

// Launch celebratory confetti when kid wins or finishes level
export function triggerCelebrationConfetti() {
  playFanfareSound();
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
  });
}
