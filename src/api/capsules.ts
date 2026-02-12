import { apiGet, apiPost } from './client';
import type { TimeCapsule } from '../types';

export interface CreateCapsuleData {
  userId: number;
  content: string;
  revealDate: string;
}

export async function createTimeCapsule(data: CreateCapsuleData): Promise<TimeCapsule> {
  return apiPost<TimeCapsule>(`/time-capsules?userId=${data.userId}`, {
    content: data.content,
    revealDate: new Date(data.revealDate).toISOString(),
  });
}

export async function getPendingCapsules(userId: number): Promise<TimeCapsule[]> {
  return apiGet<TimeCapsule[]>(`/time-capsules/pending?userId=${userId}`);
}

export async function getRevealedCapsules(userId: number): Promise<TimeCapsule[]> {
  return apiGet<TimeCapsule[]>(`/time-capsules/revealed?userId=${userId}`);
}
