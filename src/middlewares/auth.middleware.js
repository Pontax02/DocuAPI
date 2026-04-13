// auth.middleware.js — API key authentication for admin routes
// Reads the 'x-api-key' header and compares it against the secret
// stored in env.ADMIN_API_KEY. Rejects the request with 401 if missing or wrong.

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const requireApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];

  // If the key is absent or doesn't match, deny access and log the attempt
  if (!key || key !== env.ADMIN_API_KEY) {
    logger.warn(`${req.method} ${req.path} - unauthorized admin access attempt`);
    return res.status(401).json({ errors: ['unauthorized'] });
  }

  // Key is valid — pass control to the next middleware / route handler
  next();
};
