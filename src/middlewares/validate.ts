import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../errors.ts';

type Schemas = {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
};

export const validate =
  (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];
    const valid: Record<string, any> = {};

    for (const key of ['params', 'query', 'body'] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const input = key === 'body' ? (req.body ?? {}) : req[key];
      const result = schema.safeParse(input);

      if (result.success) {
        valid[key] = result.data;
      } else {
        for (const issue of result.error.issues) {
          errors.push({
            field: issue.path.join('.') || key,
            message: issue.message,
          });
        }
      }
    }

    if (errors.length > 0) return next(new ValidationError(errors));

    res.locals.valid = valid; // controller ambil hasil validasi dari sini
    next();
  };