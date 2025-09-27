import type { LogLevel } from './enums/log-level.enum.js';
import type { LogContext } from './log-context.type.js';

/**
 * Log query interface for searching logs
 */
export interface LogQuery {
  level?: LogLevel | LogLevel[];
  startTime?: Date;
  endTime?: Date;
  message?: string | RegExp;
  context?: Partial<LogContext>;
  limit?: number;
  offset?: number;
}
