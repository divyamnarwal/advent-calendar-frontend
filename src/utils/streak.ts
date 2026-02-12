import type { UserChallenge } from '../types';
import { parseDateToLocalDay } from './dates';

const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDaySerial(value: string): number | null {
  const date = parseDateToLocalDay(value);
  if (!date) {
    return null;
  }

  // Use local year/month/day, then normalize through UTC to avoid DST drift.
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

function getTodayLocalDaySerial(today = new Date()): number {
  return Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / DAY_MS);
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

export function calculateStreakStats(
  challenges: UserChallenge[],
  today = new Date()
): StreakStats {
  const completedDaySerials = new Set<number>();

  challenges.forEach((challenge) => {
    if (challenge.status !== 'COMPLETED') {
      return;
    }

    const completionDay = challenge.completionTime ?? challenge.assignedDate ?? challenge.startTime;
    if (!completionDay) {
      return;
    }
    const daySerial = toLocalDaySerial(completionDay);

    if (daySerial !== null) {
      completedDaySerials.add(daySerial);
    }
  });

  if (completedDaySerials.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDays = Array.from(completedDaySerials).sort((a, b) => a - b);

  let longestStreak = 1;
  let runningLongest = 1;

  for (let i = 1; i < sortedDays.length; i += 1) {
    if (sortedDays[i] - sortedDays[i - 1] === 1) {
      runningLongest += 1;
    } else {
      runningLongest = 1;
    }

    if (runningLongest > longestStreak) {
      longestStreak = runningLongest;
    }
  }

  const todaySerial = getTodayLocalDaySerial(today);
  const latestCompletedDay = sortedDays[sortedDays.length - 1];
  const gapFromToday = todaySerial - latestCompletedDay;

  if (gapFromToday > 1) {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 1;
  for (let i = sortedDays.length - 1; i > 0; i -= 1) {
    if (sortedDays[i] - sortedDays[i - 1] === 1) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}
