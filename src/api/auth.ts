import { apiGet, apiPost } from './client';
import type { Country, User } from '../types';

export interface EnsureAuthUserData {
  name: string;
  email: string;
  country: Country;
}

export async function ensureAuthUser(data: EnsureAuthUserData): Promise<User> {
  return apiPost<User>('/auth/ensure-user', data);
}

export async function getAuthUser(): Promise<User> {
  return apiGet<User>('/auth/me');
}
