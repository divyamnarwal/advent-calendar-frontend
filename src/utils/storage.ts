import type { StoredUser } from '../types';

const STORAGE_KEYS = {
  USER: 'advent.user',
  API_BASE: 'advent.apiBase',
} as const;

export function getStoredUser(): StoredUser | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getApiBase(): string | null {
  return localStorage.getItem(STORAGE_KEYS.API_BASE);
}

export function setApiBase(url: string): void {
  localStorage.setItem(STORAGE_KEYS.API_BASE, url);
}
