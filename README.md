# Review Kantin API - Tugas 3 (Validasi, Error, Auth)

## Setup
1. Jalankan file SQL di folder `db/` berurutan: 01, 02, 03.
2. Salin `.env.example` jadi `.env`, lalu isi DB_USER, DB_PASSWORD, JWT_SECRET.
3. `npm install`
4. `npm run dev` (otomatis generate dokumentasi Swagger)

Server: http://localhost:3000
Dokumentasi API: http://localhost:3000/docs

## Akun uji (password: password123)
- budi@test.com (customer)
- owner1@test.com, owner2@test.com (owner)
- admin@test.com (admin)

Register selalu membuat role customer. Role owner dan admin
dipromosikan manual lewat database, contoh:
UPDATE users SET role = 'owner' WHERE email = 'owner1@test.com';
