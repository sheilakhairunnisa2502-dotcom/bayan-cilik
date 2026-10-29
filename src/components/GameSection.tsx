import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { VocabItem } from '../types';
import { INITIAL_VOCAB_ITEMS } from '../data/arabicData';
import {
  speakArabic,
  playCorrectSound,
  playWrongSound,
  playPopSound,
  playFanfareSound,
  triggerCelebrationConfetti,
} from '../utils/soundEffects';
import {
  Volume2,
  Trophy,
  Star,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface GameSectionProps {
  customVocabs: VocabItem[];
}

type GameMode = 'tebak-gambar' | 'susun-huruf' | 'tebak-suara' | 'petualangan' | 'kartu-memori';

export const GameSection: React.FC<GameSectionProps> = ({ customVocabs }) => {
  const { user, addStarsAndScore } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameMode>('tebak-gambar');

  const pool = [...INITIAL_VOCAB_ITEMS, ...customVocabs];

  // Game 1: Tebak Gambar state
  const [tgCurrentIndex, setTgCurrentIndex] = useState(0);
  const [tgOptions, setTgOptions] = useState<VocabItem[]>([]);
  const [tgSelectedAnswer, setTgSelectedAnswer] = useState<string | null>(null);
  const [tgScore, setTgScore] = useState(0);
  const [tgStars, setTgStars] = useState(0);
  const [tgStreak, setTgStreak] = useState(0);
  const [tgCompleted, setTgCompleted] = useState(false);

  // Game 2: Susun Huruf state
  const [shCurrentWord, setShCurrentWord] = useState<VocabItem>(pool[0]);
  const [shScrambledLetters, setShScrambledLetters] = useState<{ char: string; id: number }[]>([]);
  const [shSelectedLetters, setShSelectedLetters] = useState<{ char: string; id: number }[]>([]);
  const [shIsCorrect, setShIsCorrect] = useState<boolean | null>(null);

  // Game 3: Tebak Suara state
  const [tsCurrentTarget, setTsCurrentTarget] = useState<VocabItem>(pool[0]);
  const [tsOptions, setTsOptions] = useState<VocabItem[]>([]);
  const [tsResult, setTsResult] = useState<'correct' | 'wrong' | null>(null);
  const [tsScore, setTsScore] = useState(0);

  // Game 4: Petualangan Bintang state
  const [questLevel, setQuestLevel] = useState<1 | 2 | 3>(1);
  const [questStep, setQuestStep] = useState(0);
  const [questFinished, setQuestFinished] = useState(false);

  // Game 5: Kartu Memori state
  interface MemoryCard {
    cardId: string;
    pairId: string;
    type: 'arabic' | 'emoji';
    content: string;
    subContent?: string;
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);

  // Initialize Tebak Gambar question
  useEffect(() => {
    setupTebakGambarQuestion(tgCurrentIndex);
  }, [tgCurrentIndex]);

  const setupTebakGambarQuestion = (idx: number) => {
    const target = pool[idx % pool.length];
    const others = pool.filter((item) => item.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [target, ...others].sort(() => 0.5 - Math.random());
    setTgOptions(combined);
    setTgSelectedAnswer(null);

    // Auto speak the target word after a brief moment
    setTimeout(() => {
      speakArabic(target.arabic);
    }, 400);
  };

  const handleTebakGambarChoice = (chosen: VocabItem) => {
    if (tgSelectedAnswer) return; // prevent multiple clicks
    const target = pool[tgCurrentIndex % pool.length];
    setTgSelectedAnswer(chosen.id);

    if (chosen.id === target.id) {
      playCorrectSound();
      setTgScore((prev) => prev + 20);
      setTgStars((prev) => prev + 1);
      setTgStreak((prev) => prev + 1);
      addStarsAndScore(1, 20, 'Tebak Gambar');

      if ((tgCurrentIndex + 1) % 5 === 0) {
        triggerCelebrationConfetti();
      }
    } else {
      playWrongSound();
      setTgStreak(0);
    }
  };

  const nextTebakGambar = () => {
    playPopSound();
    if (tgCurrentIndex >= 9) {
      setTgCompleted(true);
      triggerCelebrationConfetti();
    } else {
      setTgCurrentIndex((prev) => prev + 1);
    }
  };

  // Setup Susun Huruf
  useEffect(() => {
    setupSusunHurufWord(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  const setupSusunHurufWord = (wordItem: VocabItem) => {
    setShCurrentWord(wordItem);
    // Split the clean letters
    const rawLetters = wordItem.arabic
      .replace(/[\u064B-\u065F\u0670]/g, '') // remove harakat for letter pieces
      .split('')
      .filter((c) => c.trim().length > 0);

    const letterObjs = rawLetters.map((char, index) => ({ char, id: index }));
    const scrambled = [...letterObjs].sort(() => 0.5 - Math.random());
    setShScrambledLetters(scrambled);
    setShSelectedLetters([]);
    setShIsCorrect(null);

    setTimeout(() => {
      speakArabic(wordItem.arabic);
    }, 300);
  };

  const handlePickLetter = (item: { char: string; id: number }) => {
    playPopSound();
    setShSelectedLetters((prev) => [...prev, item]);
    setShScrambledLetters((prev) => prev.filter((l) => l.id !== item.id));
  };

  const handleReturnLetter = (item: { char: string; id: number }) => {
    playPopSound();
    setShSelectedLetters((prev) => prev.filter((l) => l.id !== item.id));
    setShScrambledLetters((prev) => [...prev, item]);
  };

  const checkSusunHuruf = () => {
    const rawTarget = shCurrentWord.arabic
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .split('')
      .filter((c) => c.trim().length > 0)
      .join('');

    const formed = shSelectedLetters.map((l) => l.char).join('');

    if (formed === rawTarget) {
      playCorrectSound();
      setShIsCorrect(true);
      triggerCelebrationConfetti();
      addStarsAndScore(2, 30, 'Susun Huruf Hijaiyah');
    } else {
      playWrongSound();
      setShIsCorrect(false);
    }
  };

  // Setup Tebak Suara
  useEffect(() => {
    setupTebakSuara();
  }, []);

  const setupTebakSuara = () => {
    const target = pool[Math.floor(Math.random() * pool.length)];
    const others = pool.filter((item) => item.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [target, ...others].sort(() => 0.5 - Math.random());
    setTsCurrentTarget(target);
    setTsOptions(combined);
    setTsResult(null);

    setTimeout(() => {
      speakArabic(target.arabic);
    }, 300);
  };

  const handleTebakSuaraChoice = (chosen: VocabItem) => {
    if (tsResult !== null) return;
    if (chosen.id === tsCurrentTarget.id) {
      playCorrectSound();
      setTsResult('correct');
      setTsScore((prev) => prev + 25);
      addStarsAndScore(1, 25, 'Tebak Suara');
      triggerCelebrationConfetti();
    } else {
      playWrongSound();
      setTsResult('wrong');
    }
  };

  // Setup Kartu Memori
  const setupMemoryGame = () => {
    const selectedVocabs = pool.sort(() => 0.5 - Math.random()).slice(0, 4);
    const newCards: MemoryCard[] = [];

    selectedVocabs.forEach((v) => {
      newCards.push({
        cardId: `${v.id}-arabic`,
        pairId: v.id,
        type: 'arabic',
        content: v.arabic,
        subContent: v.latin,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        cardId: `${v.id}-emoji`,
        pairId: v.id,
        type: 'emoji',
        content: v.emoji,
        subContent: v.indonesian,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(newCards.sort(() => 0.5 - Math.random()));
    setFlippedCards([]);
    setMatchedCount(0);
  };

  useEffect(() => {
    if (selectedGame === 'kartu-memori') {
      setupMemoryGame();
    }
  }, [selectedGame]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2) return;
    playPopSound();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // If card has Arabic, speak it!
    if (newCards[index].type === 'arabic') {
      speakArabic(newCards[index].content);
    }

    if (newFlipped.length === 2) {
      const firstIdx = newFlipped[0];
      const secondIdx = newFlipped[1];

      if (newCards[firstIdx].pairId === newCards[secondIdx].pairId) {
        // Matched!
        setTimeout(() => {
          playCorrectSound();
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedCards([]);
          setMatchedCount((prev) => {
            const nextVal = prev + 1;
            if (nextVal === 4) {
              triggerCelebrationConfetti();
              addStarsAndScore(3, 50, 'Kartu Memori');
            }
            return nextVal;
          });
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          playWrongSound();
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
        }, 1100);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selector Bar */}
      <div className="bg-white rounded-3xl p-3 border-2 border-amber-200 shadow-sm flex flex-wrap gap-2 justify-center">
        {[
          { id: 'tebak-gambar', label: '🖼️ Tebak Gambar', badge: 'Populer' },
          { id: 'susun-huruf', label: '🔤 Susun Huruf Hijaiyah', badge: 'Kreatif' },
          { id: 'tebak-suara', label: '🎧 Tebak Suara (Istima\')', badge: 'Audio' },
          { id: 'petualangan', label: '⭐ Petualangan Bintang', badge: 'Level 1-3' },
          { id: 'kartu-memori', label: '🃏 Pasangan Kartu', badge: 'Memori' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => {
              playPopSound();
              setSelectedGame(game.id as GameMode);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
              selectedGame === game.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
            }`}
          >
            <span>{game.label}</span>
          </button>
        ))}
      </div>

      {/* 1. GAME: TEBAK GAMBAR */}
      {selectedGame === 'tebak-gambar' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 shadow-lg text-center space-y-6">
          {/* Header score & streak */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-700 pb-3 border-b border-amber-100">
            <span className="flex items-center gap-1 text-amber-600">
              ⭐ Bintang: {tgStars}
            </span>
            <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              Streak: {tgStreak}x
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Soal {tgCurrentIndex + 1} / 10
            </span>
          </div>

          {!tgCompleted ? (
            <>
              {/* Question Word */}
              <div className="py-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Dengarkan dan Tebak Gambar yang Benar:
                </span>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <h2
                    dir="rtl"
                    className="text-4xl sm:text-5xl font-arabic font-bold text-amber-950 leading-[1.7]"
                  >
                    {pool[tgCurrentIndex % pool.length].arabic}
                  </h2>
                  <button
                    onClick={() => speakArabic(pool[tgCurrentIndex % pool.length].arabic)}
                    className="p-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md transform hover:scale-110 active:scale-95 transition-all"
                    title="Ulangi Suara Bahasa Arab Asli"
                  >
                    <Volume2 className="w-6 h-6 animate-pulse" />
                  </button>
                </div>
                <p className="text-sm font-bold text-amber-700 mt-1 font-mono">
                  {pool[tgCurrentIndex % pool.length].latin}
                </p>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                {tgOptions.map((opt) => {
                  const target = pool[tgCurrentIndex % pool.length];
                  const isChosen = tgSelectedAnswer === opt.id;
                  const isCorrect = opt.id === target.id;

                  let cardStyle =
                    'border-2 border-amber-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400';
                  if (tgSelectedAnswer) {
                    if (isCorrect) {
                      cardStyle = 'border-4 border-emerald-500 bg-emerald-100 ring-4 ring-emerald-200';
                    } else if (isChosen && !isCorrect) {
                      cardStyle = 'border-4 border-rose-500 bg-rose-100';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleTebakGambarChoice(opt)}
                      disabled={tgSelectedAnswer !== null}
                      className={`p-5 rounded-3xl transition-all flex flex-col items-center justify-center ${cardStyle} cursor-pointer group`}
                    >
                      <span className="text-6xl mb-2 filter drop-shadow-sm transform group-hover:scale-110 transition-transform">
                        {opt.emoji}
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-800">
                        {opt.indonesian}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Next Button */}
              {tgSelectedAnswer && (
                <div className="pt-2 animate-fade-in">
                  <button
                    onClick={nextTebakGambar}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Soal Berikutnya</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Completed Screen */
            <div className="py-8 space-y-4">
              <span className="text-6xl animate-bounce inline-block">🏆</span>
              <h3 className="text-3xl font-black font-fredoka text-emerald-700">
                Luar Biasa, Kamu Juara!
              </h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto font-medium">
                Selamat! Kamu berhasil menyelesaikan 10 soal Tebak Gambar dengan total skor: {tgScore} poin dan {tgStars} bintang!
              </p>
              <button
                onClick={() => {
                  setTgCurrentIndex(0);
                  setTgScore(0);
                  setTgStars(0);
                  setTgStreak(0);
                  setTgCompleted(false);
                }}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold rounded-2xl shadow-md inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Main Sekali Lagi</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. GAME: SUSUN HURUF HIJAIYAH */}
      {selectedGame === 'susun-huruf' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 shadow-lg text-center space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Permainan Menyusun Huruf Hijaiyah
            </span>
            <h2 className="text-2xl font-black font-fredoka text-slate-800 mt-1">
              Susun Huruf Menjadi Kata yang Benar!
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-4xl">{shCurrentWord.emoji}</span>
              <span className="text-lg font-extrabold text-amber-900">
                "{shCurrentWord.indonesian}" ({shCurrentWord.latin})
              </span>
              <button
                onClick={() => speakArabic(shCurrentWord.arabic)}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900"
                title="Dengar Suara Target"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Letter Answer Drop Area */}
          <div className="min-h-[80px] p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl flex flex-row-reverse items-center justify-center gap-2">
            {shSelectedLetters.length === 0 ? (
              <span className="text-xs text-slate-400 font-bold">
                Ketuk huruf hijaiyah di bawah untuk menyusun ke sini 👆
              </span>
            ) : (
              shSelectedLetters.map((letter) => (
                <button
                  key={letter.id}
                  onClick={() => handleReturnLetter(letter)}
                  className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 font-arabic text-3xl font-bold flex items-center justify-center shadow-md transform hover:scale-105 active:scale-95 transition-all border-2 border-amber-500"
                >
                  {letter.char}
                </button>
              ))
            )}
          </div>

          {/* Scrambled Choices */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {shScrambledLetters.map((letter) => (
              <button
                key={letter.id}
                onClick={() => handlePickLetter(letter)}
                className="w-14 h-14 rounded-2xl bg-white text-slate-800 font-arabic text-3xl font-bold flex items-center justify-center shadow-md border-2 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
              >
                {letter.char}
              </button>
            ))}
          </div>

          {/* Check / Next Word Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={checkSusunHuruf}
              disabled={shSelectedLetters.length === 0}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Periksa Susunan</span>
            </button>

            <button
              onClick={() => {
                const nextWord = pool[Math.floor(Math.random() * pool.length)];
                setupSusunHurufWord(nextWord);
              }}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl shadow-sm transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ganti Kata</span>
            </button>
          </div>

          {shIsCorrect === true && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-sm font-extrabold animate-bounce">
              🎉 Mumtaz! Susunan hurufmu sangat tepat: {shCurrentWord.arabic}!
            </div>
          )}
          {shIsCorrect === false && (
            <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 rounded-2xl text-sm font-extrabold">
              ❌ Urutan huruf belum pas, coba ketuk huruf untuk mengembalikan lalu susun lagi ya!
            </div>
          )}
        </div>
      )}

      {/* 3. GAME: TEBAK SUARA (ISTIMA') */}
      {selectedGame === 'tebak-suara' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-blue-300 p-6 sm:p-8 shadow-lg text-center space-y-6">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 pb-2 border-b border-blue-100">
            <span>🎧 Latihan Pendengaran Bahasa Arab (Maharatul Istima')</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full">
              Skor: {tsScore}
            </span>
          </div>

          {/* Sound trigger button */}
          <div className="py-4">
            <button
              onClick={() => speakArabic(tsCurrentTarget.arabic)}
              className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 transform hover:scale-105 active:scale-95 transition-all group"
            >
              <Volume2 className="w-12 h-12 group-hover:animate-pulse" />
            </button>
            <p className="text-sm font-extrabold text-blue-900 mt-3">
              Ketuk speaker untuk mendengarkan kata Arab 🔊
            </p>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-2 gap-4">
            {tsOptions.map((opt) => {
              const isCorrect = opt.id === tsCurrentTarget.id;
              let style = 'border-2 border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-400';
              if (tsResult !== null) {
                if (isCorrect) {
                  style = 'border-4 border-emerald-500 bg-emerald-100 ring-4 ring-emerald-200';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleTebakSuaraChoice(opt)}
                  disabled={tsResult !== null}
                  className={`p-5 rounded-3xl transition-all flex flex-col items-center justify-center ${style}`}
                >
                  <span className="text-6xl mb-2">{opt.emoji}</span>
                  <span className="text-sm font-black text-slate-800">{opt.indonesian}</span>
                </button>
              );
            })}
          </div>

          {tsResult && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 ${
                  tsResult === 'correct'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                    : 'bg-amber-100 border-amber-300 text-amber-950'
                }`}
              >
                <span className="text-3xl">{tsCurrentTarget.emoji}</span>
                <div>
                  <span className="text-xs font-bold block">
                    {tsResult === 'correct' ? '🎉 Jawaban Tepat!' : '💡 Kata yang diucapkan tadi:'}
                  </span>
                  <span dir="rtl" className="text-2xl font-arabic font-bold">
                    {tsCurrentTarget.arabic}
                  </span>
                  <span className="text-xs font-extrabold ml-2">
                    ({tsCurrentTarget.latin} - {tsCurrentTarget.indonesian})
                  </span>
                </div>
              </div>

              <button
                onClick={setupTebakSuara}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all"
              >
                Dengarkan Suara Berikutnya ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. GAME: PETUALANGAN BINTANG (LEVEL 1-3) */}
      {selectedGame === 'petualangan' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 shadow-lg text-center space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <h2 className="text-2xl font-black font-fredoka text-amber-950">
                Petualangan Bintang (Rihlah An-Nujum)
              </h2>
              <p className="text-xs text-slate-500">
                Selesaikan 3 level petualangan untuk membuka Mahkota Bintang Emas!
              </p>
            </div>
          </div>

          {/* Level Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { lvl: 1, title: 'Level 1: Pemula', stars: '⭐⭐⭐', icon: '🌱' },
              { lvl: 2, title: 'Level 2: Pejuang', stars: '⭐⭐⭐⭐', icon: '🚀' },
              { lvl: 3, title: 'Level 3: Juara', stars: '⭐⭐⭐⭐⭐', icon: '👑' },
            ].map((item) => (
              <button
                key={item.lvl}
                onClick={() => {
                  playPopSound();
                  setQuestLevel(item.lvl as 1 | 2 | 3);
                }}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center ${
                  questLevel === item.lvl
                    ? 'border-amber-500 bg-amber-100 shadow-md scale-105'
                    : 'border-slate-200 bg-slate-50 opacity-70'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-black text-slate-800">{item.title}</span>
                <span className="text-[10px] text-amber-600 font-bold">{item.stars}</span>
              </button>
            ))}
          </div>

          {/* Quest Content Card */}
          <div className="p-6 bg-gradient-to-tr from-amber-50 to-emerald-50 rounded-3xl border-2 border-amber-200 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Misi Level {questLevel}
              </span>
              <span className="text-xs font-bold text-amber-600">
                Hadiah: +{questLevel * 10} Koin Emas
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black font-fredoka text-slate-800">
                {questLevel === 1 && 'Hafalkan 5 Nama Hewan Bahasa Arab'}
                {questLevel === 2 && 'Hafalkan 5 Nama Buah & Angka'}
                {questLevel === 3 && 'Kuasai Percakapan Sederhana di Kelas'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Tantangan seru untuk anak SD agar semakin mahir melafalkan bahasa Arab dengan harakat yang benar.
              </p>
            </div>

            <button
              onClick={() => {
                playCorrectSound();
                triggerCelebrationConfetti();
                addStarsAndScore(questLevel, questLevel * 10, `Petualangan Level ${questLevel}`);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Selesaikan Misi & Klaim Bintang ⭐</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. GAME: PASANGAN KARTU MEMORI */}
      {selectedGame === 'kartu-memori' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 shadow-lg text-center space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <h2 className="text-2xl font-black font-fredoka text-slate-800">
                Permainan Kartu Memori
              </h2>
              <p className="text-xs text-slate-500">
                Buka dan cocokkan kartu kata Arab dengan kartu gambar!
              </p>
            </div>
            <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              Cocok: {matchedCount} / 4 Pasang
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, idx) => (
              <button
                key={card.cardId}
                onClick={() => handleCardClick(idx)}
                className={`h-24 sm:h-28 rounded-2xl transition-all transform flex flex-col items-center justify-center p-2 border-2 ${
                  card.isMatched
                    ? 'border-emerald-500 bg-emerald-100 opacity-60 cursor-default'
                    : card.isFlipped
                    ? 'border-amber-500 bg-white shadow-md'
                    : 'border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xs hover:scale-102'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <>
                    <span className={card.type === 'arabic' ? 'text-2xl sm:text-3xl font-arabic font-bold text-amber-950' : 'text-4xl'}>
                      {card.content}
                    </span>
                    {card.subContent && (
                      <span className="text-[10px] font-bold text-slate-600 mt-1 truncate max-w-full">
                        {card.subContent}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl select-none">🌙</span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={setupMemoryGame}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Acak Ulang Kartu</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
