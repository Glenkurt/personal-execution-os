import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import {
  ErrorHandlingInterceptor,
  LoggingInterceptor,
  ResponseTransformInterceptor,
} from './core/interceptors';
import { ILogger } from './core/interfaces';
import { ConsoleLoggerService } from './core/services/console-logger.service';

/**
 * Angular application configuration with standalone APIs.
 * Configures routing, HTTP client, animations, logging, and interceptors.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable zoneless change detection for better performance
    importProvidersFrom(),

    // Router configuration with routes
    provideRouter(routes),

    // HTTP client with interceptors
    provideHttpClient(withInterceptors([])),

    // Register HTTP interceptors (order matters: logging → response transform → error handling)
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ResponseTransformInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true },

    // Register logging service
    { provide: ILogger, useClass: ConsoleLoggerService },

    // Enable animations support
    provideAnimations(),
  ],
};
