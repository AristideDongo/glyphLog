# 🚀 TypeScript Typed Logger

[![npm version](https://badge.fury.io/js/@your-org/typed-logger.svg)](https://badge.fury.io/js/@your-org/typed-logger)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/your-org/typed-logger/workflows/CI/badge.svg)](https://github.com/your-org/typed-logger/actions)

Une bibliothèque de logging moderne, entièrement typée et configurable pour TypeScript/JavaScript avec support des transports multiples, middleware, et logging structuré.

## ✨ Fonctionnalités

- **🔒 Entièrement typé** - Support complet TypeScript avec types stricts
- **📦 Transports multiples** - Console, File, HTTP, Memory et plus
- **🎨 Formatters personnalisables** - JSON, Console coloré, Simple, Dev
- **⚡ Performance** - Mesures de temps et profiling intégrés
- **🔧 Middleware** - Pipeline de traitement extensible
- **👶 Child loggers** - Contexte hiérarchique et métadonnées
- **🎯 Filtrage par niveau** - TRACE, DEBUG, INFO, WARN, ERROR, FATAL
- **🌐 Universal** - Fonctionne en Node.js et navigateurs
- **📊 Logging structuré** - Support complet des métadonnées et contexte
- **🧪 Testable** - Transport mémoire et outils de test intégrés

## 📦 Installation

```bash
npm install @your-org/typed-logger
```

```bash
yarn add @your-org/typed-logger
```

```bash
pnpm add @your-org/typed-logger
```

## 🚀 Utilisation rapide

```typescript
import { createLogger } from '@your-org/typed-logger';

const logger = createLogger('my-app');

logger.info('Application started', { version: '1.0.0', port: 3000 });
logger.warn('This is a warning', { userId: '123' });
logger.error('Something went wrong', new Error('Database connection failed'));
```

## 📚 Documentation détaillée

### Configuration de base

```typescript
import { Logger, LogLevel, ConsoleTransport } from '@your-org/typed-logger';

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

### Niveaux de log

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
import { ConsoleTransport } from '@your-org/typed-logger';

const transport = new ConsoleTransport({
  level: LogLevel.INFO,
  colors: true,
  timestamp: true,
  json: false, // true pour format JSON
});
```

#### File Transport
```typescript
import { FileTransport } from '@your-org/typed-logger';

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
import { HttpTransport } from '@your-org/typed-logger';

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

#### Memory Transport (pour les tests)
```typescript
import { MemoryTransport } from '@your-org/typed-logger';

const transport = new MemoryTransport({
  level: LogLevel.TRACE,
  maxSize: 1000,
});

// Récupérer les logs stockés
const logs = transport.getLogs();
transport.clear();
```

### Formatters

#### JSON Formatter
```typescript
import { JsonFormatter } from '@your-org/typed-logger';

const formatter = new JsonFormatter();
// Sortie: {"timestamp":"2023-01-01T00:00:00.000Z","level":"INFO","message":"Hello"}
```

#### Console Formatter
```typescript
import { ConsoleFormatter } from '@your-org/typed-logger';

const formatter = new ConsoleFormatter({
  colors: true,
  timestamp: true,
});
// Sortie: 2023-01-01 00:00:00.000 [INFO ] Hello {userId="123"}
```

#### Dev Formatter
```typescript
import { DevFormatter } from '@your-org/typed-logger';

const formatter = new DevFormatter();
// Sortie avec icônes et indentation pour le développement
```

### Middleware

```typescript
import { middleware } from '@your-org/typed-logger';

// Middleware de Request ID
logger.use(middleware.requestId(() => generateRequestId()));

// Middleware de sanitisation
logger.use(middleware.sanitize(['password', 'secret', 'token']));

// Middleware d'informations sur l'appelant
logger.use(middleware.caller());

// Middleware personnalisé
logger.use((entry, next) => {
  entry.meta = { ...entry.meta, customField: 'value' };
  next();
});
```

### Logging de performance

```typescript
// Mesure de temps simple
logger.time('database-query');
await performDatabaseQuery();
logger.timeEnd('database-query');
// Sortie: database-query: 150ms

// Profiling détaillé
logger.profile('user-processing');
await processUser();
logger.profileEnd('user-processing');
// Sortie: Profile completed: user-processing avec métadonnées détaillées
```

### Factory Pattern

```typescript
import { LoggerFactory } from '@your-org/typed-logger';

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

// Loggers préconfigurés
const devLogger = factory.createDevelopmentLogger('dev');
const prodLogger = factory.createProductionLogger('prod', './logs/prod.log');
const testLogger = factory.createTestLogger('test');
```

### Gestion des erreurs

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

### Configuration par environnement

```typescript
import { createLogger } from '@your-org/typed-logger';

// Automatiquement configuré selon NODE_ENV
const logger = createLogger('app');

// Ou explicitement
const logger = createLogger('app', 'production');
```

## 🧪 Tests

```typescript
import { MemoryTransport } from '@your-org/typed-logger';

const memoryTransport = new MemoryTransport();
const logger = new Logger({
  transports: [memoryTransport],
});

logger.info('Test message');

const logs = memoryTransport.getLogs();
expect(logs).toHaveLength(1);
expect(logs[0].message).toBe('Test message');
```

## 📊 Métriques et monitoring

```typescript
// Statistiques du logger
const stats = logger.getStats();
console.log(stats);
// {
//   level: 'INFO',
//   transports: ['console', 'file'],
//   activeTimers: ['operation-1'],
//   activeProfiles: ['profile-1']
// }

// Fermeture propre
await logger.close();
```

## 🔧 Configuration avancée

### Logger personnalisé avec tous les transports

```typescript
import {
  Logger,
  LogLevel,
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  middleware,
} from '@your-org/typed-logger';

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

## 📝 Scripts de développement

Le package inclut tous les scripts nécessaires pour le développement :

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

## 🌍 Types exportés

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
} from 'logger';
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Inspiré par Winston, Pino, et d'autres excellentes librairies de logging
- Construit avec TypeScript pour une expérience de développement optimale
- Utilise des outils modernes comme Rollup, Vitest, et ESLint

---

**Fait avec ❤️ pour la communauté TypeScript**