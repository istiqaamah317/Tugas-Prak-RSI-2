# Review Kantin - Tugas 4 (Frontend React + Integrasi Backend)

Sistem Review Kantin: backend REST API (Express + SQL Server) dari Tugas 2-3, dan frontend React (TypeScript) yang diintegrasikan pada Tugas 4.

## Teknologi

**Backend** (root repo)
- Node.js, Express, TypeScript
- Drizzle ORM + driver `mssql` (SQL Server)
- Validasi Zod, autentikasi JWT, role-based access
- Dokumentasi Swagger di `/docs`

**Frontend** (folder `frontend/`)
- React + TypeScript (Vite)
- **Axios** untuk seluruh komunikasi HTTP (metode integrasi yang dipilih)
- Tailwind CSS v4, lucide-react (ikon)

## Fitur Frontend

- Daftar warung dengan pencarian (`search`), filter kategori (`category`), dan pagination
- Detail warung (`GET /stalls/:id`)
- CRUD warung sesuai role (tambah, ubah, hapus)
- Registrasi, login, dan info pengguna (`/auth/me`)
- Tampilan berdasarkan role: public, customer, owner, admin
- Loading state, empty state, dan error state
- Pesan error validasi per kolom dari backend
- Penanganan 401 (sesi berakhir) dan 403 (tidak punya hak akses)

## Hak Akses per Role

| Role | Hak akses |
|------|-----------|
| Public | Melihat daftar dan detail warung, registrasi, login |
| Customer | Sama seperti public, tanpa akses pengelolaan warung |
| Owner | Membuat warung dan mengubah warung miliknya sendiri |
| Admin | Membuat, mengubah, dan menghapus warung |

Hapus warung hanya boleh dilakukan admin. Registrasi selalu membuat role `customer`.

## Prasyarat

- Node.js 20 atau lebih baru
- SQL Server yang sedang berjalan
- Git

## Instalasi dan Menjalankan

### 1. Database

Jalankan file SQL di folder `db/` secara berurutan: `01`, `02`, `03`.

### 2. Backend

```bash
# di root repo
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run dev
```

Isi `.env` (lihat bagian Environment). Backend jalan di `http://localhost:3000`, base URL API `http://localhost:3000/api/v1`, dokumentasi Swagger di `http://localhost:3000/docs`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run dev
```

Frontend jalan di `http://localhost:5173`. Port ini dikunci (`strictPort`) karena CORS backend hanya mengizinkan origin tersebut secara default.

Jalankan backend lebih dulu, baru frontend.

### Build frontend

```bash
cd frontend
npm run build
```

## Environment

**Backend** (`.env`, lihat `.env.example`)

| Variabel | Keterangan |
|----------|------------|
| `DB_SERVER`, `DB_PORT` | Alamat SQL Server |
| `DB_USER`, `DB_PASSWORD` | Login database (isi sendiri) |
| `DB_NAME` | Nama database (`review_kantin`) |
| `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE` | Opsi koneksi SQL Server |
| `JWT_SECRET` | Secret JWT, gunakan string acak minimal 32 karakter |
| `JWT_EXPIRES_IN` | Masa berlaku token (`1h`) |
| `CORS_ORIGIN` | Origin frontend yang diizinkan (default `http://localhost:5173`) |

**Frontend** (`frontend/.env`, lihat `frontend/.env.example`)

| Variabel | Keterangan |
|----------|------------|
| `VITE_API_BASE_URL` | Base URL backend, contoh `http://localhost:3000/api/v1` |

File `.env` tidak boleh di-commit. Hanya `.env.example` yang ada di repository.

## Akun Uji

Register lewat halaman frontend selalu membuat role `customer`. Untuk membuat owner atau admin, ubah role lewat database:

```sql
UPDATE users SET role = 'owner' WHERE email = 'email-akun-kamu@contoh.com';
UPDATE users SET role = 'admin' WHERE email = 'email-akun-kamu@contoh.com';
```

## Struktur Frontend

```
frontend/src/
  lib/
    http.ts      # instance Axios, base URL, interceptor token Bearer dan 401
    api.ts       # fungsi request (stalls CRUD, register, login, me)
    errors.ts    # normalisasi error menjadi ApiError
    token.ts     # simpan/baca/hapus token di localStorage
  types/         # tipe TypeScript (auth, stall)
  App.tsx        # halaman dan komponen UI
```

## Catatan Autentikasi

Token JWT disimpan di `localStorage` dan dikirim lewat header `Authorization: Bearer <token>`. Backend tidak punya endpoint logout, jadi logout dilakukan dengan menghapus token di frontend. Token dihapus otomatis hanya jika backend membalas 401.
