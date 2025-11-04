import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateBrinde = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('quantidade')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número inteiro positivo'),
  body('valorUnitario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor unitário deve ser um número positivo'),
  body('categoria')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Categoria deve ter no máximo 50 caracteres'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

