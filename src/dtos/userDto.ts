import { z } from 'zod';

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date | null;
}

export const createUserBody = z.object({
  name: z
    .string({ error: (i) => (i.input === undefined ? 'name wajib diisi' : 'name harus berupa string') })
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),
  email: z
    .string({ error: (i) => (i.input === undefined ? 'email wajib diisi' : 'email harus berupa string') })
    .trim()
    .toLowerCase()
    .max(150, 'email maksimal 150 karakter')
    .pipe(z.email('format email tidak valid')),
  password: z
    .string({ error: (i) => (i.input === undefined ? 'password wajib diisi' : 'password harus berupa string') })
    .min(8, 'password minimal 8 karakter')
    .max(72, 'password maksimal 72 karakter'),
  role: z.enum(['admin', 'owner', 'customer'], {
    error: 'role harus salah satu dari: admin, owner, customer',
  }),
});