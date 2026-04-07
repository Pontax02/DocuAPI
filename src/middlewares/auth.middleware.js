import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const requireApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key || key !== env.ADMIN_API_KEY) {
    logger.warn(`${req.method} ${req.path} - unauthorized admin access attempt`);
    return res.status(401).json({ errors: ['unauthorized'] });
  }

  next();
};
