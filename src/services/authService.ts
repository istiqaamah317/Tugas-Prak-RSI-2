import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository.ts';
import { AppError } from '../errors.ts';
import type { RegisterInput, LoginInput } from '../dtos/authDto.ts';

const userRepository = new UserRepository();

const toPublicUser = (u: { id: number; name: string; email: string; role: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError(409, 'Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer',
    });
    return toPublicUser(user);
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    const ok = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !ok) throw new AppError(401, 'Email atau password salah');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET belum diset di .env');

    const token = jwt.sign({ role: user.role }, secret, {
      subject: String(user.id),
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as jwt.SignOptions['expiresIn'],
    });

    return { token, user: toPublicUser(user) };
  }

  async me(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(401, 'User tidak ditemukan');
    return toPublicUser(user);
  }
}