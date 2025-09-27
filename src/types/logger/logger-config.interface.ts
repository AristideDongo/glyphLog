import { LogLevel } from '../enums/log-level.enum.js';
import type { LogMeta } from '../log-meta.interface.js';
import type { LogTransport } from '../transports/log-transport.interface.js';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level?: LogLevel;
  transports?: LogTransport[];
  defaultMeta?: LogMeta;
  exitOnError?: boolean;
  silent?: boolean;
}
