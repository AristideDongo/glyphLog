import type { LogLevel } from "./enums/log-level.enum";
import type { LogMeta } from "./log-meta.interface";

/**
 * Base log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
  meta?: LogMeta
}
