import { Response } from 'express';
import { ZodIssue } from 'zod';
import { User } from '../modules/auth/types.ts';
import { FormOutput } from '../modules/forms/types.ts';
import { Responses } from '../modules/response/types.ts';

export const handleResponse = (
  res: Response,
  statusCode: number,
  message: string,
  user?: User,
): void => {
  res.status(statusCode).json({ message, user });
};

export const handleError = (
  res: Response,
  statusCode: number,
  message: string,
  error: Error | ZodIssue[],
): void => {
  res.status(statusCode).json({ message, error });
};

export const handleFormResponse = (
  res: Response,
  statusCode: number,
  message: string,
  form?: FormOutput | FormOutput[] | Responses | Responses[],
): void => {
  res.status(statusCode).json({ message, form });
};
