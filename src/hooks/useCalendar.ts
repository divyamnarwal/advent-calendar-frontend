import { useMemo, useEffect, useState } from 'react';
import {
  getToday,
  getDaysInMonth,
  isSameDay,
  isFuture,
  isPast,
  parseDateToLocalDay,
} from '../utils/dates';
import type { DayTile, UserChallenge } from '../types';

interface UseCalendarReturn {
  days: DayTile[];
  today: Date;
  currentMonth: Date;
}

export function useCalendar(userChallenges?: UserChallenge[]): UseCalendarReturn {
  const today = getToday();
  const currentMonth = today;

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(currentMonth);
    const result: DayTile[] = [];
    const challengeByDay = new Map<string, UserChallenge>();

    const getDayKey = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;

    const getStatusPriority = (challenge: UserChallenge) =>
      challenge.status === 'ASSIGNED' ? 2 : challenge.status === 'COMPLETED' ? 1 : 0;

    const getAssignedTime = (challenge: UserChallenge) => {
      const assignedAt = challenge.assignedDate ?? challenge.startTime;
      if (!assignedAt) return 0;
      const parsed = new Date(assignedAt);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    if (userChallenges) {
      userChallenges.forEach((challenge) => {
        const assignedAt = challenge.assignedDate ?? challenge.startTime;
        if (!assignedAt) return;

        const assignedDate = parseDateToLocalDay(assignedAt);
        if (!assignedDate) return;

        const dayKey = getDayKey(assignedDate);
        const existing = challengeByDay.get(dayKey);

        if (!existing) {
          challengeByDay.set(dayKey, challenge);
          return;
        }

        const existingPriority = getStatusPriority(existing);
        const nextPriority = getStatusPriority(challenge);

        if (nextPriority > existingPriority) {
          challengeByDay.set(dayKey, challenge);
          return;
        }

        if (
          nextPriority === existingPriority &&
          getAssignedTime(challenge) > getAssignedTime(existing)
        ) {
          challengeByDay.set(dayKey, challenge);
        }
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isTodayDate = isSameDay(date, today);
      const isLocked = isFuture(date);
      const isPastDate = isPast(date);

      const userChallenge = challengeByDay.get(getDayKey(date));

      result.push({
        date,
        dayOfMonth: i,
        isToday: isTodayDate,
        isLocked,
        isPast: isPastDate,
        userChallenge,
      });
    }

    return result;
  }, [currentMonth, today, userChallenges]);

  return {
    days,
    today,
    currentMonth,
  };
}

export function useTodayChecker(): {
  isToday: (date: Date) => boolean;
  today: Date;
} {
  const [today, setToday] = useState(getToday());

  useEffect(() => {
    // Update today at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilTomorrow = tomorrow.getTime() - Date.now();

    const timer = setTimeout(() => {
      setToday(getToday());
    }, msUntilTomorrow);

    return () => clearTimeout(timer);
  }, [today]);

  return {
    isToday: (date: Date) => isSameDay(date, today),
    today,
  };
}
