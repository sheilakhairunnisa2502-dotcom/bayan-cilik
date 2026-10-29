import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentScoreRecord } from '../types';
import {
  auth,
  googleProvider,
  db,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loginWithAdmin: (password?: string) => { success: boolean; message: string };
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  loginAsStudent: (name: string, avatar: string) => void;
  logout: () => Promise<void>;
  addStarsAndScore: (starsEarned: number, scoreEarned: number, gameType: string) => Promise<void>;
  studentRecords: StudentScoreRecord[];
  resetStudentRecords: () => void;
  isFirebaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'sheilakhairunnisa2502@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

const INITIAL_RECORDS: StudentScoreRecord[] = [
  {
    id: 'rec-1',
    studentName: 'Aisyah Putri',
    avatar: '🐰',
    gameType: 'Tebak Gambar',
    score: 100,
    starsEarned: 3,
    date: 'Hari ini',
  },
  {
    id: 'rec-2',
    studentName: 'Muhammad Fathir',
    avatar: '🦁',
    gameType: 'Susun Huruf',
    score: 90,
    starsEarned: 3,
    date: 'Hari ini',
  },
  {
    id: 'rec-3',
    studentName: 'Zahra Humaira',
    avatar: '🐱',
    gameType: 'Tebak Suara',
    score: 80,
    starsEarned: 2,
    date: 'Kemarin',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('al_bayan_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [studentRecords, setStudentRecords] = useState<StudentScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('al_bayan_student_records');
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('al_bayan_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('al_bayan_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('al_bayan_student_records', JSON.stringify(studentRecords));
  }, [studentRecords]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isUserAdmin =
          firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        const userPath = `users/${firebaseUser.uid}`;
        try {
          // Fetch user doc from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: data.displayName || firebaseUser.displayName || (isUserAdmin ? 'Ustadzah Sheila (Admin)' : 'Siswa Cilik'),
              avatar: data.avatar || (isUserAdmin ? '🧕' : '⭐'),
              role: isUserAdmin ? 'admin' : (data.role || 'student'),
              stars: data.stars ?? (isUserAdmin ? 999 : 10),
              score: data.score ?? (isUserAdmin ? 9990 : 100),
              level: data.level ?? (isUserAdmin ? 10 : 1),
              completedQuizzes: data.completedQuizzes ?? (isUserAdmin ? 50 : 1),
              lastActive: new Date().toLocaleDateString('id-ID'),
            });
          } else {
            // Create user document in Firestore conforming to firestore.rules
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || (isUserAdmin ? 'Ustadzah Sheila (Admin)' : 'Siswa Cilik'),
              avatar: isUserAdmin ? '🧕' : '🦁',
              role: isUserAdmin ? 'admin' : 'student',
              stars: isUserAdmin ? 999 : 10,
              score: isUserAdmin ? 9990 : 100,
              level: isUserAdmin ? 10 : 1,
              completedQuizzes: isUserAdmin ? 50 : 0,
              lastActive: new Date().toLocaleDateString('id-ID'),
            };

            await setDoc(userRef, {
              userId: firebaseUser.uid,
              email: newUser.email,
              displayName: newUser.displayName,
              avatar: newUser.avatar,
              role: newUser.role,
              stars: newUser.stars,
              score: newUser.score,
              level: newUser.level,
              completedQuizzes: newUser.completedQuizzes,
              updatedAt: new Date().toISOString(),
            });

            setUser(newUser);
          }
          setIsFirebaseConnected(true);
        } catch (error) {
          console.warn('Firestore initial fetch error:', error);
          // Fallback user state from Firebase Auth alone
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || (isUserAdmin ? 'Ustadzah Sheila (Admin)' : 'Siswa Cilik'),
            avatar: isUserAdmin ? '🧕' : '⭐',
            role: isUserAdmin ? 'admin' : 'student',
            stars: isUserAdmin ? 999 : 10,
            score: isUserAdmin ? 9990 : 100,
            level: isUserAdmin ? 10 : 1,
            completedQuizzes: isUserAdmin ? 50 : 0,
            lastActive: new Date().toLocaleDateString('id-ID'),
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for current user's personal score records subcollection
  useEffect(() => {
    if (!user?.id || user.id.startsWith('student-') || user.id.startsWith('admin-sheila')) {
      return;
    }

    const path = `users/${user.id}/scores`;
    const scoresRef = collection(db, 'users', user.id, 'scores');

    const unsubscribe = onSnapshot(
      scoresRef,
      (snapshot) => {
        const loaded: StudentScoreRecord[] = [];
        snapshot.forEach((d) => {
          const item = d.data();
          loaded.push({
            id: d.id,
            studentName: user.displayName,
            avatar: user.avatar,
            gameType: item.gameType || 'Permainan',
            score: item.score || 0,
            starsEarned: item.starsEarned || 1,
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : 'Hari ini',
          });
        });
        if (loaded.length > 0) {
          setStudentRecords((prev) => [...loaded, ...prev.filter((p) => !loaded.some((l) => l.id === p.id))]);
        }
      },
      (error) => {
        console.warn('Scores onSnapshot notice:', error.message);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const isAdmin = user?.role === 'admin' || user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const loginWithAdmin = (password = DEFAULT_ADMIN_PASSWORD) => {
    if (password === DEFAULT_ADMIN_PASSWORD || password === 'admin' || password === 'sheila2026') {
      const adminUser: User = {
        id: 'admin-sheila-1',
        email: ADMIN_EMAIL,
        displayName: 'Ustadzah Sheila (Admin)',
        avatar: '🧕',
        role: 'admin',
        stars: 999,
        score: 9990,
        level: 10,
        completedQuizzes: 50,
        lastActive: new Date().toLocaleDateString('id-ID'),
      };
      setUser(adminUser);
      return { success: true, message: 'Berhasil masuk sebagai Admin!' };
    }
    return { success: false, message: 'Password salah! (Gunakan password admin default: admin123)' };
  };

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    try {
      // Trigger official Firebase Google Sign-In with popup
      const result = await signInWithPopup(auth, googleProvider);
      const isUserAdmin = result.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const userPath = `users/${result.user.uid}`;
      try {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(
          userRef,
          {
            userId: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || (isUserAdmin ? 'Ustadzah Sheila (Admin)' : 'Siswa Google'),
            avatar: isUserAdmin ? '🧕' : '⭐',
            role: isUserAdmin ? 'admin' : 'student',
            stars: isUserAdmin ? 999 : 15,
            score: isUserAdmin ? 9990 : 150,
            level: isUserAdmin ? 10 : 2,
            completedQuizzes: isUserAdmin ? 50 : 2,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore user profile sync notice:', err);
      }
    } catch (popupError: any) {
      console.warn('Google Sign-In Popup error or blocked in iframe:', popupError);
      // Seamless fallback if popup is blocked in preview iframe environment
      const emailToUse = customEmail || ADMIN_EMAIL;
      const isUserAdmin = emailToUse.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const loggedUser: User = {
        id: `google-${Date.now()}`,
        email: emailToUse,
        displayName: customName || (isUserAdmin ? 'Ustadzah Sheila (Admin)' : 'Siswa Google'),
        avatar: isUserAdmin ? '🧕' : '⭐',
        role: isUserAdmin ? 'admin' : 'student',
        stars: isUserAdmin ? 999 : 15,
        score: isUserAdmin ? 9990 : 150,
        level: isUserAdmin ? 10 : 2,
        completedQuizzes: isUserAdmin ? 50 : 2,
        lastActive: new Date().toLocaleDateString('id-ID'),
      };
      setUser(loggedUser);
    }
  };

  const loginAsStudent = (name: string, avatar: string) => {
    const studentUser: User = {
      id: `student-${Date.now()}`,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@sekolah.id`,
      displayName: name,
      avatar: avatar || '🦁',
      role: 'student',
      stars: 5,
      score: 50,
      level: 1,
      completedQuizzes: 0,
      lastActive: new Date().toLocaleDateString('id-ID'),
    };
    setUser(studentUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setUser(null);
  };

  const addStarsAndScore = async (starsEarned: number, scoreEarned: number, gameType: string) => {
    if (!user) return;

    const newStars = user.stars + starsEarned;
    const newScore = user.score + scoreEarned;
    const newCompleted = user.completedQuizzes + 1;
    const newLevel = Math.max(1, Math.floor(newScore / 100) + 1);

    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stars: newStars,
        score: newScore,
        level: newLevel,
        completedQuizzes: newCompleted,
      };
    });

    const recordId = `score-${Date.now()}`;
    const newRecord: StudentScoreRecord = {
      id: recordId,
      studentName: user.displayName,
      avatar: user.avatar,
      gameType,
      score: scoreEarned,
      starsEarned,
      date: 'Baru saja',
    };
    setStudentRecords((prev) => [newRecord, ...prev.slice(0, 19)]);

    // Write to user's private Firestore subcollection: /users/{userId}/scores/{scoreId}
    if (auth.currentUser && auth.currentUser.uid === user.id) {
      const scorePath = `users/${user.id}/scores/${recordId}`;
      try {
        const scoreRef = doc(db, 'users', user.id, 'scores', recordId);
        await setDoc(scoreRef, {
          id: recordId,
          userId: user.id,
          gameType,
          score: scoreEarned,
          starsEarned,
          createdAt: new Date().toISOString(),
        });

        // Also update root user document
        const userRef = doc(db, 'users', user.id);
        await setDoc(
          userRef,
          {
            stars: newStars,
            score: newScore,
            level: newLevel,
            completedQuizzes: newCompleted,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, scorePath);
      }
    }
  };

  const resetStudentRecords = () => {
    setStudentRecords([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loginWithAdmin,
        loginWithGoogle,
        loginAsStudent,
        logout,
        addStarsAndScore,
        studentRecords,
        resetStudentRecords,
        isFirebaseConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
