import { Sparkles, X } from 'lucide-react';
import type { ProfileBadge } from '../../types';
import { resolveBadgeIcon } from './badgeIcons';

interface BadgeUnlockCelebrationProps {
  badges: ProfileBadge[];
  isOpen: boolean;
  onClose: () => void;
}

const CONFETTI_COLORS = ['#f97316', '#ec4899', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];

export function BadgeUnlockCelebration({ badges, isOpen, onClose }: BadgeUnlockCelebrationProps) {
  if (!isOpen || badges.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 28 }).map((_, index) => (
            <span
              key={index}
              className="confetti-piece"
              style={{
                left: `${(index * 13) % 100}%`,
                animationDelay: `${(index % 7) * 90}ms`,
                backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Close unlock dialog"
        >
          <X size={16} />
        </button>

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Sparkles size={14} />
            Badge Unlocked
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Achievement unlocked!
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            You earned new badge rewards. Keep the momentum going.
          </p>

          <div className="mt-5 space-y-3">
            {badges.map((badge) => {
              const Icon = resolveBadgeIcon(badge.icon);
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 rounded-xl border border-violet-200 dark:border-violet-700/60 bg-violet-50/85 dark:bg-violet-900/25 p-3"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-300">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {badge.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-pink-500 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
