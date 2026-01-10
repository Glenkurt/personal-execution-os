/**
 * ILogger - Interface for logging functionality.
 * Used for dependency injection of logging service.
 */
export abstract class ILogger {
  abstract info(message: string, context?: any): void;
  abstract warn(message: string, context?: any): void;
  abstract error(message: string, context?: any): void;
  abstract debug(message: string, context?: any): void;
}
