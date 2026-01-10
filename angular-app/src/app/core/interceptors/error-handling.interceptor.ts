import {
  Injectable,
  inject,
} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, finalize, mergeMap } from 'rxjs/operators';
import { ILogger } from '../interfaces/logger.interface';

/**
 * ErrorHandlingInterceptor - Global HTTP error handling with retry logic.
 * Implements exponential backoff retry strategy for transient errors.
 */
@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  private logger = inject(ILogger);

  private readonly MAX_RETRIES = 3;
  private readonly BACKOFF_DELAY = 1000;

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      // Retry with exponential backoff for transient errors
      catchError((error: HttpErrorResponse, source) => {
        if (this.isTransientError(error) && !this.hasReachedMaxRetries(req)) {
          const retryCount = this.getRetryCount(req);
          const delay = this.BACKOFF_DELAY * Math.pow(2, retryCount);

          this.logger.info(
            `Retrying request to ${req.url} (attempt ${retryCount + 1}/${this.MAX_RETRIES})`
          );

          const retryReq = req.clone();
          this.setRetryCount(retryReq, retryCount + 1);

          return timer(delay).pipe(mergeMap(() => next.handle(retryReq)));
        }

        // Log error
        this.logError(error, req);

        // Transform error to user-friendly format
        return throwError(() => this.transformError(error));
      })
    );
  }

  /**
   * Check if error is transient (can be retried).
   */
  private isTransientError(error: HttpErrorResponse): boolean {
    // Retry on network errors and specific HTTP status codes
    if (!error.status) {
      return true; // Network error
    }

    // Retry on 408 (Request Timeout), 429 (Too Many Requests), 5xx (Server Error)
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }

  /**
   * Check if max retries reached for request.
   */
  private hasReachedMaxRetries(req: HttpRequest<unknown>): boolean {
    return this.getRetryCount(req) >= this.MAX_RETRIES;
  }

  /**
   * Get current retry count from request.
   */
  private getRetryCount(req: HttpRequest<unknown>): number {
    const count = (req as any).__retryCount;
    return count ?? 0;
  }

  /**
   * Set retry count on request.
   */
  private setRetryCount(req: HttpRequest<unknown>, count: number): void {
    (req as any).__retryCount = count;
  }

  /**
   * Log HTTP error with context.
   */
  private logError(error: HttpErrorResponse, req: HttpRequest<unknown>): void {
    const context = {
      method: req.method,
      url: req.url,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
    };

    if (error.status >= 500) {
      this.logger.error(`Server error (${error.status}):`, context);
    } else if (error.status >= 400) {
      this.logger.warn(`Client error (${error.status}):`, context);
    } else {
      this.logger.error('HTTP error:', context);
    }
  }

  /**
   * Transform HTTP error to application error format.
   */
  private transformError(error: HttpErrorResponse): any {
    let errorMessage = 'An unexpected error occurred';

    if (!error.status) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid request. Please check your input.';
    } else if (error.status === 401) {
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 408) {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    return {
      status: error.status,
      message: errorMessage,
      originalError: error.error,
      timestamp: new Date(),
    };
  }
}
