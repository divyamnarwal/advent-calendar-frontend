import { BatteryLow, Zap, Flame } from 'lucide-react';
import type { Mood } from '../types';

interface MoodSelectorProps {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
  disabled?: boolean;
}

const moods: { value: Mood; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'LOW',
    label: 'Chill',
    icon: <BatteryLow size={24} />,
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-800',
  },
  {
    value: 'NEUTRAL',
    label: 'Balanced',
    icon: <Zap size={24} />,
    color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 border-violet-200 dark:border-violet-800',
  },
  {
    value: 'HIGH',
    label: 'Energetic',
    icon: <Flame size={24} />,
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800',
  },
];

export function MoodSelector({ selected, onSelect, disabled = false }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        How are you feeling today?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onSelect(mood.value)}
            disabled={disabled}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-lift'}
              ${
                selected === mood.value
                  ? `ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-[#1a1025] ${mood.color}`
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
              }
            `}
          >
            {mood.icon}
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
