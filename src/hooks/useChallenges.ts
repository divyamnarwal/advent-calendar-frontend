import { useState, useEffect, useCallback } from 'react';
import { markComplete, startChallenge as startChallengeApi } from '../api/userChallenges';
import { getTodayChallengePreview } from '../api/challenges';
import type { Challenge, UserChallenge, Mood } from '../types';

interface UseChallengesReturn {
  dailyChallenge: Challenge | null;
  previewedChallenge: Challenge | null;
  isLoading: boolean;
  isStarting: boolean;
  error: string | null;
  fetchChallengePreview: (userId: number, mood: Mood) => Promise<Challenge>;
  startChallenge: (userId: number, challengeId: number, mood: Mood) => Promise<UserChallenge>;
  completeChallenge: (userChallengeId: number) => Promise<UserChallenge>;
  clearError: () => void;
  clearPreview: () => void;
}

export function useChallenges(): UseChallengesReturn {
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [previewedChallenge, setPreviewedChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallengePreview = useCallback(async (userId: number, mood: Mood) => {
    setIsLoading(true);
    setError(null);
    // Prevent stale challenge ids from previous interactions.
    setPreviewedChallenge(null);
    setDailyChallenge(null);
    try {
      const challenge = await getTodayChallengePreview(userId, mood);
      setPreviewedChallenge(challenge);
      setDailyChallenge(challenge);
      return challenge;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge');
      setPreviewedChallenge(null);
      setDailyChallenge(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startChallenge = useCallback(async (userId: number, challengeId: number, _mood: Mood) => {
    setIsStarting(true);
    setError(null);
    try {
      // Use start endpoint so assignments are scoped to today and don't reuse old completed rows.
      const userChallenge = await startChallengeApi(userId, challengeId, _mood);
      return userChallenge;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start challenge');
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const completeChallenge = useCallback(async (userChallengeId: number) => {
    const userChallenge = await markComplete(userChallengeId);
    return userChallenge;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewedChallenge(null);
    setDailyChallenge(null);
    setError(null);
  }, []);

  return {
    dailyChallenge,
    previewedChallenge,
    isLoading,
    isStarting,
    error,
    fetchChallengePreview,
    startChallenge,
    completeChallenge,
    clearError,
    clearPreview,
  };
}

export function useUserChallenges(userId: number | null) {
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Import dynamically to avoid circular dependency
      const { getUserChallenges } = await import('../api/userChallenges');
      const data = await getUserChallenges(userId);
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const refetch = useCallback(() => {
    return fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, isLoading, error, refetch };
}
