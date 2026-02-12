import type { MonthlyRecapResponse } from '../types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isRecapPhotoArray(value: unknown): value is MonthlyRecapResponse['recentPhotos'] {
  return Array.isArray(value) && value.every((item) => {
    if (!isObject(item)) return false;
    return (
      isNumber(item.id) &&
      isString(item.secureUrl) &&
      (item.caption === undefined || item.caption === null || isString(item.caption)) &&
      isString(item.createdAt)
    );
  });
}

export function parseMonthlyRecapResponse(value: unknown): MonthlyRecapResponse {
  if (!isObject(value)) {
    throw new Error('Recap payload is not an object');
  }

  if (
    !isString(value.month) ||
    !isString(value.rangeStart) ||
    !isString(value.rangeEnd) ||
    !isNumber(value.totalAssignedThisMonth) ||
    !isNumber(value.totalCompletedThisMonth) ||
    !isNumber(value.currentStreakDays) ||
    !isNumber(value.longestStreakDays) ||
    (value.topCategory !== undefined && value.topCategory !== null && !isString(value.topCategory)) ||
    !isNumber(value.topCategoryCount) ||
    !isNumber(value.capsulesCreatedThisMonth) ||
    !isNumber(value.capsulesUnlockedThisMonth) ||
    !isNumber(value.photosAddedThisMonth) ||
    !isRecapPhotoArray(value.recentPhotos) ||
    !isString(value.generatedAt)
  ) {
    throw new Error('Recap payload shape is invalid');
  }

  return {
    month: value.month,
    rangeStart: value.rangeStart,
    rangeEnd: value.rangeEnd,
    totalAssignedThisMonth: value.totalAssignedThisMonth,
    totalCompletedThisMonth: value.totalCompletedThisMonth,
    currentStreakDays: value.currentStreakDays,
    longestStreakDays: value.longestStreakDays,
    topCategory: value.topCategory ?? null,
    topCategoryCount: value.topCategoryCount,
    capsulesCreatedThisMonth: value.capsulesCreatedThisMonth,
    capsulesUnlockedThisMonth: value.capsulesUnlockedThisMonth,
    photosAddedThisMonth: value.photosAddedThisMonth,
    recentPhotos: value.recentPhotos,
    generatedAt: value.generatedAt,
  };
}
