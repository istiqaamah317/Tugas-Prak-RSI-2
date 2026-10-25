import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors.ts';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token tidak ditemukan'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new Error('JWT_SECRET belum diset di .env'));

  try {
    const payload = jwt.verify(header.slice(7), secret) as jwt.JwtPayload;
    res.locals.user = { id: Number(payload.sub), role: payload.role as string };
    next();
  } catch {
    next(new AppError(401, 'Token tidak valid atau kedaluwarsa'));
  }
}