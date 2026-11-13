import type { AxiosResponse } from 'axios'
import type {
  LoginPayload,
  LoginResult,
  RegisterPayload,
  User,
} from '../types/auth'
import type {
  ListMeta,
  Stall,
  StallList,
  StallPayload,
  StallQuery,
} from '../types/stall'
import { ApiError } from './errors'
import { http } from './http'

export { API_BASE_URL } from './http'
export { ApiError, errorMessage, getFieldErrors, isApiError } from './errors'

interface SuccessEnvelope<T> {
  status: 'success'
  message?: string
  data: T
  meta?: unknown
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isListMeta(value: unknown): value is ListMeta {
  return (
    isObject(value) &&
    typeof value.page === 'number' &&
    typeof value.limit === 'number' &&
    typeof value.total === 'number'
  )
}

function unwrap<T>(response: AxiosResponse<unknown>): SuccessEnvelope<T> {
  const payload = response.data

  if (
    !isObject(payload) ||
    payload.status !== 'success' ||
    !('data' in payload)
  ) {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'Format respons server tidak sesuai kesepakatan.',
    )
  }

  return payload as unknown as SuccessEnvelope<T>
}

async function getData<T>(request: Promise<AxiosResponse<unknown>>): Promise<T> {
  return unwrap<T>(await request).data
}

async function getResult<T>(
  request: Promise<AxiosResponse<unknown>>,
  fallbackMessage: string,
): Promise<{ message: string; data: T }> {
  const envelope = unwrap<T>(await request)
  return { message: envelope.message ?? fallbackMessage, data: envelope.data }
}

/* ---------------------------- Warung (stalls) ---------------------------- */

export async function getStalls(query: StallQuery = {}): Promise<StallList> {
  const envelope = unwrap<Stall[]>(await http.get('/stalls', { params: query }))

  if (!Array.isArray(envelope.data) || !isListMeta(envelope.meta)) {
    throw new ApiError(200, 'INVALID_RESPONSE', 'Daftar warung tidak valid.')
  }

  return { items: envelope.data, meta: envelope.meta }
}

export function getStall(id: number): Promise<Stall> {
  return getData<Stall>(http.get(`/stalls/${id}`))
}

export function createStall(
  payload: StallPayload,
): Promise<{ message: string; data: Stall }> {
  return getResult<Stall>(
    http.post('/stalls', payload),
    'Warung berhasil ditambahkan.',
  )
}

export function updateStall(
  id: number,
  payload: Partial<StallPayload>,
): Promise<{ message: string; data: Stall }> {
  return getResult<Stall>(
    http.put(`/stalls/${id}`, payload),
    'Warung berhasil diperbarui.',
  )
}

/** Backend membalas 200 beserta data warung yang dihapus (bukan 204). */
export function deleteStall(
  id: number,
): Promise<{ message: string; data: Stall }> {
  return getResult<Stall>(
    http.delete(`/stalls/${id}`),
    'Warung berhasil dihapus.',
  )
}

/* ------------------------------ Autentikasi ------------------------------ */

export function register(
  payload: RegisterPayload,
): Promise<{ message: string; data: User }> {
  return getResult<User>(
    http.post('/auth/register', payload),
    'Akun berhasil dibuat. Silakan masuk.',
  )
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const data = await getData<unknown>(http.post('/auth/login', payload))

  if (
    !isObject(data) ||
    typeof data.token !== 'string' ||
    !isObject(data.user)
  ) {
    throw new ApiError(200, 'INVALID_RESPONSE', 'Respons login tidak valid.')
  }

  return { token: data.token, user: data.user as unknown as User }
}

export function getCurrentUser(): Promise<User> {
  return getData<User>(http.get('/auth/me'))
}