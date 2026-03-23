export type Mood = 'LOW' | 'NEUTRAL' | 'HIGH';

export type Country = 'INDIA' | 'RUSSIA' | 'GLOBAL';

export type Category =
  | 'EXPLORE_CITY'
  | 'TREND_BASED'
  | 'CAMPUS_LIFE'
  | 'SOCIAL_SPARK'
  | 'CULTURAL_EXCHANGE'
  | 'WILDCARD';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ChallengeStatus = 'ASSIGNED' | 'COMPLETED';

export interface User {
  id: number;
  name: string;
  email: string;
  country: Country;
}

export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  streak: number;
  totalPoints: number;
  badges: string[];
  themePreference: ThemePreference;
  newlyUnlockedBadgeIds: string[];
}

export interface ProfileUpdatePayload {
  name?: string;
  avatar?: string | null;
}

export interface ProfileBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
  earned: boolean;
  newlyUnlocked: boolean;
}

export interface ProfileBadgesResponse {
  badges: ProfileBadge[];
  earnedBadges: ProfileBadge[];
  newlyUnlockedBadgeIds: string[];
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: Category;
  energyLevel: EnergyLevel;
  culture: string;
  active: boolean;
}

export interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  status: ChallengeStatus;
  assignedDate?: string;
  startTime?: string;
  completionTime?: string;
  challenge?: Challenge;
}

export interface TimeCapsule {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  revealDate: string;
  revealed: boolean;
  revealable: boolean;
}

export interface Photo {
  id: number;
  userId: number;
  publicId: string;
  secureUrl: string;
  caption?: string | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  takenAt?: string | null;
  createdAt: string;
}

export interface RecapPhotoPreview {
  id: number;
  secureUrl: string;
  caption?: string | null;
  createdAt: string;
}

export interface MonthlyRecapResponse {
  month: string;
  rangeStart: string;
  rangeEnd: string;
  totalAssignedThisMonth: number;
  totalCompletedThisMonth: number;
  currentStreakDays: number;
  longestStreakDays: number;
  topCategory?: string | null;
  topCategoryCount: number;
  capsulesCreatedThisMonth: number;
  capsulesUnlockedThisMonth: number;
  photosAddedThisMonth: number;
  recentPhotos: RecapPhotoPreview[];
  generatedAt: string;
}

export interface Progress {
  totalAssigned: number;
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ClearPendingChallengesResponse {
  deletedCount: number;
  message: string;
}

export interface PulseStats {
  date: string;
  totalParticipants: number;
  totalChallengesCompleted: number;
  activeParticipants?: PulseParticipant[];
}

export interface PulseParticipant {
  id: number;
  name: string;
  country: Country;
}

export interface ParticipantView {
  id: number;
  name: string;
  initials: string;
  culture: string;
}

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  country: Country;
}

export interface DayTile {
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  isLocked: boolean;
  isPast: boolean;
  userChallenge?: UserChallenge;
}

export interface CategoryCount {
  category: Category;
  count: number;
}

export interface MoodCount {
  mood: Mood;
  count: number;
}
