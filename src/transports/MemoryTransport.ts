import { LogLevel } from '../types/enums/log-level.enum.js';
import { LogTransport } from '../types/transports/log-transport.interface.js';
import { LogEntry } from '../types/log-entry.interface.js';

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
