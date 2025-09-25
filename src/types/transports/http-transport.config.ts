import { LogLevel } from "../enums/log-level.enum";

/**
 * HTTP transport configuration
 */
export interface HttpTransportConfig {
  level?: LogLevel;
  url: string;
  headers?: Record<string, string>;
  batchSize?: number;
  flushInterval?: number; // in milliseconds
}
