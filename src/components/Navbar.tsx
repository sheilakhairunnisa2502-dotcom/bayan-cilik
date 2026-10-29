import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Gamepad2,
  Trophy,
  ShieldCheck,
  LogOut,
  Sparkles,
  Volume2,
  User as UserIcon,
} from 'lucide-react';
import { playPopSound } from '../utils/soundEffects';

interface NavbarProps {
  activeTab: 'materi' | 'game' | 'leaderboard' | 'admin' | 'ai-tutor';
  setActiveTab: (tab: 'materi' | 'game' | 'leaderboard' | 'admin' | 'ai-tutor') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin, logout } = useAuth();

  const handleTabChange = (tab: 'materi' | 'game' | 'leaderboard' | 'admin' | 'ai-tutor') => {
    playPopSound();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => handleTabChange('materi')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-emerald-500 flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform">
              <span className="text-2xl">🕌</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-fredoka tracking-tight text-amber-900 group-hover:text-amber-600 transition-colors">
                  Al-Bayan Cilik
                </span>
                <span
                  dir="rtl"
                  className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-arabic font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 leading-normal"
                >
                  العَرَبِيَّةُ لِلْأَطْفَالِ
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <span>Belajar & Bermain Bahasa Arab SD</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleTabChange('materi')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'materi'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                  : 'text-slate-600 hover:bg-amber-100/70 hover:text-amber-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Materi Interaktif</span>
            </button>

            <button
              onClick={() => handleTabChange('game')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'game'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105'
                  : 'text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-900'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Permainan Seru</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-emerald-700/60 rounded-full text-white">5</span>
            </button>

            <button
              onClick={() => handleTabChange('ai-tutor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'ai-tutor'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105'
                  : 'text-slate-600 hover:bg-purple-100/70 hover:text-purple-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Tanya Guru AI</span>
            </button>

            <button
              onClick={() => handleTabChange('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20 scale-105'
                  : 'text-slate-600 hover:bg-amber-100/70 hover:text-amber-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Juara Bintang</span>
            </button>

            {/* Admin Dashboard Tab */}
            <button
              onClick={() => handleTabChange('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : isAdmin
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Panel Admin</span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 text-[10px] bg-blue-700 text-white font-extrabold rounded-md uppercase tracking-wider">
                  Ustadzah
                </span>
              )}
            </button>
          </nav>

          {/* User Status & Logout Button */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-2xl shadow-xs">
                <span className="text-2xl filter drop-shadow-sm select-none">{user.avatar}</span>
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-800 max-w-[130px] truncate">
                      {user.displayName}
                    </span>
                    {user.role === 'admin' && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600">
                    <span className="flex items-center gap-0.5">
                      ⭐ {user.stars}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-0.5 text-emerald-600">
                      🪙 {user.score}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={() => {
                playPopSound();
                logout();
              }}
              title="Keluar dari Akun (Logout)"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-xs sm:text-sm transition-all hover:shadow-xs active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="font-extrabold">Keluar</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-amber-100 text-xs font-bold">
          <button
            onClick={() => handleTabChange('materi')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'materi' ? 'text-amber-600 font-extrabold' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Materi</span>
          </button>
          <button
            onClick={() => handleTabChange('game')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'game' ? 'text-emerald-600 font-extrabold' : 'text-slate-600'
            }`}
          >
            <Gamepad2 className="w-5 h-5 mb-0.5" />
            <span>Permainan</span>
          </button>
          <button
            onClick={() => handleTabChange('ai-tutor')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'ai-tutor' ? 'text-purple-600 font-extrabold' : 'text-slate-600'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>Guru AI</span>
          </button>
          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'leaderboard' ? 'text-amber-500 font-extrabold' : 'text-slate-600'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span>Juara</span>
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'admin' ? 'text-blue-600 font-extrabold' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
