// mime.utils.js — MIME type whitelist
// Defines which file types the API accepts and exposes a helper to check them.
// MIME types are set by the client's browser/OS and also read from the file
// magic bytes by Multer — but we double-check here to be safe.

// Exhaustive list of accepted MIME types
export const ALLOWED_MIMES = ["image/jpeg", "image/png", "application/pdf"];

// isMimeAllowed — returns true if the given MIME type is in the whitelist
export const isMimeAllowed = (mime) => ALLOWED_MIMES.includes(mime);
