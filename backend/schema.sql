CREATE DATABASE IF NOT EXISTS les_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE les_db;

CREATE TABLE IF NOT EXISTS cabang (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  alamat TEXT NOT NULL,
  status ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('pusat','cabang','guru') NOT NULL,
  cabang_id VARCHAR(36) NULL,
  teacher_id VARCHAR(36) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_cabang FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS guru (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  no_telp VARCHAR(30) NOT NULL,
  no_pegawai VARCHAR(50) NULL,
  tanggal_lahir DATE NULL,
  alamat TEXT NULL,
  jenjang ENUM('TK','SD','SMP','SMA_SMK') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_guru_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS guru_cabang (
  guru_id VARCHAR(36) NOT NULL,
  cabang_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (guru_id, cabang_id),
  CONSTRAINT fk_gc_guru FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  CONSTRAINT fk_gc_cabang FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS guru_jenjang (
  guru_id VARCHAR(36) NOT NULL,
  jenjang ENUM('TK','SD','SMP','SMA_SMK') NOT NULL,
  PRIMARY KEY (guru_id, jenjang),
  CONSTRAINT fk_gj_guru FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS siswa (
  id VARCHAR(36) PRIMARY KEY,
  cabang_id VARCHAR(36) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  tempat_lahir VARCHAR(100) NOT NULL DEFAULT '',
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  nama_ibu VARCHAR(150) NOT NULL,
  no_telp_ortu VARCHAR(30) NOT NULL,
  jenjang ENUM('TK','SD','SMP','SMA_SMK') NOT NULL,
  kelas TINYINT NOT NULL,
  guru_id VARCHAR(36) NULL,
  status ENUM('aktif','cuti','keluar') NOT NULL DEFAULT 'aktif',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_siswa_cabang FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE CASCADE,
  CONSTRAINT fk_siswa_guru FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE SET NULL,
  INDEX idx_siswa_cabang_del (cabang_id, deleted_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tarif_spp (
  id VARCHAR(36) PRIMARY KEY,
  jenjang ENUM('TK','SD','SMP','SMA_SMK') NOT NULL,
  kelas_min TINYINT NOT NULL,
  kelas_max TINYINT NOT NULL,
  nominal DECIMAL(12,2) NOT NULL,
  berlaku_sejak DATE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pembayaran_spp (
  id VARCHAR(36) PRIMARY KEY,
  siswa_id VARCHAR(36) NOT NULL,
  cabang_id VARCHAR(36) NOT NULL,
  bulan TINYINT NOT NULL,
  tahun SMALLINT NOT NULL,
  nominal DECIMAL(12,2) NOT NULL,
  status ENUM('belum_bayar','lunas') NOT NULL DEFAULT 'belum_bayar',
  nama_pembayar VARCHAR(150) NULL,
  tanggal_bayar DATE NULL,
  no_kwitansi VARCHAR(60) NULL,
  kwitansi_url VARCHAR(255) NULL,
  dikirim_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_spp_siswa FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  CONSTRAINT fk_spp_cabang FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE CASCADE,
  CONSTRAINT unique_spp_siswa_bulan_tahun UNIQUE (siswa_id, bulan, tahun)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transaksi (
  id VARCHAR(36) PRIMARY KEY,
  cabang_id VARCHAR(36) NOT NULL,
  tipe ENUM('masuk','keluar') NOT NULL,
  kategori VARCHAR(80) NOT NULL,
  nominal DECIMAL(12,2) NOT NULL,
  keterangan TEXT NOT NULL,
  tanggal DATE NOT NULL,
  referensi_id VARCHAR(36) NULL,
  CONSTRAINT fk_trx_cabang FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE CASCADE,
  INDEX idx_trx_cabang_tgl (cabang_id, tanggal)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jadwal (
  id VARCHAR(36) PRIMARY KEY,
  guru_id VARCHAR(36) NOT NULL,
  siswa_id VARCHAR(36) NULL,
  cabang_id VARCHAR(36) NOT NULL,
  hari ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  CONSTRAINT fk_jadwal_guru FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  CONSTRAINT fk_jadwal_cabang FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed minimal: 1 cabang + 1 admin pusat (password: admin123)
INSERT IGNORE INTO cabang (id, nama, alamat, status) VALUES
('cab-1', 'Cabang Jakarta Selatan', 'Jl. Contoh No.1', 'aktif');

INSERT IGNORE INTO users (id, nama, email, password_hash, role, cabang_id, is_active) VALUES
-- hash bcrypt untuk 'admin123'
('usr-admin', 'Admin Pusat', 'admin@lespintar.id', '$2a$10$5m1Pl.GMOKz2qDKzE3dZgOtQJmXOvXhV6JUO3nvrZUyx143uK4xt.', 'pusat', NULL, 1);

INSERT IGNORE INTO tarif_spp (id, jenjang, kelas_min, kelas_max, nominal, berlaku_sejak) VALUES
('trf-tk', 'TK', 0, 0, 150000, '2026-01-01'),
('trf-sd1', 'SD', 1, 3, 150000, '2026-01-01'),
('trf-sd2', 'SD', 4, 6, 175000, '2026-01-01'),
('trf-smp', 'SMP', 7, 9, 200000, '2026-01-01'),
('trf-sma', 'SMA_SMK', 10, 12, 225000, '2026-01-01');
