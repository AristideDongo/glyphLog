import fs from 'fs/promises';
import { JsonFormatter, SimpleFormatter } from '../formatters';
import { LogLevel } from '../types/enums/log-level.enum';
import { LogTransport } from '../types/transports/log-transport.interface';
import { LogEntry } from '../types/log-entry.interface';
import { FileTransportConfig } from '../types/transports/file-transport.config';

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
