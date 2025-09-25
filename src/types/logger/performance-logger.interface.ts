/**
 * Performance logging interface
 */
export interface PerformanceLogger {
  time(label: string): void;
  timeEnd(label: string): void;
  profile(label: string): void;
  profileEnd(label: string): void;
}
