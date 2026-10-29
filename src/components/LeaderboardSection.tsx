import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Star, Medal, Sparkles, Award, Flame } from 'lucide-react';
import { triggerCelebrationConfetti } from '../utils/soundEffects';

export const LeaderboardSection: React.FC = () => {
  const { user, studentRecords } = useAuth();

  const TOP_PLAYERS = [
    { rank: 1, name: 'Aisyah Putri', avatar: '🐰', score: 380, stars: 18, level: 4, badge: 'Juara 1 Emas' },
    { rank: 2, name: 'Muhammad Fathir', avatar: '🦁', score: 320, stars: 15, level: 3, badge: 'Juara 2 Perak' },
    { rank: 3, name: 'Zahra Humaira', avatar: '🐱', score: 270, stars: 12, level: 3, badge: 'Juara 3 Perunggu' },
    { rank: 4, name: 'Rian Syahputra', avatar: '🚀', score: 210, stars: 9, level: 2, badge: 'Bintang Terang' },
    { rank: 5, name: 'Bilal Ahmad', avatar: '🐬', score: 180, stars: 8, level: 2, badge: 'Siswa Rajin' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-amber-950 shadow-lg text-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-950" />
            <span>Papan Juara Al-Bayan Cilik</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-fredoka">
            Juara Bintang Bahasa Arab SD
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
            Kumpulkan poin dan bintang dari setiap permainan untuk menempati podium kehormatan!
          </p>

          <button
            onClick={triggerCelebrationConfetti}
            className="mt-4 px-4 py-2 bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Rayakan dengan Konfeti 🎉</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4">
        {/* Silver Rank 2 */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-300 text-center shadow-md flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold mb-2">
            🥈
          </div>
          <span className="text-4xl mb-1">{TOP_PLAYERS[1].avatar}</span>
          <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate w-full">
            {TOP_PLAYERS[1].name}
          </h4>
          <span className="text-xs font-extrabold text-amber-600 mt-1">
            ⭐ {TOP_PLAYERS[1].stars} Bintang
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            {TOP_PLAYERS[1].score} Poin
          </span>
        </div>

        {/* Gold Rank 1 (Tallest) */}
        <div className="bg-gradient-to-b from-amber-100 to-white rounded-3xl p-5 sm:p-8 border-4 border-amber-400 text-center shadow-xl flex flex-col items-center transform -translate-y-2">
          <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-3xl font-bold mb-2 shadow-md">
            👑
          </div>
          <span className="text-5xl mb-1">{TOP_PLAYERS[0].avatar}</span>
          <h4 className="text-sm sm:text-base font-black text-slate-900 truncate w-full">
            {TOP_PLAYERS[0].name}
          </h4>
          <span className="text-xs sm:text-sm font-black text-amber-600 mt-1">
            ⭐ {TOP_PLAYERS[0].stars} Bintang Emas
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mt-1">
            {TOP_PLAYERS[0].score} Poin
          </span>
        </div>

        {/* Bronze Rank 3 */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-700/30 text-center shadow-md flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-2xl font-bold mb-2">
            🥉
          </div>
          <span className="text-4xl mb-1">{TOP_PLAYERS[2].avatar}</span>
          <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate w-full">
            {TOP_PLAYERS[2].name}
          </h4>
          <span className="text-xs font-extrabold text-amber-600 mt-1">
            ⭐ {TOP_PLAYERS[2].stars} Bintang
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            {TOP_PLAYERS[2].score} Poin
          </span>
        </div>
      </div>

      {/* User's Current Position */}
      {user && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{user.avatar}</span>
            <div>
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                Posisi Kamu Saat Ini:
              </p>
              <h4 className="text-base font-black text-slate-800">{user.displayName}</h4>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-extrabold">
            <span className="text-amber-600">⭐ {user.stars} Bintang</span>
            <span className="text-emerald-700">🪙 {user.score} Poin</span>
            <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
              Level {user.level}
            </span>
          </div>
        </div>
      )}

      {/* Recent History Table */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-black font-fredoka text-slate-800 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Aktivitas Prestasi Terbaru Siswa</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {studentRecords.slice(0, 6).map((rec) => (
            <div key={rec.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="text-xl">{rec.avatar}</span>
                <span>{rec.studentName}</span>
                <span className="text-slate-400 font-normal">berhasil di</span>
                <span className="text-amber-800 font-extrabold">{rec.gameType}</span>
              </div>
              <div className="flex items-center gap-3 font-bold">
                <span className="text-emerald-600">+{rec.score} Poin</span>
                <span className="text-amber-500">{'⭐'.repeat(rec.starsEarned)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
