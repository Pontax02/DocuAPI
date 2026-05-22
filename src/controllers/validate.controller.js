import { validateFirstDocument, validateSecondDocument } from '../services/validate.service.js';
import { logger } from '../config/logger.js';
import { normalize } from '../utils/dni.utils.js';


export const validateController = async (req, res, next) => {
  try {
    const file_1 = req.files?.file_1?.[0];
    const file_2 = req.files?.file_2?.[0];
    const birthDate = req.body.birthDate;
    const name = req.body.name;
    const surname = req.body.surname;
    const gender = req.body.gender;


    if (!file_1) {
      logger.warn(`${req.method} ${req.path} - file_1_required`);
      return res.status(400).json({
        valid: false,
        errors: ['file_1_required'],
      });
    }

    const result = await validateFirstDocument(file_1);
    const remaining = req.rateLimit?.remaining ?? null;

    if (birthDate && result.metadata.dni?.birthDate !== birthDate) {
      result.valid = false;
      result.errors.push('birthDate_mismatch');
    }
    if (normalize(name) && normalize(result.metadata.dni?.name) !== normalize(name)) {
      result.valid = false;
      result.errors.push('name_mismatch');
    }
    if (normalize(surname) && normalize(result.metadata.dni?.surname) !== normalize(surname)) {
      result.valid = false;
      result.errors.push('surname_mismatch');
    } 
    if (normalize(gender) && normalize(result.metadata.dni?.gender) !== normalize(gender)) {
      result.valid = false;
      result.errors.push('gender_mismatch');
    }

    const matches = {
      ...(name      ? { nameMatch:      normalize(result.metadata.dni?.name)    === normalize(name) }      : {}),
      ...(surname   ? { surnameMatch:   normalize(result.metadata.dni?.surname) === normalize(surname) }   : {}),
      ...(gender    ? { genderMatch:    normalize(result.metadata.dni?.gender)  === normalize(gender) }    : {}),
      ...(birthDate ? { birthDateMatch: result.metadata.dni?.birthDate          === birthDate }            : {}),
    };

    if (file_2) {
      const result2 = await validateSecondDocument(file_2);
      logger.info(
        `${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'} | file_2: ${result2.valid ? 'valid' : 'invalid'}`
      );
      return res.status(200).json({ file_1: result, file_2: result2, matches, remaining_requests: remaining });
    }

    logger.info(`${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'}`);
    return res.status(200).json({ file_1: result, matches, remaining_requests: remaining });

  } catch (err) {
    next(err);
  }
};
