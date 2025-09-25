import { LogLevel } from "../enums/log-level.enum";

/**
 * File transport configuration
 */
export interface FileTransportConfig {
  level?: LogLevel;
  filename: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  json?: boolean;
}
