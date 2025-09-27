import type { LogLevel } from './enums/log-level.enum.js';
import type { LogMeta } from './log-meta.interface.js';

/**
 * Base log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
  meta?: LogMeta;
}
