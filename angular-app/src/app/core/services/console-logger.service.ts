import { Injectable } from '@angular/core';
import { ILogger } from '../interfaces/logger.interface';

/**
 * ConsoleLoggerService - Simple console-based implementation of ILogger.
 * Logs messages to browser console with appropriate styling.
 */
@Injectable({
  providedIn: 'root',
})
export class ConsoleLoggerService implements ILogger {
  private readonly prefix = '[App]';

  /**
   * Log info level message.
   */
  info(message: string, context?: any): void {
    const output = this.formatMessage(message, context);
    console.log(`%c${this.prefix} INFO`, 'color: #2563eb; font-weight: bold;', output);
  }

  /**
   * Log warning level message.
   */
  warn(message: string, context?: any): void {
    const output = this.formatMessage(message, context);
    console.warn(`%c${this.prefix} WARN`, 'color: #f59e0b; font-weight: bold;', output);
  }

  /**
   * Log error level message.
   */
  error(message: string, context?: any): void {
    const output = this.formatMessage(message, context);
    console.error(`%c${this.prefix} ERROR`, 'color: #dc2626; font-weight: bold;', output);
  }

  /**
   * Log debug level message.
   */
  debug(message: string, context?: any): void {
    const output = this.formatMessage(message, context);
    console.debug(`%c${this.prefix} DEBUG`, 'color: #6366f1; font-weight: bold;', output);
  }

  /**
   * Format log message with optional context.
   */
  private formatMessage(message: string, context?: any): string {
    if (!context) {
      return message;
    }

    if (typeof context === 'object') {
      return `${message} ${JSON.stringify(context)}`;
    }

    return `${message} ${context}`;
  }
}
