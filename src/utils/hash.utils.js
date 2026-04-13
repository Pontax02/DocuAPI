// hash.utils.js — File hashing utility
// Computes a SHA-256 hash of any file on disk.
// The hash is included in the API response so consumers can:
//   · Verify file integrity after transfer
//   · Detect duplicate submissions (same hash = same bytes)

import crypto from 'crypto';
import fs from 'fs';

// getFileHash — reads the file at filePath and returns its SHA-256 digest as a hex string
export const getFileHash = (filePath) => {
  const buffer = fs.readFileSync(filePath); // Read entire file into memory
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
