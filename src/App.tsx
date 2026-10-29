import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { MateriSection } from './components/MateriSection';
import { GameSection } from './components/GameSection';
import { AIAssistantSection } from './components/AIAssistantModal';
import { LeaderboardSection } from './components/LeaderboardSection';
import { AdminDashboard } from './components/AdminDashboard';
import { VocabItem } from './types';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'materi' | 'game' | 'leaderboard' | 'admin' | 'ai-tutor'>('materi');

  // Custom vocabulary stored in local storage for persistence
  const [customVocabs, setCustomVocabs] = useState<VocabItem[]>(() => {
    try {
      const saved = localStorage.getItem('al_bayan_custom_vocabs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('al_bayan_custom_vocabs', JSON.stringify(customVocabs));
  }, [customVocabs]);

  const handleAddVocab = (item: VocabItem) => {
    setCustomVocabs((prev) => [item, ...prev]);
  };

  const handleDeleteVocab = (id: string) => {
    setCustomVocabs((prev) => prev.filter((v) => v.id !== id));
  };

  // MANDATORY LOGIN GATE:
  // If the user is not authenticated, render the rich LoginPage immediately
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-white to-emerald-50/40 flex flex-col">
      {/* Navigation Header with User info and prominent Logout button */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'materi' && <MateriSection customVocabs={customVocabs} />}
        {activeTab === 'game' && <GameSection customVocabs={customVocabs} />}
        {activeTab === 'ai-tutor' && <AIAssistantSection />}
        {activeTab === 'leaderboard' && <LeaderboardSection />}
        {activeTab === 'admin' && (
          <AdminDashboard
            customVocabs={customVocabs}
            onAddVocab={handleAddVocab}
            onDeleteVocab={handleDeleteVocab}
          />
        )}
      </main>

      {/* Cheerful Footer */}
      <footer className="bg-white border-t border-amber-200/80 py-6 mt-12 text-center text-xs text-slate-500 font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕌</span>
            <span className="font-fredoka font-black text-amber-950 text-sm">
              Al-Bayan Cilik
            </span>
            <span className="text-slate-400">•</span>
            <span>Aplikasi Edukasi Bahasa Arab Interaktif Anak SD</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ⚡ Express API & Gemini AI Aktif
            </span>
            <span className="text-slate-600">
              Admin: <strong className="text-blue-700">sheilakhairunnisa2502@gmail.com</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
