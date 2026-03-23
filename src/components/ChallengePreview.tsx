import { ArrowLeft, Play, Flame } from 'lucide-react';
import type { Challenge, Mood } from '../types';

interface ChallengePreviewProps {
  challenge: Challenge;
  mood?: Mood;
  onAccept: () => void;
  onDecline: () => void;
  isStarting: boolean;
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

export function ChallengePreview({
  challenge,
  mood,
  onAccept,
  onDecline,
  isStarting,
}: ChallengePreviewProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-serif">
          Your Challenge
        </h3>
        {mood && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
            Mood: {mood}
          </span>
        )}
      </div>

      {/* Category Badge */}
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
          categoryColors[challenge.category] ||
          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}
      >
        {categoryLabels[challenge.category] || challenge.category}
      </span>

      {/* Title */}
      <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        {challenge.title}
      </h4>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        {challenge.description}
      </p>

      {/* Energy Level */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Flame size={16} />
        <span>
          Energy Level:{' '}
          <span className="font-semibold">
            {energyLabels[challenge.energyLevel] || challenge.energyLevel}
          </span>
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onDecline}
          disabled={isStarting}
          className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onAccept}
          disabled={isStarting}
          className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isStarting ? (
            <>Starting...</>
          ) : (
            <>
              <Play size={18} />
              Start Challenge
            </>
          )}
        </button>
      </div>
    </>
  );
}
