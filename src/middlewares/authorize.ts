import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.ts';

export const authorize =
  (...roles: Array<'admin' | 'owner' | 'customer'>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (!user) return next(new AppError(401, 'Token tidak ditemukan'));
    if (!roles.includes(user.role)) {
      return next(new AppError(403, 'Akses ditolak: role tidak memiliki izin'));
    }
    next();
  };