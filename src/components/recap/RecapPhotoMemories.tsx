interface RecapPhotoMemoriesProps {
  photos: Array<{
    id: number;
    secureUrl: string;
    caption?: string | null;
  }>;
  onDeletePhoto?: (photoId: number) => Promise<void> | void;
  deletingPhotoIds?: number[];
}

export function RecapPhotoMemories({
  photos,
  onDeletePhoto,
  deletingPhotoIds = [],
}: RecapPhotoMemoriesProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="mt-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Photo Memories</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos.map((photo) => (
          <article
            key={photo.id}
            className="recap-photo-card relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft"
          >
            {onDeletePhoto && (
              <button
                type="button"
                className="absolute right-2 top-2 z-10 rounded-md bg-red-600/90 px-2 py-1 text-[11px] font-medium text-white backdrop-blur transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => void onDeletePhoto(photo.id)}
                disabled={deletingPhotoIds.includes(photo.id)}
                aria-label="Delete photo"
              >
                {deletingPhotoIds.includes(photo.id) ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <img
              src={photo.secureUrl}
              alt={photo.caption || 'Memory photo'}
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
            {photo.caption && (
              <p className="text-xs text-gray-600 dark:text-gray-300 px-3 py-2">
                {photo.caption}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
