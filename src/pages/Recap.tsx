import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { RecapHero } from '../components/recap/RecapHero';
import { RecapKpiGrid } from '../components/recap/RecapKpiGrid';
import { RecapPhotoMemories } from '../components/recap/RecapPhotoMemories';
import { RecapUploadCard } from '../components/recap/RecapUploadCard';
import { useAuth } from '../hooks/useAuth';
import { useUserChallenges } from '../hooks/useChallenges';
import { useMonthlyRecap } from '../hooks/useMonthlyRecap';
import { getRevealedCapsules } from '../api/capsules';
import { deletePhoto, getPhotos, uploadPhoto } from '../api/photos';
import { calculateStreakStats } from '../utils/streak';
import { formatMonthYear, getMonthStart, getToday, parseDateToLocalDay } from '../utils/dates';
import type { MonthlyRecapResponse, Photo, RecapPhotoPreview, TimeCapsule } from '../types';

const recapV2Enabled = import.meta.env.VITE_RECAP_V2_ENABLED === 'true';

interface RecapShellProps {
  children: ReactNode;
}

function RecapShell({ children }: RecapShellProps) {
  return (
    <div className="min-h-screen recap-shell bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20]">
      <Navigation />
      <main className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}

function RecapLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20] flex items-center justify-center">
      <LoadingSpinner size="large" />
    </div>
  );
}

function RecapEmptyMessage() {
  return (
    <EmptyState
      title="No challenges completed yet"
      message="Complete some challenges this month to see your recap!"
      icon={<Trophy size={64} className="mx-auto text-gray-300" />}
    />
  );
}

function MotivationMessage({ completed }: { completed: number }) {
  const message =
    completed >= 20
      ? "Incredible! You're on fire!"
      : completed >= 10
        ? 'Great progress! Keep it up!'
        : 'Every challenge completed is a win. Keep going!';

  return (
    <div className="text-center py-8">
      <p className="text-gray-600 dark:text-gray-400 italic">{message}</p>
    </div>
  );
}

function toRecapPhotoPreview(photo: Photo): RecapPhotoPreview {
  return {
    id: photo.id,
    secureUrl: photo.secureUrl,
    caption: photo.caption ?? null,
    createdAt: photo.createdAt,
  };
}

function RecapV2() {
  const { user } = useAuth();
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoDeleteError, setPhotoDeleteError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [deletingPhotoIds, setDeletingPhotoIds] = useState<number[]>([]);
  const [photos, setPhotos] = useState<RecapPhotoPreview[]>([]);

  const monthParam = useMemo(() => {
    const today = getToday();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthName = useMemo(() => formatMonthYear(getToday()), []);
  const { data, status, error, isLoading, isRefreshing, refresh } = useMonthlyRecap(
    user?.id ?? null,
    monthParam
  );

  useEffect(() => {
    if (data?.recentPhotos) {
      setPhotos(data.recentPhotos);
    }
  }, [data]);

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsUploadingPhoto(true);

    try {
      const created = await uploadPhoto(file, photoCaption.trim() || undefined);
      const preview = toRecapPhotoPreview(created);
      setPhotos((prev) => [preview, ...prev.filter((item) => item.id !== preview.id)].slice(0, 8));
      setPhotoCaption('');
      await refresh();
    } catch (uploadErr) {
      setPhotoError(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handlePhotoDelete = async (photoId: number) => {
    setPhotoDeleteError(null);
    setDeletingPhotoIds((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));

    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      await refresh();
    } catch (deleteErr) {
      setPhotoDeleteError(
        deleteErr instanceof Error ? deleteErr.message : 'Failed to delete photo'
      );
    } finally {
      setDeletingPhotoIds((prev) => prev.filter((id) => id !== photoId));
    }
  };

  if (isLoading && !data) {
    return <RecapLoader />;
  }

  if (status === 'error' && !data) {
    return (
      <RecapLegacy
        fallbackMessage={error || 'Recap v2 is unavailable. Showing legacy recap data.'}
      />
    );
  }

  if (!data) {
    return <RecapLoader />;
  }

  const recap = data as MonthlyRecapResponse;

  return (
    <RecapShell>
      {(status === 'stale' || !!error) && (
        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle size={16} />
          Showing cached recap data. Use refresh to sync the latest numbers.
        </div>
      )}

      <RecapHero
        monthLabel={monthName}
        totalCompleted={recap.totalCompletedThisMonth}
        totalAssigned={recap.totalAssignedThisMonth}
        isRefreshing={isRefreshing}
      />

      <RecapUploadCard
        caption={photoCaption}
        onCaptionChange={setPhotoCaption}
        onUpload={handlePhotoUpload}
        isUploading={isUploadingPhoto}
        uploadError={photoError}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />

      {photoDeleteError && (
        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {photoDeleteError}
        </div>
      )}

      {recap.totalCompletedThisMonth === 0 ? (
        <RecapEmptyMessage />
      ) : (
        <>
          <RecapKpiGrid
            longestStreakDays={recap.longestStreakDays}
            currentStreakDays={recap.currentStreakDays}
            topCategory={recap.topCategory}
            topCategoryCount={recap.topCategoryCount}
            capsulesCreatedThisMonth={recap.capsulesCreatedThisMonth}
            capsulesUnlockedThisMonth={recap.capsulesUnlockedThisMonth}
            photosAddedThisMonth={recap.photosAddedThisMonth}
          />
          <MotivationMessage completed={recap.totalCompletedThisMonth} />
        </>
      )}

      <RecapPhotoMemories
        photos={photos}
        onDeletePhoto={handlePhotoDelete}
        deletingPhotoIds={deletingPhotoIds}
      />
    </RecapShell>
  );
}

function RecapLegacy({ fallbackMessage }: { fallbackMessage?: string }) {
  const { user } = useAuth();
  const { challenges, isLoading } = useUserChallenges(user?.id ?? null);

  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoCaption, setPhotoCaption] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoDeleteError, setPhotoDeleteError] = useState<string | null>(null);
  const [deletingPhotoIds, setDeletingPhotoIds] = useState<number[]>([]);
  const [legacyError, setLegacyError] = useState<string | null>(null);
  const [isRefreshingLegacy, setIsRefreshingLegacy] = useState(false);

  const monthParam = useMemo(() => {
    const today = getToday();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthName = useMemo(() => formatMonthYear(getToday()), []);

  const fetchLegacyRecap = async () => {
    if (!user) return;
    setLegacyError(null);
    setIsRefreshingLegacy(true);
    try {
      const [revealed, photoList] = await Promise.all([
        getRevealedCapsules(user.id),
        getPhotos(monthParam),
      ]);
      setCapsules(revealed);
      setPhotos(photoList);
    } catch (err) {
      setLegacyError(err instanceof Error ? err.message : 'Failed to refresh recap details');
    } finally {
      setIsRefreshingLegacy(false);
    }
  };

  useEffect(() => {
    void fetchLegacyRecap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, monthParam]);

  const currentMonthChallenges = useMemo(() => {
    const now = getToday();
    const monthStart = getMonthStart(now);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return challenges.filter((challenge) => {
      const assignedAt = challenge.assignedDate ?? challenge.startTime;
      if (!assignedAt) return false;
      const assignedDate = parseDateToLocalDay(assignedAt);
      if (!assignedDate) return false;
      return assignedDate >= monthStart && assignedDate <= monthEnd;
    });
  }, [challenges]);

  const streakStats = useMemo(() => calculateStreakStats(challenges), [challenges]);

  const stats = useMemo(() => {
    const completed = currentMonthChallenges.filter(
      (challenge) => challenge.status === 'COMPLETED'
    );
    const categoryCounts: Record<string, number> = {};

    completed.forEach((challenge) => {
      const category = challenge.challenge?.category || 'UNKNOWN';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCompleted: completed.length,
      totalAssigned: currentMonthChallenges.length,
      longestStreak: streakStats.longestStreak,
      currentStreak: streakStats.currentStreak,
      topCategory: topCategory ? topCategory[0] : null,
      topCategoryCount: topCategory ? topCategory[1] : 0,
      capsulesCount: capsules.length,
      photosAdded: photos.length,
    };
  }, [currentMonthChallenges, streakStats, capsules.length, photos.length]);

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsUploadingPhoto(true);

    try {
      const created = await uploadPhoto(file, photoCaption.trim() || undefined);
      setPhotos((prev) => [created, ...prev].slice(0, 8));
      setPhotoCaption('');
      await fetchLegacyRecap();
    } catch (uploadErr) {
      setPhotoError(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handlePhotoDelete = async (photoId: number) => {
    setPhotoDeleteError(null);
    setDeletingPhotoIds((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));

    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    } catch (deleteErr) {
      setPhotoDeleteError(
        deleteErr instanceof Error ? deleteErr.message : 'Failed to delete photo'
      );
    } finally {
      setDeletingPhotoIds((prev) => prev.filter((id) => id !== photoId));
    }
  };

  if (isLoading) {
    return <RecapLoader />;
  }

  return (
    <RecapShell>
      {fallbackMessage && (
        <div className="mb-4 rounded-xl border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 px-4 py-3 text-sm text-violet-800 dark:text-violet-200">
          {fallbackMessage}
        </div>
      )}
      {legacyError && (
        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {legacyError}
        </div>
      )}
      {photoDeleteError && (
        <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {photoDeleteError}
        </div>
      )}

      <RecapHero
        monthLabel={monthName}
        totalCompleted={stats.totalCompleted}
        totalAssigned={stats.totalAssigned}
        isRefreshing={isRefreshingLegacy}
      />

      <RecapUploadCard
        caption={photoCaption}
        onCaptionChange={setPhotoCaption}
        onUpload={handlePhotoUpload}
        isUploading={isUploadingPhoto}
        uploadError={photoError}
        onRefresh={fetchLegacyRecap}
        isRefreshing={isRefreshingLegacy}
      />

      {stats.totalCompleted === 0 ? (
        <RecapEmptyMessage />
      ) : (
        <>
          <RecapKpiGrid
            longestStreakDays={stats.longestStreak}
            currentStreakDays={stats.currentStreak}
            topCategory={stats.topCategory}
            topCategoryCount={stats.topCategoryCount}
            capsulesCreatedThisMonth={stats.capsulesCount}
            capsulesUnlockedThisMonth={stats.capsulesCount}
            photosAddedThisMonth={stats.photosAdded}
          />
          <MotivationMessage completed={stats.totalCompleted} />
        </>
      )}

      <RecapPhotoMemories
        photos={photos.map(toRecapPhotoPreview)}
        onDeletePhoto={handlePhotoDelete}
        deletingPhotoIds={deletingPhotoIds}
      />
    </RecapShell>
  );
}

export function Recap() {
  if (recapV2Enabled) {
    return <RecapV2 />;
  }

  return <RecapLegacy />;
}
