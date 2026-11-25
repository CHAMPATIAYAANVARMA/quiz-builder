import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useQuizora } from '../../context/QuizoraContext';
import { Difficulty, Question, QuestionType, QuizCategory } from '../../types/quiz';
import {
  DIFFICULTY_BADGE,
  QUESTION_TYPE_META,
  QUIZ_CATEGORIES,
  createDefaultQuestion,
  createId,
} from '../../utils/quizHelpers';

export const QuestionBankView: React.FC = () => {
  const {
    questionBank,
    quizzes,
    addBankQuestion,
    deleteBankQuestion,
    addQuestionsToQuiz,
    showToast,
  } = useQuizora();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | QuestionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | QuizCategory>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetQuizId, setTargetQuizId] = useState<string>(() => quizzes[0]?.id || '');
  const [createOpen, setCreateOpen] = useState(false);

  const [newQuestion, setNewQuestion] = useState<Question>(() => ({
    ...createDefaultQuestion('multiple_choice'),
    category: 'Web Engineering',
    difficulty: 'Intermediate',
  }));

  const filteredQuestions = useMemo(() => {
    const s = search.trim().toLowerCase();
    return questionBank.filter((q) => {
      if (
        s &&
        !q.prompt.toLowerCase().includes(s) &&
        !(q.category || '').toLowerCase().includes(s)
      ) {
        return false;
      }
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      return true;
    });
  }, [questionBank, search, typeFilter, categoryFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAddToQuiz = () => {
    if (!targetQuizId || selectedIds.length === 0) return;
    const chosen = questionBank.filter((q) => selectedIds.includes(q.id));
    addQuestionsToQuiz(targetQuizId, chosen);
    const quizTitle = quizzes.find((q) => q.id === targetQuizId)?.title || 'quiz';
    showToast({
      type: 'success',
      title: `Added ${chosen.length} ${chosen.length === 1 ? 'question' : 'questions'}`,
      description: `Inserted into "${quizTitle}".`,
    });
    setSelectedIds([]);
  };

  const handleCreateBankQuestion = () => {
    if (!newQuestion.prompt.trim()) {
      showToast({
        type: 'warning',
        title: 'Prompt required',
        description: 'Write a clear question prompt before saving.',
      });
      return;
    }
    addBankQuestion({
      ...newQuestion,
      id: createId('q_bank'),
      createdAt: new Date().toISOString(),
    });
    setCreateOpen(false);
    setNewQuestion({
      ...createDefaultQuestion('multiple_choice'),
      category: 'Web Engineering',
      difficulty: 'Intermediate',
    });
    showToast({
      type: 'success',
      title: 'Added to Question Bank',
      description: 'Your question is ready to drop into any quiz.',
    });
  };

  const handleDuplicateBankQuestion = (q: Question) => {
    addBankQuestion({
      ...q,
      id: createId('q_bank'),
      prompt: `${q.prompt} (Copy)`,
      options: q.options.map((o) => ({ ...o, id: createId('opt') })),
      createdAt: new Date().toISOString(),
    });
    showToast({ type: 'info', title: 'Bank question duplicated' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="mt-1 text-sm text-slate-600">
            Curate reusable questions across topics and drop them into quizzes in one click.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      {/* Filters & Bulk Action Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by prompt or category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-4 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by question type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | QuestionType)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            >
              <option value="all">All Types</option>
              {(Object.keys(QUESTION_TYPE_META) as QuestionType[]).map((t) => (
                <option key={t} value={t}>
                  {QUESTION_TYPE_META[t].label}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | QuizCategory)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {QUIZ_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && quizzes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5">
            <span className="text-xs font-semibold text-indigo-900">
              {selectedIds.length} {selectedIds.length === 1 ? 'question' : 'questions'} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={targetQuizId}
                onChange={(e) => setTargetQuizId(e.target.value)}
                className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkAddToQuiz}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Send className="h-3.5 w-3.5" />
                Add to Quiz
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bank List */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-indigo-500" />
          <p className="mt-3 font-display text-base font-bold text-slate-900">
            No matching questions found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Adjust your filters or add a fresh question to grow your shared library.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <div
                key={q.id}
                className={`rounded-2xl border bg-white p-4 shadow-soft transition-all ${
                  isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelect(q.id)}
                      aria-label="Select question"
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-transparent hover:border-indigo-400'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            QUESTION_TYPE_META[q.type].badgeClass
                          }`}
                        >
                          {QUESTION_TYPE_META[q.type].label}
                        </span>
                        {q.category && (
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {q.category}
                          </span>
                        )}
                        {q.difficulty && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                              DIFFICULTY_BADGE[q.difficulty]
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{q.marks} pts</span>
                      </div>

                      <p className="mt-2 font-display text-sm font-bold text-slate-900 sm:text-base">
                        {q.prompt}
                      </p>

                      {q.type === 'short_answer' ? (
                        <p className="mt-2 text-xs text-emerald-700 font-medium">
                          Accepted: {q.acceptedAnswers.join(' / ')}
                        </p>
                      ) : (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {q.options.map((opt) => (
                            <span
                              key={opt.id}
                              className={`rounded-lg border px-2.5 py-1 text-xs ${
                                opt.isCorrect
                                  ? 'border-emerald-200 bg-emerald-50 font-semibold text-emerald-800'
                                  : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                            >
                              {opt.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDuplicateBankQuestion(q)}
                      title="Duplicate"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteBankQuestion(q.id);
                        showToast({ type: 'info', title: 'Removed from bank' });
                      }}
                      title="Delete"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Question Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Add to Question Bank
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => {
                      const nextType = e.target.value as QuestionType;
                      const fresh = createDefaultQuestion(nextType);
                      setNewQuestion((prev) => ({
                        ...fresh,
                        prompt: prev.prompt,
                        category: prev.category,
                        difficulty: prev.difficulty,
                        explanation: prev.explanation,
                      }));
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  >
                    {(Object.keys(QUESTION_TYPE_META) as QuestionType[]).map((t) => (
                      <option key={t} value={t}>
                        {QUESTION_TYPE_META[t].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        category: e.target.value as QuizCategory,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  >
                    {QUIZ_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        difficulty: e.target.value as Difficulty,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Question Prompt *</label>
                <textarea
                  rows={2}
                  value={newQuestion.prompt}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, prompt: e.target.value }))
                  }
                  placeholder="Write a clear question..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {newQuestion.type === 'short_answer' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Accepted Answer
                  </label>
                  <input
                    type="text"
                    value={newQuestion.acceptedAnswers[0] || ''}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        acceptedAnswers: [e.target.value],
                      }))
                    }
                    placeholder="Expected short answer..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Options (check correct answer)
                  </label>
                  {newQuestion.options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            options: prev.options.map((o) =>
                              prev.type === 'multiple_select'
                                ? o.id === opt.id
                                  ? { ...o, isCorrect: !o.isCorrect }
                                  : o
                                : { ...o, isCorrect: o.id === opt.id }
                            ),
                          }))
                        }
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                          opt.isCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="text"
                        readOnly={newQuestion.type === 'true_false'}
                        value={opt.text}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            options: prev.options.map((o) =>
                              o.id === opt.id ? { ...o, text: e.target.value } : o
                            ),
                          }))
                        }
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600">Explanation</label>
                <textarea
                  rows={2}
                  value={newQuestion.explanation}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, explanation: e.target.value }))
                  }
                  placeholder="Optional explanation for learners..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBankQuestion}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
