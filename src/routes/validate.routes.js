import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { validateController } from '../controllers/validate.controller.js';

const router = Router();

router.post(
  '/validate-document',
  upload.fields([
    { name: 'file_1', maxCount: 1 },
    { name: 'file_2', maxCount: 1 },
  ]),
  validateController
);

router.post('/status', (req, res) => {
  res.json({ statusOK: 'true' });
});



export default router;
