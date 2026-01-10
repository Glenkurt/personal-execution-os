/**
 * Generic API response types and error handling models.
 * Used for standardized API communication across the application.
 */

/**
 * Standard successful API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
}

/**
 * Standard API error response wrapper.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
  timestamp?: string;
}

/**
 * Paginated response for list endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * HTTP error details for error handling.
 */
export interface HttpErrorDetails {
  status: number;
  statusText: string;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

/**
 * Service result wrapper for operation success/failure.
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Type guard to check if response is an error.
 */
export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'message' in response
  );
}
