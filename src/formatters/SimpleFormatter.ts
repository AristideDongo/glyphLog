import { LogFormatter } from '../types/formatters/log-formatter.interface.js';
import { LogEntry } from '../types/log-entry.interface.js';
import { LogLevel } from '../types/enums/log-level.enum.js';

/**
 * Simple formatter for file output
 */
export class SimpleFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].toUpperCase();
    const { message } = entry;

    let formatted = `${timestamp} [${level}] ${message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      formatted += ` ERROR: ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\nSTACK: ${entry.error.stack}`;
      }
    }

    return formatted;
  }
}
