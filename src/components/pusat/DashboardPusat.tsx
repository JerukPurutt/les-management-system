import React from 'react';
import { Cabang, Siswa, Guru } from '../../types';
import { StatCard } from '../common/StatCard';
import { Building2, Users, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';

interface DashboardPusatProps {
  cabangList: Cabang[];
  siswaList: Siswa[];
  guruList: Guru[];
}

export const DashboardPusat: React.FC<DashboardPusatProps> = ({
  cabangList,
  siswaList,
  guruList,
}) => {
  const totalCabang = cabangList.length;
  const activeSiswa = siswaList.filter((s) => s.status === 'aktif' && !s.deletedAt).length;
  const totalGuru = guruList.filter((g) => g.isActive).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Dashboard Pimpinan Pusat
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Monitoring operasional seluruh lokasi cabang LKP Sang Siroju Lillah
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Cabang Les"
          value={totalCabang}
          subtitle={`${cabangList.filter((c) => c.status === 'aktif').length} Cabang Aktif`}
          icon={Building2}
          variant="indigo"
        />
        <StatCard
          title="Total Siswa Aktif"
          value={activeSiswa}
          subtitle={`Dari total ${siswaList.filter((s) => !s.deletedAt).length} terdaftar`}
          icon={GraduationCap}
          variant="success"
        />
        <StatCard
          title="Total Guru Pengajar"
          value={totalGuru}
          subtitle="Mengajar lintas cabang"
          icon={Users}
          variant="default"
        />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
              Ringkasan Per Cabang
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Pusat hanya memantau agregat angka tanpa merincikan keuangan internal cabang
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Nama Cabang</th>
                <th className="p-3">Alamat</th>
                <th className="p-3">Jumlah Siswa</th>
                <th className="p-3">Jumlah Guru</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {cabangList.map((cab) => {
                const siswaCabang = siswaList.filter(
                  (s) => s.cabangId === cab.id && !s.deletedAt && s.status === 'aktif'
                ).length;
                const guruCabang = guruList.filter((g) =>
                  g.cabangIds.includes(cab.id)
                ).length;

                return (
                  <tr key={cab.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{cab.nama}</td>
                    <td className="p-3 text-slate-500 dark:text-zinc-400 text-[11px]">{cab.alamat}</td>
                    <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {siswaCabang} Siswa
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-zinc-300">{guruCabang} Guru</td>
                    <td className="p-3">
                      {cab.status === 'aktif' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/20 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-[10px] border border-slate-300 dark:border-zinc-700">
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
