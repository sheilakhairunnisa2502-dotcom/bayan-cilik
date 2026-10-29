import React, { useState } from 'react';
import { VocabItem, VocabCategory, ArabicStory } from '../types';
import { HIJAIYAH_LIST, INITIAL_VOCAB_ITEMS, HIWAR_DATA, HijaiyahDetail } from '../data/arabicData';
import { speakArabic, playPopSound } from '../utils/soundEffects';
import { Volume2, Sparkles, Search, Lightbulb, RefreshCw, VolumeX } from 'lucide-react';

interface MateriSectionProps {
  customVocabs: VocabItem[];
}

export const MateriSection: React.FC<MateriSectionProps> = ({ customVocabs }) => {
  const [materiTab, setMateriTab] = useState<'hijaiyah' | 'kosa-kata' | 'hiwar' | 'dongeng'>('hijaiyah');

  // Hijaiyah harakat selector
  const [selectedHarakat, setSelectedHarakat] = useState<'fathah' | 'kasrah' | 'dhammah' | 'tanwin'>('fathah');
  const [playingItem, setPlayingItem] = useState<string | null>(null);

  // Vocab filter & search
  const [vocabCategory, setVocabCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Story state
  const [currentStory, setCurrentStory] = useState<ArabicStory>({
    titleArabic: 'الأَرْنَبُ الصَّغِيرُ وَالجَزَرُ',
    titleIndo: 'Kelinci Kecil dan Wortel yang Manis',
    sentences: [
      {
        arabic: 'يَسْكُنُ الأَرْنَبُ الصَّغِيرُ فِي حَدِيقَةٍ خَضْرَاءَ جَمِيلَةٍ.',
        indonesian: 'Kelinci kecil tinggal di sebuah kebun hijau yang indah.',
      },
      {
        arabic: 'وَجَدَ الأَرْنَبُ جَزَرَةً كَبِيرَةً وَلَذِيذَةً فَفَرِحَ كَثِيرًا.',
        indonesian: 'Kelinci menemukan wortel besar yang lezat dan merasa sangat senang.',
      },
      {
        arabic: 'شَارَكَ الأَرْنَبُ طَعَامَهُ مَعَ صَدِيقِهِ القِطِّ بِكَرَمٍ.',
        indonesian: 'Kelinci berbagi makanannya dengan sahabatnya si kucing dengan ramah.',
      },
    ],
    moral: 'Suka berbagi makanan dengan teman membuat hati kita gembira dan disayang Allah!',
  });
  const [storyTopic, setStoryTopic] = useState('persahabatan hewan di kebun');
  const [storyLoading, setStoryLoading] = useState(false);

  // Combined vocab list
  const allVocabs = [...INITIAL_VOCAB_ITEMS, ...customVocabs];

  const filteredVocabs = allVocabs.filter((item) => {
    const matchCategory = vocabCategory === 'semua' || item.category === vocabCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.indonesian.toLowerCase().includes(q) ||
      item.latin.toLowerCase().includes(q) ||
      item.arabic.includes(q);
    return matchCategory && matchSearch;
  });

  const handlePlayArabic = (id: string, pureArabicText: string) => {
    playPopSound();
    setPlayingItem(id);
    speakArabic(pureArabicText, () => {
      setPlayingItem(null);
    });
  };

  const getHarakatChar = (item: HijaiyahDetail) => {
    switch (selectedHarakat) {
      case 'kasrah':
        return item.kasrah;
      case 'dhammah':
        return item.dhammah;
      case 'tanwin':
        return item.tanwin;
      case 'fathah':
      default:
        return item.fathah;
    }
  };

  const generateNewAIStory = async () => {
    playPopSound();
    setStoryLoading(true);
    try {
      const res = await fetch('/api/arabic-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: storyTopic }),
      });
      const data = await res.json();
      if (data.story) {
        setCurrentStory(data.story);
      }
    } catch (err) {
      console.warn('Gagal memuat cerita AI:', err);
    } finally {
      setStoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-amber-100/70 rounded-2xl border border-amber-200">
        <button
          onClick={() => {
            playPopSound();
            setMateriTab('hijaiyah');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            materiTab === 'hijaiyah'
              ? 'bg-amber-500 text-white shadow-md font-extrabold scale-102'
              : 'text-amber-900 hover:bg-amber-200/60'
          }`}
        >
          <span className="text-base">🔤</span>
          <span>Huruf Hijaiyah & Harakat</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setMateriTab('kosa-kata');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            materiTab === 'kosa-kata'
              ? 'bg-emerald-500 text-white shadow-md font-extrabold scale-102'
              : 'text-emerald-950 hover:bg-emerald-100/60'
          }`}
        >
          <span className="text-base">📚</span>
          <span>Kamus Bergambar SD</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setMateriTab('hiwar');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            materiTab === 'hiwar'
              ? 'bg-blue-600 text-white shadow-md font-extrabold scale-102'
              : 'text-blue-950 hover:bg-blue-100/60'
          }`}
        >
          <span className="text-base">💬</span>
          <span>Percakapan Santai (Hiwar)</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setMateriTab('dongeng');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            materiTab === 'dongeng'
              ? 'bg-purple-600 text-white shadow-md font-extrabold scale-102'
              : 'text-purple-950 hover:bg-purple-100/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Dongeng Mini AI</span>
        </button>
      </div>

      {/* 1. HIJAIYAH TAB */}
      {materiTab === 'hijaiyah' && (
        <div className="space-y-6">
          {/* Header & Harakat explanation */}
          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-6 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="bg-amber-600/20 text-amber-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Materi 1 • Huruf & Harakat
              </span>
              <h2 className="text-2xl font-black font-fredoka text-amber-950 mt-1">
                28 Huruf Hijaiyah dengan Suara Asli Arab
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
                Pilih tanda bunyi (harakat), lalu ketuk hurufnya untuk mendengarkan lafal aslinya!
              </p>
            </div>

            {/* Harakat selector buttons */}
            <div className="flex flex-wrap gap-1.5 bg-white/90 p-1.5 rounded-2xl border border-amber-300 shadow-xs">
              <button
                onClick={() => setSelectedHarakat('fathah')}
                className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  selectedHarakat === 'fathah'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-700 hover:bg-amber-100'
                }`}
              >
                Fathah (َ / A)
              </button>
              <button
                onClick={() => setSelectedHarakat('kasrah')}
                className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  selectedHarakat === 'kasrah'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-700 hover:bg-amber-100'
                }`}
              >
                Kasrah (ِ / I)
              </button>
              <button
                onClick={() => setSelectedHarakat('dhammah')}
                className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  selectedHarakat === 'dhammah'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-700 hover:bg-amber-100'
                }`}
              >
                Dhammah (ُ / U)
              </button>
              <button
                onClick={() => setSelectedHarakat('tanwin')}
                className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  selectedHarakat === 'tanwin'
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-700 hover:bg-amber-100'
                }`}
              >
                Tanwin (ً ٍ ٌ)
              </button>
            </div>
          </div>

          {/* Hijaiyah Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3.5">
            {HIJAIYAH_LIST.map((item, idx) => {
              const activeHarakatChar = getHarakatChar(item);
              const isPlayingLetter = playingItem === `hijaiyah-letter-${idx}`;
              const isPlayingExample = playingItem === `hijaiyah-example-${idx}`;

              return (
                <div
                  key={item.letter}
                  className={`bg-white rounded-3xl p-4 border-2 transition-all flex flex-col items-center justify-between text-center group hover:-translate-y-1 hover:shadow-lg ${
                    isPlayingLetter
                      ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                      : 'border-amber-200/90 hover:border-amber-400'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-bold font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded-full text-amber-800">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => handlePlayArabic(`hijaiyah-letter-${idx}`, activeHarakatChar)}
                      className="p-1 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                      title="Dengarkan Suara Huruf"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingLetter ? 'text-emerald-600 animate-bounce' : ''}`} />
                    </button>
                  </div>

                  {/* Big Arabic Letter with Harakat */}
                  <button
                    type="button"
                    onClick={() => handlePlayArabic(`hijaiyah-letter-${idx}`, activeHarakatChar)}
                    className="my-1 cursor-pointer focus:outline-none"
                    title={`Klik untuk dengarkan lafal ${activeHarakatChar}`}
                  >
                    <span
                      dir="rtl"
                      className="text-5xl sm:text-6xl font-arabic font-bold text-amber-950 group-hover:text-amber-600 transition-colors leading-[1.6] inline-block"
                    >
                      {activeHarakatChar}
                    </span>
                  </button>

                  {/* Letter Details */}
                  <div className="w-full pt-1 border-t border-amber-100/70">
                    <span className="text-xs font-black text-slate-800 block">
                      {item.name} ({item.arabicName})
                    </span>

                    {/* Example word button */}
                    <button
                      type="button"
                      onClick={() => handlePlayArabic(`hijaiyah-example-${idx}`, item.exampleArabic)}
                      className={`w-full mt-1.5 p-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        isPlayingExample
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-50/70 text-amber-900 border-amber-200/80 hover:bg-amber-100'
                      }`}
                      title={`Dengarkan contoh kata ${item.exampleArabic}`}
                    >
                      <Volume2 className="w-3 h-3 text-amber-600" />
                      <span dir="rtl" className="font-arabic font-bold text-xs">{item.exampleArabic}</span>
                      <span className="text-[10px] text-slate-500">({item.exampleIndo})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. KOSA KATA BERGAMBAR TAB */}
      {materiTab === 'kosa-kata' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div>
                <h2 className="text-2xl font-black font-fredoka text-slate-800">
                  Kamus Kosa Kata Bergambar & Bersuara
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Setiap kata dilafalkan fasih oleh penutur asli bahasa Arab (Fusha).
                </p>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari kata (Kucing, Apel...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {[
                { id: 'semua', label: '🌟 Semua Kata' },
                { id: 'hewan', label: '🐾 Hewan' },
                { id: 'buah', label: '🍎 Buah-buahan' },
                { id: 'sekolah', label: '🎒 Benda Sekolah' },
                { id: 'angka', label: '🔢 Angka (1-10)' },
                { id: 'tubuh', label: '👁️ Anggota Tubuh' },
                { id: 'warna', label: '🎨 Warna-warni' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    playPopSound();
                    setVocabCategory(cat.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    vocabCategory === cat.id
                      ? 'bg-emerald-500 text-white shadow-sm font-extrabold scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vocab Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabs.map((vocab) => {
              const isPlaying = playingItem === vocab.id;
              return (
                <div
                  key={vocab.id}
                  className="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-amber-400 relative overflow-hidden"
                >
                  {/* Category badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {vocab.category}
                    </span>

                    {/* Audio Speaker Button */}
                    <button
                      onClick={() => handlePlayArabic(vocab.id, vocab.arabic)}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-extrabold text-xs shadow-xs ${
                        isPlaying
                          ? 'bg-emerald-500 text-white animate-bounce ring-2 ring-emerald-300'
                          : 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                      }`}
                      title="Dengarkan Suara Orang Arab Asli"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isPlaying ? 'Memutar...' : 'Suara Arab'}</span>
                    </button>
                  </div>

                  {/* Main Word Details */}
                  <div className="text-center py-2">
                    <span className="text-5xl filter drop-shadow-sm mb-2 inline-block transform group-hover:scale-110 transition-transform">
                      {vocab.emoji}
                    </span>
                    <h3
                      dir="rtl"
                      className="text-4xl font-arabic font-bold text-amber-950 mt-1 mb-1 leading-[1.7]"
                    >
                      {vocab.arabic}
                    </h3>
                    <p className="text-sm font-black text-amber-700 font-mono tracking-wide">
                      {vocab.latin}
                    </p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      {vocab.indonesian}
                    </p>
                  </div>

                  {/* Makhraj tip or example sentence */}
                  {(vocab.makhrajTip || vocab.exampleSentence) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-amber-50/60 rounded-2xl p-3 space-y-2">
                      {vocab.makhrajTip && (
                        <p className="flex items-start gap-1.5 text-slate-700 font-medium">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{vocab.makhrajTip}</span>
                        </p>
                      )}
                      {vocab.exampleSentence && (
                        <div className="p-2 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between gap-2">
                          <div className="text-right flex-1">
                            <p dir="rtl" className="font-arabic font-bold text-amber-950 text-base leading-[1.6]">
                              {vocab.exampleSentence.arabic}
                            </p>
                            <p className="text-[11px] text-slate-500 text-left italic">
                              "{vocab.exampleSentence.indonesian}"
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePlayArabic(`sentence-${vocab.id}`, vocab.exampleSentence!.arabic)}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors flex-shrink-0"
                            title="Dengarkan Suara Kalimat Contoh"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PERCAKAPAN HIWAR TAB */}
      {materiTab === 'hiwar' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white text-left shadow-md">
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Materi 3 • Latihan Percakapan
            </span>
            <h2 className="text-2xl font-black font-fredoka mt-2">
              Percakapan Sehari-hari Anak SD (Al-Hiwar)
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              Dengarkan lafal aslinya, lalu tirukan bersama teman dan bimbingan Ustadzah Sheila!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {HIWAR_DATA.map((hiwar) => (
              <div
                key={hiwar.id}
                className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black font-fredoka text-slate-800">
                      {hiwar.title}
                    </h3>
                    <p className="text-xs text-slate-500">{hiwar.description}</p>
                  </div>
                  <span
                    dir="rtl"
                    className="text-2xl font-arabic font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-xl"
                  >
                    {hiwar.arabicTitle}
                  </span>
                </div>

                {/* Dialogue chat bubbles */}
                <div className="space-y-3">
                  {hiwar.dialogue.map((line, idx) => {
                    const isPlayingLine = playingItem === `hiwar-${hiwar.id}-${idx}`;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="text-2xl flex-shrink-0">{line.avatar}</span>
                          <div className="w-full">
                            <span className="text-xs font-black text-slate-700 block">
                              {line.speaker}
                            </span>
                            <p
                              dir="rtl"
                              className="text-xl font-arabic font-bold text-amber-950 mt-0.5 leading-[1.7] text-right"
                            >
                              {line.arabic}
                            </p>
                            <p className="text-[11px] font-bold text-amber-700 font-mono mt-0.5">
                              {line.latin}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {line.indonesian}
                            </p>
                          </div>
                        </div>

                        {/* Play line button */}
                        <button
                          onClick={() => handlePlayArabic(`hiwar-${hiwar.id}-${idx}`, line.arabic)}
                          className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                            isPlayingLine
                              ? 'bg-emerald-500 text-white animate-bounce'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          }`}
                          title="Dengarkan Suara Kalimat Ini"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DONGENG MINI AI TAB */}
      {materiTab === 'dongeng' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white text-left shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Materi 4 • Dongeng Interaktif AI
              </span>
              <h2 className="text-2xl font-black font-fredoka mt-2">
                Dongeng Mini Bahasa Arab Anak SD
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 mt-1">
                Kisah-kisah singkat dengan harakat lengkap, audio suara merdu penutur asli, dan hikmah kebaikan.
              </p>
            </div>

            {/* AI Generator Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Topik (misal: burung kecil, jujur)"
                value={storyTopic}
                onChange={(e) => setStoryTopic(e.target.value)}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-xs font-bold text-white placeholder-purple-200 focus:outline-none focus:bg-white focus:text-slate-800"
              />
              <button
                onClick={generateNewAIStory}
                disabled={storyLoading}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                {storyLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Buat Cerita Baru 🪄</span>
              </button>
            </div>
          </div>

          {/* Current Story Display */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-purple-200 shadow-md space-y-6 text-center max-w-3xl mx-auto">
            <div>
              <span className="text-5xl">📖</span>
              <h3
                dir="rtl"
                className="text-3xl font-arabic font-bold text-amber-950 mt-2 leading-[1.7]"
              >
                {currentStory.titleArabic}
              </h3>
              <p className="text-base font-extrabold text-purple-800 mt-0.5">
                {currentStory.titleIndo}
              </p>
            </div>

            {/* Sentences */}
            <div className="space-y-4 text-left">
              {currentStory.sentences.map((sentence, idx) => {
                const isPlayingSentence = playingItem === `story-${idx}`;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-start justify-between gap-3 group hover:border-purple-300 transition-all"
                  >
                    <div className="flex-1">
                      <span className="inline-block text-[10px] font-black bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full mb-1">
                        Kalimat {idx + 1}
                      </span>
                      <p
                        dir="rtl"
                        className="text-2xl font-arabic font-bold text-amber-950 leading-[1.8] text-right"
                      >
                        {sentence.arabic}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {sentence.indonesian}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlayArabic(`story-${idx}`, sentence.arabic)}
                      className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                        isPlayingSentence
                          ? 'bg-purple-600 text-white animate-bounce'
                          : 'bg-purple-200 hover:bg-purple-300 text-purple-900'
                      }`}
                      title="Dengarkan Suara Kalimat"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Moral lesson */}
            <div className="p-4 bg-amber-100 border-2 border-amber-300 rounded-2xl text-left flex items-start gap-3">
              <span className="text-3xl">🌟</span>
              <div>
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                  Pesan Moral & Kebaikan:
                </h4>
                <p className="text-sm font-bold text-amber-950 mt-0.5">
                  {currentStory.moral}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
