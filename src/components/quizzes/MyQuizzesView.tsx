import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Clock,
  Copy,
  FilePlus2,
  Filter,
  Globe,
  LayoutGrid,
  List,
  Pencil,
  Play,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useQuizora } from '../../context/QuizoraContext';
import { Difficulty, Quiz, QuizCategory, QuizStatus } from '../../types/quiz';
import {
  DIFFICULTY_BADGE,
  QUIZ_CATEGORIES,
  formatRelativeDate,
  getQuizTotalMarks,
} from '../../utils/quizHelpers';
import { ConfirmModal } from '../ui/ConfirmModal';

interface MyQuizzesViewProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onTakeQuiz: (quizId: string) => void;
}

export const MyQuizzesView: React.FC<MyQuizzesViewProps> = ({
  onCreateQuiz,
  onEditQuiz,
  onTakeQuiz,
}) => {
  const { quizzes, attempts, duplicateQuiz, deleteQuiz, toggleQuizStatus } = useQuizora();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | QuizCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | QuizStatus>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'attempts'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pendingDelete, setPendingDelete] = useState<Quiz | null>(null);

  const attemptCountByQuiz = useMemo(() => {
    const map = new Map<string, { count: number; avg: number }>();
    quizzes.forEach((quiz) => {
      const relevant = attempts.filter((a) => a.quizId === quiz.id);
      const avg =
        relevant.length > 0
          ? Math.round(relevant.reduce((s, a) => s + a.percentage, 0) / relevant.length)
          : 0;
      map.set(quiz.id, { count: relevant.length, avg });
    });
    return map;
  }, [quizzes, attempts]);

  const filteredQuizzes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quizzes
      .filter((quiz) => {
        if (
          q &&
          !quiz.title.toLowerCase().includes(q) &&
          !quiz.description.toLowerCase().includes(q) &&
          !quiz.category.toLowerCase().includes(q)
        ) {
          return false;
        }
        if (categoryFilter !== 'all' && quiz.category !== categoryFilter) return false;
        if (statusFilter !== 'all' && quiz.status !== statusFilter) return false;
        if (difficultyFilter !== 'all' && quiz.difficulty !== difficultyFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'attempts') {
          return (
            (attemptCountByQuiz.get(b.id)?.count || 0) -
            (attemptCountByQuiz.get(a.id)?.count || 0)
          );
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [
    quizzes,
    search,
    categoryFilter,
    statusFilter,
    difficultyFilter,
    sortBy,
    attemptCountByQuiz,
  ]);

  const hasActiveFilters =
    search.trim() !== '' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    difficultyFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setDifficultyFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Quizzes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Organize drafts, publish live assessments, or duplicate templates for your next cohort.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateQuiz}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-glow"
        >
          <FilePlus2 className="h-4 w-4" />
          New Quiz
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter quizzes by title, description, or topic..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
              <Filter className="h-3.5 w-3.5" />
              Filters:
            </div>

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | QuizCategory)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {QUIZ_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | QuizStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              aria-label="Filter by difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'all' | Difficulty)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-300 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              aria-label="Sort quizzes"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'title' | 'attempts')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-300 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="attempts">Most Attempted</option>
              <option value="title">Title (A–Z)</option>
            </select>

            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
            {hasActiveFilters ? 'No quizzes match those filters' : 'Your quiz library is ready'}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
            {hasActiveFilters
              ? 'Try clearing a filter or broadening your search phrase.'
              : 'Create your first assessment with multiple-choice, multi-select, true/false, or short-answer questions.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={onCreateQuiz}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <FilePlus2 className="h-4 w-4" />
              Create Quiz
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuizzes.map((quiz) => {
            const meta = attemptCountByQuiz.get(quiz.id) || { count: 0, avg: 0 };
            return (
              <div
                key={quiz.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {quiz.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          DIFFICULTY_BADGE[quiz.difficulty]
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleQuizStatus(quiz.id)}
                        title="Click to toggle Published / Draft status"
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                          quiz.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {quiz.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {quiz.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 line-clamp-2">
                    {quiz.description || 'No description added yet.'}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {quiz.questions.length} Qs ({getQuizTotalMarks(quiz)} pts)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes}m` : 'Untimed'}
                    </span>
                    <span>
                      {meta.count} {meta.count === 1 ? 'attempt' : 'attempts'}
                      {meta.count > 0 ? ` (${meta.avg}%)` : ''}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onTakeQuiz(quiz.id)}
                      disabled={quiz.questions.length === 0}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Take Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditQuiz(quiz.id)}
                      title="Edit quiz"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateQuiz(quiz.id)}
                      title="Duplicate quiz"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(quiz)}
                      title="Delete quiz"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Quiz</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Questions</th>
                  <th className="px-4 py-3.5">Attempts</th>
                  <th className="px-4 py-3.5">Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuizzes.map((quiz) => {
                  const meta = attemptCountByQuiz.get(quiz.id) || { count: 0, avg: 0 };
                  return (
                    <tr key={quiz.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-display font-bold text-slate-900">{quiz.title}</p>
                        <p className="text-xs text-slate-500">
                          {quiz.difficulty} · Pass {quiz.passingScore}%
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {quiz.category}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleQuizStatus(quiz.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            quiz.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Globe className="h-3 w-3" />
                          {quiz.status === 'published' ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {quiz.questions.length} Qs ({getQuizTotalMarks(quiz)} pts)
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {meta.count} {meta.count > 0 ? `(${meta.avg}% avg)` : ''}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatRelativeDate(quiz.updatedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onTakeQuiz(quiz.id)}
                            disabled={quiz.questions.length === 0}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                          >
                            Take
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditQuiz(quiz.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateQuiz(quiz.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(quiz)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this quiz?"
        description={`"${pendingDelete?.title}" will be permanently removed from your workspace. Existing analytics history will remain intact.`}
        confirmLabel="Delete Quiz"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteQuiz(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
};
