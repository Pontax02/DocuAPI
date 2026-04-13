// upload.middleware.js — Multer file upload configuration
// Multer is an Express middleware that handles multipart/form-data (file uploads).
// This file configures WHERE files are saved and WHICH file types are accepted.

import multer from "multer";
import path from "path";
import { env } from "../config/env.js";

// --- Storage engine ---
// diskStorage saves files to the filesystem instead of keeping them in memory.
const storage = multer.diskStorage({
  // Save files inside the uploads/ directory (configurable via .env)
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },

  // Give each file a unique name to avoid collisions:
  // combines the current timestamp with a random 9-digit number + original extension
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

// --- MIME type filter ---
// Multer calls this for every incoming file.
// Passing cb(null, true) accepts the file; cb(null, false) silently rejects it.
// Note: MIME is also re-validated in validate.service.js as a second check.
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);   // Accept the file
  } else {
    cb(null, false);  // Reject unsupported types without throwing an error
  }
};

// --- Multer instance exported for use in routes ---
export const upload = multer({
  storage,

  // Hard limit on individual file size (converted from MB to bytes)
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },

  fileFilter,
});
