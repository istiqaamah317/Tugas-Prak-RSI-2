export type UserRole = 'admin' | 'owner' | 'customer'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

/** Yang dikirim ke backend. Konfirmasi password hanya ada di form, tidak dikirim. */
export interface RegisterPayload {
  name: string
  email: string
  password: string
}

/** Isi `data` pada respons POST /auth/login. */
export interface LoginResult {
  token: string
  user: User
}