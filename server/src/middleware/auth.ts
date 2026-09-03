import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../errors';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const [kind, token] = req.header('authorization')?.split(' ') ?? [];
  if (kind !== 'Bearer' || !token) return next(new AppError(401, 'Authentication required'));
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}
