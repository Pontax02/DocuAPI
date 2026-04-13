// image.utils.js — Image validation utilities (powered by Sharp)
// Sharp is a high-performance Node.js image processing library.
// These functions perform all image-specific quality checks.

import sharp from 'sharp';

// getImageMetadata — returns Sharp's metadata object for an image file.
// Contains: format, width, height, channels, density, hasAlpha, orientation, etc.
export const getImageMetadata = async (filePath) => {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  return metadata;
};


// validateImage — runs all image quality checks and returns errors + metadata.
// Parameters:
//   filePath      — absolute path to the image saved by Multer
//   minResolution — minimum required width AND height in pixels (from env.MIN_RESOLUTION_PX)
export const validateImage = async (filePath, minResolution) => {
  const errors = [];

  // --- Corruption check ---
  // Sharp throws an error if it cannot decode the file (truncated, wrong format, etc.)
  let metadata;
  try {
    metadata = await getImageMetadata(filePath);
  } catch {
    // If Sharp can't read the file, it is corrupted — stop here, no further checks
    return { errors: ["corrupted_file"], metadata: null };
  }

  // --- Resolution check ---
  // Both dimensions must meet the minimum. A 1200×400 image would still fail.
  if (metadata.width < minResolution || metadata.height < minResolution) {
    errors.push("resolution_too_low");
  }

  // --- Blank / solid-colour detection (histogram-based) ---
  // Sharp's stats() computes per-channel statistics (mean, std deviation, etc.)
  // A standard deviation close to 0 means all pixels in that channel have
  // nearly the same value → the image is blank, white, black, or a solid colour.
  const stats = await sharp(filePath).stats();
  const channels = stats.channels;
  const isBlank = channels.every(ch => ch.std < 5); // threshold of 5 per channel
  if (isBlank) errors.push("blank_or_black_image");

  return {
    errors,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format, // e.g. 'jpeg', 'png'
    },
  };
};
