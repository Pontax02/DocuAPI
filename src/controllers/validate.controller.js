import { validateFirstDocument, validateSecondDocument } from '../services/validate.service.js';
import { logger } from '../config/logger.js';
import { normalize } from '../utils/dni.utils.js';


export const validateController = async (req, res, next) => {
  try {
    const file_1 = req.files?.file_1?.[0];
    const file_2 = req.files?.file_2?.[0];
    const { birthDate, name, surname, gender } = req.body;


    if (!file_1) {
      logger.warn(`${req.method} ${req.path} - file_1_required`);
      return res.status(400).json({
        valid: false,
        errors: ['file_1_required'],
      });
    }

    const result = await validateFirstDocument(file_1);
    const remaining = req.rateLimit?.remaining ?? null;

    const dni = result.metadata.dni;
    const nName     = normalize(name);
    const nSurname  = normalize(surname);
    const nGender   = normalize(gender);

    if (birthDate && dni?.birthDate !== birthDate)          { result.valid = false; result.errors.push('birthDate_mismatch'); }
    if (nName    && normalize(dni?.name)    !== nName)      { result.valid = false; result.errors.push('name_mismatch'); }
    if (nSurname && normalize(dni?.surname) !== nSurname)   { result.valid = false; result.errors.push('surname_mismatch'); }
    if (nGender  && normalize(dni?.gender)  !== nGender)    { result.valid = false; result.errors.push('gender_mismatch'); }

    const matches = {
      ...(nName     ? { nameMatch:      normalize(dni?.name)    === nName }      : {}),
      ...(nSurname  ? { surnameMatch:   normalize(dni?.surname) === nSurname }   : {}),
      ...(nGender   ? { genderMatch:    normalize(dni?.gender)  === nGender }    : {}),
      ...(birthDate ? { birthDateMatch: dni?.birthDate          === birthDate }   : {}),
    };

    if (file_2) {
      const result2 = await validateSecondDocument(file_2);
      logger.info(
        `${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'} | file_2: ${result2.valid ? 'valid' : 'invalid'}`
      );
      return res.status(200).json({ file_1: result, file_2: result2, ...(Object.keys(matches).length ? { matches } : {}), remaining_requests: remaining });
    }

    logger.info(`${req.method} ${req.path} - file_1: ${result.valid ? 'valid' : 'invalid'}`);
    return res.status(200).json({ file_1: result, ...(Object.keys(matches).length ? { matches } : {}), remaining_requests: remaining });

  } catch (err) {
    next(err);
  }
};
