import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookmarkPlus,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Globe,
  GripVertical,
  Lightbulb,
  Play,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useQuizora } from '../../context/QuizoraContext';
import {
  Difficulty,
  Question,
  QuestionType,
  Quiz,
  QuizCategory,
} from '../../types/quiz';
import {
  QUESTION_TYPE_META,
  QUIZ_CATEGORIES,
  createDefaultQuestion,
  createId,
  getQuizTotalMarks,
  validateQuizForBuilder,
} from '../../utils/quizHelpers';

interface QuizBuilderViewProps {
  quizId: string | null;
  onBack: () => void;
  onPreviewTakeQuiz: (quizId: string) => void;
}

export const QuizBuilderView: React.FC<QuizBuilderViewProps> = ({
  quizId,
  onBack,
  onPreviewTakeQuiz,
}) => {
  const { quizzes, questionBank, settings, saveQuiz, addBankQuestion, showToast } =
    useQuizora();

  const buildInitialQuiz = (): Quiz => {
    if (quizId) {
      const existing = quizzes.find((q) => q.id === quizId);
      if (existing) return JSON.parse(JSON.stringify(existing)) as Quiz;
    }
    const now = new Date().toISOString();
    return {
      id: createId('quiz'),
      title: '',
      description: '',
      category: 'Web Engineering',
      difficulty: 'Beginner',
      timeLimitMinutes: settings.defaultTimeLimit,
      passingScore: settings.defaultPassingScore,
      status: 'draft',
      questions: [createDefaultQuestion('multiple_choice')],
      shuffleQuestions: false,
      showExplanations: settings.showExplanationsByDefault,
      completionRate: 90,
      createdAt: now,
      updatedAt: now,
    };
  };

  const [draft, setDraft] = useState<Quiz>(buildInitialQuiz);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    () => draft.questions[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewSelectedIds, setPreviewSelectedIds] = useState<string[]>([]);
  const [previewShortText, setPreviewShortText] = useState('');

  useEffect(() => {
    const fresh = buildInitialQuiz();
    setDraft(fresh);
    setSelectedQuestionId(fresh.questions[0]?.id || '');
    setValidationErrors([]);
  }, [quizId]);

  const activeQuestionIndex = draft.questions.findIndex(
    (q) => q.id === selectedQuestionId
  );
  const activeQuestion =
    activeQuestionIndex >= 0 ? draft.questions[activeQuestionIndex] : draft.questions[0];

  useEffect(() => {
    setPreviewSelectedIds([]);
    setPreviewShortText('');
  }, [activeQuestion?.id, activeQuestion?.type]);

  const updateDraftField = <K extends keyof Quiz>(key: K, value: Quiz[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateActiveQuestion = (updater: (q: Question) => Question) => {
    if (!activeQuestion) return;
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === activeQuestion.id ? updater(q) : q)),
    }));
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQ = createDefaultQuestion(type);
    newQ.category = draft.category;
    newQ.difficulty = draft.difficulty;
    setDraft((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setSelectedQuestionId(newQ.id);
    setActiveTab('questions');
  };

  const handleDuplicateQuestion = (q: Question) => {
    const copy: Question = {
      ...q,
      id: createId('q'),
      prompt: q.prompt ? `${q.prompt} (Copy)` : '',
      options: q.options.map((o) => ({ ...o, id: createId('opt') })),
      acceptedAnswers: [...q.acceptedAnswers],
      createdAt: new Date().toISOString(),
    };
    const idx = draft.questions.findIndex((item) => item.id === q.id);
    const next = [...draft.questions];
    next.splice(idx + 1, 0, copy);
    setDraft((prev) => ({ ...prev, questions: next }));
    setSelectedQuestionId(copy.id);
    showToast({ type: 'info', title: 'Question duplicated' });
  };

  const handleDeleteQuestion = (id: string) => {
    setDraft((prev) => {
      const filtered = prev.questions.filter((q) => q.id !== id);
      if (selectedQuestionId === id) {
        setSelectedQuestionId(filtered[0]?.id || '');
      }
      return { ...prev, questions: filtered };
    });
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draft.questions.length) return;
    setDraft((prev) => {
      const next = [...prev.questions];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, questions: next };
    });
  };

  const handleChangeQuestionType = (nextType: QuestionType) => {
    if (!activeQuestion || activeQuestion.type === nextType) return;
    const template = createDefaultQuestion(nextType);
    updateActiveQuestion((q) => ({
      ...q,
      type: nextType,
      options:
        nextType === 'short_answer'
          ? []
          : nextType === 'true_false'
          ? template.options
          : q.options.length >= 2 && q.type !== 'true_false'
          ? nextType === 'multiple_choice'
            ? q.options.map((o, idx) => ({
                ...o,
                isCorrect:
                  q.options.some((x) => x.isCorrect)
                    ? idx === q.options.findIndex((x) => x.isCorrect)
                    : idx === 0,
              }))
            : q.options
          : template.options,
      acceptedAnswers: nextType === 'short_answer' ? [''] : [],
    }));
  };

  const handleSave = (publish: boolean) => {
    const candidate: Quiz = {
      ...draft,
      status: publish ? 'published' : 'draft',
    };
    const errors = validateQuizForBuilder(candidate, publish);
    setValidationErrors(errors);

    if (errors.length > 0) {
      showToast({
        type: 'warning',
        title: 'A few details need attention',
        description: errors[0],
      });
      return;
    }

    saveQuiz(candidate);
    setDraft(candidate);
    showToast({
      type: 'success',
      title: publish ? 'Quiz published!' : 'Draft saved',
      description: publish
        ? `"${candidate.title}" is ready for participants.`
        : `"${candidate.title}" has been saved safely.`,
    });
  };

  const handleTestFullQuiz = () => {
    const errors = validateQuizForBuilder(draft, true);
    setValidationErrors(errors);
    if (errors.length > 0) {
      showToast({
        type: 'warning',
        title: 'Complete your questions to preview',
        description: errors[0],
      });
      return;
    }
    saveQuiz(draft);
    onPreviewTakeQuiz(draft.id);
  };

  const handleSaveQuestionToBank = (q: Question) => {
    if (!q.prompt.trim()) {
      showToast({
        type: 'warning',
        title: 'Add a question prompt first',
        description: 'Write the question text before saving it to the Question Bank.',
      });
      return;
    }
    addBankQuestion({
      ...q,
      id: createId('q_bank'),
      category: draft.category,
      difficulty: draft.difficulty,
      createdAt: new Date().toISOString(),
    });
    showToast({
      type: 'success',
      title: 'Saved to Question Bank',
      description: 'You can now reuse this question in any quiz.',
    });
  };

  const handleImportFromBank = (bankQuestion: Question) => {
    const imported: Question = {
      ...bankQuestion,
      id: createId('q'),
      options: bankQuestion.options.map((o) => ({ ...o, id: createId('opt') })),
      acceptedAnswers: [...bankQuestion.acceptedAnswers],
      createdAt: new Date().toISOString(),
    };
    setDraft((prev) => ({
      ...prev,
      questions: [...prev.questions, imported],
    }));
    setSelectedQuestionId(imported.id);
    setBankModalOpen(false);
    showToast({
      type: 'success',
      title: 'Question added',
      description: 'Imported from your Question Bank.',
    });
  };

  const filteredBank = questionBank.filter((q) => {
    const s = bankSearch.trim().toLowerCase();
    if (!s) return true;
    return (
      q.prompt.toLowerCase().includes(s) ||
      (q.category || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Builder Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Back to quizzes"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  draft.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {draft.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span className="text-xs text-slate-400">
                {draft.questions.length} Qs · {getQuizTotalMarks(draft)} pts
              </span>
            </div>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraftField('title', e.target.value)}
              placeholder="Untitled Quiz — click to name it..."
              className="mt-1 w-full bg-transparent font-display text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'questions'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Questions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Quiz Details
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestFullQuiz}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Play className="h-3.5 w-3.5 text-indigo-600" />
            Preview Quiz
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
          >
            <Globe className="h-3.5 w-3.5" />
            {draft.status === 'published' ? 'Update Live' : 'Publish Quiz'}
          </button>
        </div>
      </div>

      {/* Validation Banner */}
      {validationErrors.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Please review before publishing:</p>
              <ul className="mt-1 list-disc pl-4 text-xs space-y-0.5 text-amber-800">
                {validationErrors.slice(0, 4).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setValidationErrors([])}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft max-w-4xl">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Quiz Details &amp; Grading Rules
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Set expectations for your learners before they begin.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Quiz Title *
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => updateDraftField('title', e.target.value)}
                placeholder="e.g., Frontend Accessibility Mastery Check"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Description
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => updateDraftField('description', e.target.value)}
                placeholder="Tell learners what this quiz covers and how it helps them grow..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Category
              </label>
              <select
                value={draft.category}
                onChange={(e) => updateDraftField('category', e.target.value as QuizCategory)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              >
                {QUIZ_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Difficulty Level
              </label>
              <select
                value={draft.difficulty}
                onChange={(e) => updateDraftField('difficulty', e.target.value as Difficulty)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Time Limit (minutes, 0 for untimed)
              </label>
              <input
                type="number"
                min={0}
                max={180}
                value={draft.timeLimitMinutes}
                onChange={(e) =>
                  updateDraftField('timeLimitMinutes', Math.max(0, Number(e.target.value)))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={draft.passingScore}
                onChange={(e) =>
                  updateDraftField(
                    'passingScore',
                    Math.min(100, Math.max(0, Number(e.target.value)))
                  )
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={draft.shuffleQuestions}
                  onChange={(e) => updateDraftField('shuffleQuestions', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Shuffle question order</p>
                  <p className="text-xs text-slate-500">
                    Present questions in a fresh sequence for each learner.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={draft.showExplanations}
                  onChange={(e) => updateDraftField('showExplanations', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Show answer explanations</p>
                  <p className="text-xs text-slate-500">
                    Help participants learn why an answer is right after submission.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Continue to Questions →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Left: Question Navigator */}
          <aside className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft xl:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Questions ({draft.questions.length})
              </h2>
              <button
                type="button"
                onClick={() => setBankModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <BookOpen className="h-3.5 w-3.5" />
                From Bank
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {draft.questions.map((q, idx) => {
                const isSelected = activeQuestion?.id === q.id;
                return (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== idx) {
                        handleMoveQuestion(dragIndex, idx);
                      }
                      setDragIndex(null);
                    }}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`group cursor-pointer rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? 'border-indigo-300 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500 cursor-grab" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-indigo-700">Q{idx + 1}</span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              {QUESTION_TYPE_META[q.type].shortLabel}
                            </span>
                            <span className="text-[10px] text-slate-400">{q.marks}pt</span>
                          </div>
                          <p className="mt-1 truncate text-xs font-medium text-slate-700">
                            {q.prompt.trim() || 'Write your question prompt...'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuestion(idx, idx - 1);
                          }}
                          disabled={idx === 0}
                          className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveQuestion(idx, idx + 1);
                          }}
                          disabled={idx === draft.questions.length - 1}
                          className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Add Question
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    'multiple_choice',
                    'multiple_select',
                    'true_false',
                    'short_answer',
                  ] as QuestionType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAddQuestion(type)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {QUESTION_TYPE_META[type].shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Center: Question Editor */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft xl:col-span-5">
            {!activeQuestion ? (
              <div className="py-16 text-center">
                <p className="font-display text-base font-bold text-slate-900">
                  No questions yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add a question from the left panel or import one from your Question Bank.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      {activeQuestionIndex + 1}
                    </span>
                    <select
                      aria-label="Question type"
                      value={activeQuestion.type}
                      onChange={(e) =>
                        handleChangeQuestionType(e.target.value as QuestionType)
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-300 focus:outline-none"
                    >
                      {(Object.keys(QUESTION_TYPE_META) as QuestionType[]).map((t) => (
                        <option key={t} value={t}>
                          {QUESTION_TYPE_META[t].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMobilePreviewOpen((p) => !p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 xl:hidden"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveQuestionToBank(activeQuestion)}
                      title="Save question to Question Bank"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      Save to Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(activeQuestion)}
                      title="Duplicate question"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(activeQuestion.id)}
                      title="Delete question"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Prompt & Marks */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Question Prompt
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-500">Marks:</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={activeQuestion.marks}
                        onChange={(e) =>
                          updateActiveQuestion((q) => ({
                            ...q,
                            marks: Math.max(1, Number(e.target.value) || 1),
                          }))
                        }
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-semibold text-slate-900 focus:border-indigo-300 focus:outline-none"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={activeQuestion.prompt}
                    onChange={(e) =>
                      updateActiveQuestion((q) => ({ ...q, prompt: e.target.value }))
                    }
                    placeholder="Ask something clear and specific..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    {QUESTION_TYPE_META[activeQuestion.type].hint}
                  </p>
                </div>

                {/* Options or Short Answer */}
                {activeQuestion.type === 'short_answer' ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Accepted Answers (case-insensitive)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveQuestion((q) => ({
                            ...q,
                            acceptedAnswers: [...q.acceptedAnswers, ''],
                          }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add variant
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {activeQuestion.acceptedAnswers.map((ans, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ans}
                            onChange={(e) =>
                              updateActiveQuestion((q) => ({
                                ...q,
                                acceptedAnswers: q.acceptedAnswers.map((a, i) =>
                                  i === idx ? e.target.value : a
                                ),
                              }))
                            }
                            placeholder={`Accepted answer ${idx + 1}`}
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
                          />
                          {activeQuestion.acceptedAnswers.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                updateActiveQuestion((q) => ({
                                  ...q,
                                  acceptedAnswers: q.acceptedAnswers.filter(
                                    (_, i) => i !== idx
                                  ),
                                }))
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Answer Options{' '}
                        <span className="normal-case font-normal text-slate-400">
                          (click check to mark correct)
                        </span>
                      </label>
                      {activeQuestion.type !== 'true_false' &&
                        activeQuestion.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveQuestion((q) => ({
                                ...q,
                                options: [
                                  ...q.options,
                                  { id: createId('opt'), text: '', isCorrect: false },
                                ],
                              }))
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add option
                          </button>
                        )}
                    </div>

                    <div className="mt-2 space-y-2">
                      {activeQuestion.options.map((option, idx) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                            option.isCorrect
                              ? 'border-emerald-300 bg-emerald-50/40'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveQuestion((q) => ({
                                ...q,
                                options: q.options.map((o) => {
                                  if (q.type === 'multiple_select') {
                                    return o.id === option.id
                                      ? { ...o, isCorrect: !o.isCorrect }
                                      : o;
                                  }
                                  return { ...o, isCorrect: o.id === option.id };
                                }),
                              }))
                            }
                            aria-label={`Mark option ${idx + 1} as correct`}
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                              option.isCorrect
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>

                          <input
                            type="text"
                            value={option.text}
                            readOnly={activeQuestion.type === 'true_false'}
                            onChange={(e) =>
                              updateActiveQuestion((q) => ({
                                ...q,
                                options: q.options.map((o) =>
                                  o.id === option.id ? { ...o, text: e.target.value } : o
                                ),
                              }))
                            }
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />

                          {activeQuestion.type !== 'true_false' &&
                            activeQuestion.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateActiveQuestion((q) => ({
                                    ...q,
                                    options: q.options.filter((o) => o.id !== option.id),
                                  }))
                                }
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    Explanation (shown in answer review)
                  </label>
                  <textarea
                    rows={2}
                    value={activeQuestion.explanation}
                    onChange={(e) =>
                      updateActiveQuestion((q) => ({ ...q, explanation: e.target.value }))
                    }
                    placeholder="Give learners a helpful nudge explaining the reasoning..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Right: Live Interactive Preview */}
          <aside
            className={`${
              mobilePreviewOpen ? 'block' : 'hidden'
            } xl:block rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-5 shadow-soft xl:col-span-4`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-600" />
                <span className="font-display text-sm font-bold text-slate-900">
                  Live Learner Preview
                </span>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                Interactive
              </span>
            </div>

            {activeQuestion ? (
              <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-semibold ${
                      QUESTION_TYPE_META[activeQuestion.type].badgeClass
                    }`}
                  >
                    {QUESTION_TYPE_META[activeQuestion.type].label}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {activeQuestion.marks}{' '}
                    {activeQuestion.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-base font-bold text-slate-900 leading-snug">
                  {activeQuestion.prompt.trim() ||
                    'Your question prompt will appear right here as you type...'}
                </h3>

                <div className="mt-4 space-y-2.5">
                  {activeQuestion.type === 'short_answer' ? (
                    <input
                      type="text"
                      value={previewShortText}
                      onChange={(e) => setPreviewShortText(e.target.value)}
                      placeholder="Learner types their answer here..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none"
                    />
                  ) : (
                    activeQuestion.options.map((opt, idx) => {
                      const chosen = previewSelectedIds.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (activeQuestion.type === 'multiple_select') {
                              setPreviewSelectedIds((prev) =>
                                prev.includes(opt.id)
                                  ? prev.filter((id) => id !== opt.id)
                                  : [...prev, opt.id]
                              );
                            } else {
                              setPreviewSelectedIds([opt.id]);
                            }
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                            chosen
                              ? 'border-indigo-500 bg-indigo-50/70 font-semibold text-indigo-950'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                chosen
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt.text.trim() || `Option ${idx + 1}`}</span>
                          </div>
                          {opt.isCorrect && (
                            <CheckCircle2
                              className="h-4 w-4 text-emerald-500 shrink-0"
                              aria-label="Correct answer indicator"
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {activeQuestion.explanation.trim() && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-700">Explanation preview: </span>
                    {activeQuestion.explanation}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-8 text-center text-xs text-slate-400">
                Select or add a question to preview it live.
              </p>
            )}
          </aside>
        </div>
      )}

      {/* Import from Question Bank Modal */}
      {bankModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card max-w-2xl w-full p-5 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Import from Question Bank
                </h3>
                <p className="text-xs text-slate-500">
                  Pick any saved question to add a copy to this quiz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBankModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="search"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Search saved questions..."
              className="mt-3 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-300 focus:outline-none"
            />

            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredBank.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No bank questions match your search.
                </p>
              ) : (
                filteredBank.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 hover:border-indigo-200"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            QUESTION_TYPE_META[q.type].badgeClass
                          }`}
                        >
                          {QUESTION_TYPE_META[q.type].shortLabel}
                        </span>
                        {q.category && (
                          <span className="text-[11px] font-medium text-slate-500">
                            {q.category}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">· {q.marks} pts</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-800">{q.prompt}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImportFromBank(q)}
                      className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
