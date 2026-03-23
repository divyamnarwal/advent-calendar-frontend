import { createElement } from 'react';
import { X, Lock } from 'lucide-react';
import type { ProfileBadge } from '../../types';
import { resolveBadgeIcon } from './badgeIcons';

interface BadgeDetailsModalProps {
  badge: ProfileBadge | null;
  onClose: () => void;
}

function BadgeDetailsIcon({ icon }: { icon: ProfileBadge['icon'] }) {
  return createElement(resolveBadgeIcon(icon), { size: 20 });
}

export function BadgeDetailsModal({ badge, onClose }: BadgeDetailsModalProps) {
  if (!badge) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
            <BadgeDetailsIcon icon={badge.icon} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close badge details"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{badge.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {badge.description}
        </p>

        <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
            Criteria
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{badge.criteria}</p>
        </div>

        <div className="mt-5">
          {badge.earned ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
              Earned
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-200 dark:bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-200">
              <Lock size={12} />
              Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
