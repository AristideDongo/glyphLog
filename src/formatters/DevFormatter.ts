import dayjs from 'dayjs';
import chalk from 'chalk';
import { LogFormatter } from '../types/formatters/log-formatter.interface.js';
import { LogEntry } from '../types/log-entry.interface.js';
import { LogLevel } from '../types/enums/log-level.enum.js';

/**
 * Development-friendly formatter
 */
export class DevFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const time = dayjs(entry.timestamp).format('HH:mm:ss.SSS');
    const level = this.getLevelIcon(entry.level);
    const { message } = entry;

    let formatted = `${chalk.gray(time)} ${level} ${message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += `\n${chalk.gray('Context:')} ${JSON.stringify(entry.context, null, 2)
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n')}`;
    }

    if (entry.error) {
      formatted += `\n${chalk.red('Error:')} ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\n${chalk.gray(
          entry.error.stack
            .split('\n')
            .map(line => `  ${line}`)
            .join('\n')
        )}`;
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
