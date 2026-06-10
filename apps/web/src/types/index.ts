import type {
  Category,
  FootprintBreakdown,
  TokenPair,
  InsightTip,
  PaginatedMeta,
} from '@carbon/shared';

export type {
  Category,
  FootprintBreakdown,
  TokenPair as Tokens,
  InsightTip,
  PaginatedMeta,
};

export interface User {
  id: string;
  email: string;
  name: string | null;
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
  currentKg: number;
  progressPercent: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginatedMeta;
}
