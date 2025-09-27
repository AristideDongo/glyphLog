import { BaseLogger } from "./BaseLogger.js";
import { LogLevel } from "../types/enums/log-level.enum.js";
import { LogMeta } from "../types/log-meta.interface.js";
import { LoggerConfig } from "../types/logger/logger-config.interface.js";
import { PerformanceLogger } from "../types/logger/performance-logger.interface.js";
import { TypedLogger } from "../types/logger/typed-logger.interface.js";

/**
 * Main Logger class that extends BaseLogger with performance monitoring,
 * child logger creation, and statistics.
 */
export class Logger extends BaseLogger implements PerformanceLogger {
  private timers = new Map<string, number>();
  private profiles = new Map<string, number>();

  constructor(config: LoggerConfig = {}) {
    super(config);
  }

  /**
   * Creates a child logger with additional metadata merged with the parent's.
   * @param meta - Metadata to add to the child logger.
   * @returns A new Logger instance inheriting parent's configuration.
   */
  child(meta: LogMeta): TypedLogger {
    const childConfig: LoggerConfig = {
      level: this.level,
      transports: this.transports,
      defaultMeta: { ...this.defaultMeta, ...meta },
      exitOnError: this.exitOnError,
      silent: this.isSilent(),
    };
    
    const childLogger = new Logger(childConfig);
    childLogger['middleware'] = [...this.middleware];

    return childLogger;
  }

  /**
   * Starts a timer to measure the duration of an operation.
   * @param label - A unique label for the timer.
   */
  time(label: string): void {
    this.timers.set(label, Date.now());
  }

  /**
   * Ends a timer and logs the elapsed time.
   * @param label - The label of the timer to end.
   */
  timeEnd(label: string): void {
    const startTime = this.timers.get(label);
    if (!startTime) {
      this.warn(`Timer '${label}' was not started`);
      return;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    this.info(`${label}: ${duration}ms`, { performance: { label, duration } });
  }

  /**
   * Starts a profiling session to measure the duration of a complex operation.
   * @param label - A unique label for the profile.
   */
  profile(label: string): void {
    this.profiles.set(label, Date.now());
    this.debug(`Profile started: ${label}`);
  }

  /**
   * Ends a profiling session and logs the detailed results.
   * @param label - The label of the profile to end.
   */
  profileEnd(label: string): void {
    const startTime = this.profiles.get(label);
    if (!startTime) {
      this.warn(`Profile '${label}' was not started`);
      return;
    }

    const duration = Date.now() - startTime;
    this.profiles.delete(label);
    
    this.info(`Profile completed: ${label}`, { 
      profile: { 
        label, 
        duration, 
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
      } 
    });
  }

  /**
   * Retrieves statistics about the logger's state.
   * @returns An object containing logger statistics.
   */
  getStats(): {
    level: string;
    transports: string[];
    activeTimers: string[];
    activeProfiles: string[];
  } {
    return {
      level: LogLevel[this.level],
      transports: this.transports.map(t => t.name),
      activeTimers: Array.from(this.timers.keys()),
      activeProfiles: Array.from(this.profiles.keys()),
    };
  }
}