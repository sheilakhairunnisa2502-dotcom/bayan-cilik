import React, { useState } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { VocabItem, VocabCategory, QuizQuestion } from '../types';
import { playPopSound, playCorrectSound, triggerCelebrationConfetti } from '../utils/soundEffects';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Users,
  BookOpen,
  Trophy,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  customVocabs: VocabItem[];
  onAddVocab: (item: VocabItem) => void;
  onDeleteVocab: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  customVocabs,
  onAddVocab,
  onDeleteVocab,
}) => {
  const { user, isAdmin, studentRecords, resetStudentRecords } = useAuth();

  // Add vocab form state
  const [newArabic, setNewArabic] = useState('');
  const [newLatin, setNewLatin] = useState('');
  const [newIndo, setNewIndo] = useState('');
  const [newCategory, setNewCategory] = useState<VocabCategory>('hewan');
  const [newEmoji, setNewEmoji] = useState('🌟');
  const [newMakhraj, setNewMakhraj] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  // AI Quiz Generator state
  const [aiTopic, setAiTopic] = useState('hewan');
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [aiSource, setAiSource] = useState<string>('');

  const handleCreateVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArabic || !newIndo) return;

    const newItem: VocabItem = {
      id: `custom-${Date.now()}`,
      arabic: newArabic.trim(),
      latin: newLatin.trim() || 'Lafalkan',
      indonesian: newIndo.trim(),
      category: newCategory,
      emoji: newEmoji || '✨',
      makhrajTip: newMakhraj.trim() || undefined,
    };

    onAddVocab(newItem);
    playCorrectSound();
    setAddSuccess(true);
    setNewArabic('');
    setNewLatin('');
    setNewIndo('');
    setNewMakhraj('');

    setTimeout(() => {
      setAddSuccess(false);
    }, 3000);
  };

  const handleGenerateAIQuiz = async () => {
    playPopSound();
    setAiLoading(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: aiTopic, count: aiCount }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setAiSource(data.source || 'gemini');
        playCorrectSound();
      }
    } catch (err) {
      console.warn('AI Quiz generation error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const exportStudentData = () => {
    playPopSound();
    const jsonStr = JSON.stringify(studentRecords, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-nilai-siswa-al-bayan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Admin Privilege Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
            🧕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-blue-500/40 text-blue-200 px-3 py-1 rounded-full border border-blue-400/30">
                Panel Guru & Administrator
              </span>
              {isAdmin && (
                <span className="text-xs bg-emerald-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-fredoka mt-1">
              Selamat Datang, Ustadzah Sheila!
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Kelola materi kosa kata bahasa Arab anak SD, buat kuis cerdas otomatis dengan Gemini AI, dan pantau nilai siswa.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center w-full md:w-auto flex-shrink-0">
          <p className="text-[11px] font-bold text-blue-200 uppercase">Akun Aktif</p>
          <p className="text-xs font-mono font-bold text-white mt-0.5">{ADMIN_EMAIL}</p>
          <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 bg-amber-400 text-amber-950 rounded">
            Hak Akses: Super Admin
          </span>
        </div>
      </div>

      {/* Grid: 1. AI Quiz Generator & 2. Add Vocab Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: GEMINI AI QUIZ GENERATOR */}
        <div className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-fredoka text-slate-800">
                  Generator Soal Kuis AI (Gemini 3.8 Flash)
                </h3>
                <p className="text-xs text-slate-500">
                  Buat soal kuis berharakat otomatis untuk anak SD dalam hitungan detik.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Kategori Soal:
              </label>
              <select
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-400"
              >
                <option value="hewan">🐾 Hewan (Al-Hayawaanaat)</option>
                <option value="buah">🍎 Buah & Makanan (Al-Fawaakih)</option>
                <option value="sekolah">🎒 Benda Kelas (Fil Fashl)</option>
                <option value="angka">🔢 Angka & Berhitung</option>
                <option value="warna">🎨 Warna-warni (Al-Alwaan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Jumlah Soal:
              </label>
              <select
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-400"
              >
                <option value={3}>3 Soal Cepat</option>
                <option value={5}>5 Soal Standar</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateAIQuiz}
            disabled={aiLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-200" />
            )}
            <span>{aiLoading ? 'Gemini Sedang Merancang Soal...' : 'Buat Soal Kuis dengan AI 🪄'}</span>
          </button>

          {/* Generated Questions List */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold text-purple-900 block">
                Hasil Soal AI ({aiSource}):
              </span>
              {generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-900">Soal {idx + 1}</span>
                    <span className="font-arabic font-bold text-lg text-amber-950">
                      {q.arabicWord}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800">{q.question}</p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <span
                        key={optIdx}
                        className={`p-1.5 rounded-lg text-center font-bold text-[11px] ${
                          optIdx === q.correctAnswerIndex
                            ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {opt} {optIdx === q.correctAnswerIndex && '✓'}
                      </span>
                    ))}
                  </div>
                  {q.funFact && (
                    <p className="text-[10px] text-purple-800 italic pt-1">
                      💡 {q.funFact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: ADD NEW VOCABULARY */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-fredoka text-slate-800">
                  Tambah Kosa Kata Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Materi yang ditambah otomatis muncul di kamus dan permainan siswa.
                </p>
              </div>
            </div>
          </div>

          {addSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Kosa kata baru berhasil disimpan!</span>
            </div>
          )}

          <form onSubmit={handleCreateVocab} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Kata Arab (Berharakat):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: بَيْتٌ"
                  value={newArabic}
                  onChange={(e) => setNewArabic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-arabic font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Lafal Latin:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Baitun"
                  value={newLatin}
                  onChange={(e) => setNewLatin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Arti Bahasa Indonesia:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rumah"
                  value={newIndo}
                  onChange={(e) => setNewIndo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Kategori:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VocabCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
                >
                  <option value="hewan">Hewan</option>
                  <option value="buah">Buah</option>
                  <option value="sekolah">Sekolah</option>
                  <option value="angka">Angka</option>
                  <option value="tubuh">Tubuh</option>
                  <option value="warna">Warna</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Emoji Gambar:
                </label>
                <input
                  type="text"
                  placeholder="🏠"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-center text-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Tips Makhraj Huruf (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ba keluar dari kedua bibir"
                  value={newMakhraj}
                  onChange={(e) => setNewMakhraj(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Kosa Kata ke Aplikasi</span>
            </button>
          </form>

          {/* Custom vocabs list */}
          {customVocabs.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-extrabold text-slate-700 mb-2">
                Kata Tambahan oleh Admin ({customVocabs.length}):
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customVocabs.map((cv) => (
                  <div
                    key={cv.id}
                    className="flex items-center justify-between p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cv.emoji}</span>
                      <div>
                        <span className="font-arabic font-bold text-amber-950 text-sm">
                          {cv.arabic}
                        </span>
                        <span className="text-slate-500 ml-2">({cv.indonesian})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteVocab(cv.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                      title="Hapus kata"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: STUDENT LEADERBOARD & PROGRESS TRACKING */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black font-fredoka text-slate-800">
                Laporan & Skor Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Daftar perolehan bintang dan permainan yang diselesaikan anak-anak.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportStudentData}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>
            <button
              onClick={resetStudentRecords}
              className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Siswa</th>
                <th className="py-2.5 px-3">Permainan</th>
                <th className="py-2.5 px-3 text-center">Skor Poin</th>
                <th className="py-2.5 px-3 text-center">Bintang</th>
                <th className="py-2.5 px-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-amber-50/50">
                  <td className="py-3 px-3 flex items-center gap-2 font-extrabold text-slate-800">
                    <span className="text-lg">{rec.avatar}</span>
                    <span>{rec.studentName}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-bold">{rec.gameType}</td>
                  <td className="py-3 px-3 text-center font-extrabold text-emerald-700">
                    +{rec.score}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-amber-600">
                    {'⭐'.repeat(Math.min(5, rec.starsEarned))}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-medium">{rec.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
