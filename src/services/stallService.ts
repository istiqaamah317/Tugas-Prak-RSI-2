import {
  StallRepository,
  type CreateStallInput,
  type FindAllParams,
} from '../repositories/stallRepository.ts';
import type { StallResponseDto } from '../dtos/stallDto.ts';
import { AppError } from '../errors.ts';

type StallRow = NonNullable<Awaited<ReturnType<StallRepository['findById']>>>;
type AuthUser = { id: number; role: string };
type StallBody = Omit<CreateStallInput, 'ownerId'>;

export class StallService {
  constructor(private stallRepository: StallRepository = new StallRepository()) {}

  private toDto(row: StallRow): StallResponseDto {
    const avgRating = Number(row.avgRating);
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      location: row.location,
      description: row.description,
      avgRating,
      reviewCount: row.reviewCount,
      isPopular: avgRating >= 4.7,
    };
  }

  async getAllStalls(params: FindAllParams) {
    const { rows, total } = await this.stallRepository.findAll(params);
    return { data: rows.map((row) => this.toDto(row)), total };
  }

  async getStallById(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.toDto(row);
  }

  async createStall(user: AuthUser, body: StallBody): Promise<StallResponseDto> {
    // ownerId diambil dari token, bukan dari body
    const row = await this.stallRepository.create({ ...body, ownerId: user.id });
    if (!row) throw new Error('Gagal membuat warung');
    return this.toDto(row);
  }

  async updateStall(user: AuthUser, id: number, body: Partial<StallBody>): Promise<StallResponseDto> {
    const existing = await this.stallRepository.findById(id);
    if (!existing) throw new AppError(404, 'Data warung tidak ditemukan');

    // owner cuma boleh ubah warung miliknya, admin bebas
    if (user.role !== 'admin' && existing.ownerId !== user.id) {
      throw new AppError(403, 'Kamu tidak berhak mengubah warung ini');
    }

    const row = await this.stallRepository.update(id, body);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.toDto(row);
  }

  async deleteStall(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.remove(id);
    if (!row) throw new AppError(404, 'Data warung tidak ditemukan');
    return this.toDto(row);
  }
}