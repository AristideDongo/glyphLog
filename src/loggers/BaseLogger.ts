import { LogLevel } from "../types/enums/log-level.enum.js";
import { LogEntry } from "../types/log-entry.interface.js";
import { LogMeta } from "../types/log-meta.interface.js";
import { LogMiddleware } from "../types/log-middleware.type.js";
import { LoggerConfig } from "../types/logger/logger-config.interface.js";
import { TypedLogger } from "../types/logger/typed-logger.interface.js";
import { LogTransport } from "../types/transports/log-transport.interface.js";
/**
 * Abstract base class for the main logger.
 * Handles core logging logic, middleware, and transport management.
 * @internal
 */
export abstract class BaseLogger implements TypedLogger {
  protected level: LogLevel;
  protected transports: LogTransport[] = [];
  protected defaultMeta: LogMeta;
  protected exitOnError: boolean;
  protected silent: boolean;
  protected middleware: LogMiddleware[] = [];

  constructor(config: LoggerConfig = {}) {
    this.level = config.level ?? LogLevel.INFO;
    this.transports = config.transports ?? [];
    this.defaultMeta = config.defaultMeta ?? {};
    this.exitOnError = config.exitOnError ?? false;
    this.silent = config.silent ?? false;
  }

  use(middleware: LogMiddleware): void {
    this.middleware.push(middleware);
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context, error);
    
    if (this.exitOnError) {
      process.exit(1);
    }
  }

  log(
    level: LogLevel, 
    message: string, 
    context?: Record<string, unknown>, 
    error?: Error
  ): void {
    if (this.isSilent() || level < this.level) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      meta: { ...this.defaultMeta },
      ...(context && { context }),
      ...(error && { error }),
    };

    this.processEntry(entry);
  }

  private processEntry(entry: LogEntry): void {
    let index = 0;

    const next = (): void => {
      if (index < this.middleware.length) {
        const currentMiddleware = this.middleware[index++];
        if (currentMiddleware) {
          currentMiddleware(entry, next);
        } else {
          next(); // Should not happen, but safe guard
        }
      } else {
        this.writeToTransports(entry);
      }
    };

    next();
  }

  private async writeToTransports(entry: LogEntry): Promise<void> {
    const promises = this.transports.map(async (transport) => {
      try {
        if (transport.level === undefined || entry.level >= transport.level) {
          await transport.log(entry);
        }
      } catch (err) {
        console.error(`Transport ${transport.name} failed:`, err);
      }
    });

    await Promise.all(promises);
  }

  abstract child(meta: LogMeta): TypedLogger;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  getTransports(): LogTransport[] {
    return [...this.transports];
  }

  async close(): Promise<void> {
    const promises = this.transports.map(async (transport) => {
      if (transport.close) {
        try {
          await transport.close();
        } catch (err) {
          console.error(`Failed to close transport ${transport.name}:`, err);
        }
      }
    });

    await Promise.all(promises);
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  isSilent(): boolean {
    return this.silent;
  }
}
