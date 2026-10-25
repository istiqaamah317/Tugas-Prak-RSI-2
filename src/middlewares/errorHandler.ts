import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors.ts';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ status: 'fail', message: 'Route tidak ditemukan' });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi gagal',
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ status: 'fail', message: err.message });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'fail', message: 'Body bukan JSON yang valid' });
  }

  console.error(err);
  res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
}