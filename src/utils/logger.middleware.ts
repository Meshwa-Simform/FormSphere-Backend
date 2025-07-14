import { Request, Response, NextFunction } from 'express';

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  // Listen for the response to finish
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeTaken = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2); // ms

    // Try to extract message from response body if possible
    let message = '';
    if (typeof res.locals.message === 'string') {
      message = res.locals.message;
    }

    // Fallback: try to get message from statusMessage
    if (!message && res.statusMessage) {
      message = res.statusMessage;
    }

    // Log the details
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${message} - ${timeTaken}ms`,
    );
  });

  next();
};
