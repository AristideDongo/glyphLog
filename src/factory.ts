import { Logger } from './loggers';
import { ConsoleTransport, FileTransport } from './transports';
import { LogLevel } from './types/enums/log-level.enum';
import { LoggerConfig } from './types/logger/logger-config.interface';
import { LoggerFactoryOptions } from './types/logger/logger-factory-options.interface';
import { TypedLogger } from './types/logger/typed-logger.interface';

/**
 * Logger factory for creating pre-configured loggers
 */
export class LoggerFactory {
  private static instance?: LoggerFactory;
  private defaultConfig: Partial<LoggerConfig>;
  private loggers = new Map<string, TypedLogger>();

  constructor(options: LoggerFactoryOptions = {}) {
    this.defaultConfig = options.defaultConfig ?? {};
  }

  /**
   * Get singleton instance
   */
  static getInstance(options?: LoggerFactoryOptions): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory(options);
    }
    return LoggerFactory.instance;
  }

  /**
   * Create a new logger instance
   */
  create(name: string, config?: Partial<LoggerConfig>): TypedLogger {
    const mergedConfig: LoggerConfig = {
      ...this.defaultConfig,
      ...config,
      defaultMeta: {
        ...this.defaultConfig.defaultMeta,
        ...config?.defaultMeta,
        logger: name,
      },
    };

    const logger = new Logger(mergedConfig);
    this.loggers.set(name, logger);
    return logger;
  }

  /**
   * Get an existing logger or create a new one
   */
  get(name: string, config?: Partial<LoggerConfig>): TypedLogger {
    let logger = this.loggers.get(name);
    if (!logger) {
      logger = this.create(name, config);
    }
    return logger;
  }

  /**
   * Create a logger for development
   */
  createDevelopmentLogger(name: string): TypedLogger {
    return this.create(name, {
      level: LogLevel.DEBUG,
      transports: [
        new ConsoleTransport({
          level: LogLevel.DEBUG,
          colors: true,
          timestamp: true,
        }),
      ],
    });
  }

  /**
   * Create a logger for production
   */
  createProductionLogger(name: string, logFile?: string): TypedLogger {
    const transports = [
      new ConsoleTransport({
        level: LogLevel.INFO,
        colors: false,
        json: true,
      }),
    ];

    if (logFile) {
      transports.push(
        new FileTransport({
          level: LogLevel.INFO,
          filename: logFile,
          json: true,
          maxSize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10,
        })
      );
    }

    return this.create(name, {
      level: LogLevel.INFO,
      transports,
      exitOnError: true,
    });
  }

  /**
   * Create a logger for testing
   */
  createTestLogger(name: string): TypedLogger {
    return this.create(name, {
      level: LogLevel.TRACE,
      silent: true,
      transports: [],
    });
  }

  /**
   * Close all managed loggers
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.loggers.values()).map(logger => logger.close());
    await Promise.all(promises);
    this.loggers.clear();
  }

  /**
   * List all managed logger names
   */
  getLoggerNames(): string[] {
    return Array.from(this.loggers.keys());
  }
}

/**
 * Middleware functions
 */
export const middleware = {
  /**
   * Add request ID to log entries
   */
  requestId: (getRequestId: () => string) => {
    return (entry: any, next: () => void) => {
      if (!entry.meta) entry.meta = {};
      entry.meta.requestId = getRequestId();
      next();
    };
  },

  /**
   * Add timestamp information
   */
  timestamp: () => {
    return (entry: any, next: () => void) => {
      if (!entry.meta) entry.meta = {};
      entry.meta.timestampMs = Date.now();
      next();
    };
  },

  /**
   * Filter sensitive information
   */
  sanitize: (sensitiveFields: string[] = ['password', 'token', 'secret']) => {
    return (entry: any, next: () => void) => {
      if (entry.context) {
        entry.context = sanitizeObject(entry.context, sensitiveFields);
      }
      next();
    };
  },

  /**
   * Add caller information
   */
  caller: () => {
    return (entry: any, next: () => void) => {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Skip first few lines (Error, middleware, logger)
        const callerLine = lines.find((line, index) => 
          index > 3 && !line.includes('node_modules')
        );
        
        if (callerLine) {
          const match = callerLine.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
          if (match) {
            if (!entry.meta) entry.meta = {};
            entry.meta.caller = {
              function: match[1],
              file: match[2],
              line: parseInt(match[3]),
              column: parseInt(match[4]),
            };
          }
        }
      }
      next();
    };
  },
};

/**
 * Utility functions
 */
function sanitizeObject(obj: any, sensitiveFields: string[]): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, sensitiveFields));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeObject(value, sensitiveFields);
    }
  }

  return sanitized;
}

/**
 * Environment-based logger factory
 */
export function createLogger(name: string, env?: string): TypedLogger {
  const environment = env ?? process.env.NODE_ENV ?? 'development';
  const factory = LoggerFactory.getInstance();

  switch (environment) {
    case 'production':
      return factory.createProductionLogger(name, './logs/app.log');
    
    case 'test':
      return factory.createTestLogger(name);
    
    case 'development':
    default:
      return factory.createDevelopmentLogger(name);
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = createLogger('default');

/**
 * Convenience functions using default logger
 */
export const trace = (message: string, context?: Record<string, unknown>) => 
  defaultLogger.trace(message, context);

export const debug = (message: string, context?: Record<string, unknown>) => 
  defaultLogger.debug(message, context);

export const info = (message: string, context?: Record<string, unknown>) => 
  defaultLogger.info(message, context);

export const warn = (message: string, context?: Record<string, unknown>) => 
  defaultLogger.warn(message, context);

export const error = (message: string, error?: Error, context?: Record<string, unknown>) => 
  defaultLogger.error(message, error, context);

export const fatal = (message: string, error?: Error, context?: Record<string, unknown>) => 
  defaultLogger.fatal(message, error, context);