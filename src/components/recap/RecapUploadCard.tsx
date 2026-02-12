import { ImagePlus, RefreshCcw } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface RecapUploadCardProps {
  caption: string;
  onCaptionChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  isUploading: boolean;
  uploadError: string | null;
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
}

export function RecapUploadCard({
  caption,
  onCaptionChange,
  onUpload,
  isUploading,
  uploadError,
  onRefresh,
  isRefreshing,
}: RecapUploadCardProps) {
  return (
    <section className="rounded-2xl p-6 mb-6 bg-white/95 dark:bg-gray-800/95 border border-gray-100 dark:border-gray-700 shadow-soft">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <ImagePlus className="text-violet-600 dark:text-violet-200" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Photo Memory</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload moments for this month recap</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={isRefreshing || isUploading}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-200 dark:border-violet-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-violet-700 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={caption}
          onChange={(event) => onCaptionChange(event.target.value)}
          placeholder="Optional caption"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
          disabled={isUploading}
        />

        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={isUploading}
            className="hidden"
          />
          <span className="inline-flex w-full items-center justify-center px-4 py-3 rounded-xl border border-dashed border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 font-medium cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
            {isUploading ? 'Uploading...' : 'Choose Photo'}
          </span>
        </label>

        {uploadError && (
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        )}
      </div>
    </section>
  );
}
