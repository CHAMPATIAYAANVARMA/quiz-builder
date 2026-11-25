import {
  Question,
  QuestionResult,
  QuestionType,
  Quiz,
  QuizAttempt,
  QuizCategory,
  UserAnswer,
} from '../types/quiz';

export const QUIZ_CATEGORIES: QuizCategory[] = [
  'Web Engineering',
  'Product & Design',
  'Data & AI',
  'Leadership & Ops',
  'Science & Logic',
  'General Knowledge',
];

export const QUESTION_TYPE_META: Record<
  QuestionType,
  { label: string; shortLabel: string; hint: string; badgeClass: string }
> = {
  multiple_choice: {
    label: 'Multiple Choice',
    shortLabel: 'Single Choice',
    hint: 'Learners pick one best answer.',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  multiple_select: {
    label: 'Multiple Select',
    shortLabel: 'Multi-Select',
    hint: 'Learners check all answers that apply.',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  true_false: {
    label: 'True / False',
    shortLabel: 'True / False',
    hint: 'Quick binary statement check.',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  short_answer: {
    label: 'Short Answer',
    shortLabel: 'Short Answer',
    hint: 'Typed response matched against accepted answers.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export function createId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function createDefaultQuestion(type: QuestionType = 'multiple_choice'): Question {
  const now = new Date().toISOString();
  if (type === 'true_false') {
    return {
      id: createId('q'),
      type,
      prompt: '',
      options: [
        { id: createId('opt'), text: 'True', isCorrect: true },
        { id: createId('opt'), text: 'False', isCorrect: false },
      ],
      acceptedAnswers: [],
      marks: 1,
      explanation: '',
      createdAt: now,
    };
  }
  if (type === 'short_answer') {
    return {
      id: createId('q'),
      type,
      prompt: '',
      options: [],
      acceptedAnswers: [''],
      marks: 2,
      explanation: '',
      createdAt: now,
    };
  }
  return {
    id: createId('q'),
    type,
    prompt: '',
    options: [
      { id: createId('opt'), text: '', isCorrect: true },
      { id: createId('opt'), text: '', isCorrect: false },
      { id: createId('opt'), text: '', isCorrect: false },
      { id: createId('opt'), text: '', isCorrect: false },
    ],
    acceptedAnswers: [],
    marks: type === 'multiple_select' ? 2 : 1,
    explanation: '',
    createdAt: now,
  };
}

export function getQuizTotalMarks(quiz: Quiz): number {
  return quiz.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function evaluateQuizSubmission(
  quiz: Quiz,
  answers: UserAnswer[],
  participantName: string,
  timeSpentSeconds: number
): QuizAttempt {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const questionResults: QuestionResult[] = quiz.questions.map((question) => {
    const userAns = answerMap.get(question.id);
    const maxMarks = question.marks || 1;

    if (question.type === 'short_answer') {
      const rawInput = (userAns?.shortAnswerText || '').trim();
      const normalized = rawInput.toLowerCase();
      const validAnswers = question.acceptedAnswers
        .map((a) => a.trim())
        .filter(Boolean);
      const isCorrect =
        normalized.length > 0 &&
        validAnswers.some((accepted) => accepted.toLowerCase() === normalized);

      return {
        questionId: question.id,
        isCorrect,
        marksEarned: isCorrect ? maxMarks : 0,
        maxMarks,
        userAnswerLabel: rawInput || 'No answer provided',
        correctAnswerLabel: validAnswers.join(' / ') || '—',
      };
    }

    const selectedIds = new Set(userAns?.selectedOptionIds || []);
    const correctIds = new Set(
      question.options.filter((o) => o.isCorrect).map((o) => o.id)
    );

    const isCorrect =
      correctIds.size > 0 &&
      selectedIds.size === correctIds.size &&
      Array.from(correctIds).every((id) => selectedIds.has(id));

    const userLabels = question.options
      .filter((o) => selectedIds.has(o.id))
      .map((o) => o.text);
    const correctLabels = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.text);

    return {
      questionId: question.id,
      isCorrect,
      marksEarned: isCorrect ? maxMarks : 0,
      maxMarks,
      userAnswerLabel: userLabels.length ? userLabels.join(', ') : 'Skipped',
      correctAnswerLabel: correctLabels.join(', ') || '—',
    };
  });

  const score = questionResults.reduce((acc, r) => acc + r.marksEarned, 0);
  const totalMarks = questionResults.reduce((acc, r) => acc + r.maxMarks, 0);
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const incorrectCount = questionResults.length - correctCount;

  return {
    id: createId('att'),
    quizId: quiz.id,
    quizTitle: quiz.title,
    participantName: participantName.trim() || 'Guest Learner',
    answers,
    questionResults,
    score,
    totalMarks,
    percentage,
    passed: percentage >= quiz.passingScore,
    correctCount,
    incorrectCount,
    timeSpentSeconds,
    completedAt: new Date().toISOString(),
  };
}

export function validateQuizForBuilder(
  quiz: Quiz,
  requirePublishReadiness: boolean
): string[] {
  const errors: string[] = [];
  if (!quiz.title.trim()) {
    errors.push('Give your quiz a clear title before saving.');
  }
  if (requirePublishReadiness && quiz.questions.length === 0) {
    errors.push('Add at least one question before publishing.');
  }

  quiz.questions.forEach((q, idx) => {
    const label = `Question ${idx + 1}`;
    if (!q.prompt.trim()) {
      errors.push(`${label} needs a question prompt.`);
    }
    if (q.type === 'short_answer') {
      const hasAccepted = q.acceptedAnswers.some((a) => a.trim().length > 0);
      if (!hasAccepted) {
        errors.push(`${label} needs at least one accepted short answer.`);
      }
    } else {
      const filledOptions = q.options.filter((o) => o.text.trim().length > 0);
      if (filledOptions.length < 2) {
        errors.push(`${label} needs at least 2 filled answer options.`);
      }
      const hasCorrect = q.options.some((o) => o.isCorrect && o.text.trim().length > 0);
      if (!hasCorrect) {
        errors.push(`${label} needs at least one correct option marked.`);
      }
    }
  });

  return errors;
}

export const DIFFICULTY_BADGE: Record<string, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-50 text-rose-700 border-rose-200',
};
