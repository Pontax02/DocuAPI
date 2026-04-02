import fs from 'fs';
import { env } from '../config/env.js';
import { isMimeAllowed } from '../utils/mime.utils.js';
import { getFileHash } from '../utils/hash.utils.js';
import { validateImage } from '../utils/image.utils.js';


export const validateDocument = async (file) => {
    const errors = [];

    if (!isMimeAllowed(file.mimetype)) {
        errors.push("mime_not_allowed");
    }

    if(file.size < env.MIN_FILE_SIZE_KB * 1024) {
        errors.push("file_too_small");
    }
    let imageMetadata = null;
    if (file.mimetype.startsWith("image/")) {
        const result = await validateImage(file.path, env.MIN_RESOLUTION_PX);
        errors.push(...result.errors);
        imageMetadata = result.metadata;
    }

    const hash = getFileHash(file.path);


    fs.unlinkSync(file.path);

  return {
    valid: errors.length === 0,
    errors,
    metadata: {
      mime: file.mimetype,
      sizeKB: Math.round(file.size / 1024),
      hash,
      ...imageMetadata,
    },
  };
};
