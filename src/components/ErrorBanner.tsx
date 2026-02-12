import { XCircle, RotateCcw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
      <XCircle className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-red-800 dark:text-red-200 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
