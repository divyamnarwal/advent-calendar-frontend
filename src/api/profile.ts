import { apiGet, apiPut } from './client';
import type {
  ProfileBadgesResponse,
  ProfileUpdatePayload,
  ThemePreference,
  UserProfile,
} from '../types';

export async function getProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/api/profile');
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<UserProfile> {
  return apiPut<UserProfile>('/api/profile', payload);
}

export async function updateProfileTheme(themePreference: ThemePreference): Promise<UserProfile> {
  return apiPut<UserProfile>('/api/profile/theme', { themePreference });
}

export async function getProfileBadges(): Promise<ProfileBadgesResponse> {
  return apiGet<ProfileBadgesResponse>('/api/profile/badges');
}
