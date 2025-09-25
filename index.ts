import { LogLevelString } from './src/types/enums/log-level.enum';
import { LogEntry } from './src/types/log-entry.interface';
import { LogMeta } from './src/types/log-meta.interface';
import { LogFormatter } from './src/types/formatters/log-formatter.interface';
import { LogTransport } from './src/types/transports/log-transport.interface';
import { ConsoleTransportConfig } from './src/types/transports/console-transport.config';
import { FileTransportConfig } from './src/types/transports/file-transport.config';
import { HttpTransportConfig } from './src/types/transports/http-transport.config';
import { LoggerConfig } from './src/types/logger/logger-config.interface';
import { TypedLogger } from './src/types/logger/typed-logger.interface';
import { PerformanceLogger } from './src/types/logger/performance-logger.interface';
import { LogContext } from './src/types/log-context.type';
import { LogQuery } from './src/types/log-query.interface';
import { LogMiddleware } from './src/types/log-middleware.type';
import { LoggerFactoryOptions } from './src/types/logger/logger-factory-options.interface';
// Main exports
export { Logger } from './src/loggers';
export { LoggerFactory, createLogger, middleware, defaultLogger } from './src/factory';

// Enums
export { LogLevel } from './src/types/enums/log-level.enum';

// Formatters
export {
  JsonFormatter,
  ConsoleFormatter,
  SimpleFormatter,
  DevFormatter,
} from './src/formatters';

// Transports
export {
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  MemoryTransport,
} from './src/transports';

// Convenience exports for quick usage
export {
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
} from './src/factory';

// Version
export const version = '1.0.0';