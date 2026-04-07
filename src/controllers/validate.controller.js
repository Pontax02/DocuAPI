import { validateFirstDocument, validateSecondDocument } from '../services/validate.service.js';
import { logger } from '../config/logger.js';

export const validateController = async (req, res, next) => {
  try {
    const file_1 = req.files?.file_1?.[0];
    const file_2 = req.files?.file_2?.[0];

    if (!file_1) {
      logger.warn(`${req.method} ${req.path} - file_1_required`);
      return res.status(400).json({
        valid: false,
        errors: ['file_1_required'],
      });
    }

    const result = await validateFirstDocument(file_1);

    if (file_2) {
      const result2 = await validateSecondDocument(file_2);
      logger.info(`${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'} | file_2: ${result2.valid ? 'valid' : 'invalid'}`);
      return res.status(200).json({ file_1: result, file_2: result2 });
    }

    logger.info(`${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'}`);
    return res.status(200).json({ file_1: result });

  } catch (err) {
    next(err);
  }
};
