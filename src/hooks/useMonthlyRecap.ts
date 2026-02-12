import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMonthlyRecap } from '../api/recap';
import type { MonthlyRecapResponse } from '../types';

type RecapStatus = 'ready' | 'stale' | 'error';

interface CacheEntry {
  data: MonthlyRecapResponse;
  fetchedAt: number;
}

const recapCache = new Map<string, CacheEntry>();
const STALE_AFTER_MS = 60_000;

export interface UseMonthlyRecapResult {
  data: MonthlyRecapResponse | null;
  status: RecapStatus;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.trim();
    if (message) {
      return message;
    }
  }
  return 'Failed to load monthly recap';
}

export function useMonthlyRecap(userId: number | null, month: string | null): UseMonthlyRecapResult {
  const cacheKey = useMemo(() => {
    if (!userId || !month) return null;
    return `${userId}:${month}`;
  }, [userId, month]);

  const [data, setData] = useState<MonthlyRecapResponse | null>(null);
  const [status, setStatus] = useState<RecapStatus>('ready');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const requestIdRef = useRef(0);

  const load = useCallback(async (force = false) => {
    if (!cacheKey) {
      setData(null);
      setStatus('ready');
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      setLastUpdated(null);
      return;
    }

    const cached = recapCache.get(cacheKey);
    const hasCached = Boolean(cached);

    if (cached) {
      setData(cached.data);
      setLastUpdated(cached.fetchedAt);
      setStatus(Date.now() - cached.fetchedAt > STALE_AFTER_MS ? 'stale' : 'ready');
      setError(null);
    }

    if (force) {
      setIsLoading(!hasCached);
      setIsRefreshing(hasCached);
    } else if (hasCached) {
      setIsRefreshing(true);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setIsRefreshing(false);
    }

    const requestId = ++requestIdRef.current;

    try {
      const response = await getMonthlyRecap(month ?? undefined);
      if (requestId !== requestIdRef.current) {
        return;
      }

      const fetchedAt = Date.now();
      recapCache.set(cacheKey, { data: response, fetchedAt });
      setData(response);
      setLastUpdated(fetchedAt);
      setStatus('ready');
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(toErrorMessage(err));
      setStatus(hasCached ? 'stale' : 'error');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [cacheKey, month]);

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    if (!cacheKey) return;

    const onWindowFocus = () => {
      void load(false);
    };

    window.addEventListener('focus', onWindowFocus);
    return () => {
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [cacheKey, load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return {
    data,
    status,
    error,
    isLoading,
    isRefreshing,
    isStale: status === 'stale',
    lastUpdated,
    refresh,
  };
}
