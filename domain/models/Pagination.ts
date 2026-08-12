export interface PaginationOptions {
  /** Opaque cursor — event id for approved-events feed */
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export const DEFAULT_PAGE_SIZE = 20;
