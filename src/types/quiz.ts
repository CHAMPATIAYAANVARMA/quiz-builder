export type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuizStatus = 'draft' | 'published';

export type QuizCategory =
  | 'Product & Design'
  | 'Web Engineering'
  | 'Data & AI'
  | 'Leadership & Ops'
  | 'Science & Logic'
  | 'General Knowledge';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[]; // used for multiple_choice, multiple_select, true_false
  acceptedAnswers: string[]; // used for short_answer (case-insensitive)
  marks: number;
  explanation: string;
  category?: QuizCategory;
  difficulty?: Difficulty;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: Difficulty;
  timeLimitMinutes: number; // 0 = untimed
  passingScore: number; // percentage 0-100
  status: QuizStatus;
  questions: Question[];
  shuffleQuestions: boolean;
  showExplanations: boolean;
  completionRate: number; // 0-100 realistic completion stat
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIds: string[];
  shortAnswerText: string;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  marksEarned: number;
  maxMarks: number;
  userAnswerLabel: string;
  correctAnswerLabel: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  participantName: string;
  participantEmail?: string;
  answers: UserAnswer[];
  questionResults: QuestionResult[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  type: 'attempt' | 'publish' | 'tip';
}

export interface UserSettings {
  fullName: string;
  role: string;
  organization: string;
  email: string;
  defaultTimeLimit: number;
  defaultPassingScore: number;
  autoSaveDrafts: boolean;
  showExplanationsByDefault: boolean;
}

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'quizzes'
  | 'builder'
  | 'bank'
  | 'analytics'
  | 'settings'
  | 'take-quiz'
  | 'results';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
