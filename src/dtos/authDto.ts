import { z } from 'zod';

const str = (field: string) =>
  z.string({
    error: (iss) =>
      iss.input === undefined ? `${field} wajib diisi` : `${field} harus berupa string`,
  });

const email = str('email')
  .trim()
  .toLowerCase()
  .max(150, 'email maksimal 150 karakter')
  .pipe(z.email('format email tidak valid'));

export const registerBody = z.object({
  name: str('name')
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),
  email,
  password: str('password')
    .min(8, 'password minimal 8 karakter')
    .max(72, 'password maksimal 72 karakter'),
});

export const loginBody = z.object({
  email: str('email').trim().toLowerCase().pipe(z.email('format email tidak valid')),
  password: str('password').min(1, 'password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerBody>;
export type LoginInput = z.infer<typeof loginBody>;