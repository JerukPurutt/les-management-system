# Dokumen Sistem Manajemen Tempat Les (Multi-Cabang)

Aplikasi Web Manajemen Tempat Les Multi-Cabang telah dikembangkan lengkap dengan gaya desain modern ala **shadcn.com** (Zinc/Slate theme, badges, modal dialog, grafik Recharts, & kwitansi PDF/WA).

---
## 🚀 Cara Menjalankan Aplikasi Web

1. **Jalankan Mode Pengembang (Development):**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173` (atau port Vite yang tersedia).

2. **Jalankan Mode Produksi (Preview Build):**
   ```bash
   npm run preview
   ```

---

## 🏛️ Fitur Per Peran & Panduan Penggunaan

### 1. Pimpinan Pusat (Role: `pusat`)
- **Dashboard Pusat:** Monitoring ringkasan angka total cabang, total siswa aktif, dan total guru di semua cabang.
- **Manajemen Cabang:** Tambah cabang baru (yang secara otomatis membuat akun login **Pimpinan Cabang** baru), edit nama/alamat/status operasional cabang, hapus cabang dengan konfirmasi aman, dan aktifkan/nonaktifkan cabang.
- **Daftar Guru (Semua Cabang):** Memantau alokasi pengajar & indikator slot siswa diajar (misalnya `4/6 Slot`), menambah guru pusat dengan NIP otomatis, serta mengubah peran guru biasa menjadi Pimpinan Cabang.
- **Pengaturan Tarif SPP:** Atur tarif SPP global per jenjang (`TK`, `SD`, `SMP`, `SMA/SMK`) dan biaya pendaftaran. Perubahan tarif bersifat *forward-looking* dan tidak mengubah riwayat lampau.
- **Audit Log & Keamanan:** Catatan audit log transparan untuk setiap perubahan data penting.

### 2. Pimpinan Cabang (Role: `cabang`)
- **Dashboard Cabang:** Kartu KPI (Siswa Aktif, SPP Belum Bayar 🔴, Slot Guru, Saldo Kas), Grafik Distribusi Siswa per Jenjang, dan Grafik Pemasukan vs Pengeluaran.
- **Pendaftaran Siswa Baru:** Form pendaftaran lengkap dengan kalkulasi diskon manual. Mengisi pendaftaran secara otomatis mencatat pemasukan cabang (`Rp100.000 - diskon`) dan membuat tagihan SPP bulan berjalan (🔴 Belum Bayar).
- **Import Data Siswa via Excel (.xlsx / .csv):**
  - Tombol **"Import Excel Siswa"** dengan unduhan **Template Excel resmi**.
  - Deteksi otomatis jenjang pendidikan berdasarkan angka kelas: `1-6` = SD, `7-9` = SMP, `10-12` (misal 11) = SMA/SMK, `0` = TK.
  - Membaca kolom Nama, Kelas, Tempat Lahir, Tanggal Lahir, No WA Ortu, Alamat, Nama Ibu, & Diskon dengan tabel preview interaktif.
- **Manajemen Siswa:**
  - Tabel siswa lengkap dengan badge SPP (🔴 Belum Bayar / 🟢 Lunas) dan badge status (🟢 Aktif / 🟡 Cuti / ⚫ Keluar).
  - **Auto-Assign Otomatis (1-Klik ⚡):** Algoritma cerdas yang secara otomatis mencocokkan siswa belum berguru dengan guru berjenjang sama secara merata (load-balanced) & mematuhi kuota maks 6 siswa/guru.
  - **Batch Multi-Select (Centang Banyak Siswa ☑️):** Fitur penugasan massal dengan mencentang 5-10 siswa sekaligus lalu menugaskannya ke 1 guru terpilih dalam 1x klik.
  - Penugasan Guru dengan validasi ketat: Dropdown hanya menampilkan guru dengan jenjang yang cocok dan **menolak penugasan ke-7** (Maksimal 6 siswa per guru total di semua cabang).
  - Soft delete siswa (sembunyikan dari daftar, simpan riwayat keuangan).
  - Aksi Massal **"Naik Kelas"** tahun ajaran.
- **Manajemen Guru & Jadwal:**
  - Menambah guru cabang dan **Import Data Guru via Excel** (dengan pembacaan Nama, No WA, Jenjang, & Alamat).
  - Edit & Hapus Guru cabang.
  - Mengatur jadwal mengajar (Hari, Jam Mulai, Jam Selesai) dengan **deteksi bentrok jam otomatis** (termasuk lintas cabang).
- **Modul Keuangan & Kwitansi:**
  - Form **Catat SPP**: Mengubah badge menjadi 🟢 Lunas, menerbitkan Nomor Kwitansi resmi (misal `KW/CAB01/2026/09/0001`), dan otomatis mencatat sebagai pemasukan cabang.
  - Modal **Preview Kwitansi PDF**: Tombol Cetak / Download PDF & Tombol **"Kirim ke Orang Tua"** via WhatsApp (`https://wa.me/62...`) yang mencatat timestamp `dikirim_at`.
  - Transaksi Manual (Gaji Guru, Sewa, Listrik, Buku, Uniform).
  - **Laporan Bulanan**: Rekapitulasi Laba/Rugi bulanan & Ekspor ke PDF / Excel.

### 3. Guru (Role: `guru`)
- **Jadwal Mengajar Saya:** Tampilan kalender mingguan (Hari, Jam, Nama Siswa, Jenjang, Cabang) dari seluruh cabang tempat guru mengajar. Read-only tanpa akses ke data keuangan atau data sensitif orang tua.

---

## ⚡ Simulator Cron Job Scheduler (Tanggal 1 00:05)
Aplikasi ini dilengkapi **Simulator Cron Job** (Tombol `Cron SPP Tgl 1` di bar header):
- Setiap tanggal 1, sistem membuat tagihan SPP baru berstatus 🔴 Belum Bayar untuk setiap siswa berstatus `Aktif`.
- **Sifat Idempoten:** Menjalankan Cron Job 2 kali pada bulan yang sama tidak akan menghasilkan tagihan ganda (dilindungi constraint unik `unique(siswa_id, bulan, tahun)`).
- Siswa berstatus `Cuti` atau `Keluar` dilewati otomatis.

---

## 🗄️ Struktur Kode Backend Laravel (`/backend`)
Untuk keperluan deployment backend Laravel + MySQL:
1. `backend/database/migrations/`: File migrasi untuk tabel `cabang`, `users`, `guru`, `guru_cabang`, `siswa` (dengan `softDeletes`), `tarif_spp`, `pembayaran_spp` (dengan `unique_spp_siswa_bulan_tahun`), `jadwal`, dan `transaksi`.
2. `backend/app/Services/SPPBillingService.php`: Logika bisnis pembuat tagihan SPP bulanan dengan `DB::transaction` dan lock.
3. `backend/app/Http/Controllers/SiswaController.php`: Pengatur penugasan guru dengan pengunci database untuk mencegah race condition penugasan ke-7.

---

## ✅ Skenario Pengujian Penting (Section 11 SRS)
1. **Penugasan siswa ke-7 pada satu guru ditolak:** Dilakukan pengujian di modal penugasan & `SiswaController.php`.
2. **Guru SMP tidak muncul saat menugaskan siswa SMA/SMK:** Filter kriteria jenjang diterapkan di dropdown & backend handler.
3. **Cron dijalankan dua kali tidak membuat tagihan ganda:** Terverifikasi via constraint unik & simulator idempotensi.
4. **Perubahan tarif SPP:** Tarif baru hanya berlaku untuk tagihan SPP mendatang; nominal tagihan lampau disalin secara permanen.
5. **Soft delete siswa:** Siswa yang di-soft-delete tersembunyi dari tabel manajemen siswa tetapi transaksi keuangannya tetap utuh di laporan bulanan.
6. **Perubahan nomor HP:** Format `0812...` dikonversi dengan presisi menjadi `62812...` untuk link WhatsApp.
