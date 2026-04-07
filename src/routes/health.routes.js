import { Router } from 'express';

const router = Router();


router.get('/status', (req, res) => {
  res.json({ status: 'OK' });
});

export default router;
