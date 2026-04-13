// admin.routes.js — Protected admin endpoints
// All routes here require a valid API key via the requireApiKey middleware.
// Mounted at /api/admin in app.js.

import { Router } from 'express';
import fs from 'fs';
import { requireApiKey } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/admin/logs?lines=N
// Returns the last N lines from logs/app.log (default: 100).
// Useful for quick triage without SSH access to the server.
router.get('/logs', requireApiKey, (req, res) => {
  // Parse the optional 'lines' query param; fall back to 100
  const lines = Number(req.query.lines) || 100;

  // If no log file exists yet, return an empty array instead of crashing
  if (!fs.existsSync('logs/app.log')) {
    return res.json({ logs: [] });
  }

  // Read the entire log file, split into lines, and return the last N entries
  const content = fs.readFileSync('logs/app.log', 'utf-8');
  const all = content.trim().split('\n').filter(Boolean);
  const last = all.slice(-lines);

  res.json({ total: all.length, showing: last.length, logs: last });
});

export default router;
