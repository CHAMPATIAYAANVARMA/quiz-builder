import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  CheckCheck,
  ExternalLink,
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { AppView } from '../../types/quiz';
import { useQuizora } from '../../context/QuizoraContext';
import { BrandLogo } from '../ui/BrandLogo';

interface DashboardShellProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onCreateNewQuiz: () => void;
  onQuickOpenQuiz: (quizId: string) => void;
  onTakeQuiz: (quizId: string) => void;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  activeView,
  onNavigate,
  onCreateNewQuiz,
  onQuickOpenQuiz,
  onTakeQuiz,
  children,
}) => {
  const { quizzes, notifications, markAllNotificationsRead, settings } = useQuizora();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return quizzes
      .filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(q) ||
          quiz.category.toLowerCase().includes(q) ||
          quiz.description.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, quizzes]);

  const initials = settings.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navItems: {
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: () => void;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quizzes', label: 'My Quizzes', icon: FolderKanban },
    { id: 'builder', label: 'Create Quiz', icon: FilePlus2, action: onCreateNewQuiz },
    { id: 'bank', label: 'Question Bank', icon: BookOpen },
    { id: 'analytics', label: 'Results & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (item: (typeof navItems)[number]) => {
    setMobileOpen(false);
    if (item.action) {
      item.action();
    } else {
      onNavigate(item.id);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 border-r border-slate-200/80">
      <div>
        <div className="flex items-center justify-between px-2">
          <BrandLogo size="md" showTagline onClick={() => onNavigate('landing')} />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-7 space-y-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 to-violet-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Pro Tip
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Save strong questions to your Bank once and reuse them across multiple assessments.
          </p>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onNavigate('bank');
            }}
            className="mt-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Open Question Bank →
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200/90 px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <span>View Landing Page</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Global Search */}
              <div ref={searchRef} className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search quizzes, categories, or topics..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />

                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-card z-40">
                    {searchResults.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-slate-500">
                        No quizzes match “{searchQuery}”.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-slate-50"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery('');
                                onQuickOpenQuiz(quiz.id);
                              }}
                              className="flex-1 text-left min-w-0"
                            >
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {quiz.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {quiz.category} · {quiz.questions.length} questions
                              </p>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery('');
                                onTakeQuiz(quiz.id);
                              }}
                              className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              Take
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-3 shadow-card z-40 animate-slide-up">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
                      <span className="font-display text-sm font-bold text-slate-900">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded-xl p-2.5 transition-colors ${
                            n.read ? 'bg-white' : 'bg-indigo-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {n.timeAgo}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
                    {initials || 'ML'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {settings.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {settings.organization}
                    </p>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-card z-40 animate-slide-up">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-sm font-semibold text-slate-900">{settings.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{settings.email}</p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onNavigate('settings');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" />
                        Workspace Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onNavigate('landing');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        Back to Landing Page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main View Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
