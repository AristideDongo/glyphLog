import dayjs from 'dayjs';
import chalk from 'chalk';
import { LogFormatter } from '../types/formatters/log-formatter.interface';
import { LogEntry } from '../types/log-entry.interface';
import { LogLevel } from '../types/enums/log-level.enum';

/**
 * JSON formatter for structured logging
 */
export class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const formatted = {
      timestamp: entry.timestamp.toISOString(),
      level: LogLevel[entry.level],
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { 
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        }
      }),
      ...(entry.meta && { meta: entry.meta }),
    };

    return JSON.stringify(formatted);
  }
}

/**
 * Human-readable console formatter with colors
 */
export class ConsoleFormatter implements LogFormatter {
  private colors: boolean;
  private showTimestamp: boolean;

  constructor(options: { colors?: boolean; timestamp?: boolean } = {}) {
    this.colors = options.colors ?? true;
    this.showTimestamp = options.timestamp ?? true;
  }

  format(entry: LogEntry): string {
    const timestamp = this.showTimestamp 
      ? dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
      : '';

    const level = this.formatLevel(entry.level);
    const message = entry.message;
    const context = entry.context ? this.formatContext(entry.context) : '';
    const error = entry.error ? this.formatError(entry.error) : '';
    const meta = entry.meta ? this.formatMeta(entry.meta) : '';

    const parts = [timestamp, level, message, context, error, meta]
      .filter(Boolean)
      .join(' ');

    return parts;
  }

  private formatLevel(level: LogLevel): string {
    const levelStr = LogLevel[level].padEnd(5);
    
    if (!this.colors) return `[${levelStr}]`;

    const colorMap = {
      [LogLevel.TRACE]: chalk.gray,
      [LogLevel.DEBUG]: chalk.blue,
      [LogLevel.INFO]: chalk.green,
      [LogLevel.WARN]: chalk.yellow,
      [LogLevel.ERROR]: chalk.red,
      [LogLevel.FATAL]: chalk.bgRed.white,
    };

    const colorFn = colorMap[level] || chalk.white;
    return colorFn(`[${levelStr}]`);
  }

  private formatContext(context: Record<string, unknown>): string {
    if (Object.keys(context).length === 0) return '';
    
    const formatted = Object.entries(context)
      .map(([key, value]) => `${key}=${this.formatValue(value)}`)
      .join(' ');
    
    return this.colors ? chalk.cyan(`{${formatted}}`) : `{${formatted}}`;
  }

  private formatError(error: Error): string {
    const errorInfo = `${error.name}: ${error.message}`;
    return this.colors ? chalk.red(errorInfo) : errorInfo;
  }

  private formatMeta(meta: Record<string, unknown>): string {
    const formatted = Object.entries(meta)
      .map(([key, value]) => `${key}=${this.formatValue(value)}`)
      .join(' ');
    
    return this.colors ? chalk.magenta(`[${formatted}]`) : `[${formatted}]`;
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}

/**
 * Simple formatter for file output
 */
export class SimpleFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].toUpperCase();
    const message = entry.message;
    
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

/**
 * Development-friendly formatter
 */
export class DevFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const time = dayjs(entry.timestamp).format('HH:mm:ss.SSS');
    const level = this.getLevelIcon(entry.level);
    const message = entry.message;
    
    let formatted = `${chalk.gray(time)} ${level} ${message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += '\n' + chalk.gray('Context:') + ' ' + 
        JSON.stringify(entry.context, null, 2)
          .split('\n')
          .map(line => '  ' + line)
          .join('\n');
    }
    
    if (entry.error) {
      formatted += '\n' + chalk.red('Error:') + ' ' + entry.error.message;
      if (entry.error.stack) {
        formatted += '\n' + chalk.gray(entry.error.stack
          .split('\n')
          .map(line => '  ' + line)
          .join('\n'));
      }
    }
    
    return formatted;
  }

  private getLevelIcon(level: LogLevel): string {
    const icons = {
      [LogLevel.TRACE]: chalk.gray('◦'),
      [LogLevel.DEBUG]: chalk.blue('◉'),
      [LogLevel.INFO]: chalk.green('ℹ'),
      [LogLevel.WARN]: chalk.yellow('⚠'),
      [LogLevel.ERROR]: chalk.red('✖'),
      [LogLevel.FATAL]: chalk.bgRed.white(' ✖ '),
    };
    
    return icons[level] || '•';
  }
}