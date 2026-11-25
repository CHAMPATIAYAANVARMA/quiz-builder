import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { formatDuration } from '../../utils/quizHelpers';

interface QuizResultsViewProps {
  attempt: QuizAttempt;
  quiz?: Quiz;
  onRetake: (quizId: string) => void;
  onBackToQuizzes: () => void;
  onViewAnalytics: () => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  attempt,
  quiz,
  onRetake,
  onBackToQuizzes,
  onViewAnalytics,
}) => {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect'>('all');

  const summaryMessage =
    attempt.percentage >= 90
      ? 'Outstanding mastery! You nailed nearly every concept.'
      : attempt.passed
      ? 'Great job! You cleared the passing bar with solid understanding.'
      : 'Good effort! Review the explanations below to lock in the tricky concepts.';

  const questionMap = new Map(quiz?.questions.map((q) => [q.id, q]) || []);

  const visibleResults = attempt.questionResults.filter((r) =>
    reviewFilter === 'incorrect' ? !r.isCorrect : true
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToQuizzes}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onViewAnalytics}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            Analytics
          </button>
          {quiz && (
            <button
              type="button"
              onClick={() => onRetake(quiz.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
          )}
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  attempt.passed
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-800'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {attempt.passed ? 'Passed' : 'Needs Practice'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Completed by {attempt.participantName}
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {attempt.quizTitle}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{summaryMessage}</p>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/70 px-6 py-5">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Final Score
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold text-slate-900">
                {attempt.percentage}%
              </p>
              <p className="text-xs font-medium text-slate-500">
                {attempt.score} / {attempt.totalMarks} marks
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown Stat Pills */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Correct
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">
              {attempt.correctCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
              <XCircle className="h-4 w-4" />
              Incorrect
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">
              {attempt.incorrectCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <Clock className="h-4 w-4" />
              Time Taken
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">
              {formatDuration(attempt.timeSpentSeconds)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-600">
              <Award className="h-4 w-4" />
              Passing Bar
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">
              {quiz ? `${quiz.passingScore}%` : '70%'}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Review */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Answer Review</h2>
            <p className="text-xs text-slate-500">
              Inspect your responses alongside the expected answers and explanations.
            </p>
          </div>

          {attempt.questionResults.length > 0 && (
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  reviewFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                All ({attempt.questionResults.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('incorrect')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  reviewFilter === 'incorrect'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Needs Review ({attempt.incorrectCount})
              </button>
            </div>
          )}
        </div>

        {attempt.questionResults.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Detailed question-level breakdown was not recorded for this historical sample attempt.
          </div>
        ) : visibleResults.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 font-display text-sm font-bold text-slate-900">
              Zero incorrect answers!
            </p>
            <p className="text-xs text-slate-500">Every single response hit the mark.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {visibleResults.map((res, idx) => {
              const q = questionMap.get(res.questionId);
              return (
                <div
                  key={res.questionId}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    res.isCorrect
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : 'border-rose-200/80 bg-rose-50/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          res.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {res.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Question {idx + 1}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {res.marksEarned} / {res.maxMarks} pts
                    </span>
                  </div>

                  <p className="mt-3 font-display text-sm font-bold text-slate-900 sm:text-base">
                    {q?.prompt || 'Question prompt'}
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Your Answer
                      </p>
                      <p
                        className={`mt-1 text-sm font-medium ${
                          res.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {res.userAnswerLabel}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Expected Answer
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {res.correctAnswerLabel}
                      </p>
                    </div>
                  </div>

                  {(quiz?.showExplanations ?? true) && q?.explanation && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-slate-700">
                      <Lightbulb className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
