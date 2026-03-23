import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * Targets ~400KB max, capped at 1200px on the longest side.
 * Falls back to the original file if compression fails.
 */
export async function compressImage(file: File): Promise<File> {
  // Skip compression for non-image files or already-small files (under 300KB)
  if (!file.type.startsWith('image/') || file.size < 300 * 1024) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: file.type as string,
    });
    return compressed;
  } catch {
    // If compression fails for any reason, upload the original
    return file;
  }
}
