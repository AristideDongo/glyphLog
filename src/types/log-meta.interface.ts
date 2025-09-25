/**
 * Additional metadata for log entries
 */
export interface LogMeta {
  caller?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  service?: string;
  version?: string;
  environment?: string;
  [key: string]: unknown;
}
