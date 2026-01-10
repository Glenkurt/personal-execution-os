import { TestBed } from '@angular/core/testing';
import { ConsoleLoggerService } from './console-logger.service';
import { ILogger } from '../interfaces/logger.interface';

describe('ConsoleLoggerService', () => {
  let service: ConsoleLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ILogger, useClass: ConsoleLoggerService }],
    });

    service = TestBed.inject(ILogger) as ConsoleLoggerService;

    // Mock console methods
    spyOn(console, 'log');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    spyOn(console, 'debug');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log info messages to console.log', () => {
    service.info('Test info message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log warning messages to console.warn', () => {
    service.warn('Test warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages to console.error', () => {
    service.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('should log debug messages to console.debug', () => {
    service.debug('Test debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  it('should include context in log messages', () => {
    const context = { userId: 123, action: 'test' };
    service.info('User action', context);

    expect(console.log).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.any(String),
      jasmine.stringContaining('userId')
    );
  });

  it('should format simple context values', () => {
    service.info('Test', 'simple value');
    expect(console.log).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), jasmine.stringContaining('simple value'));
  });

  it('should handle messages without context', () => {
    service.info('Message without context');
    expect(console.log).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), jasmine.stringContaining('Message without context'));
  });

  it('should provide ILogger interface implementation', () => {
    const logger = TestBed.inject(ILogger);
    expect(logger).toBeTruthy();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});
