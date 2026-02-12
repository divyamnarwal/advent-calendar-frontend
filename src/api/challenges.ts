import { apiGet, apiPost } from './client';
import type { Challenge, Mood } from '../types';

export interface ChallengeFilters {
  category?: string;
  energyLevel?: string;
  culture?: string;
}

export async function getAllChallenges(filters?: ChallengeFilters): Promise<Challenge[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.energyLevel) params.append('energyLevel', filters.energyLevel);
  if (filters?.culture) params.append('culture', filters.culture);

  const query = params.toString();
  return apiGet<Challenge[]>(`/challenges${query ? `?${query}` : ''}`);
}

export async function getChallengeById(id: number): Promise<Challenge> {
  return apiGet<Challenge>(`/challenges/${id}`);
}

export async function getChallengesByCategory(category: string): Promise<Challenge[]> {
  return apiGet<Challenge[]>(`/challenges/category/${category}`);
}

export async function getTodayChallenge(userId: number, mood: Mood): Promise<Challenge> {
  return apiGet<Challenge>(`/challenges/today?userId=${userId}&mood=${mood}`);
}

export async function getTodayChallengePreview(userId: number, mood: Mood): Promise<Challenge> {
  return apiGet<Challenge>(`/challenges/today/preview?userId=${userId}&mood=${mood}`);
}

export interface CreateChallengeData {
  title: string;
  description: string;
  category: string;
  energyLevel: string;
  culture: string;
  active: boolean;
}

export async function createChallenge(data: CreateChallengeData): Promise<Challenge> {
  return apiPost<Challenge>('/challenges', data);
}
