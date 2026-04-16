import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, printf, colorize } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
);

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'info',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: 'logs/app.log', format: fileFormat }),
    new winston.transports.File({ filename: 'logs/error.log', format: fileFormat, level: 'error' }),
  ],
});
