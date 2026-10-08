import { Jenjang, Siswa, Guru, Jadwal, StudentStatus } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppLink(
  phone: string,
  siswaNama: string,
  bulan: string,
  nominal: number,
  kwitansiUrl: string
): string {
  const normalized = normalizePhoneNumber(phone);
  const text = `Halo Bapak/Ibu Orang Tua dari *${siswaNama}*,\n\nBerikut adalah Bukti Kwitansi Pembayaran SPP Bulan *${bulan}* sebesar *${formatCurrency(nominal)}*.\n\nKwitansi resmi PDF dapat diunduh melalui tautan berikut:\n${kwitansiUrl}\n\nTerima kasih telah memercayakan bimbingan belajar putra/putri Anda bersama kami 🙏.`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

export function getJenjangLabel(jenjang: Jenjang, kelas?: number, status?: StudentStatus): string {
  if (status === 'keluar') {
    return 'Lulus';
  }
  switch (jenjang) {
    case 'TK':
      return 'TK';
    case 'SD':
      return kelas ? (kelas > 6 ? 'Lulus' : `SD Kelas ${kelas}`) : 'SD';
    case 'SMP':
      return kelas ? (kelas > 9 ? 'Lulus' : `SMP Kelas ${kelas}`) : 'SMP';
    case 'SMA_SMK':
      return kelas ? (kelas > 12 ? 'Lulus' : `SMA/SMK Kelas ${kelas}`) : 'SMA/SMK';
    default:
      return jenjang;
  }
}

export function calculateSPPRate(jenjang: Jenjang, kelas: number): number {
  if (jenjang === 'TK') return 150000;
  if (jenjang === 'SD') {
    return kelas <= 3 ? 150000 : 175000;
  }
  if (jenjang === 'SMP') return 200000;
  if (jenjang === 'SMA_SMK') return 225000;
  return 150000;
}

export function isTeacherEligibleForStudent(guru: Guru, siswa: Pick<Siswa, 'jenjang'>): boolean {
  const list = guru.jenjangList && guru.jenjangList.length > 0 ? guru.jenjangList : [guru.jenjang];
  return list.includes(siswa.jenjang);
}

export function countTeacherAssignedStudents(guruId: string, allSiswa: Siswa[]): number {
  return allSiswa.filter(s => s.guruId === guruId && !s.deletedAt && s.status !== 'keluar').length;
}

export function checkScheduleConflict(
  newJadwal: Omit<Jadwal, 'id'>,
  existingJadwals: Jadwal[],
  currentJadwalId?: string
): { conflict: boolean; reason?: string } {
  const newStart = parseTimeToMinutes(newJadwal.jamMulai);
  const newEnd = parseTimeToMinutes(newJadwal.jamSelesai);

  if (newEnd <= newStart) {
    return { conflict: true, reason: 'Jam selesai harus lebih besar dari jam mulai.' };
  }

  for (const j of existingJadwals) {
    if (currentJadwalId && j.id === currentJadwalId) continue;

    // Check conflict for the same teacher on the same day across ALL branches
    if (j.guruId === newJadwal.guruId && j.hari === newJadwal.hari) {
      const exStart = parseTimeToMinutes(j.jamMulai);
      const exEnd = parseTimeToMinutes(j.jamSelesai);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (newStart < exEnd && newEnd > exStart) {
        return {
          conflict: true,
          reason: `Bentrok jadwal guru pada hari ${j.hari} jam ${j.jamMulai} - ${j.jamSelesai}.`,
        };
      }
    }
  }

  return { conflict: false };
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthNumber - 1] || 'Bulan';
}

export function generateReceiptNumber(cabangCode: string, year: number, month: number, count: number): string {
  const formattedCount = String(count).padStart(4, '0');
  const formattedMonth = String(month).padStart(2, '0');
  return `KW/${cabangCode.toUpperCase()}/${year}/${formattedMonth}/${formattedCount}`;
}
