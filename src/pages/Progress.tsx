import { useEffect, useMemo, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  Trophy,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserChallenges } from '../hooks/useChallenges';
import { getUserProgress, clearPendingChallenges } from '../api/userChallenges';
import { calculateStreakStats } from '../utils/streak';
import type { Progress, ClearPendingChallengesResponse, UserChallenge } from '../types';

const categoryLabels: Record<string, string> = {
  EXPLORE_CITY: 'Explore City',
  TREND_BASED: 'Trend Based',
  CAMPUS_LIFE: 'Campus Life',
  SOCIAL_SPARK: 'Social Spark',
  CULTURAL_EXCHANGE: 'Cultural Exchange',
  WILDCARD: 'Wildcard',
};

export function Progress() {
  const { user } = useAuth();
  const { challenges, isLoading, refetch } = useUserChallenges(user?.id ?? null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearResult, setClearResult] = useState<ClearPendingChallengesResponse | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<UserChallenge | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProgress(user.id).then(setProgress).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!isDetailOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDetailOpen]);

  useEffect(() => {
    if (isDetailOpen || !selectedChallenge) return;
    const timeout = window.setTimeout(() => {
      setSelectedChallenge(null);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [isDetailOpen, selectedChallenge]);

  const completedChallenges = challenges.filter((c) => c.status === 'COMPLETED');
  const pendingChallenges = challenges.filter((c) => c.status === 'ASSIGNED');
  const streakStats = useMemo(() => calculateStreakStats(challenges), [challenges]);

  const openChallengeDetails = (challenge: UserChallenge) => {
    setSelectedChallenge(challenge);
    setIsDetailOpen(true);
  };

  const closeChallengeDetails = () => {
    setIsDetailOpen(false);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCompletedAge = (dateValue?: string): string => {
    if (!dateValue) return 'Completed today';
    const completedAt = new Date(dateValue);
    if (Number.isNaN(completedAt.getTime())) return 'Completed recently';

    const diffMs = Date.now() - completedAt.getTime();
    if (diffMs < 60_000) return 'Completed just now';

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) return `Completed ${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Completed ${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `Completed ${days} day${days === 1 ? '' : 's'} ago`;
  };

  const handleClearPending = async () => {
    if (!user) return;
    setIsClearing(true);
    setClearError(null);
    setClearResult(null);
    try {
      const result = await clearPendingChallenges(user.id);
      setClearResult(result);
      await refetch();
      // Refresh progress too
      getUserProgress(user.id).then(setProgress).catch(console.error);
      setShowConfirm(false);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        'Failed to clear pending challenges. Please try again.';
      setClearError(message);
      console.error('Failed to clear pending challenges:', err);
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20]">
      <Navigation />

      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-serif mb-5">
            Your Progress
          </h1>

          {/* Summary Header */}
          {progress && (
            <section className="mb-9 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-5 shadow-soft backdrop-blur-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-300 mb-2">
                  Snapshot
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-serif leading-tight">
                  {progress.totalCompleted} completed challenges
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {pendingChallenges.length} pending and {streakStats.currentStreak} days in your
                  current streak.
                </p>
              </div>
            </section>
          )}

          {/* Completed Challenges */}
          <section className="mb-10">
            <div className="flex items-end justify-between gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-serif">
                Completed Challenges
              </h2>
              <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {completedChallenges.length}
              </span>
            </div>
            {completedChallenges.length > 0 ? (
              <div className="space-y-3">
                {completedChallenges.map((uc) => (
                  <button
                    type="button"
                    key={uc.id}
                    onClick={() => openChallengeDetails(uc)}
                    className="group w-full cursor-pointer text-left bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-soft border border-emerald-100 dark:border-emerald-900/40 hover:-translate-y-0.5 hover:shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {uc.challenge?.title || 'Challenge'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {categoryLabels[uc.challenge?.category ?? ''] || uc.challenge?.category}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 size={12} />
                          Done
                        </span>
                        {uc.completionTime && (
                          <p className="mt-2 text-[11px] font-normal text-gray-400/90 dark:text-gray-500/90">
                            {formatCompletedAge(uc.completionTime)}
                          </p>
                        )}
                        <ChevronRight
                          size={14}
                          className="ml-auto mt-2 text-gray-300 dark:text-gray-600 opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No completed challenges yet"
                message="Complete your first challenge to see it here!"
                icon={<Trophy size={48} className="mx-auto text-gray-300" />}
              />
            )}
          </section>

          {/* Pending Challenges */}
          {pendingChallenges.length > 0 && (
            <section className="rounded-2xl border border-gray-200/80 dark:border-gray-700 bg-white/65 dark:bg-gray-900/45 shadow-soft overflow-hidden">
              <button
                type="button"
                onClick={() => setIsPendingExpanded((prev) => !prev)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50/80 dark:hover:bg-gray-800/35 transition-colors"
                aria-expanded={isPendingExpanded}
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 font-serif">
                  Pending Challenges
                </h2>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex min-w-8 justify-center rounded-full border border-violet-200 dark:border-violet-900/60 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    {pendingChallenges.length}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 dark:text-gray-400 transition-transform ${
                      isPendingExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isPendingExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-end mb-4">
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={isClearing}
                      className="text-sm font-medium text-red-600/90 dark:text-red-400/90 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-4 decoration-red-300/70 dark:decoration-red-700/70 transition-colors disabled:opacity-50"
                    >
                      {isClearing ? (
                        <>
                          <RotateCcw size={14} className="animate-spin" />
                          Clearing pending...
                        </>
                      ) : (
                        'Clear all pending'
                      )}
                    </button>
                  </div>

                  {showConfirm && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-center gap-4">
                      <Trash2 size={20} className="text-red-500 dark:text-red-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                          Are you sure you want to clear all {pendingChallenges.length} pending
                          challenges? This cannot be undone.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowConfirm(false)}
                          disabled={isClearing}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleClearPending}
                          disabled={isClearing}
                          className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {(clearResult || clearError) && (
                    <div
                      className={`rounded-lg p-3 mb-4 flex items-start gap-3 border ${
                        clearError
                          ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                          : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {clearError ? (
                        <AlertTriangle
                          size={18}
                          className="text-red-500 dark:text-red-400 mt-0.5"
                        />
                      ) : (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-600 dark:text-emerald-400 mt-0.5"
                        />
                      )}
                      <p
                        className={`text-sm font-medium ${
                          clearError
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        {clearError ?? clearResult?.message}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {pendingChallenges.map((uc) => (
                      <button
                        type="button"
                        key={uc.id}
                        onClick={() => openChallengeDetails(uc)}
                        className="w-full text-left bg-white/75 dark:bg-gray-800/65 rounded-xl p-4 shadow-sm border border-gray-200/80 dark:border-gray-700/70 opacity-85 hover:opacity-100 hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {uc.challenge?.title || 'Challenge'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {uc.challenge?.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
          <button
            type="button"
            aria-label="Close challenge details"
            onClick={closeChallengeDetails}
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
              isDetailOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-details-title"
            className={`relative w-full md:w-[420px] h-[88vh] md:h-full bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700 md:border-t-0 md:border-l rounded-t-2xl md:rounded-none transition-transform duration-300 ease-out flex flex-col ${
              isDetailOpen
                ? 'translate-y-0 md:translate-x-0'
                : 'translate-y-full md:translate-y-0 md:translate-x-full'
            }`}
          >
            <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mb-2">
                  Challenge Details
                </p>
                <h2
                  id="challenge-details-title"
                  className="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {selectedChallenge.challenge?.title || 'Challenge'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeChallengeDetails}
                className="ml-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close details panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedChallenge.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                  }`}
                >
                  {selectedChallenge.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedChallenge.challenge?.category || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {selectedChallenge.challenge?.description || 'No description available.'}
                  </p>
                </div>

                {selectedChallenge.challenge?.culture && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-1">
                      Culture
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {selectedChallenge.challenge.culture}
                    </p>
                  </div>
                )}

                {selectedChallenge.challenge?.energyLevel && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-1">
                      Energy Level
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {selectedChallenge.challenge.energyLevel}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-3">
                    Timeline
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Started</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                        {formatDateTime(
                          selectedChallenge.assignedDate ?? selectedChallenge.startTime
                        )}
                      </p>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                        {selectedChallenge.completionTime
                          ? formatDateTime(selectedChallenge.completionTime)
                          : 'Not completed yet'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedChallenge.status === 'ASSIGNED' && (
                  <p className="text-xs text-violet-700 dark:text-violet-300">
                    This challenge is currently pending. Finish it to move it to completed.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
