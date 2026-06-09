// Shared TypeScript types for the web app

export type Category = 'transport' | 'diet' | 'energy' | 'shopping';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface FootprintBreakdown {
  transport: number;
  diet: number;
  energy: number;
  shopping: number;
  total: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  category: Category;
  subtype: string;
  amount: number;
  unit: string;
  co2Kg: number;
  loggedAt: string;
  note?: string;
}

export interface InsightTip {
  category: Category;
  title: string;
  description: string;
  potentialSavingKg: number;
  actionUrl?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetKg: number;
  baselineKg: number;
  deadline: string;
  achieved: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed by the server
  currentKg: number;
  progressPercent: number;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginatedMeta;
}
