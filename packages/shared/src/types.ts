export type Category = 'transport' | 'diet' | 'energy' | 'shopping';

export interface FootprintBreakdown {
  transport: number;
  diet: number;
  energy: number;
  shopping: number;
  total: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface InsightTip {
  category: Category;
  title: string;
  description: string;
  potentialSavingKg: number;
  actionUrl?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
