import { Sparkles } from 'lucide-react';

interface RecapHeroProps {
  monthLabel: string;
  totalCompleted: number;
  totalAssigned: number;
  isRefreshing: boolean;
}

export function RecapHero({
  monthLabel,
  totalCompleted,
  totalAssigned,
  isRefreshing,
}: RecapHeroProps) {
  return (
    <section className="recap-hero-card rounded-3xl p-7 md:p-9 mb-6 border border-white/40 dark:border-violet-900/30 shadow-soft">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700 dark:text-violet-300">
            Month in Review
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {monthLabel}
          </h1>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-violet-900/30 border border-white/60 dark:border-violet-800/40 flex items-center justify-center shadow-sm">
          <Sparkles className="text-violet-600 dark:text-violet-300" size={28} />
        </div>
      </div>

      <div className="flex items-end gap-3">
        <p className="text-6xl font-bold text-gray-900 dark:text-gray-100">{totalCompleted}</p>
        <p className="pb-2 text-gray-700 dark:text-gray-300">
          completed out of <strong>{totalAssigned}</strong> assigned
        </p>
      </div>

      <p className="mt-3 text-sm text-violet-800/80 dark:text-violet-200/80">
        {isRefreshing ? 'Syncing latest recap data...' : 'Your monthly recap is up to date.'}
      </p>
    </section>
  );
}
