# GlyphLog

[![npm version](https://badge.fury.io/js/glyphlog.svg)](https://badge.fury.io/js/glyphlog)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://coveralls.io/repos/github/AristideDongo/glyphLog/badge.svg?branch=main)](https://coveralls.io/github/AristideDongo/glyphLog?branch=main)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/glyphlog)](https://bundlephobia.com/package/glyphlog)
[![npm downloads](https://img.shields.io/npm/dm/glyphlog)](https://www.npmjs.com/package/glyphlog)

A modern, fully typed and configurable logging library for TypeScript/JavaScript with support for multiple transports, middleware, and structured logging.

### 🤔 Why choose glyphLog?

-   **Native TypeScript experience:** Unlike others, glyphLog is written from the ground up in TypeScript for TypeScript developers. Enjoy perfect auto-completion, strict types, and fully typed configuration effortlessly.
-   **Simplicity and Modernity:** An intuitive and modern API that doesn't require complex configuration to get started. `Factories` and environment-based configuration are built-in to follow current best practices.
-   **Performance out-of-the-box:** Profiling tools (`time`, `profile`) are included natively to help you measure and optimize your code's performance without adding dependencies.
-   **Extensibility designed for testing:** The built-in `MemoryTransport` and clear architecture greatly facilitate testing your logs.

## ✨ Features

- **🔒 Fully typed** - Complete TypeScript support with strict types
- **📦 Multiple transports** - Console, File, HTTP, Memory and more
- **🎨 Customizable formatters** - JSON, Colored Console, Simple, Dev
- **⚡ Performance** - Built-in timing and profiling measurements
- **🔧 Middleware** - Extensible processing pipeline
- **👶 Child loggers** - Hierarchical context and metadata
- **🎯 Level filtering** - TRACE, DEBUG, INFO, WARN, ERROR, FATAL
- **🌐 Universal** - Works in Node.js and browsers
- **📊 Structured logging** - Full metadata and context support
- **🧪 Testable** - Memory transport and built-in testing tools

## 📦 Installation

```bash
npm install glyphLog
```

```bash
yarn add glyphLog
```

```bash
pnpm add glyphLog
```

## 🚀 Quick usage

```typescript
import { createLogger } from 'glyphLog';

const logger = createLogger('my-app');

logger.info('Application started', { version: '1.0.0', port: 3000 });
logger.warn('This is a warning', { userId: '123' });
logger.error('Something went wrong', new Error('Database connection failed'));
```

## 📚 Detailed documentation

For a complete API guide and configuration options, please visit our [complete documentation site](https://aristidedongo.github.io/logger-pack/).

### Basic configuration

```typescript
import { Logger, LogLevel, ConsoleTransport } from 'glyphLog';

const logger = new Logger({
  level: LogLevel.INFO,
  transports: [
    new ConsoleTransport({
      colors: true,
      timestamp: true,
    }),
  ],
  defaultMeta: {
    service: 'user-service',
    version: '1.0.0',
  },
});
```

### Log levels

```typescript
logger.trace('Trace message');         // LogLevel.TRACE (0)
logger.debug('Debug message');         // LogLevel.DEBUG (1)
logger.info('Info message');           // LogLevel.INFO (2)
logger.warn('Warning message');        // LogLevel.WARN (3)
logger.error('Error message', error);  // LogLevel.ERROR (4)
logger.fatal('Fatal message', error);  // LogLevel.FATAL (5)
```

### Child Loggers

```typescript
const requestLogger = logger.child({
  requestId: 'req-123',
  userId: 'user-456',
});

requestLogger.info('Processing request');
requestLogger.warn('Request took too long', { duration: 2500 });
```

### Transports

#### Console Transport
```typescript
import { ConsoleTransport } from 'glyphLog';

const transport = new ConsoleTransport({
  level: LogLevel.INFO,
  colors: true,
  timestamp: true,
  json: false, // true for JSON format
});
```

#### File Transport
```typescript
import { FileTransport } from 'glyphLog';

const transport = new FileTransport({
  level: LogLevel.DEBUG,
  filename: './logs/app.log',
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  json: true,
});
```

#### HTTP Transport
```typescript
import { HttpTransport } from 'glyphLog';

const transport = new HttpTransport({
  level: LogLevel.ERROR,
  url: 'https://logs.example.com/api/logs',
  headers: {
    'Authorization': 'Bearer token',
  },
  batchSize: 10,
  flushInterval: 5000,
});
```

#### Memory Transport (for testing)
```typescript
import { MemoryTransport } from 'glyphLog';

const transport = new MemoryTransport({
  level: LogLevel.TRACE,
  maxSize: 1000,
});

// Retrieve stored logs
const logs = transport.getLogs();
transport.clear();
```

### Formatters

#### JSON Formatter
```typescript
import { JsonFormatter } from 'glyphLog';

const formatter = new JsonFormatter();
// Output: {"timestamp":"2023-01-01T00:00:00.000Z","level":"INFO","message":"Hello"}
```

#### Console Formatter
```typescript
import { ConsoleFormatter } from 'glyphLog';

const formatter = new ConsoleFormatter({
  colors: true,
  timestamp: true,
});
// Output: 2023-01-01 00:00:00.000 [INFO ] Hello {userId="123"}
```

#### Dev Formatter
```typescript
import { DevFormatter } from 'glyphLog';

const formatter = new DevFormatter();
// Output with icons and indentation for development
```

### Middleware

```typescript
import { middleware } from 'glyphLog';

// Request ID middleware
logger.use(middleware.requestId(() => generateRequestId()));

// Sanitization middleware
logger.use(middleware.sanitize(['password', 'secret', 'token']));

// Caller information middleware
logger.use(middleware.caller());

// Custom middleware
logger.use((entry, next) => {
  entry.meta = { ...entry.meta, customField: 'value' };
  next();
});
```

### Performance logging

```typescript
// Simple timing
logger.time('database-query');
await performDatabaseQuery();
logger.timeEnd('database-query');
// Output: database-query: 150ms

// Detailed profiling
logger.profile('user-processing');
await processUser();
logger.profileEnd('user-processing');
// Output: Profile completed: user-processing with detailed metadata
```

### Factory Pattern

```typescript
import { LoggerFactory } from 'glyphLog';

const factory = LoggerFactory.getInstance({
  defaultConfig: {
    level: LogLevel.INFO,
    defaultMeta: {
      application: 'my-app',
    },
  },
});

const userLogger = factory.get('user-service');
const orderLogger = factory.get('order-service');

// Pre-configured loggers
const devLogger = factory.createDevelopmentLogger('dev');
const prodLogger = factory.createProductionLogger('prod', './logs/prod.log');
const testLogger = factory.createTestLogger('test');
```

### Error handling

```typescript
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Operation failed', error as Error, {
    operation: 'user-registration',
    userId: 'user-123',
    timestamp: new Date().toISOString(),
  });
}
```

### Environment-based configuration

```typescript
import { createLogger } from 'glyphLog';

// Automatically configured based on NODE_ENV
const logger = createLogger('app');

// Or explicitly
const logger = createLogger('app', 'production');
```

## 📖 Advanced examples (Recipes)

Discover concrete use cases and integrations in the [examples repository](https://github.com/AristideDongo/logger-pack/tree/main/examples):

-   **Express.js integration:** Middleware to automatically log all HTTP requests.
-   **Critical error alerting:** How to use `HttpTransport` to send errors to external services like Sentry or Slack.
-   **Advanced log rotation:** Detailed `FileTransport` configuration for production log management.

## 🧪 Testing

```typescript
import { MemoryTransport } from 'glyphLog';

const memoryTransport = new MemoryTransport();
const logger = new Logger({
  transports: [memoryTransport],
});

logger.info('Test message');

const logs = memoryTransport.getLogs();
expect(logs).toHaveLength(1);
expect(logs[0].message).toBe('Test message');
```

## 📊 Metrics and monitoring

```typescript
// Logger statistics
const stats = logger.getStats();
console.log(stats);
// {
//   level: 'INFO',
//   transports: ['console', 'file'],
//   activeTimers: ['operation-1'],
//   activeProfiles: ['profile-1']
// }

// Clean shutdown
await logger.close();
```

## 🔧 Advanced configuration

### Custom logger with all transports

```typescript
import {
  Logger,
  LogLevel,
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  middleware,
} from 'glyphLog';

const logger = new Logger({
  level: LogLevel.DEBUG,
  transports: [
    new ConsoleTransport({
      level: LogLevel.INFO,
      colors: true,
      timestamp: true,
    }),
    new FileTransport({
      level: LogLevel.DEBUG,
      filename: './logs/debug.log',
      json: true,
      maxSize: 50 * 1024 * 1024,
      maxFiles: 10,
    }),
    new HttpTransport({
      level: LogLevel.ERROR,
      url: 'https://logging-service.com/api/logs',
      headers: { 'API-Key': 'your-api-key' },
      batchSize: 20,
      flushInterval: 10000,
    }),
  ],
  defaultMeta: {
    service: 'api-server',
    version: '2.1.0',
    environment: process.env.NODE_ENV,
  },
  exitOnError: false,
});

// Middleware setup
logger.use(middleware.requestId(() => crypto.randomUUID()));
logger.use(middleware.sanitize(['password', 'token', 'secret', 'key']));
logger.use(middleware.timestamp());
logger.use(middleware.caller());
```

## 📝 Development scripts

The package includes all necessary scripts for development:

```json
{
  "scripts": {
    "build": "rollup -c",
    "dev": "tsx watch src/example.ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "typecheck": "tsc --noEmit",
    "example": "tsx src/example.ts"
  }
}
```

## 🌍 Exported types

```typescript
import type {
  LogLevel,
  LogEntry,
  LogMeta,
  LogFormatter,
  LogTransport,
  TypedLogger,
  PerformanceLogger,
  LoggerConfig,
  LogMiddleware,
} from 'glyphLog';
```

## 🤝 Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file to learn how to participate.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- Inspired by Winston, Pino, and other excellent logging libraries
- Built with TypeScript for an optimal development experience
- Uses modern tools like Rollup, Vitest, and ESLint

---

**Made with ❤️ for the TypeScript community**