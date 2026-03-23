import { CheckCircle2, Clock, Flame } from 'lucide-react';
import type { Challenge, UserChallenge, Mood } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  mood?: Mood;
  userChallenge?: UserChallenge;
  onComplete?: () => void;
  isCompleting?: boolean;
  showMood?: boolean;
}

const categoryLabels: Record<string, string> = {
  EXPLORE_CITY: 'Explore City',
  TREND_BASED: 'Trend Based',
  CAMPUS_LIFE: 'Campus Life',
  SOCIAL_SPARK: 'Social Spark',
  CULTURAL_EXCHANGE: 'Cultural Exchange',
  WILDCARD: 'Wildcard',
};

const categoryColors: Record<string, string> = {
  EXPLORE_CITY: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  TREND_BASED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  CAMPUS_LIFE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  SOCIAL_SPARK: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  CULTURAL_EXCHANGE: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  WILDCARD: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
};

const energyLabels: Record<string, string> = {
  LOW: 'Chill',
  MEDIUM: 'Moderate',
  HIGH: 'Energetic',
};

export function ChallengeCard({
  challenge,
  mood,
  userChallenge,
  onComplete,
  isCompleting = false,
  showMood = false,
}: ChallengeCardProps) {
  const isCompleted = userChallenge?.status === 'COMPLETED';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 border border-gray-100 dark:border-gray-700 card-hover">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            categoryColors[challenge.category] ||
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {categoryLabels[challenge.category] || challenge.category}
        </span>
        {showMood && mood && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
            Mood: {mood}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 font-serif">
        {challenge.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <Flame size={16} />
          {energyLabels[challenge.energyLevel] || challenge.energyLevel}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {challenge.culture}
        </span>
      </div>

      {/* Action */}
      {isCompleted ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
          <CheckCircle2 size={20} />
          <span>Completed!</span>
        </div>
      ) : (
        onComplete && (
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? 'Marking Complete...' : 'Mark Complete'}
          </button>
        )
      )}
    </div>
  );
}
