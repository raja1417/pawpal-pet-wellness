import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { AppError } from '../errors';
import { asyncHandler } from '../middleware/async';
import { loginSchema, registerSchema } from '../validation';

export const authRouter = Router();

function tokenFor(id: string) {
  return jwt.sign({}, config.JWT_SECRET, { subject: id, expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

authRouter.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  if (await prisma.user.findUnique({ where: { email: data.email } })) throw new AppError(409, 'Email is already registered');
  const user = await prisma.user.create({ data: { name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12) } });
  res.status(201).json({ token: tokenFor(user.id), user: { id: user.id, name: user.name, email: user.email } });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) throw new AppError(401, 'Invalid email or password');
  res.json({ token: tokenFor(user.id), user: { id: user.id, name: user.name, email: user.email } });
}));
