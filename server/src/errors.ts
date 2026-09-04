import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'Route not found'));
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: error.flatten() });
  }
  const status = error instanceof AppError ? error.status : 500;
  const message = error instanceof AppError ? error.message : 'Internal server error';
  if (status === 500) req.log?.error({ err: error }, 'Unhandled request error');
  return res.status(status).json({ error: message });
}
