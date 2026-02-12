import type { ThemePreference } from '../../types';

interface ThemePreferenceSelectorProps {
  currentPreference: ThemePreference;
  isUpdating: boolean;
  onChange: (nextPreference: ThemePreference) => void;
}

const THEME_OPTIONS: Array<{ label: string; value: ThemePreference; description: string }> = [
  {
    label: 'System',
    value: 'SYSTEM',
    description: 'Follow your device theme automatically.',
  },
  {
    label: 'Light',
    value: 'LIGHT',
    description: 'Keep the interface bright.',
  },
  {
    label: 'Dark',
    value: 'DARK',
    description: 'Use a low-light friendly interface.',
  },
];

export function ThemePreferenceSelector({
  currentPreference,
  isUpdating,
  onChange,
}: ThemePreferenceSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {THEME_OPTIONS.map((option) => {
        const isActive = option.value === currentPreference;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={isUpdating}
            className={`rounded-xl border px-3 py-3 text-left transition-all ${
              isActive
                ? 'border-violet-400 bg-violet-100/90 dark:border-violet-600 dark:bg-violet-900/40'
                : 'border-gray-200 bg-white/70 dark:border-gray-700 dark:bg-gray-800/70 hover:border-violet-300 dark:hover:border-violet-500'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{option.label}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
