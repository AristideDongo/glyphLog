import { LogLevel } from "../enums/log-level.enum";
import type { LogMeta } from "../log-meta.interface";
import type { LogTransport } from "../transports/log-transport.interface";

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
