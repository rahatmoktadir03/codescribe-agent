import chalk from "chalk";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(
        chalk.gray(`[DEBUG] ${new Date().toISOString()}: ${message}`),
        ...args
      );
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(
        chalk.blue(`[INFO] ${new Date().toISOString()}: ${message}`),
        ...args
      );
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(
        chalk.yellow(`[WARN] ${new Date().toISOString()}: ${message}`),
        ...args
      );
    }
  }

  error(message: string, error?: any, ...args: any[]) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        chalk.red(`[ERROR] ${new Date().toISOString()}: ${message}`),
        error,
        ...args
      );
    }
  }

  success(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(
        chalk.green(`[SUCCESS] ${new Date().toISOString()}: ${message}`),
        ...args
      );
    }
  }

  agent(message: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(
        chalk.magenta(`[AGENT] ${new Date().toISOString()}: ${message}`),
        ...args
      );
    }
  }
}

export const logger = new Logger();

// Set log level from environment variable
if (process.env.LOG_LEVEL) {
  const level =
    LogLevel[process.env.LOG_LEVEL.toUpperCase() as keyof typeof LogLevel];
  if (level !== undefined) {
    logger.setLevel(level);
  }
}
