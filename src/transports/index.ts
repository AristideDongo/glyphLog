import fs from 'fs/promises';
import { ConsoleFormatter, JsonFormatter, SimpleFormatter } from '../formatters';
import { LogLevel } from '../types/enums/log-level.enum';
import { LogTransport } from '../types/transports/log-transport.interface';
import { ConsoleTransportConfig } from '../types/transports/console-transport.config';
import { HttpTransportConfig } from '../types/transports/http-transport.config';
import { LogEntry } from '../types/log-entry.interface';
import { FileTransportConfig } from '../types/transports/file-transport.config';

/**
 * Console transport for outputting logs to stdout/stderr
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';
  level: LogLevel;
  private formatter: ConsoleFormatter | JsonFormatter;

  constructor(config: ConsoleTransportConfig = {}) {
    this.level = config.level ?? LogLevel.INFO;
    
    if (config.json) {
      this.formatter = new JsonFormatter();
    } else {
      const formatterConfig: { colors?: boolean; timestamp?: boolean } = {};
      if (config.colors !== undefined) formatterConfig.colors = config.colors;
      if (config.timestamp !== undefined) formatterConfig.timestamp = config.timestamp;
      this.formatter = new ConsoleFormatter(formatterConfig);
    }
  }

  log(entry: LogEntry): void {
    if (entry.level < this.level) return;

    const formatted = this.formatter.format(entry);
    
    if (entry.level >= LogLevel.ERROR) {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }
}

/**
 * File transport for writing logs to files with rotation
 */
export class FileTransport implements LogTransport {
  name = 'file';
  level: LogLevel;
  private filename: string;
  private maxSize: number;
  private maxFiles: number;
  private formatter: SimpleFormatter | JsonFormatter;
  private currentSize = 0;

  constructor(config: FileTransportConfig) {
    this.level = config.level ?? LogLevel.INFO;
    this.filename = config.filename;
    this.maxSize = config.maxSize ?? 10 * 1024 * 1024; // 10MB
    this.maxFiles = config.maxFiles ?? 5;
    
    this.formatter = config.json 
      ? new JsonFormatter() 
      : new SimpleFormatter();
  }

  async log(entry: LogEntry): Promise<void> {
    if (entry.level < this.level) return;

    const formatted = this.formatter.format(entry) + '\n';
    
    // Check if rotation is needed
    if (this.currentSize + formatted.length > this.maxSize) {
      await this.rotate();
    }

    try {
      await fs.appendFile(this.filename, formatted, 'utf8');
      this.currentSize += formatted.length;
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  private async rotate(): Promise<void> {
    try {
      // Rotate existing files
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldFile = `${this.filename}.${i}`;
        const newFile = `${this.filename}.${i + 1}`;
        
        try {
          await fs.access(oldFile);
          if (i === this.maxFiles - 1) {
            await fs.unlink(oldFile); // Delete oldest file
          } else {
            await fs.rename(oldFile, newFile);
          }
        } catch {
          // File doesn't exist, continue
        }
      }

      // Move current file to .1
      try {
        await fs.access(this.filename);
        await fs.rename(this.filename, `${this.filename}.1`);
      } catch {
        // Current file doesn't exist
      }

      this.currentSize = 0;
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  async close(): Promise<void> {
    // No resources to clean up for file transport
  }
}

/**
 * HTTP transport for sending logs to a remote server
 */
export class HttpTransport implements LogTransport {
  name = 'http';
  level: LogLevel;
  private url: string;
  private headers: Record<string, string>;
  private batchSize: number;
  private flushInterval: number;
  private buffer: LogEntry[] = [];
  private timer?: NodeJS.Timeout;

  constructor(config: HttpTransportConfig) {
    this.level = config.level ?? LogLevel.INFO;
    this.url = config.url;
    this.headers = { 'Content-Type': 'application/json', ...config.headers };
    this.batchSize = config.batchSize ?? 10;
    this.flushInterval = config.flushInterval ?? 5000;

    this.startTimer();
  }

  log(entry: LogEntry): void {
    if (entry.level < this.level) return;

    this.buffer.push(entry);

    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = this.buffer.splice(0);
    const payload = entries.map(entry => ({
      timestamp: entry.timestamp.toISOString(),
      level: LogLevel[entry.level],
      message: entry.message,
      context: entry.context,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      } : undefined,
      meta: entry.meta,
    }));

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ logs: payload }),
      });

      if (!response.ok) {
        console.error(`HTTP transport failed: ${response.status} ${response.statusText}`);
        // Re-add entries to buffer for retry (optional)
        this.buffer.unshift(...entries);
      }
    } catch (error) {
      console.error('HTTP transport error:', error);
      // Re-add entries to buffer for retry (optional)
      this.buffer.unshift(...entries);
    }
  }

  async close(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // Flush remaining entries
    await this.flush();
  }
}

/**
 * Memory transport for testing and development
 */
export class MemoryTransport implements LogTransport {
  name = 'memory';
  level: LogLevel;
  private logs: LogEntry[] = [];
  private maxSize: number;

  constructor(config: { level?: LogLevel; maxSize?: number } = {}) {
    this.level = config.level ?? LogLevel.TRACE;
    this.maxSize = config.maxSize ?? 1000;
  }

  log(entry: LogEntry): void {
    if (entry.level < this.level) return;

    this.logs.push(entry);

    // Rotate if needed
    if (this.logs.length > this.maxSize) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }

  close(): void {
    this.clear();
  }
}