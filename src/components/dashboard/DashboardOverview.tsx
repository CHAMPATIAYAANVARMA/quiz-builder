import React from 'react';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Copy,
  FilePlus2,
  Layers,
  Pencil,
  Play,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useQuizora } from '../../context/QuizoraContext';
import { AppView } from '../../types/quiz';
import {
  DIFFICULTY_BADGE,
  formatDuration,
  formatRelativeDate,
  getQuizTotalMarks,
} from '../../utils/quizHelpers';

interface DashboardOverviewProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onTakeQuiz: (quizId: string) => void;
  onNavigate: (view: AppView) => void;
  onInspectAttempt: (attemptId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onCreateQuiz,
  onEditQuiz,
  onTakeQuiz,
  onNavigate,
  onInspectAttempt,
}) => {
  const { quizzes, attempts, settings, duplicateQuiz } = useQuizora();

  const publishedCount = quizzes.filter((q) => q.status === 'published').length;
  const draftCount = quizzes.length - publishedCount;
  const totalParticipants = attempts.length;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;
  const avgCompletionRate =
    quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + q.completionRate, 0) / quizzes.length)
      : 0;

  const firstName = settings.fullName.split(' ')[0] || 'there';

  const stats = [
    {
      label: 'Total Quizzes',
      value: String(quizzes.length),
      subtext: `${publishedCount} published · ${draftCount} draft`,
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Participants',
      value: String(totalParticipants),
      subtext: 'Recorded learner attempts',
      icon: Users,
      iconBg: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Average Score',
      value: `${avgScore}%`,
      subtext: `${attempts.filter((a) => a.passed).length} passed overall`,
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Completion Rate',
      value: `${avgCompletionRate}%`,
      subtext: 'Across active assessments',
      icon: TrendingUp,
      iconBg: 'bg-sky-50 text-sky-600',
    },
  ];

  const recentQuizzes = [...quizzes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const recentAttempts = attempts.slice(0, 5);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here’s how your learners are progressing across your active quizzes today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('analytics')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            View Analytics
          </button>
          <button
            type="button"
            onClick={onCreateQuiz}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-glow"
          >
            <FilePlus2 className="h-4 w-4" />
            Create Quiz
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft transition-all hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Two-Column Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Quizzes */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Your Quizzes</h2>
              <p className="text-xs text-slate-500">
                Jump back into editing or preview a live quiz experience.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('quizzes')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See all ({quizzes.length})
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentQuizzes.map((quiz) => {
              const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
              const quizAvg =
                quizAttempts.length > 0
                  ? Math.round(
                      quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length
                    )
                  : null;

              return (
                <div
                  key={quiz.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition-colors hover:border-indigo-200 hover:bg-white sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          quiz.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {quiz.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          DIFFICULTY_BADGE[quiz.difficulty]
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Updated {formatRelativeDate(quiz.updatedAt)}
                      </span>
                    </div>
                    <h3 className="mt-1.5 truncate font-display text-sm font-bold text-slate-900">
                      {quiz.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {quiz.questions.length} Qs · {getQuizTotalMarks(quiz)} pts ·{' '}
                      {quizAttempts.length} attempts
                      {quizAvg !== null ? ` · ${quizAvg}% avg` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onTakeQuiz(quiz.id)}
                      title="Take or preview quiz"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Take
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditQuiz(quiz.id)}
                      title="Edit quiz"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateQuiz(quiz.id)}
                      title="Duplicate quiz"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Learner Activity */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Recent Submissions</h2>
              <p className="text-xs text-slate-500">Latest completions from your learners.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All results
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-700">No submissions yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Take one of your quizzes to see live completion metrics here.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {recentAttempts.map((attempt) => (
                <button
                  key={attempt.id}
                  type="button"
                  onClick={() => onInspectAttempt(attempt.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-left transition-all hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        attempt.passed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {attempt.participantName
                        .split(' ')
                        .map((s) => s[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {attempt.participantName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{attempt.quizTitle}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-display text-sm font-bold text-slate-900">
                        {attempt.percentage}%
                      </span>
                      {attempt.passed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {formatDuration(attempt.timeSpentSeconds)} ·{' '}
                      {formatRelativeDate(attempt.completedAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
