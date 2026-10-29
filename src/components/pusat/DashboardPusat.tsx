import React from 'react';
import { Cabang, Siswa, Guru } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import {
  Building2,
  Users,
  GraduationCap,
  AlertTriangle,
  Gauge,
  TrendingUp,
} from 'lucide-react';

interface DashboardPusatProps {
  cabangList: Cabang[];
  siswaList: Siswa[];
  guruList: Guru[];
}

const JENJANG_META = [
  { key: 'TK', label: 'TK', color: '#0ea5e9' },
  { key: 'SD', label: 'SD', color: '#10b981' },
  { key: 'SMP', label: 'SMP', color: '#f59e0b' },
  { key: 'SMA_SMK', label: 'SMA/SMK', color: '#f43f5e' },
] as const;

const PANEL =
  'rounded-[1.75rem] border border-black/[0.07] bg-white/90 dark:border-white/[0.08] dark:bg-white/[0.035]';

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
  const assignedCount = activeSiswa.length - unassigned.length;
  const assignedPct = activeSiswa.length > 0 ? Math.round((assignedCount / activeSiswa.length) * 100) : 0;

  const perCabang = cabangList.map((cab) => {
    const sis = activeSiswa.filter((s) => s.cabangId === cab.id);
    const gur = activeGuru.filter((g) => g.cabangIds.includes(cab.id));
    const withGuru = sis.filter((s) => s.guruId).length;
    const capacity = gur.length * 6;
    return {
      id: cab.id,
      fullNama: cab.nama,
      alamat: cab.alamat,
      status: cab.status,
      siswa: sis.length,
      tanpaGuru: sis.length - withGuru,
      guru: gur.length,
      occupancy: capacity > 0 ? Math.round((withGuru / capacity) * 100) : 0,
    };
  });

  const maxSiswa = Math.max(1, ...perCabang.map((c) => c.siswa));
  const jenjangTotal = Math.max(1, activeSiswa.length);
  const jenjangRows = JENJANG_META.map((j) => ({
    ...j,
    count: activeSiswa.filter((s) => s.jenjang === j.key).length,
  }));

  const avgLoad = activeGuru.length > 0
    ? (assignedCount / activeGuru.length).toFixed(1)
    : '0';
  const occupancyRate = activeGuru.length > 0
    ? Math.round((assignedCount / (activeGuru.length * 6)) * 100)
    : 0;

  let cursor = 0;
  const donut = `conic-gradient(${jenjangRows
    .map((j) => {
      const start = cursor;
      cursor += (j.count / jenjangTotal) * 100;
      return `${j.color} ${start}% ${cursor}%`;
    })
    .join(', ')})`;

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Masthead */}
      <header className="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
            Pusat · Operational Overview
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-5xl">
            Dashboard <span className="text-sky-700 dark:text-sky-400">Pimpinan Pusat</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pantau kapasitas pengajar, sebaran siswa, dan kesehatan operasional seluruh cabang
            LKP Sang Siroju Lillah.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Data tersinkron
          </div>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">{today}</span>
        </div>
      </header>

      {unassigned.length > 0 && (
        <div className="reveal flex items-start gap-3 rounded-[1.25rem] border-l-2 border-amber-500 bg-amber-500/[0.07] px-4 py-3.5 dark:bg-amber-400/[0.06]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            <span className="font-semibold">{unassigned.length} siswa aktif belum memiliki guru.</span>{' '}
            Minta pimpinan cabang menjalankan Auto-Assign di Manajemen Siswa.
          </p>
        </div>
      )}

      {/* Primary metric + supporting stats */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article
          className="reveal relative flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#101311] p-6 text-white sm:p-8 lg:col-span-5"
          style={{ animationDelay: '60ms' }}
        >
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/[0.08]" />
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/[0.08]" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                Siswa Aktif
              </span>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-mono text-6xl font-semibold leading-none tracking-[-0.06em] tabular-nums sm:text-7xl">
                  {activeSiswa.length}
                </span>
                <span className="pb-1.5 text-xs text-white/40">siswa</span>
              </div>
              <p className="mt-2 text-[11px] text-white/40">
                dari {siswaList.filter(live).length} siswa terdaftar
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/60">
              <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/45">Terhubung ke guru</span>
              <span className="font-mono tabular-nums text-white/80">{assignedPct}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-full origin-left rounded-full bg-sky-400 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ transform: `scaleX(${assignedPct / 100})` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-xl font-semibold tabular-nums">{activeGuru.length}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/40">
                  Guru aktif
                </div>
              </div>
              <div>
                <div className={`font-mono text-xl font-semibold tabular-nums ${unassigned.length > 0 ? 'text-amber-300' : 'text-white'}`}>
                  {unassigned.length}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/40">
                  Tanpa guru
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
          <div className="reveal" style={{ animationDelay: '100ms' }}>
            <StatCard
              title="Total Cabang"
              value={cabangList.length}
              subtitle={`${activeCabang.length} aktif · ${cabangList.length - activeCabang.length} nonaktif`}
              icon={Building2}
              variant="sky"
            />
          </div>
          <div className="reveal" style={{ animationDelay: '140ms' }}>
            <StatCard
              title="Beban Guru"
              value={`${avgLoad}`}
              subtitle="Rata-rata siswa per guru aktif"
              icon={Users}
              variant="default"
            />
          </div>
          <div className="reveal" style={{ animationDelay: '180ms' }}>
            <StatCard
              title="Okupansi Slot"
              value={`${occupancyRate}%`}
              subtitle="Kapasitas ideal 6 siswa per guru"
              icon={Gauge}
              variant={occupancyRate >= 90 ? 'warning' : 'success'}
            />
          </div>
        </div>
      </section>

      {/* Distribution + composition */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className={`${PANEL} reveal lg:col-span-7`} style={{ animationDelay: '220ms' }}>
          <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                Sebaran Siswa per Cabang
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Panjang bar = jumlah siswa · persentase = okupansi slot
              </p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-sky-500/15 bg-sky-500/[0.06] text-sky-600 dark:text-sky-400">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          </div>

          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            {perCabang.map((c, index) => (
              <div
                key={c.id}
                className="border-b border-black/[0.06] py-3.5 last:border-0 dark:border-white/[0.06]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-200">
                      {c.fullNama}
                    </span>
                    {c.tanpaGuru > 0 && (
                      <span className="hidden shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-700 dark:text-amber-400 sm:inline">
                        {c.tanpaGuru} tanpa guru
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[13px] font-semibold tabular-nums text-zinc-900 dark:text-white">
                    {c.siswa}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3 pl-7">
                  <div className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                    <div
                      className="h-full w-full origin-left rounded-full bg-sky-600 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-sky-400"
                      style={{ transform: `scaleX(${c.siswa / maxSiswa})` }}
                    />
                  </div>
                  <span className="w-9 text-right font-mono text-[10px] tabular-nums text-zinc-400">
                    {c.occupancy}%
                  </span>
                </div>
              </div>
            ))}

            {perCabang.length === 0 && (
              <p className="py-10 text-center font-mono text-xs text-zinc-400">
                Belum ada cabang terdaftar.
              </p>
            )}
          </div>
        </div>

        <div className={`${PANEL} reveal lg:col-span-5`} style={{ animationDelay: '260ms' }}>
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              Komposisi Jenjang
            </h2>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Distribusi {activeSiswa.length} siswa aktif
            </p>
          </div>

          <div className="flex flex-col gap-6 px-5 py-6 sm:px-6">
            <div className="flex items-center justify-center">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{ background: activeSiswa.length > 0 ? donut : '#d4d4d8' }}
              >
                <div className="absolute inset-[22%] grid place-items-center rounded-full bg-white dark:bg-[#0B0C0E]">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
                      {activeSiswa.length}
                    </div>
                    <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                      Siswa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {jenjangRows.map((j) => {
                const pct = Math.round((j.count / jenjangTotal) * 100);
                return (
                  <div key={j.key} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: j.color }} />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{j.label}</span>
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-white">
                      {j.count}
                      <span className="ml-1 font-normal text-zinc-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Operational table */}
      <section className={`${PANEL} reveal overflow-hidden`} style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col gap-1.5 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              Ringkasan Operasional
            </h2>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Kapasitas ideal 6 siswa per guru · persentase slot terisi
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
            {cabangList.length} cabang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] text-[9px] uppercase tracking-[0.18em] text-zinc-400 dark:border-white/[0.06]">
                <th className="px-5 py-3 font-medium sm:px-6">Cabang</th>
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="px-4 py-3 font-medium">Guru</th>
                <th className="min-w-44 px-4 py-3 font-medium">Okupansi</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {perCabang.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors duration-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="text-[13px] font-medium text-zinc-900 dark:text-white">
                      {c.fullNama}
                    </div>
                    <div className="mt-0.5 max-w-64 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {c.alamat}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                      {c.siswa}
                    </span>
                    {c.tanpaGuru > 0 && (
                      <span className="ml-2 rounded-full bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-700 dark:text-amber-400">
                        +{c.tanpaGuru}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                    {c.guru}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                        <div
                          className={`h-full w-full origin-left rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            c.occupancy >= 90
                              ? 'bg-rose-500'
                              : c.occupancy >= 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ transform: `scaleX(${Math.min(100, c.occupancy) / 100})` }}
                        />
                      </div>
                      <span className="w-9 text-right font-mono text-[10px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                        {c.occupancy}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
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
                  <td colSpan={5} className="px-6 py-10 text-center font-mono text-xs text-zinc-400">
                    Belum ada cabang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
