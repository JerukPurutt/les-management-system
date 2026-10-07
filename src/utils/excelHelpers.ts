import * as XLSX from 'xlsx';
import { Jenjang } from '../types';

export interface ParsedSiswaRow {
  nama: string;
  jenjang: Jenjang;
  kelas: number;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  namaIbu: string;
  noTelpOrtu: string;
  diskon: number;
}

export interface ParsedGuruRow {
  nama: string;
  alamat: string;
  noTelp: string;
  jenjang: Jenjang;
}

/**
 * Determine Jenjang and normalized Kelas integer based on user input
 * Rules:
 * - TK / PAUD / 0: TK (kelas 0)
 * - 1..6: SD
 * - 7..9: SMP
 * - 10..12 (or higher): SMA_SMK
 */
export function determineJenjangAndKelas(rawKelas: any, rawJenjang?: any): { jenjang: Jenjang; kelas: number } {
  const strKelas = String(rawKelas || '').toLowerCase().trim();
  const strJenjang = String(rawJenjang || '').toLowerCase().trim();

  // If explicitly specified as TK, PAUD, or 0 in kelas or jenjang column
  if (
    strKelas.includes('tk') ||
    strJenjang.includes('tk') ||
    strKelas.includes('paud') ||
    strJenjang.includes('paud') ||
    strKelas === '0'
  ) {
    return { jenjang: 'TK', kelas: 0 };
  }

  let kNum = parseInt(strKelas.replace(/[^0-9]/g, ''), 10);
  if (isNaN(kNum)) {
    if (strJenjang.includes('smp')) kNum = 7;
    else if (strJenjang.includes('sma') || strJenjang.includes('smk')) kNum = 10;
    else if (strJenjang.includes('sd')) kNum = 1;
    else kNum = 1;
  }

  if (kNum <= 0) {
    return { jenjang: 'TK', kelas: 0 };
  } else if (kNum >= 1 && kNum <= 6) {
    return { jenjang: 'SD', kelas: kNum };
  } else if (kNum >= 7 && kNum <= 9) {
    return { jenjang: 'SMP', kelas: kNum };
  } else {
    // 10, 11, 12, etc -> SMA/SMK
    return { jenjang: 'SMA_SMK', kelas: kNum > 12 ? 12 : kNum };
  }
}

/**
 * Determine Jenjang from string e.g. "SD", "SMP", "SMA/SMK", "SMA"
 */
export function determineJenjangGuru(rawJenjang: any): Jenjang {
  const str = String(rawJenjang || '').toLowerCase().trim();
  if (str.includes('tk')) return 'TK';
  if (str.includes('smp')) return 'SMP';
  if (str.includes('sma') || str.includes('smk')) return 'SMA_SMK';
  return 'SD';
}

/**
 * Parse uploaded Excel or CSV file for Siswa
 */
export async function parseSiswaExcel(file: File): Promise<ParsedSiswaRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const result: ParsedSiswaRow[] = [];

  for (const row of jsonData) {
    // Find keys ignoring case & whitespace
    const keys = Object.keys(row);
    const getValue = (...possibleKeys: string[]): string => {
      for (const pk of possibleKeys) {
        const foundKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === pk.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    const nama = getValue('nama', 'namasiswa', 'nama_siswa');
    if (!nama) continue; // Skip empty rows

    const rawKelas = getValue('kelas', 'kelassiswa', 'tingkat');
    const rawJenjang = getValue('jenjang', 'jenjangsiswa', 'tingkatpendidikan');
    const { jenjang, kelas } = determineJenjangAndKelas(rawKelas, rawJenjang);

    let tempatLahir = getValue('tempatlahir', 'tempat_lahir', 'tempat');
    let tanggalLahir = getValue('tanggallahir', 'tanggal_lahir', 'tgl_lahir', 'tgllahir');

    // Handle combined "Tempat, Tanggal Lahir"
    const combinedTtl = getValue('tempattanggallahir', 'tempat_tanggal_lahir', 'ttl');
    if (combinedTtl && (!tempatLahir || !tanggalLahir)) {
      const parts = combinedTtl.split(',');
      if (parts.length >= 2) {
        if (!tempatLahir) tempatLahir = parts[0].trim();
        if (!tanggalLahir) tanggalLahir = parts.slice(1).join(',').trim();
      } else if (!tempatLahir) {
        tempatLahir = combinedTtl;
      }
    }

    if (!tempatLahir) tempatLahir = 'Surabaya';
    if (!tanggalLahir) tanggalLahir = '2012-05-15';

    const noTelpOrtu = getValue('nowaortu', 'no_wa_ortu', 'notelportu', 'nowa', 'nohp', 'telepon');
    const alamat = getValue('alamat', 'alamatrumah', 'alamat_lengkap');
    const namaIbu = getValue('namaibu', 'nama_ibu', 'ibu') || 'Ibu Kandung';
    const diskonStr = getValue('diskon', 'nominaldiskon', 'potongan');
    const diskon = parseInt(diskonStr.replace(/[^0-9]/g, ''), 10) || 0;

    result.push({
      nama,
      jenjang,
      kelas,
      tempatLahir,
      tanggalLahir,
      alamat: alamat || 'Jl. Pemuda Surabaya',
      namaIbu,
      noTelpOrtu: noTelpOrtu || '081234567890',
      diskon,
    });
  }

  return result;
}

/**
 * Parse uploaded Excel or CSV file for Guru
 */
export async function parseGuruExcel(file: File): Promise<ParsedGuruRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const result: ParsedGuruRow[] = [];

  for (const row of jsonData) {
    const keys = Object.keys(row);
    const getValue = (...possibleKeys: string[]): string => {
      for (const pk of possibleKeys) {
        const foundKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === pk.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
      }
      return '';
    };

    const nama = getValue('nama', 'namaguru', 'nama_guru');
    if (!nama) continue;

    const alamat = getValue('alamat', 'alamatrumah', 'alamat_lengkap');
    const noTelp = getValue('nowa', 'no_wa', 'notelp', 'no_telp', 'nohp', 'telepon');
    const rawJenjang = getValue('jenjang', 'jenjangmengajar', 'jenjang_mengajar');
    const jenjang = determineJenjangGuru(rawJenjang);

    result.push({
      nama,
      alamat: alamat || 'Jl. Pemuda Surabaya',
      noTelp: noTelp || '081234567890',
      jenjang,
    });
  }

  return result;
}

/**
 * Download sample Excel format for Siswa
 */
export function downloadTemplateSiswaExcel() {
  const data = [
    {
      'Nama Siswa': 'Budi Santoso',
      'Kelas': 5, // 1-6 auto SD, 7-9 auto SMP, 10-12 auto SMA/SMK
      'Tempat Lahir': 'Surabaya',
      'Tanggal Lahir': '2014-08-20',
      'No WA Ortu': '081234567890',
      'Alamat Rumah': 'Jl. Mawar No. 12 Surabaya',
      'Nama Ibu': 'Siti Rahma',
      'Diskon Nominal': 0,
    },
    {
      'Nama Siswa': 'Siti Nurhaliza',
      'Kelas': 8, // Auto SMP
      'Tempat Lahir': 'Sidoarjo',
      'Tanggal Lahir': '2011-03-15',
      'No WA Ortu': '081398765432',
      'Alamat Rumah': 'Jl. Anggrek No. 45 Sidoarjo',
      'Nama Ibu': 'Dewi Lestari',
      'Diskon Nominal': 0,
    },
    {
      'Nama Siswa': 'Rizky Febrian',
      'Kelas': 11, // Auto SMA/SMK
      'Tempat Lahir': 'Gresik',
      'Tanggal Lahir': '2008-11-10',
      'No WA Ortu': '081555666777',
      'Alamat Rumah': 'Jl. Veteran No. 88 Gresik',
      'Nama Ibu': 'Anita Wijaya',
      'Diskon Nominal': 50000,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Nama Siswa
    { wch: 8 },  // Kelas
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 15 }, // No WA Ortu
    { wch: 30 }, // Alamat Rumah
    { wch: 18 }, // Nama Ibu
    { wch: 15 }, // Diskon
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
  XLSX.writeFile(workbook, 'Template_Import_Data_Siswa.xlsx');
}

/**
 * Download sample Excel format for Guru
 */
export function downloadTemplateGuruExcel() {
  const data = [
    {
      'Nama Guru': 'Ahmad Fauzi, S.Pd',
      'No WA': '081234567890',
      'Jenjang Mengajar': 'SD',
      'Alamat Rumah': 'Jl. Pemuda No. 10 Surabaya',
    },
    {
      'Nama Guru': 'Rina Kusuma, M.Pd',
      'No WA': '081398765432',
      'Jenjang Mengajar': 'SMP',
      'Alamat Rumah': 'Jl. Pahlawan No. 25 Sidoarjo',
    },
    {
      'Nama Guru': 'Bambang Hartono, S.T',
      'No WA': '081555666777',
      'Jenjang Mengajar': 'SMA/SMK',
      'Alamat Rumah': 'Jl. Basuki Rahmat No. 99 Surabaya',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 24 }, // Nama Guru
    { wch: 15 }, // No WA
    { wch: 18 }, // Jenjang
    { wch: 32 }, // Alamat
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
  XLSX.writeFile(workbook, 'Template_Import_Data_Guru.xlsx');
}
