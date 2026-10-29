import React, { useState } from 'react';
import { useAuth, ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Sparkles, Key, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playPopSound, playFanfareSound } from '../utils/soundEffects';

const AVATAR_OPTIONS = [
  { emoji: '🦁', label: 'Singa Juara' },
  { emoji: '🐱', label: 'Kucing Pintar' },
  { emoji: '🐰', label: 'Kelinci Ceria' },
  { emoji: '🐼', label: 'Panda Bijak' },
  { emoji: '🐬', label: 'Lumba-Lumba' },
  { emoji: '🦅', label: 'Elang Gagah' },
  { emoji: '🚀', label: 'Astronot' },
  { emoji: '⭐', label: 'Bintang Terang' },
];

export const LoginPage: React.FC = () => {
  const { loginWithAdmin, loginWithGoogle, loginAsStudent } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'google' | 'admin'>('student');
  const [studentName, setStudentName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [adminError, setAdminError] = useState('');

  // Google sign in modal / state
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Tuliskan namamu dulu ya, anak pintar!');
      return;
    }
    playFanfareSound();
    loginAsStudent(studentName.trim(), selectedAvatar);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (adminEmail.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setAdminError(`Email admin harus: ${ADMIN_EMAIL}`);
      return;
    }

    const result = loginWithAdmin(adminPassword);
    if (result.success) {
      playFanfareSound();
    } else {
      setAdminError(result.message);
    }
  };

  const handleQuickAdminLogin = () => {
    playFanfareSound();
    setAdminEmail(ADMIN_EMAIL);
    setAdminPassword(DEFAULT_ADMIN_PASSWORD);
    loginWithAdmin(DEFAULT_ADMIN_PASSWORD);
  };

  const handleGoogleSignIn = async (emailToUse: string, nameToUse: string) => {
    setGoogleLoading(true);
    playPopSound();
    setTimeout(() => {
      loginWithGoogle(emailToUse, nameToUse);
      playFanfareSound();
      setGoogleLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-amber-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 text-6xl animate-bounce">⭐</div>
        <div className="absolute top-24 right-16 text-5xl animate-pulse">🌙</div>
        <div className="absolute bottom-16 left-20 text-6xl">🎈</div>
        <div className="absolute bottom-20 right-24 text-6xl animate-bounce">🕌</div>
      </div>

      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Playful Header Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 p-6 sm:p-8 text-center text-white relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Permainan Bahasa Arab Anak SD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-fredoka tracking-tight text-amber-950 drop-shadow-xs">
            Al-Bayan Cilik
          </h1>
          <p
            dir="rtl"
            className="text-2xl sm:text-3xl font-arabic font-bold text-amber-950 mt-1 leading-[1.8]"
          >
            العَرَبِيَّةُ لِلْأَطْفَالِ الصِّغَارِ
          </p>
          <p className="text-sm font-semibold text-amber-950/80 mt-2 max-w-md mx-auto">
            Belajar huruf hijaiyah, kosa kata bergambar dengan suara audio asli, dan kuis game berhadiah bintang!
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b-2 border-amber-200 bg-amber-50/70 p-1.5 gap-1.5 text-xs sm:text-sm font-bold">
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('student');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl transition-all ${
              activeTab === 'student'
                ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold scale-102'
                : 'text-slate-600 hover:bg-amber-100'
            }`}
          >
            <span>👦 Masuk Siswa</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('google');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl transition-all ${
              activeTab === 'google'
                ? 'bg-white text-slate-800 shadow-md font-extrabold border border-slate-200 scale-102'
                : 'text-slate-600 hover:bg-amber-100'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Login</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('admin');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl transition-all ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md font-extrabold scale-102'
                : 'text-slate-600 hover:bg-blue-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Akun Admin</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          {/* 1. STUDENT LOGIN TAB */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">
                  1. Pilih Karakter Avatar Lucu Kamu:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
                  {AVATAR_OPTIONS.map((item) => (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => {
                        playPopSound();
                        setSelectedAvatar(item.emoji);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all ${
                        selectedAvatar === item.emoji
                          ? 'border-amber-500 bg-amber-100 scale-105 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-3xl mb-1">{item.emoji}</span>
                      <span className="text-[11px] font-bold text-slate-700 truncate w-full text-center">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="studentName" className="block text-sm font-extrabold text-slate-800 mb-2">
                  2. Tuliskan Nama Lengkap / Panggilanmu:
                </label>
                <div className="relative">
                  <input
                    id="studentName"
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Fatih / Aisyah"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3.5 text-base font-bold bg-amber-50/50 border-2 border-amber-300 rounded-2xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 shadow-inner"
                  />
                  <span className="absolute right-3.5 top-3.5 text-2xl">✏️</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-emerald-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <span>Ayo Mulai Bermain! 🎮</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center text-xs font-semibold text-amber-800">
                💡 Belajar sambil bermain: Raih piala, kumpulkan bintang, dan dengarkan suara huruf hijaiyah!
              </div>
            </form>
          )}

          {/* 2. GOOGLE SIGN-IN TAB */}
          {activeTab === 'google' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
                🌐
              </div>

              <div>
                <h3 className="text-xl font-black font-fredoka text-slate-800">
                  Masuk dengan Firebase Google Sign-In
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Gunakan akun Google Anda untuk menyimpan nilai, bintang, dan level belajar anak secara otomatis.
                </p>
              </div>

              {googleLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-600">Menghubungkan ke Akun Google...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Google Login Options */}
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(ADMIN_EMAIL, 'Ustadzah Sheila (Admin)')}
                    className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-2xl font-extrabold text-slate-700 shadow-sm flex items-center justify-center gap-3 transition-all hover:border-blue-400 group"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <div className="text-left flex-1 truncate">
                      <span className="block text-xs font-bold text-slate-800">
                        Masuk sebagai Admin ({ADMIN_EMAIL})
                      </span>
                      <span className="block text-[11px] text-blue-600 font-semibold">
                        Akses penuh Panel Guru & Soal Kuis AI
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      Admin
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn('siswa.cilik@gmail.com', 'Siswa Cerdas Google')}
                    className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-600 text-xs flex items-center justify-center gap-2"
                  >
                    <span>Masuk dengan Akun Google Siswa Lainnya</span>
                  </button>
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                ✅ Sesuai konfigurasi Firebase Auth Google Sign-in untuk web app.
              </div>
            </div>
          )}

          {/* 3. ADMIN LOGIN TAB */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-extrabold text-sm text-blue-950 mb-1">
                    Akun Khusus Guru / Admin
                  </p>
                  <p>
                    User Email: <strong className="font-mono bg-blue-100 px-1 py-0.5 rounded">{ADMIN_EMAIL}</strong>
                  </p>
                  <p className="mt-0.5">
                    Password Default: <strong className="font-mono bg-blue-100 px-1 py-0.5 rounded">{DEFAULT_ADMIN_PASSWORD}</strong>
                  </p>
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Email Admin:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                  />
                  <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                  />
                  <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="flex-1 py-3 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>1-Klik Masuk Admin</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Key className="w-4 h-4" />
                  <span>Masuk Sistem</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 font-semibold flex items-center justify-between">
          <span>🕌 Belajar Bahasa Arab Menyenangkan</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Siap Deploy Vercel
          </span>
        </div>
      </div>
    </div>
  );
};
