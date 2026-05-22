import fs from 'fs';
import { env } from '../config/env.js';
import { isMimeAllowed } from '../utils/mime.utils.js';
import { getFileHash } from '../utils/hash.utils.js';
import { validateImage } from '../utils/image.utils.js';
import { validatePdf } from '../utils/pdf.utils.js';
import { extractText } from '../utils/ocr.utils.js';
import { isDni, parseDniFields } from '../utils/dni.utils.js';

export const validateFirstDocument = async (file_1) => {
  const errors = [];
  let imageMetadata = null;
  let hash = null;

  try {
    if (!isMimeAllowed(file_1.mimetype)) {
      errors.push("mime_not_allowed");
    }

    if (file_1.size < env.MIN_FILE_SIZE_KB * 1024) {
      errors.push("file_too_small");
    }

    if (file_1.mimetype.startsWith("image/")) {
      const result = await validateImage(file_1.path, env.MIN_RESOLUTION_PX);
      errors.push(...result.errors);
      imageMetadata = result.metadata;

      const text = await extractText(file_1.path);
      if (!text) {
        errors.push("ocr_no_text_detected");
      } else if (!isDni(text)) {
        errors.push("ocr_not_a_dni");
      }
      const dni = text ? parseDniFields(text) : null;
      imageMetadata = { ...imageMetadata, ocrRawText: text || null, dni };
    } else if (file_1.mimetype === "application/pdf") {
      const result = await validatePdf(file_1.path);
      errors.push(...result.errors);
      imageMetadata = result.metadata;
    }

    hash = getFileHash(file_1.path);

  } finally {
    if (fs.existsSync(file_1.path)) fs.unlinkSync(file_1.path);
  }

  return {
    valid: errors.length === 0,
    errors,
    metadata: {
      mime: file_1.mimetype,
      sizeKB: Math.round(file_1.size / 1024),
      hash,
      ...imageMetadata,
    },
  };
};

export const validateSecondDocument = async (file_2) => {
  const errors = [];
  let imageMetadata = null;
  let hash = null;

  try {
    if (!isMimeAllowed(file_2.mimetype)) {
      errors.push("mime_not_allowed");
    }

    if (file_2.size < env.MIN_FILE_SIZE_KB * 1024) {
      errors.push("file_too_small");
    }

    if (file_2.mimetype.startsWith("image/")) {
      const result = await validateImage(file_2.path, env.MIN_RESOLUTION_PX);
      errors.push(...result.errors);
      imageMetadata = result.metadata;
    } else if (file_2.mimetype === "application/pdf") {
      const result = await validatePdf(file_2.path);
      errors.push(...result.errors);
      imageMetadata = result.metadata;
    }

    hash = getFileHash(file_2.path);

  } finally {
    if (fs.existsSync(file_2.path)) fs.unlinkSync(file_2.path);
  }

  return {
    valid: errors.length === 0,
    errors,
    metadata: {
      mime: file_2.mimetype,
      sizeKB: Math.round(file_2.size / 1024),
      hash,
      ...imageMetadata,
    },
  };
};



export const validateAge = async (age) => {
  const errors = [];
  const calculatedAge = getBirthDateFromDni();
  if (age != calculatedAge) {
    errors.push("age_mismatch"); {
    
  } 

}
  return {
    valid: errors.length === 0,
    errors
  };
};

