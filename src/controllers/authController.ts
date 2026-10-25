import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.ts';

const authService = new AuthService();

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(res.locals.valid.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(res.locals.valid.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.me(res.locals.user.id);
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
}