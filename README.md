# 🚀 TypeScript Typed Logger

[![npm version](https://badge.fury.io/js/logify.svg)](https://badge.fury.io/js/logify)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/AristideDongo/logger-pack/workflows/CI/badge.svg)](https://github.com/AristideDongo/logger-pack/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/AristideDongo/logger-pack.svg?branch=main)](https://coveralls.io/github/AristideDongo/logger-pack?branch=main)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/logify)](https://bundlephobia.com/package/logify)
[![npm downloads](https://img.shields.io/npm/dm/logify)](https://www.npmjs.com/package/logify)

Une bibliothèque de logging moderne, entièrement typée et configurable pour TypeScript/JavaScript avec support des transports multiples, middleware, et logging structuré.

### 🤔 Pourquoi choisir Logify ?

Dans un écosystème avec des loggers matures comme Winston ou Pino, Logify se distingue par :

-   **Une expérience TypeScript native :** Contrairement à d'autres, Logify est écrit dès le départ en TypeScript pour les développeurs TypeScript. Profitez d'une auto-complétion parfaite, de types stricts et d'une configuration entièrement typée sans effort.
-   **Simplicité et Modernité :** Une API intuitive et moderne qui ne nécessite pas une configuration complexe pour démarrer. Les `factories` et la configuration par environnement sont intégrées pour suivre les meilleures pratiques actuelles.
-   **Performance out-of-the-box :** Des outils de profiling (`time`, `profile`) sont inclus nativement pour vous aider à mesurer et optimiser les performances de votre code sans ajouter de dépendances.
-   **Extensibilité pensée pour les tests :** Le `MemoryTransport` intégré et une architecture claire facilitent grandement les tests de vos logs.

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
npm install logify
```

```bash
yarn add logify
```

```bash
pnpm add logify
```

## 🚀 Utilisation rapide

```typescript
import { createLogger } from 'logify';

const logger = createLogger('my-app');

logger.info('Application started', { version: '1.0.0', port: 3000 });
logger.warn('This is a warning', { userId: '123' });
logger.error('Something went wrong', new Error('Database connection failed'));
```

## 📚 Documentation détaillée

Pour un guide complet de l'API et des options de configuration, veuillez consulter notre [site de documentation complet](https://aristidedongo.github.io/logger-pack/).

### Configuration de base

```typescript
import { Logger, LogLevel, ConsoleTransport } from 'logify';

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
import { ConsoleTransport } from 'logify';

const transport = new ConsoleTransport({
  level: LogLevel.INFO,
  colors: true,
  timestamp: true,
  json: false, // true pour format JSON
});
```

#### File Transport
```typescript
import { FileTransport } from 'logify';

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
import { HttpTransport } from 'logify';

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
import { MemoryTransport } from 'logify';

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
import { JsonFormatter } from 'logify';

const formatter = new JsonFormatter();
// Sortie: {"timestamp":"2023-01-01T00:00:00.000Z","level":"INFO","message":"Hello"}
```

#### Console Formatter
```typescript
import { ConsoleFormatter } from 'logify';

const formatter = new ConsoleFormatter({
  colors: true,
  timestamp: true,
});
// Sortie: 2023-01-01 00:00:00.000 [INFO ] Hello {userId="123"}
```

#### Dev Formatter
```typescript
import { DevFormatter } from 'logify';

const formatter = new DevFormatter();
// Sortie avec icônes et indentation pour le développement
```

### Middleware

```typescript
import { middleware } from 'logify';

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
import { LoggerFactory } from 'logify';

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
import { createLogger } from 'logify';

// Automatiquement configuré selon NODE_ENV
const logger = createLogger('app');

// Ou explicitement
const logger = createLogger('app', 'production');
```

## 📖 Exemples avancés (Recettes)

Découvrez des cas d'utilisation concrets et des intégrations dans le [répertoire d'exemples](https-github-com-aristidedongo-logger-pack-tree-main-examples) :

-   **Intégration avec Express.js :** Un middleware pour logger automatiquement toutes les requêtes HTTP.
-   **Alerting sur les erreurs critiques :** Comment utiliser `HttpTransport` pour envoyer des erreurs vers un service externe comme Sentry ou Slack.
-   **Rotation de logs avancée :** Configuration détaillée du `FileTransport` pour la gestion des logs en production.

## 🧪 Tests

```typescript
import { MemoryTransport } from 'logify';

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
} from 'logify';

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
} from 'logify';
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour savoir comment participer.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Inspiré par Winston, Pino, et d'autres excellentes librairies de logging
- Construit avec TypeScript pour une expérience de développement optimale
- Utilise des outils modernes comme Rollup, Vitest, et ESLint

---

**Fait avec ❤️ pour la communauté TypeScript**