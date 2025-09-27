import type { LogMiddleware } from '../log-middleware.type.js';
import type { LoggerConfig } from './logger-config.interface.js';

/**
 * Logger factory options
 */
export interface LoggerFactoryOptions {
  defaultConfig?: Partial<LoggerConfig>;
  middleware?: LogMiddleware[];
}
