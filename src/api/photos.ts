import { apiDelete, apiGet, apiPost } from './client';
import type { Photo } from '../types';

interface PhotoUploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
}

interface CreatePhotoPayload {
  publicId: string;
  secureUrl: string;
  caption?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  takenAt?: string;
}

export async function getPhotoUploadSignature(): Promise<PhotoUploadSignatureResponse> {
  return apiGet<PhotoUploadSignatureResponse>('/photos/upload-signature');
}

export async function createPhotoRecord(payload: CreatePhotoPayload): Promise<Photo> {
  return apiPost<Photo>('/photos', payload);
}

export async function getPhotos(month?: string): Promise<Photo[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiGet<Photo[]>(`/photos${query}`);
}

export async function deletePhoto(photoId: number): Promise<void> {
  return apiDelete<void>(`/photos/${photoId}`);
}

export async function uploadPhoto(file: File, caption?: string): Promise<Photo> {
  const signature = await getPhotoUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Cloudinary upload failed');
  }

  const uploaded = (await response.json()) as CloudinaryUploadResponse;
  return createPhotoRecord({
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    caption,
    format: uploaded.format,
    width: uploaded.width,
    height: uploaded.height,
    bytes: uploaded.bytes,
  });
}
