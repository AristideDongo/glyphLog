import { LoggerFactory, createLogger, middleware } from './factory.js';
import { Logger } from './loggers/index.js';
import { ConsoleTransport, MemoryTransport } from './transports/index.js';
import { LogLevel } from './types/enums/log-level.enum.js';

/**
 * Basic usage example
 */
function basicUsage() {
  console.log('\n=== Basic Usage ===');

  const logger = createLogger('app');

  logger.trace('This is a trace message');
  logger.debug('This is a debug message', { userId: '123' });
  logger.info('Application started', { version: '1.0.0', port: 3000 });
  logger.warn('This is a warning', { deprecated: true });
  logger.error('An error occurred', new Error('Something went wrong'));
}

/**
 * Advanced configuration example
 */
function advancedConfiguration() {
  console.log('\n=== Advanced Configuration ===');

  const logger = new Logger({
    level: LogLevel.DEBUG,
    transports: [
      new ConsoleTransport({
        level: LogLevel.INFO,
        colors: true,
        timestamp: true,
      }),
      new MemoryTransport({
        level: LogLevel.TRACE,
        maxSize: 100,
      }),
    ],
    defaultMeta: {
      service: 'user-service',
      version: '1.2.3',
      environment: 'development',
    },
  });

  logger.info('User logged in', {
    userId: 'user-123',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  });

  logger.error('Database connection failed', new Error('Connection timeout'), {
    database: 'users',
    host: 'localhost:5432',
  });
}

/**
 * Child logger example
 */
function childLoggerExample() {
  console.log('\n=== Child Logger ===');

  const mainLogger = createLogger('main');
  const requestLogger = mainLogger.child({
    requestId: 'req-456',
    userId: 'user-789',
  });

  mainLogger.info('Server started');
  requestLogger.info('Processing request');
  requestLogger.warn('Request took longer than expected', { duration: 2500 });
  requestLogger.info('Request completed');
}

/**
 * Middleware example
 */
function middlewareExample() {
  console.log('\n=== Middleware ===');

  const logger = new Logger({
    level: LogLevel.DEBUG,
    transports: [new ConsoleTransport({ colors: true })],
  });

  // Add request ID middleware
  logger.use(middleware.requestId(() => `req-${Date.now()}`));

  // Add sanitization middleware
  logger.use(middleware.sanitize(['password', 'secret', 'token']));

  // Add caller information
  logger.use(middleware.caller());

  logger.info('User login attempt', {
    username: 'john_doe',
    password: 'secret123', // Will be redacted
    token: 'jwt-token-here', // Will be redacted
    ip: '192.168.1.100',
  });
}

/**
 * Performance logging example
 */
function performanceExample() {
  console.log('\n=== Performance Logging ===');

  // const logger = createLogger('performance');

  // // Timer example
  // logger.time('database-query');
  // setTimeout(() => {
  //   logger.timeEnd('database-query');
  // }, 100);

  // // Profile example
  // logger.profile('user-processing');
  // setTimeout(() => {
  //   logger.profileEnd('user-processing');
  // }, 200);
}

/**
 * Factory pattern example
 */
function factoryExample() {
  console.log('\n=== Factory Pattern ===');

  const factory = LoggerFactory.getInstance({
    defaultConfig: {
      level: LogLevel.INFO,
      defaultMeta: {
        application: 'my-app',
        version: '2.0.0',
      },
    },
  });

  const userLogger = factory.get('user-service');
  const orderLogger = factory.get('order-service');
  const emailLogger = factory.get('email-service');

  userLogger.info('User service initialized');
  orderLogger.info('Order service initialized');
  emailLogger.info('Email service initialized');

  console.log('Managed loggers:', factory.getLoggerNames());
}

/**
 * Different transport example
 */
async function transportExample() {
  console.log('\n=== Different Transports ===');

  const logger = new Logger({
    level: LogLevel.DEBUG,
    transports: [
      // Console with colors
      new ConsoleTransport({
        level: LogLevel.INFO,
        colors: true,
      }),

      // File transport (commented out for demo)
      // new FileTransport({
      //   level: LogLevel.DEBUG,
      //   filename: './logs/app.log',
      //   json: true,
      //   maxSize: 10 * 1024 * 1024,
      //   maxFiles: 5,
      // }),

      // Memory transport for testing
      new MemoryTransport({
        level: LogLevel.TRACE,
        maxSize: 50,
      }),
    ],
  });

  logger.trace('This will only go to memory');
  logger.debug('This goes to memory');
  logger.info('This goes to console and memory');
  logger.error('This goes to all transports', new Error('Test error'));

  // Get memory transport to show stored logs
  const memoryTransport = logger.getTransports().find(t => t.name === 'memory') as any;
  if (memoryTransport?.getLogs) {
    console.log(`\nMemory transport has ${memoryTransport.getLogs().length} logs stored`);
  }
}

/**
 * Error handling example
 */
function errorHandlingExample() {
  console.log('\n=== Error Handling ===');

  const logger = createLogger('error-handler');

  try {
    throw new Error('Something went wrong in the application');
  } catch (error) {
    logger.error('Caught an error', error as Error, {
      operation: 'user-registration',
      userId: 'user-456',
      timestamp: new Date().toISOString(),
    });
  }

  // Nested error
  try {
    try {
      throw new Error('Database connection failed');
    } catch (dbError) {
      throw new Error(`User creation failed: ${(dbError as Error).message}`);
    }
  } catch (error) {
    logger.fatal('Critical error in user creation', error as Error, {
      service: 'user-service',
      critical: true,
    });
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('🚀 TypeScript Logger Examples');
  console.log('================================');

  basicUsage();
  advancedConfiguration();
  childLoggerExample();
  middlewareExample();
  performanceExample();
  factoryExample();
  await transportExample();
  errorHandlingExample();

  console.log('\n✅ All examples completed!');
  console.log('\nTo use this logger in your project:');
  console.log('```typescript');
  console.log('import { createLogger } from "@your-org/typed-logger";');
  console.log('');
  console.log('const logger = createLogger("my-app");');
  console.log('logger.info("Hello, world!");');
  console.log('```');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
