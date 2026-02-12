import { apiGet, apiPost } from './client';
import type { User } from '../types';

export interface CreateUserData {
  name: string;
  email: string;
  country: 'INDIA' | 'RUSSIA' | 'GLOBAL';
}

export async function getAllUsers(): Promise<User[]> {
  return apiGet<User[]>('/users');
}

export async function getUserById(id: number): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

export async function createUser(data: CreateUserData): Promise<User> {
  return apiPost<User>('/users', data);
}

export async function findOrCreateUser(
  name: string,
  email: string,
  country: 'INDIA' | 'RUSSIA' | 'GLOBAL'
): Promise<User> {
  // Try to find existing user by email
  const users = await getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    return existing;
  }

  // Create new user
  return createUser({ name, email, country });
}
