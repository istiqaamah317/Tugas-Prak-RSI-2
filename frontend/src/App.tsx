import { useEffect, useState } from 'react'
import {
  MapPin,
  Star,
  Store,
  LogIn,
  LogOut,
  UserPlus,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
} from 'lucide-react'
import {
  createStall,
  updateStall,
  deleteStall,
  getStalls,
  getStall,
  getCurrentUser,
  login,
  register,
  errorMessage,
  getFieldErrors,
  isApiError,
} from './lib/api'
import { setToken, clearToken, getToken } from './lib/token'
import type { User, LoginPayload, RegisterPayload } from './types/auth'
import type { Stall, StallPayload } from './types/stall'

const PAGE_SIZE = 12
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-danger">{message}</p>
}
export default function App() {
  const [stalls, setStalls] = useState<Stall[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

    // Status autentikasi
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authFieldErrors, setAuthFieldErrors] = useState<
    Record<string, string>
  >({})

  // Data form
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formConfirmPassword, setFormConfirmPassword] = useState('')

  // Status form warung
  const [stallFormOpen, setStallFormOpen] = useState(false)
  const [editingStall, setEditingStall] = useState<Stall | null>(null)
  const [stallFormLoading, setStallFormLoading] = useState(false)
  const [stallFormError, setStallFormError] = useState('')
  const [stallFieldErrors, setStallFieldErrors] = useState<
    Record<string, string>
  >({})

  // Input form warung
  const [stallName, setStallName] = useState('')
  const [stallCategory, setStallCategory] = useState('')
  const [stallLocation, setStallLocation] = useState('')
  const [stallDescription, setStallDescription] = useState('')

  // Hak akses berdasarkan role
  const isAdmin = user?.role === 'admin'
  const isOwner = user?.role === 'owner'
  const canManageStall = isAdmin || isOwner
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilter = search !== '' || category !== ''

  function resetFilters() {
    setSearchInput('')
    setCategoryInput('')
  }

  async function openStall(id: number) {
  try {
    setSelectedStall(null)
    setDetailError('')
    setDetailLoading(true)

    const result = await getStall(id)
    setSelectedStall(result)
  } catch (err) {
    setDetailError(errorMessage(err))
  } finally {
    setDetailLoading(false)
  }
  }

    // Memeriksa sesi login saat aplikasi dibuka
  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      const token = getToken()

      if (!token) return

      try {
        const currentUser = await getCurrentUser()

        if (!cancelled) {
          setUser(currentUser)
        }
      } catch (err) {
        // Cuma hapus token kalau backend bilang token-nya memang tidak valid (401).
        // Gagal konek / server mati: token dibiarkan, user bisa login otomatis lagi nanti.
        if (isApiError(err) && err.status === 401) {
          clearToken()

          if (!cancelled) {
            setUser(null)
          }
        }
      }
    }

    void checkAuth()

    return () => {
      cancelled = true
    }
  }, [])

    // Sesi berakhir: sinyal ini dikirim http.ts saat backend membalas 401
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setStallFormOpen(false)
      setAuthMode('login')
      setAuthMessage('')
      setAuthFieldErrors({})
      setAuthError('Sesi kamu berakhir. Silakan login lagi.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

    function openAuth(mode: 'login' | 'register') {
    setAuthMode(mode)
    setAuthError('')
    setAuthMessage('')
    setAuthFieldErrors({})
  }

  // Proses login
  async function handleLogin() {
    try {
      setAuthLoading(true)
      setAuthError('')
      setAuthFieldErrors({})
      setAuthMessage('')

      const payload: LoginPayload = {
        email: formEmail,
        password: formPassword,
      }

      const result = await login(payload)

      setToken(result.token)
      setUser(result.user)
      setAuthMode(null)
      setFormPassword('')
      setFormConfirmPassword('')
    } catch (err) {
      setAuthError(errorMessage(err))
      setAuthFieldErrors(getFieldErrors(err))
    } finally {
      setAuthLoading(false)
    }
  }

  // Proses registrasi
  async function handleRegister() {
    try {
      setAuthLoading(true)
      setAuthError('')
      setAuthFieldErrors({})
      setAuthMessage('')

      if (formPassword !== formConfirmPassword) {
        setAuthFieldErrors({
          confirmPassword: 'Konfirmasi password tidak cocok.',
        })
        return
      }

      const payload: RegisterPayload = {
        name: formName,
        email: formEmail,
        password: formPassword,
      }

      const result = await register(payload)

      setAuthMessage(result.message || 'Registrasi berhasil. Silakan login.')
      setAuthMode('login')
      setFormPassword('')
      setFormConfirmPassword('')
    } catch (err) {
      setAuthError(errorMessage(err))
      setAuthFieldErrors(getFieldErrors(err))
    } finally {
      setAuthLoading(false)
    }
  }

  // Proses logout
  function handleLogout() {
    clearToken()
    setUser(null)
    setAuthMode(null)
    setAuthMessage('')
    setAuthError('')
  }

    // Membuka form tambah warung
  function openCreateStallForm() {
    setEditingStall(null)
    setStallName('')
    setStallCategory('')
    setStallLocation('')
    setStallDescription('')
    setStallFormError('')
    setStallFieldErrors({})
    setStallFormOpen(true)
  }

  // Membuka form edit warung
  function openEditStallForm(stall: Stall) {
    setEditingStall(stall)
    setStallName(stall.name)
    setStallCategory(stall.category)
    setStallLocation(stall.location || '')
    setStallDescription(stall.description || '')
    setStallFormError('')
    setStallFieldErrors({})
    setStallFormOpen(true)
  }

    // Menyimpan data warung
  async function handleSaveStall() {
    const clientErrors: Record<string, string> = {}

    if (!stallName.trim()) clientErrors.name = 'Nama warung wajib diisi.'
    if (!stallCategory.trim()) clientErrors.category = 'Kategori wajib diisi.'

    if (Object.keys(clientErrors).length > 0) {
      setStallFieldErrors(clientErrors)
      setStallFormError('')
      return
    }

    const payload: StallPayload = {
      name: stallName.trim(),
      category: stallCategory.trim(),
      location: stallLocation.trim() || undefined,
      description: stallDescription.trim() || undefined,
    }

    try {
      setStallFormLoading(true)
      setStallFormError('')
      setStallFieldErrors({})

      if (editingStall) {
        await updateStall(editingStall.id, payload)
        setReloadKey((k) => k + 1) // tetap di halaman yang sama
      } else {
        await createStall(payload)
        // bersihin filter supaya warung baru pasti kelihatan
        setSearchInput('')
        setCategoryInput('')
        setSearch('')
        setCategory('')
        setPage(Math.max(1, Math.ceil((total + 1) / PAGE_SIZE)))
        setReloadKey((k) => k + 1)
      }

      setStallFormOpen(false)
    } catch (err) {
      setStallFormError(errorMessage(err))
      setStallFieldErrors(getFieldErrors(err))
    } finally {
      setStallFormLoading(false)
    }
  }

    // Menghapus warung (khusus Admin)
  async function handleDeleteStall(stall: Stall) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus warung "${stall.name}"?`
    )

    if (!confirmed) return

    try {
      await deleteStall(stall.id)

      // kalau yang dihapus satu-satunya kartu di halaman ini, mundur satu halaman
      if (stalls.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setReloadKey((k) => k + 1)
      }
    } catch (err) {
      alert(errorMessage(err))
    }
  }

      // Jeda 0,4 detik setelah user berhenti mengetik, lalu kembali ke halaman 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setCategory(categoryInput.trim())
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchInput, categoryInput])

  useEffect(() => {
    let cancelled = false

    async function loadStalls() {
      try {
        setLoading(true)
        setError('')

        const result = await getStalls({
          page,
          limit: PAGE_SIZE,
          // string kosong jangan dikirim, biar backend tidak menolaknya
          search: search || undefined,
          category: category || undefined,
        })

        if (!cancelled) {
          setStalls(result.items)
          setTotal(result.meta.total)
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadStalls()

    return () => {
      cancelled = true
    }
  }, [page, search, category, reloadKey])

  return (
    <div className="min-h-screen bg-page text-text">
      {/* Navbar */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary p-2 text-white">
              <Store size={22} />
            </div>
            <span className="text-xl font-bold">Review Kantin</span>
          </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm font-medium">
                    {user.name} ({user.role})
                  </span>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
                  >
                    <LogIn size={16} />
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    <UserPlus size={16} />
                    Register
                  </button>
                </>
              )}
            </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <section className="mb-10 rounded-2xl bg-surface-muted px-8 py-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Temukan favoritmu
          </p>

          <h1 className="mb-3 max-w-2xl text-3xl font-bold md:text-4xl">
            Temukan tempat makan favorit di sekitar kampus!
          </h1>

          <p className="max-w-xl text-text-muted">
            Jelajahi berbagai warung, lihat informasi, dan temukan
            pilihan kuliner yang cocok buat kamu.
          </p>
        </section>

        {/* Daftar Warung */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Daftar Warung</h2>
              <p className="mt-1 text-text-muted">
                Temukan pilihan kuliner yang tersedia.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!loading && !error && (
                <span className="text-sm text-text-muted">
                  {total} warung tersedia
                </span>
              )}

              {canManageStall && (
                <button
                  type="button"
                  onClick={openCreateStallForm}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  <Plus size={16} />
                  Tambah Warung
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative min-w-60 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari warung..."
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-4 outline-none focus:border-primary"
              />
            </div>

            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Kategori (contoh: Nasi)"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary sm:w-56"
            />

            {(searchInput || categoryInput) && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
              >
                Reset
              </button>
            )}
          </div>

          {loading && (
            <div className="rounded-xl bg-surface p-10 text-center shadow-card">
              <p className="text-text-muted">Memuat daftar warung...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-danger/20 bg-danger-bg p-6 text-center">
              <p className="font-semibold text-danger">
                Gagal memuat daftar warung
              </p>
              <p className="mt-2 text-sm text-danger">{error}</p>
              <p className="mt-3 text-sm text-text-muted">
                Pastikan backend sedang berjalan, lalu muat ulang halaman.
              </p>
            </div>
          )}

          {!loading && !error && stalls.length === 0 && (
            <div className="rounded-xl bg-surface p-10 text-center shadow-card">
              <Store className="mx-auto mb-3 text-text-muted" size={32} />
              <p className="font-semibold">
                {hasFilter
                  ? 'Warung tidak ditemukan.'
                  : 'Belum ada warung tersedia.'}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {hasFilter
                  ? 'Coba kata kunci atau kategori lain.'
                  : 'Daftar warung masih kosong.'}
              </p>
              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
                >
                  Reset pencarian
                </button>
              )}
            </div>
          )}

          {!loading && !error && stalls.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stalls.map((stall) => (
                <div
                  key={stall.id}
                  onClick={() => void openStall(stall.id)}
                  className="w-full rounded-xl border border-border bg-surface p-5 text-left shadow-card transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-surface-muted p-3 text-primary">
                      <Store size={24} />
                    </div>

                    {stall.isPopular && (
                      <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning">
                        Populer
                      </span>
                    )}
                  </div>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    {stall.category}
                  </p>

                  <h3 className="mb-2 text-lg font-bold">
                    {stall.name}
                  </h3>

                  <p className="mb-4 min-h-10 text-sm text-text-muted">
                    {stall.description || 'Belum ada deskripsi warung.'}
                  </p>

                  <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                    <div className="flex items-center gap-1 text-text-muted">
                      <MapPin size={15} />
                      <span>{stall.location || 'Lokasi belum tersedia'}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold">
                      <Star size={15} className="fill-warning text-warning" />
                      <span>{Number(stall.avgRating || 0).toFixed(1)}</span>
                      <span className="text-text-muted">
                        ({stall.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-border pt-4">
                    {(isAdmin || (isOwner && stall.ownerId === user?.id)) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditStallForm(stall)
                        }}
                        className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleDeleteStall(stall)
                        }}
                        className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {!error && total > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted disabled:opacity-50"
            >
              Sebelumnya
            </button>

            <span className="text-sm text-text-muted">
              Halaman {page} dari {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        )}
      </main>
      
      {stallFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-dialog">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingStall ? 'Edit Warung' : 'Tambah Warung'}
              </h2>

              <button
                type="button"
                onClick={() => setStallFormOpen(false)}
                className="rounded-lg p-2 hover:bg-surface-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Nama Warung
              </label>
              <input
                type="text"
                value={stallName}
                onChange={(e) => setStallName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                placeholder="Masukkan nama warung"
              />
              <FieldError message={stallFieldErrors.name} />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Kategori
              </label>
              <input
                type="text"
                value={stallCategory}
                onChange={(e) => setStallCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                placeholder="Contoh: Bakso, Mie Ayam"
              />
              <FieldError message={stallFieldErrors.category} />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Lokasi
              </label>
              <input
                type="text"
                value={stallLocation}
                onChange={(e) => setStallLocation(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                placeholder="Masukkan lokasi warung"
              />
              <FieldError message={stallFieldErrors.location} />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Deskripsi
              </label>
              <textarea
                value={stallDescription}
                onChange={(e) => setStallDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                rows={3}
                placeholder="Ceritakan tentang warung"
              />
              <FieldError message={stallFieldErrors.description} />
            </div>

            {stallFormError && Object.keys(stallFieldErrors).length === 0 && (
              <p className="mb-4 text-sm text-danger">
                {stallFormError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleSaveStall()}
              disabled={stallFormLoading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {stallFormLoading
                ? 'Menyimpan...'
                : editingStall
                  ? 'Simpan Perubahan'
                  : 'Tambah Warung'}
            </button>
          </div>
        </div>
      )}

      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-dialog">
            <h2 className="mb-2 text-2xl font-bold">
              {authMode === 'login' ? 'Login' : 'Buat Akun'}
            </h2>

            <p className="mb-6 text-sm text-text-muted">
              {authMode === 'login'
                ? 'Masuk ke akun Review Kantin kamu.'
                : 'Daftarkan akun baru untuk mulai menggunakan Review Kantin.'}
            </p>

            {authMode === 'register' && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Nama</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                  placeholder="Masukkan nama"
                />
                <FieldError message={authFieldErrors.name} />
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                placeholder="Masukkan email"
              />
              <FieldError message={authFieldErrors.email} />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                placeholder="Masukkan password"
              />
              <FieldError message={authFieldErrors.password} />
            </div>

            {authMode === 'register' && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Konfirmasi Password</label>
                <input
                  type="password"
                  value={formConfirmPassword}
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary"
                  placeholder="Ulangi password"
                />
                <FieldError message={authFieldErrors.confirmPassword} />
              </div>
            )}

            {authError && Object.keys(authFieldErrors).length === 0 && (
              <p className="mb-4 text-sm text-danger">{authError}</p>
            )}

            {authMessage && (
              <p className="mb-4 text-sm text-green-600">{authMessage}</p>
            )}

            <button
              type="button"
              disabled={authLoading}
              onClick={() => {
                if (authMode === 'login') {
                  void handleLogin()
                } else {
                  void handleRegister()
                }
              }}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {authLoading
                ? 'Memproses...'
                : authMode === 'login'
                  ? 'Login'
                  : 'Register'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode(null)
                setAuthError('')
                setAuthMessage('')
                setAuthFieldErrors({})
              }}
              className="mt-3 w-full rounded-lg border border-border px-4 py-2 font-semibold hover:bg-surface-muted"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {(detailLoading || detailError || selectedStall) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-dialog">
      {detailLoading && (
        <p className="text-center">Memuat detail warung...</p>
      )}

      {detailError && (
        <div>
          <p className="font-semibold text-danger">
            Gagal memuat detail warung
          </p>
          <p className="mt-2 text-sm">{detailError}</p>
        </div>
      )}

      {selectedStall && (
        <div>
          <p className="mb-2 text-sm font-semibold uppercase text-primary">
            {selectedStall.category}
          </p>

          <h2 className="mb-3 text-2xl font-bold">
            {selectedStall.name}
          </h2>

          <p className="mb-4 text-sm text-text-muted">
            {selectedStall.description || 'Belum ada deskripsi.'}
          </p>

          <p className="mb-2">
            <MapPin size={16} className="mr-2 inline" />
            {selectedStall.location || 'Lokasi belum tersedia'}
          </p>

          <p className="mb-5">
            <Star size={16} className="mr-2 inline text-warning" />
            {Number(selectedStall.avgRating || 0).toFixed(1)}
            {' '}({selectedStall.reviewCount} ulasan)
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setSelectedStall(null)
          setDetailError('')
        }}
        disabled={detailLoading}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
      >
        Tutup
      </button>
    </div>
  </div>
)}

      <footer className="mt-16 border-t border-border bg-surface px-6 py-6 text-center text-sm text-text-muted">
        © 2026 Review Kantin. Jelajahi kuliner kampus dengan mudah.
      </footer>
    </div>
  )
}
