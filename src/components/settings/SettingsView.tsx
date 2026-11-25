import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload } from 'lucide-react';
import { useQuizora } from '../../context/QuizoraContext';
import { ConfirmModal } from '../ui/ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    settings,
    quizzes,
    questionBank,
    attempts,
    updateSettings,
    resetDemoData,
    importWorkspaceData,
    showToast,
  } = useQuizora();

  const [form, setForm] = useState(settings);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      quizzes,
      questionBank,
      attempts,
      settings: form,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quizora-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({
      type: 'success',
      title: 'Backup exported',
      description: 'Downloaded your quizzes, question bank, and analytics as JSON.',
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        importWorkspaceData(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Personalize your creator profile, quiz defaults, and local workspace data.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft space-y-6"
      >
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Profile &amp; Workspace
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Role
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Organization / School
              </label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="font-display text-base font-bold text-slate-900">
            Default Quiz Rules
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Default Time Limit (mins)
              </label>
              <input
                type="number"
                min={0}
                max={180}
                value={form.defaultTimeLimit}
                onChange={(e) =>
                  setForm({ ...form, defaultTimeLimit: Math.max(0, Number(e.target.value)) })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Default Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.defaultPassingScore}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultPassingScore: Math.min(100, Math.max(0, Number(e.target.value))),
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showExplanationsByDefault}
                onChange={(e) =>
                  setForm({ ...form, showExplanationsByDefault: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <span className="text-sm text-slate-700">
                Enable post-quiz answer explanations by default on new quizzes
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Save className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      </form>

      {/* Data Management */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft">
        <h2 className="font-display text-base font-bold text-slate-900">
          Workspace Data &amp; Backups
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          All QUIZORA data is saved locally in your browser. Export a backup anytime or restore
          the default sample workspace.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            Export JSON Backup
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4 text-indigo-600" />
            Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo Data
          </button>
        </div>
      </div>

      <ConfirmModal
        open={resetModalOpen}
        title="Restore sample demo data?"
        description="This will replace your current quizzes, bank questions, and attempt history with QUIZORA's starter demo dataset."
        confirmLabel="Restore Defaults"
        variant="danger"
        onCancel={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setResetModalOpen(false);
        }}
      />
    </div>
  );
};
