export const ALLOWED_MIMES = ["image/jpeg", "image/png", "application/pdf"];

export const isMimeAllowed = (mime) => ALLOWED_MIMES.includes(mime);
