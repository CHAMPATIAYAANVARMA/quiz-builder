import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Users,
  Wand2,
} from 'lucide-react';
import { Quiz } from '../../types/quiz';
import { BrandLogo } from '../ui/BrandLogo';
import { DIFFICULTY_BADGE, getQuizTotalMarks } from '../../utils/quizHelpers';

interface LandingPageProps {
  quizzes: Quiz[];
  onGetStarted: () => void;
  onExploreQuizzes: () => void;
  onTakeQuiz: (quizId: string) => void;
  onCreateQuiz: () => void;
}

const FEATURES = [
  {
    icon: Wand2,
    title: 'Split-pane live builder',
    description:
      'Write questions on the left and watch the exact learner experience update live on the right—no guesswork.',
    accent: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Layers,
    title: 'Four rich question formats',
    description:
      'Mix multiple choice, multi-select, true/false, and smart short-answer checks with custom marks and explanations.',
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    icon: BookOpen,
    title: 'Reusable question bank',
    description:
      'Save your sharpest questions once and drop them into onboarding tracks, cohorts, or weekly check-ins in seconds.',
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Timer,
    title: 'Calm, timed assessments',
    description:
      'Give learners a distraction-free player with progress tracking, question flags, countdown timers, and review mode.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Clear outcome analytics',
    description:
      'Spot score distributions, completion rates, and tricky concepts at a glance so you know where to coach next.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    icon: ShieldCheck,
    title: 'Instant explanations & review',
    description:
      'Turn every submission into a teaching moment with tailored explanations and per-question answer breakdowns.',
    accent: 'bg-rose-50 text-rose-600',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We moved our entire frontend bootcamp checkpoints onto QUIZORA. Learners actually enjoy the review screen because the explanations feel thoughtful, not robotic.',
    author: 'Hannah Lindqvist',
    role: 'Curriculum Director, CraftCode Cohort',
    initials: 'HL',
  },
  {
    quote:
      'The split-pane question editor and reusable bank saved our L&D team at least six hours a week. Building a crisp onboarding quiz now takes ten minutes.',
    author: 'Devon Brooks',
    role: 'People Enablement Lead, RelayFlow',
    initials: 'DB',
  },
  {
    quote:
      'Finally a quiz tool that looks like modern software. Our product managers love checking score distributions right after a workshop.',
    author: 'Ananya Sharma',
    role: 'VP of Product Education, FinStack',
    initials: 'AS',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  quizzes,
  onGetStarted,
  onExploreQuizzes,
  onTakeQuiz,
  onCreateQuiz,
}) => {
  const featuredQuizzes = quizzes.filter((q) => q.status === 'published').slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <BrandLogo size="md" />

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">
              Features
            </a>
            <a href="#sample-quizzes" className="transition-colors hover:text-slate-900">
              Explore Quizzes
            </a>
            <a href="#testimonials" className="transition-colors hover:text-slate-900">
              Stories
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onGetStarted}
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:inline-flex"
            >
              Open Workspace
            </button>
            <button
              type="button"
              onClick={onCreateQuiz}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-glow"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-24">
        <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 flex justify-center">
          <div className="h-[420px] w-[820px] rounded-full bg-gradient-to-tr from-indigo-100/80 via-violet-100/60 to-sky-100/50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              Built for modern educators, cohort leads &amp; L&amp;D teams
            </div>

            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              Create smarter quizzes.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Make learning engaging.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              QUIZORA turns assessment design into a calm, thoughtful workflow. Craft interactive
              quizzes with live previews, reuse questions across cohorts, and uncover clear learning
              insights—all in one refined workspace.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-indigo-700 sm:w-auto"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onExploreQuizzes}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-soft transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                <Play className="h-4 w-4 text-indigo-600" />
                Explore Quizzes
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No setup required — instant local workspace
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />4 question types with auto-grading
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Live learner preview
              </span>
            </div>
          </div>

          {/* Product Dashboard Preview */}
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-card sm:p-3">
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50">
                {/* Mock Browser Chrome */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                    app.quizora.studio/workspace
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-slate-500">Live Preview</span>
                  </div>
                </div>

                {/* Mock Dashboard Preview Body */}
                <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-12">
                  {/* Left mini sidebar */}
                  <div className="hidden rounded-xl border border-slate-200/80 bg-white p-3 lg:col-span-3 lg:block">
                    <div className="mb-4 flex items-center gap-2 px-2">
                      <div className="h-6 w-6 rounded-lg bg-indigo-600" />
                      <span className="font-display text-sm font-bold text-slate-900">QUIZORA</span>
                    </div>
                    <div className="space-y-1 text-xs font-medium">
                      {[
                        { label: 'Dashboard', active: true },
                        { label: 'My Quizzes', active: false },
                        { label: 'Create Quiz', active: false },
                        { label: 'Question Bank', active: false },
                        { label: 'Results & Analytics', active: false },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-lg px-2.5 py-2 ${
                            item.active
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right preview content */}
                  <div className="space-y-4 lg:col-span-9">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: 'Published Quizzes', val: '12', note: '+3 this month' },
                        { label: 'Participants', val: '1,480', note: '92% completion' },
                        { label: 'Average Score', val: '84%', note: '+6% vs last week' },
                        { label: 'Active Bank', val: '96 Qs', note: '6 categories' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl border border-slate-200/80 bg-white p-3"
                        >
                          <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                          <p className="mt-1 font-display text-lg font-bold text-slate-900">
                            {stat.val}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                            {stat.note}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                            Live Builder Preview
                          </span>
                          <span className="text-[11px] text-slate-400">2 pts</span>
                        </div>
                        <p className="mt-2.5 text-sm font-semibold text-slate-900">
                          Which hook preserves a mutable value without triggering a re-render?
                        </p>
                        <div className="mt-3 space-y-2">
                          {['useRef', 'useState', 'useMemo'].map((opt, idx) => (
                            <div
                              key={opt}
                              className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs ${
                                idx === 0
                                  ? 'border-indigo-300 bg-indigo-50/70 font-semibold text-indigo-900'
                                  : 'border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{opt}</span>
                              {idx === 0 && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900">
                            Score Distribution
                          </span>
                          <span className="text-[11px] text-slate-500">Last 14 days</span>
                        </div>
                        <div className="mt-4 flex items-end gap-2.5 h-24 px-1">
                          {[22, 38, 65, 92, 74].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                              <div
                                className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-500/85"
                                style={{ height: `${h}%` }}
                              />
                              <span className="text-[10px] text-slate-400">
                                {['<50', '60s', '70s', '80s', '90+'][i]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-200/80 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Thoughtful Craft
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything you need to author, run, and learn from quizzes
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Designed to feel effortless from your first draft question to cohort-wide insights.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200/90 bg-slate-50/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-card"
                >
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Sample Quizzes Strip */}
      <section id="sample-quizzes" className="border-t border-slate-200/80 bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Try It Live
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
                Take a sample quiz right now
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Experience QUIZORA from the learner’s seat—with countdown timer, flags, and instant
                review.
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreQuizzes}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Browse all quizzes in workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
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
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {quiz.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
                    {quiz.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {quiz.questions.length} Qs ({getQuizTotalMarks(quiz)} pts)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} min` : 'Untimed'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTakeQuiz(quiz.id)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                  >
                    <Play className="h-4 w-4" />
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-slate-200/80 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Loved by Teams
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
              Built for people who care about how others learn
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.author}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">“{item.quote}”</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.author}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA & Footer */}
      <section className="border-t border-slate-200 bg-slate-900 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Ready to build your next quiz?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Jump straight into the QUIZORA studio with sample quizzes, reusable questions, and live
              analytics ready to explore.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onCreateQuiz}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              Create a Quiz
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700"
            >
              <Users className="h-4 w-4" />
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} QUIZORA Learning Studio. Crafted with clarity.</p>
          <p>Data persists locally in your browser workspace.</p>
        </div>
      </footer>
    </div>
  );
};
