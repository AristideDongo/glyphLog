import { LogFormatter } from '../types/formatters/log-formatter.interface';
import { LogEntry } from '../types/log-entry.interface';
import { LogLevel } from '../types/enums/log-level.enum';

/**
 * JSON formatter for structured logging
 */
export class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const formatted = {
      timestamp: entry.timestamp.toISOString(),
      level: LogLevel[entry.level],
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { 
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        }
      }),
      ...(entry.meta && { meta: entry.meta }),
    };

    return JSON.stringify(formatted);
  }
}
