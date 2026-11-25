import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppNotification,
  Question,
  Quiz,
  QuizAttempt,
  ToastItem,
  UserSettings,
} from '../types/quiz';
import {
  DEFAULT_USER_SETTINGS,
  SEED_ATTEMPTS,
  SEED_NOTIFICATIONS,
  SEED_QUESTION_BANK,
  SEED_QUIZZES,
} from '../data/seedData';
import { createId } from '../utils/quizHelpers';

const STORAGE_KEYS = {
  quizzes: 'quizora_v1_quizzes',
  bank: 'quizora_v1_question_bank',
  attempts: 'quizora_v1_attempts',
  notifications: 'quizora_v1_notifications',
  settings: 'quizora_v1_settings',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface QuizoraContextValue {
  quizzes: Quiz[];
  questionBank: Question[];
  attempts: QuizAttempt[];
  notifications: AppNotification[];
  settings: UserSettings;
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  saveQuiz: (quiz: Quiz) => void;
  deleteQuiz: (quizId: string) => void;
  duplicateQuiz: (quizId: string) => Quiz | null;
  toggleQuizStatus: (quizId: string) => void;
  addBankQuestion: (question: Question) => void;
  updateBankQuestion: (question: Question) => void;
  deleteBankQuestion: (questionId: string) => void;
  addQuestionsToQuiz: (quizId: string, questions: Question[]) => void;
  recordAttempt: (attempt: QuizAttempt) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (next: UserSettings) => void;
  resetDemoData: () => void;
  importWorkspaceData: (jsonText: string) => boolean;
}

const QuizoraContext = createContext<QuizoraContextValue | null>(null);

export const QuizoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(() =>
    readStorage(STORAGE_KEYS.quizzes, SEED_QUIZZES)
  );
  const [questionBank, setQuestionBank] = useState<Question[]>(() =>
    readStorage(STORAGE_KEYS.bank, SEED_QUESTION_BANK)
  );
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() =>
    readStorage(STORAGE_KEYS.attempts, SEED_ATTEMPTS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    readStorage(STORAGE_KEYS.notifications, SEED_NOTIFICATIONS)
  );
  const [settings, setSettings] = useState<UserSettings>(() =>
    readStorage(STORAGE_KEYS.settings, DEFAULT_USER_SETTINGS)
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bank, JSON.stringify(questionBank));
  }, [questionBank]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  const showToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = createId('toast');
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const saveQuiz = (quiz: Quiz) => {
    const stamped: Quiz = {
      ...quiz,
      updatedAt: new Date().toISOString(),
    };
    setQuizzes((prev) => {
      const exists = prev.some((q) => q.id === stamped.id);
      if (exists) {
        return prev.map((q) => (q.id === stamped.id ? stamped : q));
      }
      return [stamped, ...prev];
    });
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    showToast({
      type: 'info',
      title: 'Quiz removed',
      description: 'The quiz has been deleted from your workspace.',
    });
  };

  const duplicateQuiz = (quizId: string): Quiz | null => {
    const original = quizzes.find((q) => q.id === quizId);
    if (!original) return null;
    const now = new Date().toISOString();
    const copy: Quiz = {
      ...original,
      id: createId('quiz'),
      title: `${original.title} (Copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      questions: original.questions.map((q) => ({
        ...q,
        id: createId('q'),
        options: q.options.map((o) => ({ ...o, id: createId('opt') })),
      })),
    };
    setQuizzes((prev) => [copy, ...prev]);
    showToast({
      type: 'success',
      title: 'Quiz duplicated',
      description: `Created a draft copy of "${original.title}".`,
    });
    return copy;
  };

  const toggleQuizStatus = (quizId: string) => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) return;
    if (target.status === 'draft' && target.questions.length === 0) {
      showToast({
        type: 'warning',
        title: 'Add questions first',
        description: 'A quiz needs at least one question before it can be published.',
      });
      return;
    }
    const nextStatus = target.status === 'published' ? 'draft' : 'published';
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId ? { ...q, status: nextStatus, updatedAt: new Date().toISOString() } : q
      )
    );
    showToast({
      type: 'success',
      title: nextStatus === 'published' ? 'Quiz published' : 'Moved to drafts',
      description:
        nextStatus === 'published'
          ? `"${target.title}" is now live for learners.`
          : `"${target.title}" is hidden while you refine it.`,
    });
  };

  const addBankQuestion = (question: Question) => {
    setQuestionBank((prev) => [question, ...prev]);
  };

  const updateBankQuestion = (question: Question) => {
    setQuestionBank((prev) => prev.map((q) => (q.id === question.id ? question : q)));
  };

  const deleteBankQuestion = (questionId: string) => {
    setQuestionBank((prev) => prev.filter((q) => q.id !== questionId));
  };

  const addQuestionsToQuiz = (quizId: string, questions: Question[]) => {
    const cloned = questions.map((q) => ({
      ...q,
      id: createId('q'),
      options: q.options.map((o) => ({ ...o, id: createId('opt') })),
      createdAt: new Date().toISOString(),
    }));
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              questions: [...quiz.questions, ...cloned],
              updatedAt: new Date().toISOString(),
            }
          : quiz
      )
    );
  };

  const recordAttempt = (attempt: QuizAttempt) => {
    setAttempts((prev) => [attempt, ...prev]);
    setNotifications((prev) => [
      {
        id: createId('notif'),
        title: `New submission on ${attempt.quizTitle}`,
        message: `${attempt.participantName} scored ${attempt.percentage}% (${attempt.score}/${attempt.totalMarks} pts).`,
        timeAgo: 'Just now',
        read: false,
        type: 'attempt',
      },
      ...prev,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateSettings = (next: UserSettings) => {
    setSettings(next);
    showToast({
      type: 'success',
      title: 'Preferences saved',
      description: 'Your workspace settings have been updated.',
    });
  };

  const resetDemoData = () => {
    setQuizzes(SEED_QUIZZES);
    setQuestionBank(SEED_QUESTION_BANK);
    setAttempts(SEED_ATTEMPTS);
    setNotifications(SEED_NOTIFICATIONS);
    setSettings(DEFAULT_USER_SETTINGS);
    showToast({
      type: 'info',
      title: 'Demo workspace restored',
      description: 'Sample quizzes, questions, and attempt analytics are back to defaults.',
    });
  };

  const importWorkspaceData = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed.quizzes)) setQuizzes(parsed.quizzes);
      if (Array.isArray(parsed.questionBank)) setQuestionBank(parsed.questionBank);
      if (Array.isArray(parsed.attempts)) setAttempts(parsed.attempts);
      if (parsed.settings) setSettings(parsed.settings);
      showToast({
        type: 'success',
        title: 'Workspace imported',
        description: 'Your quizzes and analytics data have been restored.',
      });
      return true;
    } catch {
      showToast({
        type: 'error',
        title: 'Invalid backup file',
        description: 'Please upload a valid QUIZORA JSON export file.',
      });
      return false;
    }
  };

  const value = useMemo(
    () => ({
      quizzes,
      questionBank,
      attempts,
      notifications,
      settings,
      toasts,
      showToast,
      dismissToast,
      saveQuiz,
      deleteQuiz,
      duplicateQuiz,
      toggleQuizStatus,
      addBankQuestion,
      updateBankQuestion,
      deleteBankQuestion,
      addQuestionsToQuiz,
      recordAttempt,
      markAllNotificationsRead,
      updateSettings,
      resetDemoData,
      importWorkspaceData,
    }),
    [quizzes, questionBank, attempts, notifications, settings, toasts]
  );

  return <QuizoraContext.Provider value={value}>{children}</QuizoraContext.Provider>;
};

export function useQuizora() {
  const ctx = useContext(QuizoraContext);
  if (!ctx) throw new Error('useQuizora must be used inside QuizoraProvider');
  return ctx;
}
