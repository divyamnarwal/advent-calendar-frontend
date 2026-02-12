import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Flame, Users, Zap, Globe, X, ChevronRight } from 'lucide-react';
import { getPulseToday } from '../api/pulse';
import { getAllUsers } from '../api/users';
import { getUserProgress } from '../api/userChallenges';
import { useAuth } from '../hooks/useAuth';
import type { Country, PulseParticipant, PulseStats, Progress } from '../types';

const MILESTONES = [10, 25, 50, 100, 200] as const;

function sortParticipants(participants: PulseParticipant[]): PulseParticipant[] {
  return [...participants].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return initials || '?';
}

function formatCountryLabel(country: Country): string {
  return country.charAt(0) + country.slice(1).toLowerCase();
}

export function Pulse() {
  const { user } = useAuth();
  const [pulse, setPulse] = useState<PulseStats | null>(null);
  const [userProgress, setUserProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<PulseParticipant[]>([]);
  const [participantsSource, setParticipantsSource] = useState<'pulse' | 'fallback' | null>(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [isParticipantsDrawerOpen, setIsParticipantsDrawerOpen] = useState(false);
  const [reactorFill, setReactorFill] = useState(0);

  const loadFallbackParticipants = useCallback(async () => {
    setParticipantsLoading(true);
    setParticipantsError(null);
    setParticipantsSource('fallback');

    try {
      const users = await getAllUsers();
      setParticipants(
        sortParticipants(
          users.map((participant) => ({
            id: participant.id,
            name: participant.name,
            country: participant.country,
          }))
        )
      );
    } catch (err) {
      setParticipants([]);
      setParticipantsError(err instanceof Error ? err.message : 'Failed to fetch participant list');
    } finally {
      setParticipantsLoading(false);
    }
  }, []);

  const fetchPulse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setParticipantsError(null);

    try {
      const data = await getPulseToday();
      setPulse(data);

      if (Array.isArray(data.activeParticipants)) {
        setParticipants(sortParticipants(data.activeParticipants));
        setParticipantsSource('pulse');
        setParticipantsLoading(false);
        return;
      }

      void loadFallbackParticipants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pulse data');
      setParticipantsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadFallbackParticipants]);

  const fetchUserProgress = useCallback(async () => {
    if (!user) return;
    try {
      const progress = await getUserProgress(user.id);
      setUserProgress(progress);
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
    }
  }, [user]);

  useEffect(() => {
    void fetchPulse();
    void fetchUserProgress();
  }, [fetchPulse, fetchUserProgress]);

  useEffect(() => {
    if (!isParticipantsDrawerOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsParticipantsDrawerOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isParticipantsDrawerOpen]);

  const completedCount = userProgress?.totalCompleted ?? 0;
  const milestoneProgress = useMemo(() => {
    const nextMilestone = MILESTONES.find((milestone) => completedCount < milestone) ?? null;

    if (!nextMilestone) {
      return {
        nextMilestone: null,
        progressPercent: 100,
        statusText: 'All milestones cleared! You are on fire!',
      };
    }

    const previousMilestone =
      [...MILESTONES].reverse().find((milestone) => milestone <= completedCount) ?? 0;
    const span = nextMilestone - previousMilestone;
    const progressPercent =
      span <= 0 ? 0 : Math.min(100, Math.max(0, ((completedCount - previousMilestone) / span) * 100));

    return {
      nextMilestone,
      progressPercent,
      statusText: `${nextMilestone - completedCount} more to unlock ${nextMilestone}`,
    };
  }, [completedCount]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setReactorFill(milestoneProgress.progressPercent);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [milestoneProgress.progressPercent]);

  const participantsSourceLabel =
    participantsSource === 'pulse'
      ? 'Live active participants'
      : participantsSource === 'fallback'
      ? 'Live list unavailable, showing campus members'
      : 'Preparing participant source';

  const participantsHint = participantsLoading
    ? 'Preparing participant list...'
    : participantsSource === 'fallback'
    ? 'Tap to view campus members'
    : 'Tap to view participants';

  const proximityText = milestoneProgress.nextMilestone
    ? `${Math.round(reactorFill)}% of the way to ${milestoneProgress.nextMilestone}`
    : 'All listed milestones reached';

  const nextActionText = milestoneProgress.nextMilestone
    ? `Finish ${milestoneProgress.nextMilestone - completedCount} more challenge${
        milestoneProgress.nextMilestone - completedCount === 1 ? '' : 's'
      } to unlock milestone ${milestoneProgress.nextMilestone}.`
    : 'Set a stretch goal beyond 200 challenges to keep momentum going.';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !pulse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20]">
        <Navigation />
        <main className="md:ml-64 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <EmptyState
              title="Pulse unavailable"
              message={error || 'Unable to load global stats right now.'}
              icon={<Globe size={48} className="mx-auto text-gray-300" />}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20]">
      <Navigation />

      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Flame className="text-orange-500 mx-auto mb-4" size={48} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-serif">
              Campus Pulse
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your personal milestone progress
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-5 items-stretch">
            <button
              type="button"
              onClick={() => setIsParticipantsDrawerOpen(true)}
              className="md:col-span-2 bg-white/95 dark:bg-gray-800 rounded-2xl p-6 md:p-7 shadow-soft border border-gray-100 dark:border-gray-700 text-center hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              <Users className="text-violet-500 mx-auto mb-3" size={34} />
              <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {pulse.totalParticipants}
              </p>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Active {pulse.totalParticipants === 1 ? 'participant' : 'participants'} today
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-violet-600 dark:text-violet-300 flex items-center justify-center gap-1">
                {participantsHint}
                <ChevronRight size={14} />
              </p>
            </button>

            <div className="md:col-span-3 relative overflow-hidden bg-gradient-to-br from-white to-orange-50/60 dark:from-gray-800 dark:to-orange-950/20 rounded-3xl p-7 md:p-9 border border-orange-200/70 dark:border-orange-500/30 shadow-[0_22px_48px_-22px_rgba(249,115,22,0.42)] dark:shadow-[0_20px_45px_-22px_rgba(249,115,22,0.5)] hover-lift">
              <div className="pointer-events-none absolute -top-14 -right-16 h-36 w-36 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/20" />
              <div className="pointer-events-none absolute -bottom-10 -left-16 h-32 w-32 rounded-full bg-fuchsia-300/15 blur-3xl dark:bg-fuchsia-500/15" />

              <div className="relative z-10 flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Zap className="text-orange-500" size={24} />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-700 dark:text-orange-300">
                    Milestone Reactor
                  </p>
                </div>
                <span className="rounded-full border border-orange-200 dark:border-orange-500/40 bg-orange-100/80 dark:bg-orange-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-orange-700 dark:text-orange-200">
                  Priority
                </span>
              </div>

              <p className="relative z-10 text-left text-xs font-semibold uppercase tracking-[0.1em] text-orange-700 dark:text-orange-300 mb-3">
                Achievement
              </p>
              <p className="relative z-10 text-left text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {completedCount}
              </p>
              <p className="relative z-10 text-left text-base md:text-lg text-gray-700 dark:text-gray-300 mb-5">
                Total challenges completed
              </p>

              <div className="relative z-10 mt-6 pt-5 border-t border-orange-200/70 dark:border-orange-500/30">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-orange-700 dark:text-orange-300 text-left">
                  Proximity
                </p>
                <div className="reactor-progress-track h-3.5 rounded-full overflow-hidden">
                  <div
                    className="reactor-progress-fill reactor-progress-fill-enter h-full rounded-full"
                    style={{ width: `${reactorFill}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300 text-left">
                  {proximityText}
                </p>
              </div>

              <div className="relative z-10 mt-5 flex flex-wrap gap-2">
                {MILESTONES.map((milestone) => {
                  const reached = completedCount >= milestone;
                  const justReached = completedCount === milestone;

                  return (
                    <span
                      key={milestone}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        reached
                          ? 'milestone-chip-reached border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-500/60 dark:bg-orange-500/20 dark:text-orange-200'
                          : 'border-gray-200 bg-gray-100/90 text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400'
                      } ${justReached ? 'milestone-chip-hit' : ''}`}
                    >
                      {milestone}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl p-6 md:p-7 text-left hover-lift-subtle">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-violet-700 dark:text-violet-300 mb-2">
              Next action
            </p>
            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              {nextActionText}
            </p>
            {participantsSource === 'fallback' && (
              <p className="mt-3 text-xs text-violet-700 dark:text-violet-300">
                Participant drawer is currently using fallback campus-member data.
              </p>
            )}
          </div>
        </div>
      </main>

      {isParticipantsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <button
            type="button"
            aria-label="Close participants drawer"
            onClick={() => setIsParticipantsDrawerOpen(false)}
            className="absolute inset-0 bg-black/55 animate-fade-in"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="pulse-participants-title"
            className="pulse-drawer-enter relative w-full md:max-w-xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mb-1">
                  Participant Feed
                </p>
                <h2
                  id="pulse-participants-title"
                  className="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                  Active Participants
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {participantsLoading
                    ? 'Loading participants...'
                    : `${participants.length} participant${participants.length === 1 ? '' : 's'} listed`}
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-300 mt-1">{participantsSourceLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsParticipantsDrawerOpen(false)}
                className="ml-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                aria-label="Close participants panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(85vh-132px)]">
              {participantsLoading ? (
                <div className="py-14 flex justify-center">
                  <LoadingSpinner size="large" />
                </div>
              ) : participantsError ? (
                <div className="py-8">
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-4">
                      {participantsError}
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadFallbackParticipants()}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : participants.length === 0 ? (
                <EmptyState
                  title="No participants listed"
                  message={
                    participantsSource === 'pulse'
                      ? 'No one has been marked active yet today.'
                      : 'No campus members were returned right now.'
                  }
                  icon={<Users size={48} className="mx-auto text-gray-300" />}
                />
              ) : (
                <ul className="space-y-2">
                  {participants.map((participant) => (
                    <li
                      key={participant.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 font-semibold flex items-center justify-center shrink-0">
                          {getInitials(participant.name)}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {participant.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200">
                          {formatCountryLabel(participant.country)}
                        </span>
                        {user?.id === participant.id && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-200">
                            You
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}


