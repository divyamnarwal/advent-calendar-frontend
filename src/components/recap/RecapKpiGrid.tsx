import { Clock, Flame, ImagePlus, Trophy, Unlock } from 'lucide-react';
import type { ReactNode } from 'react';

interface RecapKpiGridProps {
  longestStreakDays: number;
  currentStreakDays: number;
  topCategory?: string | null;
  topCategoryCount: number;
  capsulesCreatedThisMonth: number;
  capsulesUnlockedThisMonth: number;
  photosAddedThisMonth: number;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  accentClass: string;
}

function KpiCard({ title, value, subtitle, icon, accentClass }: KpiCardProps) {
  return (
    <article className="recap-kpi-card rounded-2xl p-5 border border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.09em] text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accentClass}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}

function formatCategoryLabel(category?: string | null): string {
  if (!category) return 'No dominant category yet';
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function RecapKpiGrid({
  longestStreakDays,
  currentStreakDays,
  topCategory,
  topCategoryCount,
  capsulesCreatedThisMonth,
  capsulesUnlockedThisMonth,
  photosAddedThisMonth,
}: RecapKpiGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 mb-6">
      <KpiCard
        title="Longest Streak"
        value={`${longestStreakDays}d`}
        subtitle="Best run this cycle"
        icon={<Flame className="text-orange-600 dark:text-orange-200" size={22} />}
        accentClass="bg-orange-100 dark:bg-orange-900/40"
      />
      <KpiCard
        title="Current Streak"
        value={`${currentStreakDays}d`}
        subtitle="Consecutive active days"
        icon={<Trophy className="text-emerald-600 dark:text-emerald-200" size={22} />}
        accentClass="bg-emerald-100 dark:bg-emerald-900/40"
      />
      <KpiCard
        title="Top Category"
        value={formatCategoryLabel(topCategory)}
        subtitle={
          topCategory
            ? `${topCategoryCount} completed challenge${topCategoryCount === 1 ? '' : 's'}`
            : 'Complete more to rank categories'
        }
        icon={<Trophy className="text-violet-600 dark:text-violet-200" size={22} />}
        accentClass="bg-violet-100 dark:bg-violet-900/40"
      />
      <KpiCard
        title="Photos Added"
        value={String(photosAddedThisMonth)}
        subtitle="Memories captured this month"
        icon={<ImagePlus className="text-fuchsia-600 dark:text-fuchsia-200" size={22} />}
        accentClass="bg-fuchsia-100 dark:bg-fuchsia-900/40"
      />
      <KpiCard
        title="Capsules Created"
        value={String(capsulesCreatedThisMonth)}
        subtitle="New messages locked in"
        icon={<Clock className="text-teal-600 dark:text-teal-200" size={22} />}
        accentClass="bg-teal-100 dark:bg-teal-900/40"
      />
      <KpiCard
        title="Capsules Unlocked"
        value={String(capsulesUnlockedThisMonth)}
        subtitle="Messages opened this month"
        icon={<Unlock className="text-indigo-600 dark:text-indigo-200" size={22} />}
        accentClass="bg-indigo-100 dark:bg-indigo-900/40"
      />
    </section>
  );
}
