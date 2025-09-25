/**
 * Log levels with numeric values for filtering
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

/**
 * String representation of log levels
 */
export type LogLevelString = keyof typeof LogLevel;
