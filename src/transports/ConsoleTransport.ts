import { ConsoleFormatter, JsonFormatter } from '../formatters';
import { LogLevel } from '../types/enums/log-level.enum';
import { LogTransport } from '../types/transports/log-transport.interface';
import { ConsoleTransportConfig } from '../types/transports/console-transport.config';
import { LogEntry } from '../types/log-entry.interface';

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
