import React, { useState } from 'react';
import { Sparkles, Send, Volume2, HelpCircle, Lightbulb, BookOpen, MessageSquare } from 'lucide-react';
import { speakArabic, playPopSound, playCorrectSound } from '../utils/soundEffects';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  arabic?: string;
  audioText?: string;
}

export const AIAssistantSection: React.FC = () => {
  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'tutor',
      text: 'Ahlan wa sahlan! Aku adalah Asisten Guru Bahasa Arab AI. Kamu bisa tanya apa saja arti kata, cara melafalkan makhraj huruf, atau meminta contoh kalimat bahasa Arab yang seru!',
      arabic: 'أَهْلاً وَسَهْلاً بِكَ يَا بَطَلُ!',
      audioText: 'أَهْلاً وَسَهْلاً بِكَ يَا بَطَلُ',
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputWord.trim();
    if (!query) return;

    playPopSound();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputWord('');
    setLoading(true);

    try {
      const res = await fetch('/api/pronunciation-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: query }),
      });
      const data = await res.json();

      playCorrectSound();
      const tutorMsg: Message = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: data.tips || `Bagus sekali! Kata "${query}" adalah kosa kata yang hebat untuk dipelajari!`,
        arabic: data.word,
        audioText: data.word,
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: `Hebat sekali! Teruslah bersemangat belajar dan melafalkan huruf-huruf bahasa Arab dengan suara jelas dan merdu ya!`,
        arabic: 'مُمْتَازٌ! وَاصِلْ تَعَلُّمَكَ',
        audioText: 'مُمْتَازٌ',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Apa bahasa Arabnya "Sepeda"?',
    'Bagaimana makhraj huruf Qaf (ق)?',
    'Apa arti dari "Syukran" (شُكْرًا)?',
    'Bahasa Arabnya "Masjid Indah"?',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kecerdasan Buatan Ramah Anak</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-fredoka">
            Tanya Guru Cilik AI Bahasa Arab
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Ketik kata apa saja untuk mengetahui tulisan Arab berharakat, tips makhraj, dan suara bunyinya!
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
          🤖
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs ${
                msg.sender === 'user' ? 'bg-amber-400 text-amber-950' : 'bg-purple-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? '👦' : '🤖'}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-amber-100 text-amber-950 font-bold rounded-tr-none'
                  : 'bg-purple-50 text-slate-800 border border-purple-200 font-semibold rounded-tl-none'
              }`}
            >
              {msg.arabic && (
                <div className="flex items-center justify-between gap-2 border-b border-purple-200 pb-2">
                  <span className="text-2xl font-arabic font-bold text-purple-950">
                    {msg.arabic}
                  </span>
                  {msg.audioText && (
                    <button
                      onClick={() => speakArabic(msg.audioText!)}
                      className="p-1.5 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-900 transition-colors"
                      title="Dengarkan Suara"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 animate-pulse pl-12">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Guru AI sedang menyiapkan penjelasan ceria...</span>
          </div>
        )}
      </div>

      {/* Quick Question Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-500">Pertanyaan Populer:</span>
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => setInputWord(q)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Tanyakan kata atau kalimat bahasa Arab (misal: apa arti qalamun?)..."
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          className="flex-1 px-4 py-3 bg-white border-2 border-purple-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-600 shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputWord.trim() || loading}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Kirim</span>
        </button>
      </form>
    </div>
  );
};
