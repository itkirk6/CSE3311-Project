import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack || err);

  // Default values
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Basic heuristic for 404s (without AppError)
  if (message && message.toLowerCase().includes('not found')) {
    status = 404;
  }

  // Example: Prisma "Record not found" error
  if (err.code === 'P2025') {
    status = 404;
    message = 'Record not found';
  }

  res.status(status).json({ success: false, message });
};
