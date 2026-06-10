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
  TokenPair,
  InsightTip,
  PaginatedMeta,
};

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
