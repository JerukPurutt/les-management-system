import React from 'react';
import { Cabang, Siswa, Guru, PembayaranSPP, Transaksi } from '../../types';
import { StatCard } from '../common/StatCard';
import { Users, GraduationCap, AlertCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardCabangProps {
  currentCabang: Cabang;
  siswaList: Siswa[];
  guruList: Guru[];
  sppList: PembayaranSPP[];
  transaksiList: Transaksi[];
}

export const DashboardCabang: React.FC<DashboardCabangProps> = ({
  currentCabang,
  siswaList,
  guruList,
  sppList,
  transaksiList,
}) => {
  const cabangSiswa = siswaList.filter((s) => s.cabangId === currentCabang.id && !s.deletedAt);
  const activeSiswa = cabangSiswa.filter((s) => s.status === 'aktif');
  const cutiSiswa = cabangSiswa.filter((s) => s.status === 'cuti');
  const keluarSiswa = cabangSiswa.filter((s) => s.status === 'keluar');

  const currentMonth = 9;
  const currentYear = 2026;
  const unpaidSPP = sppList.filter(
    (s) => s.cabangId === currentCabang.id && s.status === 'belum_bayar' && s.bulan === currentMonth && s.tahun === currentYear
  );

  const cabangGuru = guruList.filter((g) => g.cabangIds.includes(currentCabang.id) && g.isActive);

  const cabangTrx = transaksiList.filter((t) => t.cabangId === currentCabang.id);
  const totalMasuk = cabangTrx
    .filter((t) => t.tipe === 'masuk')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalKeluar = cabangTrx
    .filter((t) => t.tipe === 'keluar')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const jenjangCounts = [
    { name: 'TK', value: activeSiswa.filter((s) => s.jenjang === 'TK').length },
    { name: 'SD', value: activeSiswa.filter((s) => s.jenjang === 'SD').length },
    { name: 'SMP', value: activeSiswa.filter((s) => s.jenjang === 'SMP').length },
    { name: 'SMA/SMK', value: activeSiswa.filter((s) => s.jenjang === 'SMA_SMK').length },
  ];

  const financialData = [
    { name: 'Pemasukan', amount: totalMasuk },
    { name: 'Pengeluaran', amount: totalKeluar },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Dashboard Cabang: {currentCabang.nama}
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Ringkasan operasional siswa, status SPP, dan grafik kas cabang
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Siswa Aktif"
          value={activeSiswa.length}
          subtitle={`${cutiSiswa.length} Cuti • ${keluarSiswa.length} Keluar`}
          icon={GraduationCap}
          variant="success"
        />
        <StatCard
          title="Belum Bayar SPP"
          value={`${unpaidSPP.length} Siswa`}
          subtitle={`Tagihan Sep ${currentYear}`}
          icon={AlertCircle}
          variant="danger"
        />
        <StatCard
          title="Guru Pengajar"
          value={`${cabangGuru.length} Guru`}
          subtitle="Slot terisi otomatis"
          icon={Users}
          variant="indigo"
        />
        <StatCard
          title="Saldo Kas"
          value={formatCurrency(totalMasuk - totalKeluar)}
          subtitle={`Masuk: ${formatCurrency(totalMasuk)}`}
          icon={Wallet}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
            Siswa Aktif per Jenjang
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jenjangCounts}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
            Perbandingan Pemasukan vs Pengeluaran
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
