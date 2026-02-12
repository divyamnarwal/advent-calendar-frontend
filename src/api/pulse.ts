import { apiGet } from './client';
import type { PulseStats } from '../types';

export async function getPulseToday(): Promise<PulseStats> {
  return apiGet<PulseStats>('/pulse/today');
}
