import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Flame, Globe2, Sparkles, Target, Trophy } from 'lucide-react';
import { Calendar } from '../components/Calendar/Calendar';
import { Navigation } from '../components/Navigation';
import { MoodSelector } from '../components/MoodSelector';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChallengePreview } from '../components/ChallengePreview';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { useCalendar } from '../hooks/useCalendar';
import { useChallenges } from '../hooks/useChallenges';
import { useUserChallenges } from '../hooks/useChallenges';
import { formatMonthYear } from '../utils/dates';
import { calculateStreakStats } from '../utils/streak';
import type { Mood, DayTile, UserChallenge } from '../types';

const HERO_MOODS: Array<{ value: Mood; label: string }> = [
  { value: 'LOW', label: 'Chill' },
  { value: 'NEUTRAL', label: 'Balanced' },
  { value: 'HIGH', label: 'Energetic' },
];

function formatAssignedAge(dateValue?: string): string {
  if (!dateValue) return 'Assigned recently';
  const assignedAt = new Date(dateValue);
  if (Number.isNaN(assignedAt.getTime())) return 'Assigned recently';

  const diffMs = Date.now() - assignedAt.getTime();
  if (diffMs < 60_000) return 'Assigned just now';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `Assigned ${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Assigned ${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `Assigned ${days} day${days === 1 ? '' : 's'} ago`;
}

function formatCompletedTime(dateValue?: string): string {
  if (!dateValue) return 'Completed today';
  const completedAt = new Date(dateValue);
  if (Number.isNaN(completedAt.getTime())) return 'Completed today';
  return `Completed at ${completedAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export function Home() {
  const { user } = useAuth();
  const { challenges, isLoading: isLoadingChallenges, refetch } = useUserChallenges(user?.id ?? null);
  const { days, currentMonth } = useCalendar(challenges);
  const todayTile = useMemo(() => days.find((day) => day.isToday) ?? null, [days]);
  const todayChallenge = todayTile?.userChallenge?.challenge;
  const todayStatus = todayTile?.userChallenge?.status;

  const completedCount = useMemo(
    () => challenges.filter((challenge) => challenge.status === 'COMPLETED').length,
    [challenges]
  );
  const assignedCount = challenges.length;
  const completionPercent = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;
  const streakStats = useMemo(() => calculateStreakStats(challenges), [challenges]);

  const [selectedDay, setSelectedDay] = useState<DayTile | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [heroMood, setHeroMood] = useState<Mood | null>(null);
  const [joinedChallenge, setJoinedChallenge] = useState<UserChallenge | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showChallengePreview, setShowChallengePreview] = useState(false);
  const [isCompletingToday, setIsCompletingToday] = useState(false);
  const [heroActionError, setHeroActionError] = useState<string | null>(null);

  const {
    previewedChallenge,
    isLoading: isLoadingChallenge,
    isStarting,
    error: challengeError,
    fetchChallengePreview,
    startChallenge,
    completeChallenge,
    clearError,
    clearPreview,
  } = useChallenges();

  const handleDayClick = async (day: DayTile) => {
    if (day.isLocked) return;
    setSelectedDay(day);
    setShowMoodSelector(false);
    setShowChallengePreview(false);
    setSelectedMood(null);
    setJoinedChallenge(null);
    setHeroActionError(null);
    clearPreview();

    // If already has a user challenge, show it
    if (day.userChallenge) {
      setJoinedChallenge(day.userChallenge);
      return;
    }

    // If today and no challenge, show mood selector
    if (day.isToday) {
      setShowMoodSelector(true);
    }
  };

  const handleMoodSelect = async (mood: Mood) => {
    if (!user || !selectedDay) return;

    setSelectedMood(mood);
    clearError();

    try {
      // Only fetch preview, don't assign yet.
      await fetchChallengePreview(user.id, mood);
      setShowMoodSelector(false);
      setShowChallengePreview(true);
    } catch (_err) {
      // Error handled by hook
    }
  };

  const handleAcceptChallenge = async () => {
    if (!user || !previewedChallenge || !selectedMood) return;

    try {
      const joined = await startChallenge(user.id, previewedChallenge.id, selectedMood);
      setJoinedChallenge(joined.challenge ? joined : { ...joined, challenge: previewedChallenge });
      setShowChallengePreview(false);
      await refetch();
    } catch (err) {
      console.error('Failed to start challenge:', err);
    }
  };

  const handleDeclineChallenge = () => {
    setShowChallengePreview(false);
    setShowMoodSelector(true);
    setSelectedMood(null);
    clearPreview();
  };

  const handleComplete = async () => {
    if (!joinedChallenge) return;

    try {
      await completeChallenge(joinedChallenge.id);
      refetch();
      setSelectedDay(null);
      setJoinedChallenge(null);
    } catch (err) {
      console.error('Failed to complete challenge:', err);
    }
  };

  const closeChallengeModal = () => {
    setSelectedDay(null);
    setShowMoodSelector(false);
    setShowChallengePreview(false);
    setSelectedMood(null);
    setJoinedChallenge(null);
    setHeroActionError(null);
    clearPreview();
  };

  const handleHeroUnlock = async () => {
    if (!user || !todayTile || !heroMood) return;

    setHeroActionError(null);
    clearError();
    clearPreview();

    try {
      await fetchChallengePreview(user.id, heroMood);
      setSelectedMood(heroMood);
      setSelectedDay(todayTile);
      setShowMoodSelector(false);
      setShowChallengePreview(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to unlock challenge right now.';
      setHeroActionError(message);
    }
  };

  const handleHeroComplete = async () => {
    const todayUserChallenge = todayTile?.userChallenge;
    if (!todayUserChallenge || todayUserChallenge.status !== 'ASSIGNED') return;

    const confirmed = window.confirm('Mark today\'s challenge as complete?');
    if (!confirmed) return;

    setIsCompletingToday(true);
    setHeroActionError(null);

    try {
      await completeChallenge(todayUserChallenge.id);
      await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete challenge.';
      setHeroActionError(message);
    } finally {
      setIsCompletingToday(false);
    }
  };

  const handleHeroViewDetails = () => {
    if (!todayTile) return;
    void handleDayClick(todayTile);
  };

  const shouldHighlightMoodSelection = !heroMood && !isLoadingChallenge;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20]">
      <Navigation />

      {/* Main Content */}
      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 md:space-y-5">
          {/* Secondary Greeting */}
          {user && (
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Hi, {user.name}. Welcome back.
            </p>
          )}

          {/* Hero: Today's Challenge */}
          <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 px-6 py-5 md:px-8 md:py-6 border border-violet-200/70 dark:border-violet-900/50 shadow-xl shadow-violet-200/60 dark:shadow-violet-950/40">
            <div className="absolute -top-14 -right-14 h-44 w-44 rounded-full bg-violet-200/45 dark:bg-violet-700/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-fuchsia-200/50 dark:bg-fuchsia-700/20 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600 dark:text-violet-300">
                  Today's Challenge
                </p>

                {todayStatus === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/35 text-green-700 dark:text-green-300">
                    <CheckCircle2 size={14} />
                    Completed
                  </span>
                ) : todayStatus === 'ASSIGNED' && todayChallenge?.category ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-[0.1em] bg-gray-100/70 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border border-gray-200/70 dark:border-gray-700/70 opacity-75">
                    {todayChallenge.category.replace(/_/g, ' ')}
                  </span>
                ) : null}
              </div>

              {todayStatus === 'ASSIGNED' ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 font-serif leading-tight mb-3">
                    {todayChallenge?.title || "Today's Challenge"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl leading-relaxed">
                    {todayChallenge?.description || 'Your challenge is ready. Complete it to keep your streak alive.'}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <button
                      onClick={handleHeroComplete}
                      disabled={isCompletingToday}
                      className="w-full md:w-auto min-w-[280px] px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl font-semibold text-base hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 dark:shadow-violet-950/60"
                    >
                      {isCompletingToday ? 'Completing...' : 'Complete Challenge'}
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold bg-violet-100/90 dark:bg-violet-900/45 text-violet-700 dark:text-violet-200 border border-violet-200/90 dark:border-violet-700/80">
                      <Clock3 size={15} className="text-fuchsia-500 dark:text-fuchsia-300" />
                      {formatAssignedAge(todayTile?.userChallenge?.assignedDate ?? todayTile?.userChallenge?.startTime)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Flame size={16} className="text-orange-500" />
                      {todayChallenge?.energyLevel || 'Energy set'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe2 size={16} className="text-teal-500" />
                      {todayChallenge?.culture || user?.country || 'Global'}
                    </span>
                  </div>
                </>
              ) : todayStatus === 'COMPLETED' ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 font-serif leading-tight mb-2">
                    {todayChallenge?.title || "Today's Challenge"}
                  </h1>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-4">
                    {formatCompletedTime(todayTile?.userChallenge?.completionTime)}
                  </p>
                  <div className="rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-4 py-3 mb-5">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Great job. You've kept your streak alive. Come back tomorrow for a new challenge.
                    </p>
                  </div>
                  <button
                    onClick={handleHeroViewDetails}
                    className="w-full md:w-auto min-w-[280px] px-8 py-3 bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300 rounded-2xl font-semibold border border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                  >
                    View Challenge Details
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 font-serif leading-tight mb-3">
                    Unlock your personalized challenge
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-5 max-w-2xl">
                    Choose your mood to unlock today's challenge and set the tone for your progress.
                  </p>

                  {shouldHighlightMoodSelection && (
                    <p className="inline-flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-violet-700 dark:text-violet-300 animate-pulse">
                      <Target size={13} className="text-violet-500 dark:text-violet-300" />
                      Select a mood first to enable unlock
                    </p>
                  )}
                  <div
                    className={`grid grid-cols-3 gap-2 mb-5 transition-all ${
                      shouldHighlightMoodSelection
                        ? 'rounded-2xl p-1 bg-violet-100/70 dark:bg-violet-900/25 ring-1 ring-violet-300/70 dark:ring-violet-700/60'
                        : ''
                    }`}
                  >
                    {HERO_MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setHeroMood(mood.value)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold border transition-all ${
                          heroMood === mood.value
                            ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200 dark:shadow-violet-900/40'
                            : 'bg-white/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                        }`}
                      >
                        {mood.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">
                    {heroMood ? 'Mood selected. You can now unlock your challenge.' : 'Select one mood to enable unlock.'}
                  </p>

                  <button
                    onClick={handleHeroUnlock}
                    disabled={!heroMood || isLoadingChallenge}
                    className="w-full md:w-auto min-w-[280px] px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl font-semibold text-base hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:bg-gray-300 disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-300 disabled:shadow-none disabled:cursor-not-allowed shadow-lg shadow-violet-200 dark:shadow-violet-950/60"
                  >
                    {isLoadingChallenge
                      ? 'Unlocking...'
                      : heroMood
                      ? 'Unlock My Challenge'
                      : 'Select a mood to continue'}
                  </button>
                </>
              )}

              {(heroActionError || (challengeError && !selectedDay)) && (
                <div className="mt-4">
                  <ErrorBanner
                    message={heroActionError || challengeError || 'Something went wrong.'}
                    onDismiss={() => {
                      setHeroActionError(null);
                      clearError();
                    }}
                    onRetry={
                      todayStatus
                        ? undefined
                        : heroMood
                        ? () => {
                            void handleHeroUnlock();
                          }
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          </section>

          {/* Secondary: Quick Stats */}
          <section className="rounded-2xl bg-white/72 dark:bg-gray-900/68 border border-gray-200/75 dark:border-gray-700/60 p-4 md:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-gray-400 dark:text-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                Quick Stats
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-200/85 dark:border-gray-700/75 bg-white/60 dark:bg-gray-800/45 px-3 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-flex items-center gap-1">
                  <Flame size={13} className="text-orange-500" />
                  Streak
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{streakStats.currentStreak}</p>
              </div>
              <div className="rounded-xl border border-gray-200/85 dark:border-gray-700/75 bg-white/60 dark:bg-gray-800/45 px-3 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-flex items-center gap-1">
                  <Trophy size={13} className="text-violet-500" />
                  Completed
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{completedCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200/85 dark:border-gray-700/75 bg-white/60 dark:bg-gray-800/45 px-3 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-flex items-center gap-1">
                  <Target size={13} className="text-teal-500" />
                  Progress
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{completionPercent}%</p>
              </div>
            </div>

          </section>

          {/* Tertiary: Calendar Navigator */}
          <section className="rounded-2xl bg-white/58 dark:bg-gray-900/55 border border-gray-200/65 dark:border-gray-700/55 p-3 md:p-4 shadow-none opacity-80">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                <CalendarDays size={14} />
                Calendar Navigator
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{formatMonthYear(currentMonth)}</p>
            </div>

            {isLoadingChallenges ? (
              <div className="flex justify-center py-8 opacity-70">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="scale-[0.975] origin-top">
                <Calendar days={days} onDayClick={handleDayClick} />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Challenge Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeChallengeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-serif">
                  {selectedDay.isToday ? "Today's Challenge" : `Day ${selectedDay.dayOfMonth}`}
                </h3>
                <button
                  onClick={closeChallengeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Mood Selector (for today without challenge) */}
              {showMoodSelector ? (
                <MoodSelector
                  selected={selectedMood}
                  onSelect={handleMoodSelect}
                  disabled={isLoadingChallenge}
                />
              ) : showChallengePreview && previewedChallenge ? (
                <ChallengePreview
                  challenge={previewedChallenge}
                  mood={selectedMood ?? undefined}
                  onAccept={handleAcceptChallenge}
                  onDecline={handleDeclineChallenge}
                  isStarting={isStarting}
                />
              ) : joinedChallenge && joinedChallenge.challenge ? (
                <ChallengeCard
                  challenge={joinedChallenge.challenge}
                  mood={selectedMood ?? undefined}
                  userChallenge={joinedChallenge}
                  onComplete={handleComplete}
                  isCompleting={false}
                  showMood
                />
              ) : selectedDay.userChallenge?.challenge ? (
                <ChallengeCard
                  challenge={selectedDay.userChallenge.challenge}
                  userChallenge={selectedDay.userChallenge}
                />
              ) : selectedDay.isToday ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Select your mood to get today's challenge!
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    This day's challenge is not available yet.
                  </p>
                </div>
              )}

              {challengeError && (
                <ErrorBanner
                  message={challengeError}
                  onDismiss={clearError}
                  onRetry={() => selectedMood && handleMoodSelect(selectedMood)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
