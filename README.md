# Les Management System

Aplikasi web manajemen tempat les multi-cabang dengan tiga peran: **Pimpinan Pusat**, **Pimpinan Cabang**, dan **Guru**.

| Bagian   | Teknologi                          |
| -------- | ---------------------------------- |
| Frontend | React 19 + Vite 6 + Tailwind CSS 4 |
| Backend  | Express 4 + MySQL 8 (JWT + bcrypt) |
| Grafik   | Recharts                           |
| Import   | Excel/CSV via `xlsx`               |

Detail fitur per peran ada di [`DOCUMENTATION.md`](./DOCUMENTATION.md).

---

## Struktur Proyek

```text
├── src/                    # Frontend React (Vite, SPA)
│   ├── components/         # auth, common, cron, pusat, cabang, guru
│   ├── data/               # Data awal untuk mode demo tanpa backend
│   ├── types/              # Tipe TypeScript (Cabang, Siswa, Guru, SPP, ...)
│   └── utils/              # Helper + import Excel
├── backend/                # API Express (satu file: index.js)
│   ├── index.js            # Seluruh endpoint + validasi transaksi
│   ├── schema.sql          # Skema MySQL + seed awal
│   └── .env.example        # Template konfigurasi
├── public/                 # Aset statis
└── DOCUMENTATION.md        # Panduan fitur per peran
```

---

## Cara Menjalankan

### 1. Backend (API + Database)

Butuh **MySQL 8** berjalan (misal via Laragon/XAMPP) dan database `les_db`:

```bash
cd backend
cp .env.example .env        # sesuaikan DB_USER / DB_PASS bila perlu
npm install
mysql -u root < schema.sql  # buat tabel + seed awal
node index.js               # API jalan di http://localhost:3001
```

Cek kesehatan: `GET http://localhost:3001/api/health` → `{ "ok": true, "db": "up" }`.

Akun seed:

| Email                | Password   | Peran        |
| -------------------- | ---------- | ------------ |
| `admin@lespintar.id` | `admin123` | Pimpinan Pusat |

> Ganti `JWT_SECRET` di `.env` dengan string acak minimal 32 karakter untuk produksi.

### 2. Frontend (tanpa backend = mode demo)

```bash
npm install
npm run dev      # http://localhost:5173 (wajib: backend menyala dulu)
npm run build    # output produksi ke dist/
npm run preview  # pratinjau hasil build
```

> Frontend tersambung ke API via `src/utils/api.ts` (base URL default `http://localhost:3001`,
> override dengan `VITE_API_URL`). Login memakai JWT yang disimpan di `localStorage`.
> Setiap aksi simpan langsung ke MySQL lalu refresh dari server.

---

## Ringkasan Endpoint API

Base URL: `http://localhost:3001/api` — semua rute (kecuali login & health) butuh header `Authorization: Bearer <token>`.

> Dokumentasi interaktif + uji coba langsung: buka **`http://localhost:3001/api/docs`** (Swagger UI).
> Alur: `POST /auth/login` → copy `token` → tombol **Authorize** → tempel `Bearer <token>` → Try it out.

| Method | Endpoint               | Akses        | Keterangan                              |
| ------ | ---------------------- | ------------ | --------------------------------------- |
| GET    | `/health`              | publik       | Status API + koneksi DB                 |
| POST   | `/auth/login`          | publik       | Login, dapat JWT (12 jam)               |
| GET    | `/auth/me`             | semua        | Profil user dari token                  |
| GET    | `/cabang`              | semua        | Daftar cabang                           |
| POST   | `/cabang`              | pusat        | Tambah cabang + auto akun pimpinan      |
| PUT    | `/cabang/:id`          | pusat        | Edit cabang                             |
| DELETE | `/cabang/:id`          | pusat        | Hapus cabang                            |
| GET    | `/guru?cabangId=`      | semua        | Daftar guru (filter cabang opsional)    |
| POST   | `/guru`                | pusat/cabang | Tambah guru + akun + relasi cabang      |
| PUT    | `/guru/:id`            | pusat/cabang | Edit guru                               |
| DELETE | `/guru/:id`            | pusat/cabang | Hapus guru (siswa diasuh dilepas)       |
| GET    | `/siswa?cabangId=`     | semua        | Daftar siswa (sembunyikan soft-delete)  |
| POST   | `/siswa`               | pusat/cabang | Daftar siswa + auto transaksi & tagihan |
| PATCH  | `/siswa/:id/assign`    | pusat/cabang | Tugaskan guru (cek jenjang + kuota 6)   |
| PATCH  | `/siswa/:id/status`    | pusat/cabang | `aktif/cuti/keluar` (`keluar` lepas guru)|
| DELETE | `/siswa/:id`           | pusat/cabang | Soft delete (riwayat keuangan utuh)     |
| GET    | `/spp?...`             | semua        | Tagihan (filter cabang/bulan/tahun)     |
| POST   | `/spp/billing`         | pusat/cabang | Generate tagihan bulanan (idempoten)    |
| PATCH  | `/spp/:id/pay`         | pusat/cabang | Bayar → lunas + kwitansi + transaksi    |
| POST   | `/spp/:id/sent`        | semua        | Tandai kwitansi terkirim via WA         |
| GET    | `/transaksi?cabangId=` | semua        | Riwayat kas cabang                      |
| POST   | `/transaksi`           | pusat/cabang | Catat kas manual (masuk/keluar)         |

Aturan bisnis yang dijaga database (bukan sekadar di UI):

- `UNIQUE(siswa_id, bulan, tahun)` — cron/billing ganda tidak bikin tagihan dobel.
- `SELECT ... FOR UPDATE` — penugasan guru ke-7 ditolak walau request bersamaan.
- Soft delete siswa — transaksi & laporan tetap utuh.

---

## Variabel Environment Backend

| Nama         | Contoh      | Keterangan              |
| ------------ | ----------- | ----------------------- |
| `PORT`       | `3001`      | Port API                |
| `DB_HOST`    | `localhost` | Host MySQL              |
| `DB_PORT`    | `3306`      | Port MySQL              |
| `DB_USER`    | `root`      | User MySQL              |
| `DB_PASS`    | _(kosong)_  | Password MySQL          |
| `DB_NAME`    | `les_db`    | Nama database           |
| `JWT_SECRET` | _(acak)_    | Kunci tanda tangan JWT  |

---

## Catatan

- File `.env`, `node_modules/`, dan `dist/` tidak di-commit (lihat `.gitignore`).
- Tarif SPP default per jenjang ikut seed `schema.sql` (TK 150rb, SD 150/175rb, SMP 200rb, SMA 225rb).
