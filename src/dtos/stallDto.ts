import { z } from 'zod';

export interface StallResponseDto {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number;
  reviewCount: number;
  isPopular: boolean;
}

export const idParams = z.object({
  id: z.coerce
    .number({ error: 'id harus berupa angka' })
    .int('id harus bilangan bulat')
    .positive('id harus lebih dari 0'),
});

export const listStallsQuery = z.object({
  search: z.string().trim().max(100, 'search maksimal 100 karakter').optional(),
  category: z.string().trim().max(50, 'category maksimal 50 karakter').optional(),
  page: z.coerce
    .number({ error: 'page harus berupa angka' })
    .int('page harus bilangan bulat')
    .min(1, 'page minimal 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'limit harus berupa angka' })
    .int('limit harus bilangan bulat')
    .min(1, 'limit minimal 1')
    .max(100, 'limit maksimal 100')
    .default(10),
});

export const createStallBody = z.object({
  name: z
    .string({ error: (i) => (i.input === undefined ? 'name wajib diisi' : 'name harus berupa string') })
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),
  category: z.string().trim().max(50, 'category maksimal 50 karakter').optional(),
  location: z.string().max(100, 'location maksimal 100 karakter').optional(),
  description: z.string().max(1000, 'description maksimal 1000 karakter').optional(),
});

export const updateStallBody = createStallBody
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Minimal satu field harus diisi');