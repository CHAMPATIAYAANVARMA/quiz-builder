import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useQuizora } from '../../context/QuizoraContext';
import { formatDuration, formatRelativeDate } from '../../utils/quizHelpers';

interface AnalyticsViewProps {
  onInspectAttempt: (attemptId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onInspectAttempt }) => {
  const { quizzes, attempts } = useQuizora();
  const [selectedQuizId, setSelectedQuizId] = useState<'all' | string>('all');
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const filteredAttempts = useMemo(() => {
    if (selectedQuizId === 'all') return attempts;
    return attempts.filter((a) => a.quizId === selectedQuizId);
  }, [attempts, selectedQuizId]);

  const kpis = useMemo(() => {
    const total = filteredAttempts.length;
    const avgScore =
      total > 0
        ? Math.round(filteredAttempts.reduce((s, a) => s + a.percentage, 0) / total)
        : 0;
    const passRate =
      total > 0
        ? Math.round(
            (filteredAttempts.filter((a) => a.passed).length / total) * 100
          )
        : 0;
    const avgTime =
      total > 0
        ? Math.round(
            filteredAttempts.reduce((s, a) => s + a.timeSpentSeconds, 0) / total
          )
        : 0;
    return { total, avgScore, passRate, avgTime };
  }, [filteredAttempts]);

  // 1. Score Distribution Buckets
  const scoreBuckets = useMemo(() => {
    const buckets = [
      { label: '0–20%', min: 0, max: 20, count: 0 },
      { label: '21–40%', min: 21, max: 40, count: 0 },
      { label: '41–60%', min: 41, max: 60, count: 0 },
      { label: '61–80%', min: 61, max: 80, count: 0 },
      { label: '81–100%', min: 81, max: 100, count: 0 },
    ];
    filteredAttempts.forEach((a) => {
      const target = buckets.find(
        (b) => a.percentage >= b.min && a.percentage <= b.max
      );
      if (target) target.count += 1;
    });
    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    return { buckets, maxCount };
  }, [filteredAttempts]);

  // 2. Participation Over Last 7 Days
  const participationSeries = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dayKey = date.toDateString();
      const count = filteredAttempts.filter(
        (a) => new Date(a.completedAt).toDateString() === dayKey
      ).length;
      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }
    const maxVal = Math.max(2, ...days.map((d) => d.count));
    return { days, maxVal };
  }, [filteredAttempts]);

  // 3. Quiz Performance & Completion Comparison
  const quizComparison = useMemo(() => {
    return quizzes.map((quiz) => {
      const relevant = attempts.filter((a) => a.quizId === quiz.id);
      const avg =
        relevant.length > 0
          ? Math.round(relevant.reduce((s, a) => s + a.percentage, 0) / relevant.length)
          : 0;
      const passRate =
        relevant.length > 0
          ? Math.round(
              (relevant.filter((a) => a.passed).length / relevant.length) * 100
            )
          : 0;
      return {
        id: quiz.id,
        title: quiz.title,
        attempts: relevant.length,
        avgScore: avg,
        passRate,
        completionRate: quiz.completionRate,
      };
    });
  }, [quizzes, attempts]);

  // SVG Area Chart coordinates
  const svgW = 460;
  const svgH = 160;
  const padX = 24;
  const padY = 20;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;
  const points = participationSeries.days.map((d, idx) => {
    const x =
      padX + (idx / Math.max(1, participationSeries.days.length - 1)) * plotW;
    const y = padY + plotH - (d.count / participationSeries.maxVal) * plotH;
    return { ...d, x, y };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    padY + plotH
  } L ${points[0].x} ${padY + plotH} Z`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Results &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track participation trends, score distributions, and learner outcomes.
          </p>
        </div>

        <select
          aria-label="Filter analytics by quiz"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-300 focus:outline-none"
        >
          <option value="all">All Quizzes ({quizzes.length})</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Attempts',
            val: String(kpis.total),
            icon: Users,
            tone: 'bg-indigo-50 text-indigo-600',
          },
          {
            label: 'Average Score',
            val: `${kpis.avgScore}%`,
            icon: Award,
            tone: 'bg-violet-50 text-violet-600',
          },
          {
            label: 'Pass Rate',
            val: `${kpis.passRate}%`,
            icon: CheckCircle2,
            tone: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Avg Completion Time',
            val: formatDuration(kpis.avgTime),
            icon: Clock,
            tone: 'bg-sky-50 text-sky-600',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`rounded-xl p-2 ${card.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                {card.val}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Participation Over Time */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Participation (Last 7 Days)
              </h2>
              <p className="text-xs text-slate-500">Daily completed quiz submissions</p>
            </div>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>

          <div className="mt-4">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="quizoraAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((step) => (
                <line
                  key={step}
                  x1={padX}
                  x2={svgW - padX}
                  y1={padY + plotH * (1 - step)}
                  y2={padY + plotH * (1 - step)}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />
              ))}
              <path d={areaPath} fill="url(#quizoraAreaGrad)" />
              <path
                d={linePath}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, idx) => (
                <g key={p.label}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredDay === idx ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredDay(idx)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                  {hoveredDay === idx && (
                    <g>
                      <rect
                        x={p.x - 24}
                        y={p.y - 30}
                        width="48"
                        height="20"
                        rx="6"
                        fill="#0F172A"
                      />
                      <text
                        x={p.x}
                        y={p.y - 16}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {p.count} {p.count === 1 ? 'run' : 'runs'}
                      </text>
                    </g>
                  )}
                  <text
                    x={p.x}
                    y={svgH - 2}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="11"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Score Distribution
              </h2>
              <p className="text-xs text-slate-500">How learner scores cluster by range</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
              {filteredAttempts.length} submissions
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3 h-40 pt-4 px-2">
            {scoreBuckets.buckets.map((bucket, idx) => {
              const heightPct = Math.max(
                8,
                Math.round((bucket.count / scoreBuckets.maxCount) * 100)
              );
              return (
                <div
                  key={bucket.label}
                  onMouseEnter={() => setHoveredBucket(idx)}
                  onMouseLeave={() => setHoveredBucket(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span
                    className={`text-xs font-bold transition-opacity ${
                      hoveredBucket === idx ? 'text-indigo-700' : 'text-slate-600'
                    }`}
                  >
                    {bucket.count}
                  </span>
                  <div className="w-full max-w-[54px] flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-300 group-hover:from-indigo-700 group-hover:to-violet-600"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz Performance Comparison */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft">
          <h2 className="font-display text-base font-bold text-slate-900">
            Quiz Performance Comparison
          </h2>
          <p className="text-xs text-slate-500">Average score and pass rate per quiz</p>

          <div className="mt-5 space-y-4">
            {quizComparison.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate pr-2">
                    {item.title}
                  </span>
                  <span className="shrink-0 font-bold text-indigo-700">
                    {item.attempts > 0 ? `${item.avgScore}% avg` : 'No attempts'}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500"
                    style={{ width: `${item.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rates */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-soft">
          <h2 className="font-display text-base font-bold text-slate-900">
            Completion Rates
          </h2>
          <p className="text-xs text-slate-500">
            Share of started attempts that reach final submission
          </p>

          <div className="mt-5 space-y-4">
            {quizComparison.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate pr-2">
                    {item.title}
                  </span>
                  <span className="shrink-0 font-bold text-emerald-700">
                    {item.completionRate}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${item.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attempts Log Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-soft">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Participant Attempts
          </h2>
          <p className="text-xs text-slate-500">
            Inspect any submission to view its complete answer breakdown.
          </p>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No attempts recorded for this selection yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Participant</th>
                  <th className="px-4 py-3">Quiz</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-5 py-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {att.participantName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{att.quizTitle}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-900">
                      {att.percentage}% ({att.score}/{att.totalMarks})
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          att.passed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {att.passed ? 'Passed' : 'Needs Practice'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {formatDuration(att.timeSpentSeconds)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatRelativeDate(att.completedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onInspectAttempt(att.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-600" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
