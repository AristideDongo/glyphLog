import { LogLevel } from '../enums/log-level.enum.js';
import type { LogMeta } from '../log-meta.interface.js';
import type { LogTransport } from '../transports/log-transport.interface.js';

/**
 * Typed logging methods interface
 */
export interface TypedLogger {
  trace(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, context?: Record<string, unknown>): void;

  // Convenience methods
  log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void;
  child(meta: LogMeta): TypedLogger;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  addTransport(transport: LogTransport): void;
  removeTransport(name: string): void;
  close(): Promise<void>;
}
