import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type {
  UserChallenge,
  ChallengeStatus,
  Progress,
  ClearPendingChallengesResponse,
} from '../types';

export async function getUserChallenges(userId: number): Promise<UserChallenge[]> {
  return apiGet<UserChallenge[]>(`/user-challenges/user/${userId}`);
}

export async function getUserProgress(userId: number): Promise<Progress> {
  return apiGet<Progress>(`/user-challenges/user/${userId}/progress`);
}

export async function getUserChallengesByStatus(
  userId: number,
  status: ChallengeStatus
): Promise<UserChallenge[]> {
  return apiGet<UserChallenge[]>(`/user-challenges/user/${userId}/status?status=${status}`);
}

export async function joinChallenge(userId: number, challengeId: number): Promise<UserChallenge> {
  return apiPost<UserChallenge>(`/user-challenges/join?userId=${userId}&challengeId=${challengeId}`);
}

export async function markComplete(userChallengeId: number): Promise<UserChallenge> {
  return apiPut<UserChallenge>(`/user-challenges/${userChallengeId}/complete`);
}

export async function updateStatus(
  userChallengeId: number,
  status: ChallengeStatus
): Promise<UserChallenge> {
  return apiPut<UserChallenge>(`/user-challenges/${userChallengeId}/status?status=${status}`);
}

export async function getDailyChallenge(userId: number, mood: string): Promise<UserChallenge> {
  return apiGet<UserChallenge>(`/user-challenges/daily?userId=${userId}&mood=${mood}`);
}

export async function deleteUserChallenge(userChallengeId: number): Promise<void> {
  return apiDelete<void>(`/user-challenges/${userChallengeId}`);
}

export async function clearPendingChallenges(
  userId: number
): Promise<ClearPendingChallengesResponse> {
  return apiDelete<ClearPendingChallengesResponse>(`/user-challenges/clear-pending?userId=${userId}`);
}

export async function startChallenge(
  userId: number,
  challengeId: number,
  mood: string
): Promise<UserChallenge> {
  return apiPost<UserChallenge>(
    `/user-challenges/start?userId=${userId}&challengeId=${challengeId}&mood=${mood}`
  );
}
