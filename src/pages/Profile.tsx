import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Camera, Flame, Mail, Save, Trophy, UserRound } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { BadgeCard } from '../components/profile/BadgeCard';
import { BadgeDetailsModal } from '../components/profile/BadgeDetailsModal';
import { BadgeUnlockCelebration } from '../components/profile/BadgeUnlockCelebration';
import { ThemePreferenceSelector } from '../components/profile/ThemePreferenceSelector';
import { getProfile, getProfileBadges, updateProfile, updateProfileTheme } from '../api/profile';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import type {
  ProfileBadge,
  ProfileBadgesResponse,
  ProfileUpdatePayload,
  ThemePreference,
  UserProfile,
} from '../types';

export function Profile() {
  const { hasActiveSession, isLoading: isAuthLoading } = useAuth();
  const { setThemePreference } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<ProfileBadge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isSavingTheme, setIsSavingTheme] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string>('');
  const [draftAvatar, setDraftAvatar] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<ProfileBadge | null>(null);
  const [unlockBadges, setUnlockBadges] = useState<ProfileBadge[]>([]);
  const [isUnlockOpen, setIsUnlockOpen] = useState<boolean>(false);

  const seenUnlockBadgeIdsRef = useRef<Set<string>>(new Set());

  const earnedBadges = useMemo(() => badges.filter((badge) => badge.earned), [badges]);

  const getRequestErrorMessage = useCallback((requestError: unknown, fallback: string) => {
    if (
      requestError &&
      typeof requestError === 'object' &&
      'message' in requestError &&
      typeof (requestError as { message?: unknown }).message === 'string'
    ) {
      return (requestError as { message: string }).message;
    }

    if (requestError instanceof Error) {
      return requestError.message;
    }

    return fallback;
  }, []);

  const handleNewUnlocks = useCallback((unlockIds: string[], availableBadges: ProfileBadge[]) => {
    if (unlockIds.length === 0) {
      return;
    }

    const unseenUnlockIds = unlockIds.filter((id) => !seenUnlockBadgeIdsRef.current.has(id));
    if (unseenUnlockIds.length === 0) {
      return;
    }

    unseenUnlockIds.forEach((id) => seenUnlockBadgeIdsRef.current.add(id));
    const unlockedBadgeModels = availableBadges.filter((badge) => unseenUnlockIds.includes(badge.id));

    if (unlockedBadgeModels.length > 0) {
      setUnlockBadges(unlockedBadgeModels);
      setIsUnlockOpen(true);
    }
  }, []);

  const applyServerSnapshot = useCallback(
    (profileResponse: UserProfile, badgesResponse: ProfileBadgesResponse) => {
      setProfile(profileResponse);
      setBadges(badgesResponse.badges);
      setDraftName(profileResponse.name);
      setDraftAvatar(profileResponse.avatar ?? '');
      setThemePreference(profileResponse.themePreference);

      const unlockIds = Array.from(
        new Set([...profileResponse.newlyUnlockedBadgeIds, ...badgesResponse.newlyUnlockedBadgeIds])
      );
      handleNewUnlocks(unlockIds, badgesResponse.badges);
    },
    [handleNewUnlocks, setThemePreference]
  );

  const fetchProfileSnapshot = useCallback(
    async (showPageLoader: boolean = true) => {
      if (!hasActiveSession) {
        return;
      }

      if (showPageLoader) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const profileResponse = await getProfile();
        const badgesResponse = await getProfileBadges();
        applyServerSnapshot(profileResponse, badgesResponse);
      } catch (requestError) {
        const message = getRequestErrorMessage(requestError, 'Failed to fetch profile details.');
        setError(message);
      } finally {
        if (showPageLoader) {
          setIsLoading(false);
        }
      }
    },
    [applyServerSnapshot, getRequestErrorMessage, hasActiveSession]
  );

  useEffect(() => {
    if (isAuthLoading || !hasActiveSession) {
      return;
    }

    void fetchProfileSnapshot();
  }, [fetchProfileSnapshot, hasActiveSession, isAuthLoading]);

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const nameValue = draftName.trim();
    if (!nameValue) {
      setError('Name cannot be empty.');
      return;
    }

    const avatarValue = draftAvatar.trim();
    const currentAvatarValue = (profile.avatar ?? '').trim();
    const payload: ProfileUpdatePayload = {};

    if (nameValue !== profile.name) {
      payload.name = nameValue;
    }
    if (avatarValue !== currentAvatarValue) {
      payload.avatar = avatarValue.length > 0 ? avatarValue : null;
    }

    if (Object.keys(payload).length === 0) {
      setSuccessMessage('No profile changes to save.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedProfile = await updateProfile(payload);
      const badgesResponse = await getProfileBadges();
      applyServerSnapshot(updatedProfile, badgesResponse);
      setSuccessMessage('Profile updated successfully.');
    } catch (requestError) {
      const message = getRequestErrorMessage(requestError, 'Failed to save profile changes.');
      setError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleThemeChange = async (nextPreference: ThemePreference) => {
    if (!profile || nextPreference === profile.themePreference) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSavingTheme(true);

    const previousPreference = profile.themePreference;
    setThemePreference(nextPreference);
    setProfile((current) =>
      current ? { ...current, themePreference: nextPreference } : current
    );

    try {
      const updatedProfile = await updateProfileTheme(nextPreference);
      const badgesResponse = await getProfileBadges();
      applyServerSnapshot(updatedProfile, badgesResponse);
      setSuccessMessage('Theme preference updated.');
    } catch (requestError) {
      setThemePreference(previousPreference);
      setProfile((current) =>
        current ? { ...current, themePreference: previousPreference } : current
      );
      const message = getRequestErrorMessage(requestError, 'Failed to update theme preference.');
      setError(message);
    } finally {
      setIsSavingTheme(false);
    }
  };

  const closeUnlockModal = () => {
    setIsUnlockOpen(false);
    setUnlockBadges([]);
  };

  const totalBadges = badges.length;

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
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
          <section className="rounded-3xl border border-violet-200/80 dark:border-violet-800/60 bg-white/85 dark:bg-gray-900/80 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-300">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 font-serif">
              Personal Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your details, theme settings, and badge progress in one place.
            </p>
          </section>

          {error && (
            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
              onRetry={() => {
                void fetchProfileSnapshot(false);
              }}
            />
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/35 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-200">
              {successMessage}
            </div>
          )}

          <section className="rounded-3xl border border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 p-6">
            <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
              <div className="rounded-2xl border border-violet-200 dark:border-violet-800/60 bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/35 dark:to-pink-900/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-violet-700 dark:text-violet-300">
                  Avatar
                </p>

                <div className="mt-4 flex justify-center">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={`${profile.name} avatar`}
                      className="h-24 w-24 rounded-2xl border border-violet-200 dark:border-violet-700 object-cover bg-white dark:bg-gray-800"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-gray-800 text-2xl font-semibold text-violet-700 dark:text-violet-300">
                      {profile?.name ? profile.name.trim().charAt(0).toUpperCase() : <UserRound size={30} />}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 px-3 py-2 border border-violet-100 dark:border-violet-800/40">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Streak</p>
                    <p className="mt-1 flex items-center gap-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                      <Flame size={14} className="text-orange-500" />
                      {profile?.streak ?? 0} days
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 px-3 py-2 border border-violet-100 dark:border-violet-800/40">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Total Points</p>
                    <p className="mt-1 flex items-center gap-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                      <Trophy size={14} className="text-violet-600 dark:text-violet-300" />
                      {profile?.totalPoints ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1">
                      <Camera size={14} />
                      Avatar URL
                    </span>
                  </label>
                  <input
                    value={draftAvatar}
                    onChange={(event) => setDraftAvatar(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
                  <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                    <Mail size={14} />
                    {profile?.email ?? '-'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={14} />
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-serif">Badges</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earned {earnedBadges.length} of {totalBadges} available badges.
                </p>
              </div>
              <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                Achievement System
              </div>
            </div>

            {badges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-400">
                Badge catalog is empty right now.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} onClick={setSelectedBadge} />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-serif">Settings</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Theme controls are now managed inside your profile and synced with backend preference.
            </p>

            <div className="mt-4">
              <ThemePreferenceSelector
                currentPreference={profile?.themePreference ?? 'SYSTEM'}
                isUpdating={isSavingTheme}
                onChange={handleThemeChange}
              />
            </div>
          </section>
        </div>
      </main>

      <BadgeDetailsModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <BadgeUnlockCelebration badges={unlockBadges} isOpen={isUnlockOpen} onClose={closeUnlockModal} />
    </div>
  );
}
