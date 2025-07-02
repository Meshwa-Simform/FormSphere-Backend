import { Response } from 'express';
import { ZodIssue } from 'zod';

export function handleResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): void {
  res.locals.message = message;
  res.status(statusCode).json({ message, data });
}

export function handleError(
  res: Response,
  statusCode: number,
  message: string,
  error: Error | ZodIssue[],
): void {
  res.locals.message = message;
  res.status(statusCode).json({ message, error });
}
