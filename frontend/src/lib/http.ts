import axios from 'axios'
import { toApiError } from './errors'
import { clearToken, getToken } from './token'

const fallbackBaseUrl = 'http://localhost:3000/api/v1'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || fallbackBaseUrl
).replace(/\/+$/, '')

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Setiap request membawa token JWT (kalau ada) lewat header Authorization.
http.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : ''
    const isCredentialCall =
      url.includes('/auth/login') || url.includes('/auth/register')
    const isSessionCheck = url.includes('/auth/me')

    // 401 di luar login/register berarti token hilang, salah, atau kedaluwarsa.
    if (apiError.status === 401 && !isCredentialCall) {
      clearToken()

      if (!isSessionCheck) {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }

    return Promise.reject(apiError)
  },
)