import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository.ts';
import type { UserResponseDto } from '../dtos/userDto.ts';
import { AppError } from '../errors.ts';

type UserRow = { id: number; name: string; email: string; role: string; createdAt: Date | null };
type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'owner' | 'customer';
};

export class UserService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  private toDto(row: UserRow): UserResponseDto {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const rows = await this.userRepository.findAll();
    return rows.map((row) => this.toDto(row));
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const row = await this.userRepository.findById(id);
    if (!row) throw new AppError(404, 'User tidak ditemukan');
    return this.toDto(row);
  }

  async createUser(body: CreateUserBody): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(body.email);
    if (existing) throw new AppError(409, 'Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(body.password, 10);
    const row = await this.userRepository.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
    });
    if (!row) throw new Error('Gagal membuat user');
    return this.toDto(row);
  }
}