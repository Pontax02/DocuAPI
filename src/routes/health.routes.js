// health.routes.js — Health check route
// GET /api/status is the standard liveness endpoint used by load balancers,
// Docker health checks, and uptime monitors to verify the service is running.

import { Router } from 'express';

const router = Router();

// GET /api/status — returns a simple OK payload with no authentication required
router.get('/status', (req, res) => {
  res.json({ status: 'OK' });
});

export default router;
