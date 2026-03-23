import { createElement } from 'react';
import { Lock } from 'lucide-react';
import type { ProfileBadge } from '../../types';
import { resolveBadgeIcon } from './badgeIcons';

interface BadgeCardProps {
  badge: ProfileBadge;
  onClick: (badge: ProfileBadge) => void;
}

function BadgeCardIcon({ icon }: { icon: ProfileBadge['icon'] }) {
  return createElement(resolveBadgeIcon(icon), { size: 18 });
}

export function BadgeCard({ badge, onClick }: BadgeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(badge)}
      title={badge.description}
      className={`relative rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        badge.earned
          ? 'border-violet-200 dark:border-violet-700/70 bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 dark:from-violet-900/30 dark:via-pink-900/20 dark:to-rose-900/25'
          : 'border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/70 grayscale'
      } ${badge.newlyUnlocked ? 'badge-unlock-highlight' : ''}`}
    >
      {!badge.earned && (
        <span className="absolute right-3 top-3 rounded-full bg-gray-200 dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-300">
          <Lock size={12} />
        </span>
      )}

      <div
        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
          badge.earned
            ? 'bg-white/90 dark:bg-gray-900/70 text-violet-600 dark:text-violet-300'
            : 'bg-white/70 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
        }`}
      >
        <BadgeCardIcon icon={badge.icon} />
      </div>

      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{badge.title}</p>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
        {badge.description}
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
        {badge.earned ? 'Earned' : 'Locked'}
      </p>
    </button>
  );
}
