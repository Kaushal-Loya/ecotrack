// Shared TypeScript types for the API

export type Category = 'transport' | 'diet' | 'energy' | 'shopping';

export interface JwtPayload {
  sub: string;  // user id
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
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

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface InsightTip {
  category: Category;
  title: string;
  description: string;
  potentialSavingKg: number;
  actionUrl?: string;
}
