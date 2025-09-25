import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryTransport, ConsoleTransport } from '../transports';
import { Logger } from '../loggers/index';
import { LogLevel } from '../types/enums/log-level.enum';

describe('Logger', () => {
  let logger: Logger;
  let memoryTransport: MemoryTransport;

  beforeEach(() => {
    memoryTransport = new MemoryTransport({ level: LogLevel.TRACE });
    logger = new Logger({
      level: LogLevel.TRACE,
      transports: [memoryTransport],
    });
  });

  afterEach(() => {
    memoryTransport.clear();
  });

  describe('Basic logging', () => {
    it('should log trace messages', () => {
      logger.trace('Test trace message');
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.TRACE);
      expect(logs[0]?.message).toBe('Test trace message');
    });

    it('should log debug messages with context', () => {
      logger.debug('Test debug message', { userId: '123' });
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.DEBUG);
      expect(logs[0]?.context).toEqual({ userId: '123' });
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.INFO);
    });

    it('should log warnings', () => {
      logger.warn('Test warning message');
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.WARN);
    });

    it('should log errors with error objects', () => {
      const testError = new Error('Test error');
      logger.error('Test error message', testError);
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.ERROR);
      expect(logs[0]?.error).toBe(testError);
    });

    it('should log fatal errors', () => {
      const testError = new Error('Fatal error');
      logger.fatal('Test fatal message', testError);
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.FATAL);
      expect(logs[0]?.error).toBe(testError);
    });
  });

  describe('Log levels', () => {
    it('should respect minimum log level', () => {
      logger.setLevel(LogLevel.WARN);
      
      logger.trace('Should not log');
      logger.debug('Should not log');
      logger.info('Should not log');
      logger.warn('Should log');
      logger.error('Should log', new Error('test'));
      
      const logs = memoryTransport.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0]?.level).toBe(LogLevel.WARN);
      expect(logs[1]?.level).toBe(LogLevel.ERROR);
    });

    it('should get and set log level', () => {
      expect(logger.getLevel()).toBe(LogLevel.TRACE);
      
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('Child loggers', () => {
    it('should create child logger with additional metadata', () => {
      const childLogger = logger.child({
        service: 'user-service',
        requestId: 'req-123',
      });

      childLogger.info('Child logger message');
      const logs = memoryTransport.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0]?.meta).toMatchObject({
        service: 'user-service',
        requestId: 'req-123',
      });
    });

    it('should inherit parent configuration', () => {
      logger.setLevel(LogLevel.WARN);
      const childLogger = logger.child({ component: 'auth' });
      
      childLogger.info('Should not log');
      childLogger.warn('Should log');
      
      const logs = memoryTransport.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.WARN);
    });
  });

  describe('Transports', () => {
    it('should add and remove transports', () => {
      expect(logger.getTransports()).toHaveLength(1);
      
      const consoleTransport = new ConsoleTransport();
      logger.addTransport(consoleTransport);
      
      expect(logger.getTransports()).toHaveLength(2);
      
      logger.removeTransport('console');
      expect(logger.getTransports()).toHaveLength(1);
      expect(logger.getTransports()[0]?.name).toBe('memory');
    });

    it('should handle transport errors gracefully', async () => {
      const faultyTransport = {
        name: 'faulty',
        level: LogLevel.INFO,
        log: vi.fn().mockRejectedValue(new Error('Transport error')),
      };

      logger.addTransport(faultyTransport);
      
      // Should not throw
      expect(() => logger.info('Test message')).not.toThrow();
    });
  });

  describe('Performance logging', () => {
    it('should track timing', (done) => {
      logger.time('test-operation');
      
      setTimeout(() => {
        logger.timeEnd('test-operation');
        
        const logs = memoryTransport.getLogs();
        const timerLog = logs.find(log => log.message.includes('test-operation:'));
        
        expect(timerLog).toBeDefined();
        expect(timerLog?.context?.performance).toBeDefined();
        done();
      }, 10);
    });

    it('should handle missing timer', () => {
      logger.timeEnd('non-existent-timer');
      
      const logs = memoryTransport.getLogs();
      const warningLog = logs.find(log => log.level === LogLevel.WARN);
      
      expect(warningLog).toBeDefined();
      expect(warningLog?.message).toContain('was not started');
    });

    it('should track profiling', (done) => {
      logger.profile('test-profile');
      
      setTimeout(() => {
        logger.profileEnd('test-profile');
        
        const logs = memoryTransport.getLogs();
        expect(logs).toHaveLength(2); // start and end messages
        
        const profileEnd = logs.find(log => log.message.includes('Profile completed'));
        expect(profileEnd).toBeDefined();
        expect(profileEnd?.context?.profile).toBeDefined();
        done();
      }, 10);
    });
  });

  describe('Middleware', () => {
    it('should process entries through middleware', () => {
      const middleware = vi.fn((entry, next) => {
        if (!entry.meta) entry.meta = {};
        entry.meta.processed = true;
        next();
      });

      logger.use(middleware);
      logger.info('Test message');
      
      expect(middleware).toHaveBeenCalledTimes(1);
      
      const logs = memoryTransport.getLogs();
      expect(logs[0]?.meta?.processed).toBe(true);
    });

    it('should handle multiple middleware in order', () => {
      const middleware1 = vi.fn((entry, next) => {
        if (!entry.meta) entry.meta = {};
        entry.meta.step1 = true;
        next();
      });

      const middleware2 = vi.fn((entry, next) => {
        if (!entry.meta) entry.meta = {};
        entry.meta.step2 = true;
        next();
      });

      logger.use(middleware1);
      logger.use(middleware2);
      logger.info('Test message');
      
      expect(middleware1).toHaveBeenCalledTimes(1);
      expect(middleware2).toHaveBeenCalledTimes(1);
      
      const logs = memoryTransport.getLogs();
      expect(logs[0]?.meta).toMatchObject({
        step1: true,
        step2: true,
      });
    });
  });

  describe('Silent mode', () => {
    it('should not log when silent', () => {
      logger.setSilent(true);
      expect(logger.isSilent()).toBe(true);
      
      logger.info('Should not log');
      logger.error('Should not log', new Error('test'));
      
      const logs = memoryTransport.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('should resume logging when silent is disabled', () => {
      logger.setSilent(true);
      logger.info('Should not log');
      
      logger.setSilent(false);
      logger.info('Should log');
      
      const logs = memoryTransport.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.message).toBe('Should log');
    });
  });

  describe('Statistics', () => {
    it('should provide logger statistics', () => {
      logger.time('active-timer');
      logger.profile('active-profile');
      
      const stats = logger.getStats();
      
      expect(stats.level).toBe('TRACE');
      expect(stats.transports).toContain('memory');
      expect(stats.activeTimers).toContain('active-timer');
      expect(stats.activeProfiles).toContain('active-profile');
    });
  });

  describe('Error handling', () => {
    it('should handle undefined context gracefully', () => {
      expect(() => logger.info('Message', undefined)).not.toThrow();
      
      const logs = memoryTransport.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.context).toBe(undefined);
    });

    it('should handle circular references in context', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // Should not throw due to JSON.stringify issues
      expect(() => logger.info('Circular test', circular)).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with real console transport', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const consoleLogger = new Logger({
        level: LogLevel.INFO,
        transports: [new ConsoleTransport({ colors: false })],
      });

      consoleLogger.info('Console test message');
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should close all transports', async () => {
      const mockTransport = {
        name: 'mock',
        level: LogLevel.INFO,
        log: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
      };

      logger.addTransport(mockTransport);
      await logger.close();
      
      expect(mockTransport.close).toHaveBeenCalledTimes(1);
    });

    it('should handle transport close errors gracefully', async () => {
      const mockTransport = {
        name: 'mock',
        level: LogLevel.INFO,
        log: vi.fn(),
        close: vi.fn().mockRejectedValue(new Error('Close error')),
      };

      logger.addTransport(mockTransport);
      
      // Should not throw
      await expect(logger.close()).resolves.not.toThrow();
    });
  });
});