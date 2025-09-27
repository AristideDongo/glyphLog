// Main exports
export { Logger } from './loggers/index.js';
export { LoggerFactory, createLogger, middleware, defaultLogger } from './factory.js';

// Enums
export { LogLevel } from './types/enums/log-level.enum.js';

// Formatters
export {
  JsonFormatter,
  ConsoleFormatter,
  SimpleFormatter,
  DevFormatter,
} from './formatters/index.js';

// Transports
export {
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  MemoryTransport,
} from './transports/index.js';

// Convenience exports for quick usage
export { trace, debug, info, warn, error, fatal } from './factory.js';

// Version
export const version = '1.0.0';
