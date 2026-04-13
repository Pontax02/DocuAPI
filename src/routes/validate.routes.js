// validate.routes.js — Routes for document validation
// Defines the main POST /api/validate-document endpoint.
// Multer's upload.fields() processes the multipart form before the controller runs.

import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { validateController } from '../controllers/validate.controller.js';

const router = Router();

// POST /api/validate-document
// Accepts up to 2 files in the multipart body:
//   · file_1 (required) — primary document
//   · file_2 (optional) — secondary document
// Multer saves each file to disk and attaches it to req.files before
// the validateController runs.
router.post(
  '/validate-document',
  upload.fields([
    { name: 'file_1', maxCount: 1 },
    { name: 'file_2', maxCount: 1 },
  ]),
  validateController
);

// POST /api/status — simple liveness probe (kept here for historical reasons)
router.post('/status', (req, res) => {
  res.json({ statusOK: 'true' });
});

export default router;
