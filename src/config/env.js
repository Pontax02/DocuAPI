import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'],

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900_000,
  RATE_LIMIT_MAX:       Number(process.env.RATE_LIMIT_MAX) || 100,

  MAX_FILE_SIZE_MB:  Number(process.env.MAX_FILE_SIZE_MB) || 5,
  MIN_FILE_SIZE_KB:  Number(process.env.MIN_FILE_SIZE_KB) || 30,
  MIN_RESOLUTION_PX: Number(process.env.MIN_RESOLUTION_PX) || 600,

  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',

  ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'changeme',
};
