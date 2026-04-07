import { Router } from 'express';
import fs from 'fs';
import { requireApiKey } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/logs', requireApiKey, (req, res) => {
  const lines = Number(req.query.lines) || 100;

  if (!fs.existsSync('logs/app.log')) {
    return res.json({ logs: [] });
  }

  const content = fs.readFileSync('logs/app.log', 'utf-8');
  const all = content.trim().split('\n').filter(Boolean);
  const last = all.slice(-lines);

  res.json({ total: all.length, showing: last.length, logs: last });
});

export default router;
