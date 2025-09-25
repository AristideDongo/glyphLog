import { LogLevel } from "../enums/log-level.enum";
import type { LogEntry } from "../log-entry.interface";

/**
 * Log transport interface for outputting logs
 */
export interface LogTransport {
  name: string;
  level: LogLevel;
  log(entry: LogEntry): Promise<void> | void;
  close?(): Promise<void> | void;
}
