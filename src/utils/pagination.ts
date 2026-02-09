/**
 * Pagination Utility
 * Provides consistent pagination handling across all list endpoints
 */

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Extract and validate pagination parameters from query string
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Parsed pagination params with defaults
 */
export const parsePaginationParams = (
  page?: number | string,
  limit?: number | string
): { skip: number; limit: number; page: number } => {
  let parsedPage = 1;
  let parsedLimit = 10;

  if (page) {
    const p = typeof page === 'string' ? parseInt(page, 10) : page;
    parsedPage = Math.max(1, p); // Ensure page is at least 1
  }

  if (limit) {
    const l = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    parsedLimit = Math.min(Math.max(1, l), 100); // Ensure between 1-100
  }

  const skip = (parsedPage - 1) * parsedLimit;

  return { skip, limit: parsedLimit, page: parsedPage };
};

/**
 * Build pagination metadata
 * @param totalItems - Total number of items in collection
 * @param currentPage - Current page number
 * @param pageSize - Items per page
 * @returns Pagination metadata object
 */
export const buildPaginationMetadata = (
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginationMetadata => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/**
 * Create paginated response
 * @param data - Array of items to return
 * @param totalItems - Total items in collection
 * @param currentPage - Current page
 * @param pageSize - Items per page
 * @returns Paginated response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginatedResponse<T> => {
  return {
    data,
    pagination: buildPaginationMetadata(totalItems, currentPage, pageSize),
  };
};
