import { LogLevel } from '../types/enums/log-level.enum';
import { LogTransport } from '../types/transports/log-transport.interface';
import { HttpTransportConfig } from '../types/transports/http-transport.config';
import { LogEntry } from '../types/log-entry.interface';

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
