import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { transformSnakeToCamelCase } from '../utils/transform.util';

/**
 * ResponseTransformInterceptor - Transforms API responses from snake_case to camelCase.
 * This ensures consistency with Angular naming conventions throughout the application.
 */
@Injectable()
export class ResponseTransformInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      map((event) => {
        // Only transform successful HTTP responses with 2xx status
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          const transformedBody = transformSnakeToCamelCase(event.body);
          return event.clone({ body: transformedBody });
        }

        return event;
      })
    );
  }
}
