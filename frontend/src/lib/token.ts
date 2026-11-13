const TOKEN_KEY = 'review_kantin_token'

// localStorage bisa melempar error (mode privat, storage penuh), jadi dibungkus try/catch.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Diabaikan: sesi hanya berlaku selama halaman terbuka.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Diabaikan.
  }
}