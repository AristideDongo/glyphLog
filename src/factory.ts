import { Logger } from './loggers/index.js';
import { ConsoleTransport, FileTransport } from './transports/index.js';
import { LogLevel } from './types/enums/log-level.enum.js';
import { LoggerConfig } from './types/logger/logger-config.interface.js';
import { LoggerFactoryOptions } from './types/logger/logger-factory-options.interface.js';
import { TypedLogger } from './types/logger/typed-logger.interface.js';
import { LogTransport } from './types/transports/log-transport.interface.js';
/**
 * Manages the creation and lifecycle of logger instances.
 * This class follows a singleton pattern to ensure a single point of configuration.
 */
export class LoggerFactory {
  private static instance?: LoggerFactory;
  private defaultConfig: Partial<LoggerConfig>;
  private loggers = new Map<string, TypedLogger>();

  /**
   * @param options - Configuration options for the factory.
   */
  constructor(options: LoggerFactoryOptions = {}) {
    this.defaultConfig = options.defaultConfig ?? {};
  }

  /**
   * Retrieves the singleton instance of the LoggerFactory.
   * @param options - Initial configuration if the instance is created for the first time.
   * @returns The singleton LoggerFactory instance.
   */
  static getInstance(options?: LoggerFactoryOptions): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory(options);
    }
    return LoggerFactory.instance;
  }

  /**
   * Creates a new logger instance and registers it with the factory.
   * @param name - The name for the new logger.
   * @param config - Logger-specific configuration to merge with the default.
   * @returns The newly created logger instance.
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
   * Retrieves an existing logger by name or creates a new one if it doesn't exist.
   * @param name - The name of the logger to retrieve or create.
   * @param config - Configuration to use if a new logger is created.
   * @returns An existing or new logger instance.
   */
  get(name: string, config?: Partial<LoggerConfig>): TypedLogger {
    let logger = this.loggers.get(name);
    if (!logger) {
      logger = this.create(name, config);
    }
    return logger;
  }

  /**
   * Creates a pre-configured logger optimized for development environments.
   * (e.g., colorful console output, debug level).
   * @param name - The name for the development logger.
   * @returns A logger instance configured for development.
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
   * Creates a pre-configured logger optimized for production environments.
   * (e.g., JSON console output, file transport, info level).
   * @param name - The name for the production logger.
   * @param logFile - Optional path to a file for log output.   * @returns A logger instance configured for production.
   */
  createProductionLogger(name: string, logFile?: string): TypedLogger {
    const transports: LogTransport[] = [
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
   * Creates a pre-configured logger for testing environments (silent by default).
   * @param name - The name for the test logger.
   * @returns A logger instance configured for testing.
   */
  createTestLogger(name: string): TypedLogger {
    return this.create(name, {
      level: LogLevel.TRACE,
      silent: true,
      transports: [],
    });
  }

  /**
   * Gracefully closes all logger instances managed by the factory.
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.loggers.values()).map(logger => logger.close());
    await Promise.all(promises);
    this.loggers.clear();
  }

  /**
   * Returns the names of all loggers currently managed by the factory.
   * @returns An array of logger names.
   */
  getLoggerNames(): string[] {
    return Array.from(this.loggers.keys());
  }
}

/**
 * A collection of pre-built middleware functions.
 */
export const middleware = {
  /**
   * Creates a middleware to add a request ID to each log entry.
   * @param getRequestId - A function that returns the request ID string.
   */
  requestId: (getRequestId: () => string) => {
    return (entry: any, next: () => void) => {
      if (!entry.meta) entry.meta = {};
      entry.meta.requestId = getRequestId();
      next();
    };
  },

  /**
   * Creates a middleware to add a high-resolution timestamp to each log entry.
   */
  timestamp: () => {
    return (entry: any, next: () => void) => {
      if (!entry.meta) entry.meta = {};
      entry.meta.timestampMs = Date.now();
      next();
    };
  },

  /**
   * Creates a middleware to redact sensitive fields from the log context.
   * @param sensitiveFields - An array of keys to redact. Defaults to ['password', 'token', 'secret'].
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
   * Creates a middleware to add caller information (file, line, function) to each log entry.
   */
  caller: () => {
    return (entry: any, next: () => void) => {
      const { stack } = new Error();
      if (stack) {
        const lines = stack.split('\n');
        // Skip first few lines (Error, middleware, logger)
        const callerLine = lines.find((line, index) => index > 3 && !line.includes('node_modules'));

        if (callerLine) {
          const match = callerLine.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
          if (match) {
            if (!entry.meta) entry.meta = {};
            entry.meta.caller = {
              function: match[1],
              file: match[2],
              line: parseInt(match[3] ?? '0'),
              column: parseInt(match[4] ?? '0'),
            };
          }
        }
      }
      next();
    };
  },
};

/**
 * Recursively sanitizes an object by redacting values of sensitive keys.
 * @param obj - The object to sanitize.
 * @param sensitiveFields - An array of keys to redact.
 * @returns A new, sanitized object.
 * @internal
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
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeObject(value, sensitiveFields);
    }
  }

  return sanitized;
}

/**
 * Creates a new logger instance with a configuration based on the environment.
 * Detects 'production', 'test', or 'development' from `process.env.NODE_ENV`.
 * @param name - The name of the logger.
 * @param env - Optional override for the environment.
 * @returns A pre-configured logger instance.
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
 * A default, globally accessible logger instance.
 */
export const defaultLogger = createLogger('default');

/** Logs a `trace` message using the default logger. */
export const trace = (message: string, context?: Record<string, unknown>) =>
  defaultLogger.trace(message, context);

/** Logs a `debug` message using the default logger. */
export const debug = (message: string, context?: Record<string, unknown>) =>
  defaultLogger.debug(message, context);

/** Logs an `info` message using the default logger. */
export const info = (message: string, context?: Record<string, unknown>) =>
  defaultLogger.info(message, context);

/** Logs a `warn` message using the `default` logger. */
export const warn = (message: string, context?: Record<string, unknown>) =>
  defaultLogger.warn(message, context);

/** Logs an `error` message using the default logger. */
export const error = (message: string, error?: Error, context?: Record<string, unknown>) =>
  defaultLogger.error(message, error, context);

/** Logs a `fatal` message using the default logger. */
export const fatal = (message: string, error?: Error, context?: Record<string, unknown>) =>
  defaultLogger.fatal(message, error, context);
