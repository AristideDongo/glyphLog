import type { LogMiddleware } from "../log-middleware.type";
import type { LoggerConfig } from "./logger-config.interface";

/**
 * Logger factory options
 */
export interface LoggerFactoryOptions {
  defaultConfig?: Partial<LoggerConfig>;
  middleware?: LogMiddleware[];
}
