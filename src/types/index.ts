export type Role = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  role: Role;
  stars: number;
  score: number;
  level: number;
  completedQuizzes: number;
  lastActive: string;
}

export type VocabCategory =
  | 'hijaiyah'
  | 'hewan'
  | 'buah'
  | 'sekolah'
  | 'angka'
  | 'tubuh'
  | 'warna'
  | 'keluarga';

export interface VocabItem {
  id: string;
  arabic: string;
  latin: string;
  indonesian: string;
  category: VocabCategory;
  emoji: string;
  makhrajTip?: string;
  exampleSentence?: {
    arabic: string;
    indonesian: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  arabicWord: string;
  latin?: string;
  emoji?: string;
  options: string[];
  correctAnswerIndex: number;
  meaning: string;
  funFact?: string;
}

export interface ConversationLine {
  speaker: 'Ali' | 'Fatimah' | 'Guru' | 'Ahmad';
  arabic: string;
  latin: string;
  indonesian: string;
  avatar: string;
}

export interface HiwarItem {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  dialogue: ConversationLine[];
}

export interface ArabicStory {
  titleArabic: string;
  titleIndo: string;
  sentences: {
    arabic: string;
    indonesian: string;
  }[];
  moral: string;
}

export interface StudentScoreRecord {
  id: string;
  studentName: string;
  avatar: string;
  gameType: string;
  score: number;
  starsEarned: number;
  date: string;
}
