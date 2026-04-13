// validate.controller.js — Request handler for POST /api/validate-document
// Sits between the route and the service layer.
// Responsibilities:
//   1. Extract uploaded files from req.files (populated by Multer)
//   2. Guard that file_1 is always present
//   3. Delegate validation logic to the service layer
//   4. Shape and send the HTTP response
//   5. Forward unexpected errors to the centralised error handler via next(err)

import { validateFirstDocument, validateSecondDocument } from '../services/validate.service.js';
import { logger } from '../config/logger.js';

export const validateController = async (req, res, next) => {
  try {
    // Multer stores files in req.files as arrays keyed by field name
    const file_1 = req.files?.file_1?.[0];
    const file_2 = req.files?.file_2?.[0];

    // file_1 is mandatory — reject early if missing
    if (!file_1) {
      logger.warn(`${req.method} ${req.path} - file_1_required`);
      return res.status(400).json({
        valid: false,
        errors: ['file_1_required'],
      });
    }

    // Validate the primary document
    const result = await validateFirstDocument(file_1);

    // If a second file was also uploaded, validate it and include it in the response
    if (file_2) {
      const result2 = await validateSecondDocument(file_2);
      logger.info(
        `${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'} | file_2: ${result2.valid ? 'valid' : 'invalid'}`
      );
      return res.status(200).json({ file_1: result, file_2: result2 });
    }

    // Single-file response
    logger.info(`${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'}`);
    return res.status(200).json({ file_1: result });

  } catch (err) {
    // Pass any unexpected error to the centralised error handler in error.middleware.js
    next(err);
  }
};
