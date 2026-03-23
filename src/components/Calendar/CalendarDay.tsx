import { Lock, Check } from 'lucide-react';
import type { DayTile } from '../../types';

interface CalendarDayProps {
  day: DayTile;
  onClick: () => void;
}

const weekdayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarDay({ day, onClick }: CalendarDayProps) {
  const { dayOfMonth, isToday, isLocked, userChallenge } = day;

  // Completed state
  const isCompleted = userChallenge?.status === 'COMPLETED';

  // Base styles
  const baseClasses = `
    relative aspect-square rounded-xl flex items-center justify-center
    font-semibold text-lg transition-all duration-200 cursor-pointer card-hover
    ${isLocked ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
  `;

  // State-specific styles
  let stateClasses = '';
  let content = <span>{dayOfMonth}</span>;

  if (isLocked) {
    stateClasses = 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500';
    content = (
      <>
        <span>{dayOfMonth}</span>
        <Lock size={14} className="absolute top-1 right-1 opacity-40" />
      </>
    );
  } else if (isCompleted) {
    stateClasses =
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800';
    content = (
      <>
        <span>{dayOfMonth}</span>
        <Check size={14} className="absolute bottom-1 right-1 text-green-600 dark:text-green-400" />
      </>
    );
  } else if (isToday) {
    stateClasses =
      'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/50';
  } else {
    stateClasses =
      'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20';
  }

  // Keep the "Today" label in normal flow so it doesn't escape the calendar container.
  const todayIndicator =
    isToday && !isCompleted ? (
      <span className="mt-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300 leading-none">
        Today
      </span>
    ) : null;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => !isLocked && onClick()}
        disabled={isLocked}
        className={`${baseClasses} ${stateClasses}`}
        aria-label={`Day ${dayOfMonth}${isLocked ? ' (locked)' : ''}${isToday ? ' (today)' : ''}`}
      >
        {content}
      </button>
      {todayIndicator}
    </div>
  );
}

export function CalendarHeader() {
  return (
    <div className="grid grid-cols-7 gap-2 mb-4">
      {weekdayInitials.map((day, index) => (
        <div
          key={index}
          className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          {day}
        </div>
      ))}
    </div>
  );
}
