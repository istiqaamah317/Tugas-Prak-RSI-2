import { z } from 'zod';

export interface ReviewResponseDto {
  id: number;
  stallId: number;
  userId: number;
  rating: number;
  comment: string | null;
  likeCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  userName?: string | null;
}

export const createReviewBody = z.object({
  rating: z
    .number({
      error: (i) => (i.input === undefined ? 'rating wajib diisi' : 'rating harus berupa angka'),
    })
    .int('rating harus bilangan bulat')
    .min(1, 'rating minimal 1')
    .max(5, 'rating maksimal 5'),
  comment: z.string().trim().max(1000, 'comment maksimal 1000 karakter').optional(),
});

export const listReviewsQuery = z.object({
  stallId: z.coerce
    .number({ error: 'stallId harus berupa angka' })
    .int('stallId harus bilangan bulat')
    .positive('stallId harus lebih dari 0')
    .optional(),
});