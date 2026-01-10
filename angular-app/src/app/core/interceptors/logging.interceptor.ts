import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { ILogger } from '../interfaces/logger.interface';

/**
 * LoggingInterceptor - HTTP request/response logging interceptor.
 * Logs all HTTP requests and responses with timing information.
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  private logger = inject(ILogger);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    this.logRequest(req, requestId);

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.logResponse(event, requestId, startTime);
        }
      }),
      finalize(() => {
        const duration = performance.now() - startTime;
        this.logger.debug(`Request [${requestId}] completed in ${duration.toFixed(2)}ms`);
      })
    );
  }

  /**
   * Log HTTP request details.
   */
  private logRequest(req: HttpRequest<unknown>, requestId: string): void {
    const context = {
      id: requestId,
      method: req.method,
      url: req.url,
      hasBody: !!req.body,
    };

    this.logger.debug(`HTTP Request [${requestId}]`, context);
  }

  /**
   * Log HTTP response details.
   */
  private logResponse(
    response: HttpResponse<unknown>,
    requestId: string,
    startTime: number
  ): void {
    const duration = performance.now() - startTime;
    const context = {
      id: requestId,
      status: response.status,
      statusText: response.statusText,
      durationMs: duration.toFixed(2),
      url: response.url,
    };

    if (response.status < 300) {
      this.logger.debug(`HTTP Response [${requestId}]`, context);
    } else if (response.status < 400) {
      this.logger.info(`HTTP Response [${requestId}] (${response.status} redirect)`, context);
    } else {
      this.logger.warn(`HTTP Response [${requestId}] (${response.status} error)`, context);
    }
  }

  /**
   * Generate unique request ID for tracing.
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
