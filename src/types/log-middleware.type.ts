import type { LogEntry } from "./log-entry.interface";

/**
 * Middleware function for processing log entries
 */
export type LogMiddleware = (entry: LogEntry, next: () => void) => void;
