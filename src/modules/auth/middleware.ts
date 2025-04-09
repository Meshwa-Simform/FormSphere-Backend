import { Request, Response, NextFunction } from 'express';
import { registerSchema } from './validations';
import { handleError, handleResponse } from '../../utils/responseHandling.utils';
import { ZodIssue } from 'zod';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    handleError(res, 400, 'Validation error', result.error.errors as ZodIssue[]);
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    handleResponse(res, 400, 'Email and password are required');
    return;
  }
  next();
};
