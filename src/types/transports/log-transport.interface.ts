import { LogLevel } from '../enums/log-level.enum.js';
import type { LogEntry } from '../log-entry.interface.js';

/**
 * Log transport interface for outputting logs
 */
export interface LogTransport {
  name: string;
  level: LogLevel;
  log(entry: LogEntry): Promise<void> | void;
  close?(): Promise<void> | void;
}
