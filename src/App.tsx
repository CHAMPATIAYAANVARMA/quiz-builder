import React, { useState } from 'react';
import { QuizoraProvider, useQuizora } from './context/QuizoraContext';
import { AppView, QuizAttempt } from './types/quiz';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardShell } from './components/layout/DashboardShell';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MyQuizzesView } from './components/quizzes/MyQuizzesView';
import { QuizBuilderView } from './components/builder/QuizBuilderView';
import { QuestionBankView } from './components/bank/QuestionBankView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { QuizPlayerView } from './components/player/QuizPlayerView';
import { QuizResultsView } from './components/results/QuizResultsView';
import { ToastContainer } from './components/ui/ToastContainer';

const QuizoraWorkspace: React.FC = () => {
  const { quizzes, attempts } = useQuizora();
  const [view, setView] = useState<AppView>('landing');
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);

  const openCreateQuiz = () => {
    setEditingQuizId(null);
    setView('builder');
  };

  const openEditQuiz = (quizId: string) => {
    setEditingQuizId(quizId);
    setView('builder');
  };

  const openTakeQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setView('take-quiz');
  };

  const handleInspectAttempt = (attemptId: string) => {
    const found = attempts.find((a) => a.id === attemptId);
    if (found) {
      setActiveAttempt(found);
      setView('results');
    }
  };

  if (view === 'landing') {
    return (
      <LandingPage
        quizzes={quizzes}
        onGetStarted={() => setView('dashboard')}
        onExploreQuizzes={() => setView('quizzes')}
        onTakeQuiz={openTakeQuiz}
        onCreateQuiz={openCreateQuiz}
      />
    );
  }

  if (view === 'take-quiz') {
    const quizToTake = quizzes.find((q) => q.id === activeQuizId);
    if (!quizToTake) {
      setView('quizzes');
      return null;
    }
    return (
      <QuizPlayerView
        quiz={quizToTake}
        onExit={() => setView('quizzes')}
        onComplete={(attempt) => {
          setActiveAttempt(attempt);
          setView('results');
        }}
      />
    );
  }

  return (
    <DashboardShell
      activeView={view}
      onNavigate={setView}
      onCreateNewQuiz={openCreateQuiz}
      onQuickOpenQuiz={openEditQuiz}
      onTakeQuiz={openTakeQuiz}
    >
      {view === 'dashboard' && (
        <DashboardOverview
          onCreateQuiz={openCreateQuiz}
          onEditQuiz={openEditQuiz}
          onTakeQuiz={openTakeQuiz}
          onNavigate={setView}
          onInspectAttempt={handleInspectAttempt}
        />
      )}

      {view === 'quizzes' && (
        <MyQuizzesView
          onCreateQuiz={openCreateQuiz}
          onEditQuiz={openEditQuiz}
          onTakeQuiz={openTakeQuiz}
        />
      )}

      {view === 'builder' && (
        <QuizBuilderView
          quizId={editingQuizId}
          onBack={() => setView('quizzes')}
          onPreviewTakeQuiz={openTakeQuiz}
        />
      )}

      {view === 'bank' && <QuestionBankView />}

      {view === 'analytics' && (
        <AnalyticsView onInspectAttempt={handleInspectAttempt} />
      )}

      {view === 'settings' && <SettingsView />}

      {view === 'results' && activeAttempt && (
        <QuizResultsView
          attempt={activeAttempt}
          quiz={quizzes.find((q) => q.id === activeAttempt.quizId)}
          onRetake={openTakeQuiz}
          onBackToQuizzes={() => setView('quizzes')}
          onViewAnalytics={() => setView('analytics')}
        />
      )}
    </DashboardShell>
  );
};

export function App() {
  return (
    <QuizoraProvider>
      <QuizoraWorkspace />
      <ToastContainer />
    </QuizoraProvider>
  );
}

export default App;
