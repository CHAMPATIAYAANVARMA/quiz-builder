import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Play,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Quiz, QuizAttempt, UserAnswer } from '../../types/quiz';
import { useQuizora } from '../../context/QuizoraContext';
import {
  DIFFICULTY_BADGE,
  QUESTION_TYPE_META,
  evaluateQuizSubmission,
  formatDuration,
  getQuizTotalMarks,
} from '../../utils/quizHelpers';
import { BrandLogo } from '../ui/BrandLogo';
import { ConfirmModal } from '../ui/ConfirmModal';

interface QuizPlayerViewProps {
  quiz: Quiz;
  onExit: () => void;
  onComplete: (attempt: QuizAttempt) => void;
}

export const QuizPlayerView: React.FC<QuizPlayerViewProps> = ({
  quiz,
  onExit,
  onComplete,
}) => {
  const { settings, recordAttempt, showToast } = useQuizora();

  const [started, setStarted] = useState(false);
  const [participantName, setParticipantName] = useState(settings.fullName || 'Guest Learner');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const orderedQuestions = useMemo(() => {
    if (!quiz.shuffleQuestions) return quiz.questions;
    const copy = [...quiz.questions];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [quiz]);

  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  const totalAllowedSeconds = quiz.timeLimitMinutes > 0 ? quiz.timeLimitMinutes * 60 : 0;
  const [remainingSeconds, setRemainingSeconds] = useState(totalAllowedSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (totalAllowedSeconds > 0) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, totalAllowedSeconds]);

  useEffect(() => {
    if (started && totalAllowedSeconds > 0 && remainingSeconds === 0) {
      finalizeSubmission(true);
    }
  }, [remainingSeconds, started, totalAllowedSeconds]);

  const finalizeSubmission = (timedOut = false) => {
    const answerList: UserAnswer[] = orderedQuestions.map(
      (q) =>
        answers[q.id] || {
          questionId: q.id,
          selectedOptionIds: [],
          shortAnswerText: '',
        }
    );
    const attempt = evaluateQuizSubmission(
      { ...quiz, questions: orderedQuestions },
      answerList,
      participantName,
      elapsedSeconds
    );
    recordAttempt(attempt);
    showToast({
      type: timedOut ? 'warning' : 'success',
      title: timedOut ? 'Time is up — quiz submitted!' : 'Quiz submitted!',
      description: `You scored ${attempt.percentage}% (${attempt.score}/${attempt.totalMarks} pts).`,
    });
    onComplete(attempt);
  };

  const currentQuestion = orderedQuestions[currentIdx];

  const isQuestionAnswered = (qId: string): boolean => {
    const a = answers[qId];
    if (!a) return false;
    return a.selectedOptionIds.length > 0 || a.shortAnswerText.trim().length > 0;
  };

  const answeredCount = orderedQuestions.filter((q) => isQuestionAnswered(q.id)).length;
  const progressPercent =
    orderedQuestions.length > 0
      ? Math.round((answeredCount / orderedQuestions.length) * 100)
      : 0;

  const toggleOption = (questionId: string, optionId: string, isMulti: boolean) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || {
        questionId,
        selectedOptionIds: [],
        shortAnswerText: '',
      };
      const nextIds = isMulti
        ? existing.selectedOptionIds.includes(optionId)
          ? existing.selectedOptionIds.filter((id) => id !== optionId)
          : [...existing.selectedOptionIds, optionId]
        : [optionId];
      return {
        ...prev,
        [questionId]: { ...existing, selectedOptionIds: nextIds },
      };
    });
  };

  const updateShortAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOptionIds: [],
        shortAnswerText: text,
      },
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <BrandLogo size="sm" />
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Exit
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card sm:p-8 animate-slide-up">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {quiz.category}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  DIFFICULTY_BADGE[quiz.difficulty]
                }`}
              >
                {quiz.difficulty}
              </span>
            </div>

            <h1 className="mt-4 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {quiz.title}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {quiz.description ||
                'Take your time, read each prompt carefully, and review flagged questions before submitting.'}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Questions
                </p>
                <p className="mt-1 font-display text-lg font-bold text-slate-900">
                  {orderedQuestions.length}
                </p>
                <p className="text-[11px] text-slate-500">{getQuizTotalMarks(quiz)} pts</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Time Limit
                </p>
                <p className="mt-1 font-display text-lg font-bold text-slate-900">
                  {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes}m` : 'Untimed'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {quiz.timeLimitMinutes > 0 ? 'Auto-submits' : 'No rush'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Pass Mark
                </p>
                <p className="mt-1 font-display text-lg font-bold text-slate-900">
                  {quiz.passingScore}%
                </p>
                <p className="text-[11px] text-slate-500">To pass</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Your Name (for results &amp; analytics)
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your full name..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Instant answer review unlocked after submit
              </span>
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-indigo-700"
              >
                <Play className="h-4 w-4" />
                Start Quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isLowTime = totalAllowedSeconds > 0 && remainingSeconds <= 60;
  const activeAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Quiz Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Exit quiz"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-sm font-bold text-slate-900 sm:text-base">
                {quiz.title}
              </h1>
              <p className="text-xs text-slate-500">
                Question {currentIdx + 1} of {orderedQuestions.length} · {answeredCount} answered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold ${
                isLowTime
                  ? 'border-rose-200 bg-rose-50 text-rose-700 animate-pulse'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {totalAllowedSeconds > 0
                ? formatDuration(remainingSeconds)
                : formatDuration(elapsedSeconds)}
            </div>

            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Send className="h-3.5 w-3.5" />
              Submit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Quiz Content Grid */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Question Card */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft sm:p-8 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      QUESTION_TYPE_META[currentQuestion.type].badgeClass
                    }`}
                  >
                    {QUESTION_TYPE_META[currentQuestion.type].label}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {currentQuestion.marks}{' '}
                    {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    flaggedIds.includes(currentQuestion.id)
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Flag className="h-3.5 w-3.5" />
                  {flaggedIds.includes(currentQuestion.id) ? 'Flagged' : 'Flag for review'}
                </button>
              </div>

              <h2 className="mt-5 font-display text-lg font-bold text-slate-900 sm:text-xl leading-snug">
                {currentQuestion.prompt}
              </h2>

              {currentQuestion.type === 'multiple_select' && (
                <p className="mt-1.5 text-xs font-medium text-indigo-600">
                  Select all answers that apply.
                </p>
              )}

              <div className="mt-6 space-y-3">
                {currentQuestion.type === 'short_answer' ? (
                  <div>
                    <input
                      type="text"
                      value={activeAnswer?.shortAnswerText || ''}
                      onChange={(e) =>
                        updateShortAnswer(currentQuestion.id, e.target.value)
                      }
                      placeholder="Type your concise answer here..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    />
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Matching is case-insensitive.
                    </p>
                  </div>
                ) : (
                  currentQuestion.options.map((opt, idx) => {
                    const selected =
                      activeAnswer?.selectedOptionIds.includes(opt.id) || false;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          toggleOption(
                            currentQuestion.id,
                            opt.id,
                            currentQuestion.type === 'multiple_select'
                          )
                        }
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-100'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                              selected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span
                            className={`text-sm sm:text-base ${
                              selected ? 'font-semibold text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {opt.text}
                          </span>
                        </div>

                        {selected && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Navigation Footer */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                {currentIdx === orderedQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    Finish &amp; Submit
                    <Send className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIdx((i) => Math.min(orderedQuestions.length - 1, i + 1))
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Question Navigator
                </h3>
                <span className="text-xs font-semibold text-indigo-600">
                  {progressPercent}% done
                </span>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {orderedQuestions.map((q, idx) => {
                  const answered = isQuestionAnswered(q.id);
                  const flagged = flaggedIds.includes(q.id);
                  const isCurrent = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative flex h-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                          : answered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                      {flagged && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-indigo-600" /> Current question
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-emerald-300 bg-emerald-50" />{' '}
                  Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" /> Flagged for review
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <ConfirmModal
        open={submitModalOpen}
        title="Ready to submit your quiz?"
        description={
          answeredCount < orderedQuestions.length
            ? `You have answered ${answeredCount} of ${orderedQuestions.length} questions (${
                orderedQuestions.length - answeredCount
              } unanswered). You can still review them or submit now.`
            : `All ${orderedQuestions.length} questions are answered. Submit now to see your score and detailed explanations.`
        }
        confirmLabel="Submit Quiz"
        cancelLabel="Review Answers"
        onCancel={() => setSubmitModalOpen(false)}
        onConfirm={() => {
          setSubmitModalOpen(false);
          finalizeSubmission(false);
        }}
      />
    </div>
  );
};
