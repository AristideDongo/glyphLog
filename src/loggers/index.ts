import { LogLevel } from "../types/enums/log-level.enum";
import { LogEntry } from "../types/log-entry.interface";
import { LogMeta } from "../types/log-meta.interface";
import { LogMiddleware } from "../types/log-middleware.type";
import { LoggerConfig } from "../types/logger/logger-config.interface";
import { PerformanceLogger } from "../types/logger/performance-logger.interface";
import { TypedLogger } from "../types/logger/typed-logger.interface";
import { LogTransport } from "../types/transports/log-transport.interface";


/**
 * Main Logger class implementing TypedLogger interface
 */
export class Logger implements TypedLogger, PerformanceLogger {
  private level: LogLevel;
  private transports: LogTransport[] = [];
  private defaultMeta: LogMeta;
  private exitOnError: boolean;
  private silent: boolean;
  private middleware: LogMiddleware[] = [];
  private timers = new Map<string, number>();
  private profiles = new Map<string, number>();

  constructor(config: LoggerConfig = {}) {
    this.level = config.level ?? LogLevel.INFO;
    this.transports = config.transports ?? [];
    this.defaultMeta = config.defaultMeta ?? {};
    this.exitOnError = config.exitOnError ?? false;
    this.silent = config.silent ?? false;
  }

  /**
   * Add middleware to process log entries
   */
  use(middleware: LogMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Log a trace message
   */
  trace(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context, error);
    
    if (this.exitOnError) {
      process.exit(1);
    }
  }

  /**
   * Generic log method
   */
  log(
    level: LogLevel, 
    message: string, 
    context?: Record<string, unknown>, 
    error?: Error
  ): void {
    if (this.silent || level < this.level) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      meta: this.defaultMeta,
    };

    this.processEntry(entry);
  }

  /**
   * Process log entry through middleware and transports
   */
  private processEntry(entry: LogEntry): void {
    let index = 0;

    const next = (): void => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++];
        if (middleware) {
          middleware(entry, next);
        } else {
          next();
        }
      } else {
        this.writeToTransports(entry);
      }
    };

    next();
  }

  /**
   * Write entry to all transports
   */
  private async writeToTransports(entry: LogEntry): Promise<void> {
    const promises = this.transports.map(async (transport) => {
      try {
        await transport.log(entry);
      } catch (error) {
        console.error(`Transport ${transport.name} failed:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Create a child logger with additional metadata
   */
  child(meta: LogMeta): TypedLogger {
    const childLogger = new Logger({
      level: this.level,
      transports: this.transports,
      defaultMeta: { ...this.defaultMeta, ...meta },
      exitOnError: this.exitOnError,
      silent: this.silent,
    });

    // Copy middleware
    childLogger.middleware = [...this.middleware];

    return childLogger;
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Add a transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove a transport by name
   */
  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  /**
   * Get all transports
   */
  getTransports(): LogTransport[] {
    return [...this.transports];
  }

  /**
   * Close all transports
   */
  async close(): Promise<void> {
    const promises = this.transports.map(async (transport) => {
      if (transport.close) {
        try {
          await transport.close();
        } catch (error) {
          console.error(`Failed to close transport ${transport.name}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  /**
   * Start a timer for performance logging
   */
  time(label: string): void {
    this.timers.set(label, Date.now());
  }

  /**
   * End a timer and log the duration
   */
  timeEnd(label: string): void {
    const startTime = this.timers.get(label);
    if (!startTime) {
      this.warn(`Timer '${label}' was not started`);
      return;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    this.info(`${label}: ${duration}ms`, { performance: { label, duration } });
  }

  /**
   * Start a profile for performance logging
   */
  profile(label: string): void {
    this.profiles.set(label, Date.now());
    this.debug(`Profile started: ${label}`);
  }

  /**
   * End a profile and log detailed timing
   */
  profileEnd(label: string): void {
    const startTime = this.profiles.get(label);
    if (!startTime) {
      this.warn(`Profile '${label}' was not started`);
      return;
    }

    const duration = Date.now() - startTime;
    this.profiles.delete(label);
    
    this.info(`Profile completed: ${label}`, { 
      profile: { 
        label, 
        duration, 
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      } 
    });
  }

  /**
   * Enable or disable silent mode
   */
  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  /**
   * Check if logger is in silent mode
   */
  isSilent(): boolean {
    return this.silent;
  }

  /**
   * Get logger statistics
   */
  getStats(): {
    level: string;
    transports: string[];
    activeTimers: string[];
    activeProfiles: string[];
  } {
    return {
      level: LogLevel[this.level],
      transports: this.transports.map(t => t.name),
      activeTimers: Array.from(this.timers.keys()),
      activeProfiles: Array.from(this.profiles.keys()),
    };
  }
}