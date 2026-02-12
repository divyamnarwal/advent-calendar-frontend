import { apiGet } from './client';
import type { MonthlyRecapResponse } from '../types';
import { parseMonthlyRecapResponse } from '../utils/recap';

export async function getMonthlyRecap(month?: string): Promise<MonthlyRecapResponse> {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  const payload = await apiGet<unknown>(`/recap/monthly${query}`);
  return parseMonthlyRecapResponse(payload);
}
