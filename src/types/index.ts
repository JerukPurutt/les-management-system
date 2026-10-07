export type Role = 'pusat' | 'cabang' | 'guru';
export type Theme = 'dark' | 'light';

export type StudentStatus = 'aktif' | 'cuti' | 'keluar';
export type SPPStatus = 'belum_bayar' | 'lunas';
export type Jenjang = 'TK' | 'SD' | 'SMP' | 'SMA_SMK';

export interface Cabang {
  id: string;
  nama: string;
  alamat: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
}

export interface User {
  id: string;
  nama: string;
  email: string;
  noPegawai?: string;
  tanggalLahir?: string; // YYYY-MM-DD
  password?: string;
  role: Role;
  cabangId?: string | null;
  teacherId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Guru {
  id: string;
  userId: string;
  nama: string;
  email: string;
  noTelp: string;
  noPegawai?: string;
  tanggalLahir?: string;
  alamat?: string;
  jenjang: Jenjang;
  cabangIds: string[]; // Many to many
  isActive: boolean;
}

export interface Siswa {
  id: string;
  cabangId: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  namaIbu: string;
  noTelpOrtu: string;
  jenjang: Jenjang;
  kelas: number; // e.g. 0 for TK, 1-6 for SD, 7-9 for SMP, 10-12 for SMA/SMK
  guruId?: string | null;
  status: StudentStatus;
  createdAt: string;
  deletedAt?: string | null;
}

export interface TarifSPP {
  id: string;
  jenjang: Jenjang;
  kelasMin: number;
  kelasMax: number;
  nominal: number;
  berlakuSejak: string;
}

export interface Pendaftaran {
  id: string;
  siswaId: string;
  biaya: number;
  diskon: number;
  keteranganDiskon?: string;
  total: number;
  tanggal: string;
}

export interface PembayaranSPP {
  id: string;
  siswaId: string;
  cabangId: string;
  bulan: number; // 1-12
  tahun: number; // 2026
  nominal: number;
  status: SPPStatus;
  namaPembayar?: string;
  tanggalBayar?: string;
  noKwitansi?: string;
  kwitansiUrl?: string;
  dikirimAt?: string | null;
  createdAt: string;
}

export interface Jadwal {
  id: string;
  guruId: string;
  siswaId: string;
  cabangId: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamMulai: string; // e.g. "14:00"
  jamSelesai: string; // e.g. "15:30"
}

export interface Transaksi {
  id: string;
  cabangId: string;
  tipe: 'masuk' | 'keluar';
  kategori: string;
  nominal: number;
  keterangan: string;
  tanggal: string;
  referensiId?: string | null;
  buktiUrl?: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userNama: string;
  action: string;
  details: string;
}
