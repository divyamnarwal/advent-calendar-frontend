import { CalendarHeader, CalendarDay } from './CalendarDay';
import type { DayTile } from '../../types';

interface CalendarProps {
  days: DayTile[];
  onDayClick: (day: DayTile) => void;
  month?: Date;
}

export function Calendar({ days, onDayClick, month }: CalendarProps) {
  const monthName = month?.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate starting offset (day of week for first day)
  const firstDayOfWeek = days[0]?.date.getDay() ?? 0;

  // Create empty cells for days before the first of the month
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="mx-auto w-full max-w-[32rem] md:max-w-[36rem]">
      {monthName && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-serif text-center">
          {monthName}
        </h2>
      )}

      <CalendarHeader />

      <div className="grid grid-cols-7 gap-1.5 pb-3 md:gap-2 md:pb-2">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {days.map((day) => (
          <CalendarDay key={day.dayOfMonth} day={day} onClick={() => onDayClick(day)} />
        ))}
      </div>
    </div>
  );
}
