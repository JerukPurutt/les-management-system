import React from 'react';
import { Cabang, Siswa, Guru } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Building2, Users, GraduationCap, UserX, AlertTriangle, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
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
      color: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6],
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
    <div className="space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono font-medium bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Operational Metrics
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard Pimpinan Pusat
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monitoring operasional dan alokasi sumber daya seluruh cabang LKP Sang Siroju Lillah
          </p>
        </div>
      </div>

      {/* Unassigned Warning Banner */}
      {unassigned.length > 0 && (
        <div className="p-1 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
          <div className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-[calc(1rem-0.25rem)] p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold">{unassigned.length} siswa aktif belum ditugaskan ke guru.</span>{' '}
              <span className="opacity-90">Minta pimpinan cabang melakukan penugasan di <em>Manajemen Siswa → Auto-Assign</em>.</span>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle={`Terdaftar ${siswaList.filter(live).length} • Non-aktif ${siswaList.filter((s) => live(s) && s.status !== 'aktif').length}`}
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
          subtitle={unassigned.length > 0 ? 'Butuh penugasan segera' : 'Semua siswa teralokasi'}
          icon={UserX}
          variant={unassigned.length > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Analytics Charts Grid - Doppelrand Outer Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Chart: Siswa per Cabang */}
        <div className="lg:col-span-3 p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs">
          <div className="h-full bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" /> Siswa Aktif per Cabang
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Distribusi beban siswa di setiap lokasi
                </p>
              </div>
            </div>

            <div className="h-60 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perCabang} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <XAxis dataKey="nama" stroke="#71717a" fontSize={11} interval={0} angle={-10} dy={6} height={40} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
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
        </div>

        {/* Right Chart: Komposisi Jenjang */}
        <div className="lg:col-span-2 p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs">
          <div className="h-full bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" /> Komposisi Jenjang
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total {activeSiswa.length} siswa aktif
              </p>
            </div>

            <div className="space-y-4 py-2">
              {jenjangRows.map((j) => {
                const pct = Math.round((j.count / jenjangTotal) * 100);
                return (
                  <div key={j.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{j.label}</span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                        {j.count} <span className="text-zinc-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden p-0.5 border border-zinc-200/40 dark:border-white/5">
                      <div
                        className={`h-full rounded-full ${j.bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Summary Table Doppelrand Outer Shell */}
      <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] overflow-hidden">
          
          <div className="p-5 border-b border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight">
                Ringkasan Per Cabang
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kapasitas ideal: 6 siswa/guru • Persentase okupansi slot terisi
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-widest border-b border-zinc-200/80 dark:border-white/10">
                <tr>
                  <th className="p-4">Cabang</th>
                  <th className="p-4">Siswa</th>
                  <th className="p-4">Guru</th>
                  <th className="p-4 min-w-44">Okupansi Slot</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                {perCabang.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-900 dark:text-white text-xs">{c.fullNama}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-64 mt-0.5">{c.alamat}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{c.siswa}</span>
                      {c.tanpaGuru > 0 && (
                        <span className="ml-2 font-mono text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          +{c.tanpaGuru} tanpa guru
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-medium text-xs">{c.guru}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-200/40 dark:border-white/5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.occupancy >= 90 ? 'bg-red-500' : c.occupancy >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, c.occupancy)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold w-10 text-right">{c.occupancy}%</span>
                      </div>
                    </td>
                    <td className="p-4">
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
                    <td colSpan={5} className="p-8 text-center text-zinc-400 font-mono text-xs">Belum ada cabang terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

