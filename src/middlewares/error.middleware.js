import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      valid: false,
      errors: ['file_too_large'],
    });
  }

  res.status(500).json({
    valid: false,
    errors: ['internal_server_error'],
  });
};

export const notFoundHandler = (req, res) => {
  logger.warn(`${req.method} ${req.path} - route_not_found`);
  res.status(404).json({
    valid: false,
    errors: ['route_not_found'],
  });
};
