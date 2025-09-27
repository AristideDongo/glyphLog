import { LogLevel } from '../enums/log-level.enum.js';

/**
 * Console transport configuration
 */
export interface ConsoleTransportConfig {
  level?: LogLevel;
  colors?: boolean;
  timestamp?: boolean;
  json?: boolean;
}
