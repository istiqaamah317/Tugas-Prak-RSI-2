import { ReviewRepository } from '../repositories/reviewRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';
import type { ReviewResponseDto } from '../dtos/reviewDto.ts';
import { AppError } from '../errors.ts';

type AuthUser = { id: number; role: string };
type ReviewBody = { rating: number; comment?: string };

export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository = new ReviewRepository(),
    private stallRepository: StallRepository = new StallRepository(),
  ) {}

  private toDto(row: any): ReviewResponseDto {
    return {
      id: row.id,
      stallId: row.stallId,
      userId: row.userId,
      rating: row.rating,
      comment: row.comment,
      likeCount: row.likeCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.userName !== undefined ? { userName: row.userName } : {}),
    };
  }

  async getAllReviews(stallId?: number): Promise<ReviewResponseDto[]> {
    const rows = await this.reviewRepository.findAllWithUser(stallId);
    return rows.map((row) => this.toDto(row));
  }

  async createReview(user: AuthUser, stallId: number, body: ReviewBody): Promise<ReviewResponseDto> {
    const stall = await this.stallRepository.findById(stallId);
    if (!stall) throw new AppError(404, 'Data warung tidak ditemukan');

    // userId diambil dari token, bukan dari body
    const row = await this.reviewRepository.create({
      stallId,
      userId: user.id,
      rating: body.rating,
      ...(body.comment !== undefined ? { comment: body.comment } : {}),
    });
    if (!row) throw new Error('Gagal membuat review');
    return this.toDto(row);
  }

  async deleteReview(id: number): Promise<ReviewResponseDto> {
    const row = await this.reviewRepository.remove(id);
    if (!row) throw new AppError(404, 'Review tidak ditemukan');
    return this.toDto(row);
  }
}