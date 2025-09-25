import type { LogEntry } from "../log-entry.interface";

/**
 * Log formatter interface
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}
