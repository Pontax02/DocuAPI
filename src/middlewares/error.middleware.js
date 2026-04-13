// error.middleware.js — Centralised error handling
// Express requires error-handling middleware to have exactly 4 parameters (err, req, res, next).
// These handlers must be registered AFTER all routes in app.js.

import { logger } from '../config/logger.js';

// errorHandler — catches errors forwarded via next(err) from any route or middleware.
export const errorHandler = (err, req, res, next) => {
  // Log the error with method + path for traceability
  logger.error(`${req.method} ${req.path} - ${err.message}`);

  // Multer throws LIMIT_FILE_SIZE when a file exceeds the configured size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      valid: false,
      errors: ['file_too_large'],
    });
  }

  // Fallback for any unhandled error — never expose internal details to the client
  res.status(500).json({
    valid: false,
    errors: ['internal_server_error'],
  });
};

// notFoundHandler — returns 404 for any request that didn't match a registered route.
export const notFoundHandler = (req, res) => {
  logger.warn(`${req.method} ${req.path} - route_not_found`);
  res.status(404).json({
    valid: false,
    errors: ['route_not_found'],
  });
};
