import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight, Download, ImageOff, RefreshCw } from 'lucide-react';
import { Navigation } from '../components/Navigation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';
const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE as string | undefined;
const PLACEHOLDER_ASPECT_RATIO = '4 / 5';
const SKELETON_RATIOS = ['4 / 5', '1 / 1', '3 / 4', '5 / 4', '4 / 6', '6 / 5', '4 / 5', '3 / 5'];

export interface Photo {
  id: number | string;
  secureUrl: string | null;
  caption: string | null;
  takenAt: string;
  width: number;
  height: number;
}

function getCurrentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1, 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function shiftMonth(month: string, direction: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const shifted = new Date(year, monthNumber - 1 + direction, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getDownloadUrl(secureUrl: string): string {
  return secureUrl.replace('/upload/', '/upload/fl_attachment/');
}

function RecapSkeletonCard({ aspectRatio }: { aspectRatio: string }) {
  return (
    <div className="mb-4 break-inside-avoid sm:mb-5">
      <div
        className="animate-pulse overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/65 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.32)] dark:border-white/10 dark:bg-slate-900/60"
        style={{ aspectRatio }}
      >
        <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/70 px-6 py-14 text-center shadow-[0_22px_60px_-28px_rgba(15,23,42,0.32)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <ImageOff size={28} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quiet month so far</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
        No photos yet this month. Start capturing memories!
      </p>
    </section>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="rounded-[2rem] border border-rose-200/80 bg-white/80 px-6 py-10 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.32)] backdrop-blur dark:border-rose-500/30 dark:bg-slate-900/75">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
            Unable to load recap
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700 dark:text-slate-300">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    </section>
  );
}

function PhotoCard({ photo, onDownload }: { photo: Photo; onDownload: (photo: Photo) => void }) {
  const hasImage = Boolean(photo.secureUrl);
  const aspectRatio =
    photo.width > 0 && photo.height > 0
      ? `${photo.width} / ${photo.height}`
      : PLACEHOLDER_ASPECT_RATIO;

  return (
    <article className="group mb-4 break-inside-avoid sm:mb-5">
      <div className="overflow-hidden rounded-[1.4rem] border border-white/75 bg-white/75 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.32)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        {hasImage ? (
          <div className="relative">
            <img
              src={photo.secureUrl ?? undefined}
              alt={
                photo.caption ||
                `Advent recap photo from ${new Date(photo.takenAt).toLocaleDateString('en-US')}`
              }
              className="block h-auto w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              width={photo.width}
              height={photo.height}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <button
              type="button"
              aria-label="Download photo"
              onClick={() => onDownload(photo)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-900 opacity-0 shadow-lg transition duration-300 hover:bg-white group-hover:opacity-100"
            >
              <Download size={16} />
            </button>

            {photo.caption ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="truncate text-sm font-medium text-white">{photo.caption}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className="flex items-center justify-center bg-slate-200/90 px-4 text-center dark:bg-slate-800/90"
            style={{ aspectRatio: aspectRatio || PLACEHOLDER_ASPECT_RATIO }}
          >
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-slate-600 backdrop-blur dark:bg-slate-900/75 dark:text-slate-200">
              Photo expired
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function RecapPage() {
  const { getToken, isLoaded } = useAuth();
  const currentMonth = useMemo(() => getCurrentMonthValue(), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const controller = new AbortController();

    const loadPhotos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = CLERK_JWT_TEMPLATE
          ? await getToken({ template: CLERK_JWT_TEMPLATE })
          : await getToken();

        if (!token) {
          throw new Error('Your session has expired. Please sign in again.');
        }

        const response = await fetch(
          `${API_BASE_URL}/photos?month=${encodeURIComponent(selectedMonth)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to load your monthly recap.');
        }

        const data = (await response.json()) as Photo[];
        setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load your monthly recap.');
        setPhotos([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadPhotos();

    return () => {
      controller.abort();
    };
  }, [getToken, isLoaded, reloadKey, selectedMonth]);

  const monthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);
  const isOnCurrentMonth = selectedMonth === currentMonth;

  const handleRetry = () => {
    setReloadKey((value) => value + 1);
  };

  const handleDownload = (photo: Photo) => {
    if (!photo.secureUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = getDownloadUrl(photo.secureUrl);
    link.download = `advent-photo-${photo.id}.jpg`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(254,240,138,0.45),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(251,113,133,0.2),_transparent_32%),linear-gradient(180deg,_#fff9ef_0%,_#f8f2ff_48%,_#eef6ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_50%,_#172033_100%)]">
      <Navigation />

      <main className="relative md:ml-64 pb-36 md:pb-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.85),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55 sm:p-7">
            <div className="absolute inset-0 pointer-events-none" />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
                    Monthly Photo Recap
                  </p>
                  <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                    A living collage of this month&apos;s memories.
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                    Browse the month like a photo wall, drift through the tall moments, and save the
                    ones you want to keep close.
                  </p>
                </div>

                {!isLoading ? (
                  <div className="inline-flex w-fit items-center rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                    {photos.length} photos
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4 rounded-[1.6rem] border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/65 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-slate-100/90 px-2 py-2 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth((value) => shiftMonth(value, -1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="min-w-[12rem] px-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Selected Month
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {monthLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMonth((value) => shiftMonth(value, 1))}
                    disabled={isOnCurrentMonth}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:bg-white/60 disabled:text-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:bg-slate-900/70 dark:disabled:text-slate-600"
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isOnCurrentMonth
                    ? 'You are viewing the current month.'
                    : 'Step backward or forward through your recap.'}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            {error ? (
              <ErrorState message={error} onRetry={handleRetry} />
            ) : isLoading ? (
              <div className="columns-2 gap-4 [column-gap:1rem] md:columns-3 md:[column-gap:1.25rem]">
                {SKELETON_RATIOS.map((ratio, index) => (
                  <RecapSkeletonCard key={`${ratio}-${index}`} aspectRatio={ratio} />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="columns-2 gap-4 [column-gap:1rem] md:columns-3 md:[column-gap:1.25rem]">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} onDownload={handleDownload} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
