import type { LogEntry } from '../log-entry.interface.js';

/**
 * Log formatter interface
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}
