import React from 'react';
import { Cabang, Siswa, Guru } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Building2, Users, GraduationCap, UserX, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardPusatProps {
  cabangList: Cabang[];
  siswaList: Siswa[];
  guruList: Guru[];
}

const JENJANG_META = [
  { key: 'TK', label: 'TK', bar: 'bg-emerald-500' },
  { key: 'SD', label: 'SD', bar: 'bg-sky-500' },
  { key: 'SMP', label: 'SMP', bar: 'bg-amber-500' },
  { key: 'SMA_SMK', label: 'SMA/SMK', bar: 'bg-indigo-500' },
] as const;

export const DashboardPusat: React.FC<DashboardPusatProps> = ({
  cabangList,
  siswaList,
  guruList,
}) => {
  const live = (s: Siswa) => !s.deletedAt;
  const activeSiswa = siswaList.filter((s) => s.status === 'aktif' && live(s));
  const activeGuru = guruList.filter((g) => g.isActive);
  const unassigned = activeSiswa.filter((s) => !s.guruId);
  const activeCabang = cabangList.filter((c) => c.status === 'aktif');

  const perCabang = cabangList.map((cab, i) => {
    const sis = activeSiswa.filter((s) => s.cabangId === cab.id);
    const gur = activeGuru.filter((g) => g.cabangIds.includes(cab.id));
    const withGuru = sis.filter((s) => s.guruId).length;
    const capacity = gur.length * 6;
    return {
      id: cab.id,
      nama: cab.nama.length > 14 ? cab.nama.slice(0, 14) + '…' : cab.nama,
      fullNama: cab.nama,
      alamat: cab.alamat,
      status: cab.status,
      siswa: sis.length,
      tanpaGuru: sis.length - withGuru,
      guru: gur.length,
      occupancy: capacity > 0 ? Math.round((withGuru / capacity) * 100) : 0,
      color: ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'][i % 6],
    };
  });

  const jenjangTotal = Math.max(1, activeSiswa.length);
  const jenjangRows = JENJANG_META.map((j) => ({
    ...j,
    count: activeSiswa.filter((s) => s.jenjang === j.key).length,
  }));

  const avgLoad = activeGuru.length > 0
    ? (activeSiswa.filter((s) => s.guruId).length / activeGuru.length).toFixed(1)
    : '0';

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

      {unassigned.length > 0 && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>{unassigned.length} siswa aktif belum punya guru.</strong>{' '}
            Minta pimpinan cabang menugaskan via <em>Manajemen Siswa → Auto-Assign</em> agar slot tidak menganggur.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Cabang"
          value={cabangList.length}
          subtitle={`${activeCabang.length} aktif • ${cabangList.length - activeCabang.length} nonaktif`}
          icon={Building2}
          variant="indigo"
        />
        <StatCard
          title="Siswa Aktif"
          value={activeSiswa.length}
          subtitle={`Terdaftar ${siswaList.filter(live).length} • Cuti/Keluar ${siswaList.filter((s) => live(s) && s.status !== 'aktif').length}`}
          icon={GraduationCap}
          variant="success"
        />
        <StatCard
          title="Guru Aktif"
          value={activeGuru.length}
          subtitle={`Rata-rata beban ${avgLoad} siswa/guru`}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Tanpa Guru"
          value={unassigned.length}
          subtitle={unassigned.length > 0 ? 'Butuh penugasan segera' : 'Semua siswa sudah berguru'}
          icon={UserX}
          variant={unassigned.length > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-2xs">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
            Siswa Aktif per Cabang
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
            Perbandingan beban antar lokasi
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCabang} margin={{ top: 4, right: 4, left: -14, bottom: 0 }}>
                <XAxis dataKey="nama" stroke="#94a3b8" fontSize={11} interval={0} angle={-12} dy={6} height={44} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(v: any, _n: any, p: any) => [`${v} siswa`, p?.payload?.fullNama || '']}
                />
                <Bar dataKey="siswa" radius={[6, 6, 0, 0]}>
                  {perCabang.map((c) => (
                    <Cell key={c.id} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-2xs">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
            Komposisi Jenjang
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-3">
            {activeSiswa.length} siswa aktif semua cabang
          </p>
          <div className="space-y-3">
            {jenjangRows.map((j) => (
              <div key={j.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{j.label}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                    {j.count} <span className="text-slate-400 font-normal">({Math.round((j.count / jenjangTotal) * 100)}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${j.bar} transition-all`}
                    style={{ width: `${Math.round((j.count / jenjangTotal) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
            Ringkasan Per Cabang
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Okupansi = slot guru terisi dari kapasitas 6 siswa/guru
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Cabang</th>
                <th className="p-3">Siswa</th>
                <th className="p-3">Guru</th>
                <th className="p-3 min-w-36">Okupansi Slot</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {perCabang.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-zinc-100">{c.fullNama}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-52">{c.alamat}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{c.siswa}</span>
                    {c.tanpaGuru > 0 && (
                      <span className="ml-1.5 font-mono text-[10px] text-rose-600 dark:text-rose-400">(+{c.tanpaGuru} tanpa guru)</span>
                    )}
                  </td>
                  <td className="p-3 font-mono">{c.guru}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.occupancy >= 90 ? 'bg-rose-500' : c.occupancy >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, c.occupancy)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] w-9 text-right">{c.occupancy}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {c.status === 'aktif' ? (
                      <Badge variant="success">Aktif</Badge>
                    ) : (
                      <Badge variant="neutral">Nonaktif</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {perCabang.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">Belum ada cabang.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
