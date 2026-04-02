import { validateDocument } from '../services/validate.service.js';

export const validateController = async (req, res, next) => {
  try {
    const file = req.files?.file_1?.[0];

    if (!file) {
      return res.status(400).json({
        valid: false,
        errors: ['file_1_required'],
      });
    }

    const result = await validateDocument(file);
    return res.status(200).json(result);

  } catch (err) {
    next(err); // manda el error al errorHandler
  }
};
