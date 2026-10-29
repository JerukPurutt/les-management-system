import React, { useState } from 'react';
import { TarifSPP } from '../../types';
import {
  BadgePercent,
  Save,
  CheckCircle2,
  ShieldAlert,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface PengaturanTarifProps {
  tarifList: TarifSPP[];
  biayaPendaftaran: number;
  onUpdateTarif: (id: string, nominal: number) => void;
  onUpdateBiayaPendaftaran: (nominal: number) => void;
}

const PANEL =
  'rounded-[1.75rem] border border-black/[0.07] bg-white/90 dark:border-white/[0.08] dark:bg-white/[0.035]';

const INPUT =
  'w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white';

const labelFor = (t: TarifSPP) =>
  t.jenjang === 'TK'
    ? 'TK (Taman Kanak-kanak)'
    : t.jenjang === 'SD' && t.kelasMax <= 3
    ? 'SD Kelas 1 sampai 3'
    : t.jenjang === 'SD' && t.kelasMax > 3
    ? 'SD Kelas 4 sampai 6'
    : t.jenjang === 'SMP'
    ? 'SMP'
    : 'SMA / SMK';

export const PengaturanTarif: React.FC<PengaturanTarifProps> = ({
  tarifList,
  biayaPendaftaran,
  onUpdateTarif,
  onUpdateBiayaPendaftaran,
}) => {
  const [tarifState, setTarifState] = useState(tarifList);
  const [pendaftaranState, setPendaftaranState] = useState(biayaPendaftaran);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const nominals = tarifState
    .map((t) => t.nominal)
    .filter((n) => Number.isFinite(n) && n >= 0);
  const minTarif = nominals.length > 0 ? Math.min(...nominals) : 0;
  const maxTarif = nominals.length > 0 ? Math.max(...nominals) : 0;
  const avgTarif = nominals.length > 0
    ? Math.round(nominals.reduce((sum, n) => sum + n, 0) / nominals.length)
    : 0;

  const isDirty =
    pendaftaranState !== biayaPendaftaran ||
    tarifState.some((t, i) => t.nominal !== tarifList[i]?.nominal);

  const handleSave = () => {
    tarifState.forEach((t) => onUpdateTarif(t.id, t.nominal));
    onUpdateBiayaPendaftaran(pendaftaranState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Masthead */}
      <header className="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
            Pusat · Pricing & Fees
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-5xl">
            Pengaturan <span className="text-sky-700 dark:text-sky-400">Tarif</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Atur iuran SPP bulanan dan biaya pendaftaran yang berlaku global untuk seluruh
            cabang LKP Sang Siroju Lillah.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          {isDirty && (
            <span className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Belum disimpan
            </span>
          )}

          <button
            onClick={handleSave}
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-zinc-950 py-2 pl-5 pr-2 text-xs font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            <span>Simpan Perubahan</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px dark:bg-zinc-950/10">
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </button>
        </div>
      </header>

      {savedSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="reveal flex items-center gap-3 rounded-[1.25rem] border-l-2 border-emerald-500 bg-emerald-500/[0.07] px-4 py-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
          Perubahan tarif SPP global berhasil disimpan.
        </div>
      )}

      {/* Policy notice */}
      <div className="reveal flex items-start gap-3 rounded-[1.25rem] border-l-2 border-amber-500 bg-amber-500/[0.07] px-4 py-3.5 dark:bg-amber-400/[0.06]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <span className="font-semibold">Riwayat tarif aman.</span> Perubahan nominal hanya
          mempengaruhi tagihan SPP baru. Tagihan bulan sebelumnya tidak berubah.
        </p>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* SPP rates */}
        <section className={`${PANEL} reveal overflow-hidden lg:col-span-7`} style={{ animationDelay: '80ms' }}>
          <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06] sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                <BadgePercent className="h-4 w-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
                Tarif SPP Bulanan
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Nominal per jenjang dan rentang kelas
              </p>
            </div>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400 sm:block">
              {tarifState.length} jenjang
            </span>
          </div>

          {tarifState.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-black/[0.07] bg-black/[0.02] text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
                <BadgePercent className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Belum ada pengaturan tarif SPP.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {tarifState.map((t, idx) => (
                <div
                  key={t.id}
                  className="group grid grid-cols-1 gap-3 px-5 py-4 transition-colors duration-300 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-black/[0.06] bg-black/[0.02] font-mono text-[10px] font-semibold text-zinc-500 transition-all duration-500 group-hover:border-sky-500/20 group-hover:bg-sky-500/[0.06] group-hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:group-hover:text-sky-400">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-white">
                        {labelFor(t)}
                      </h3>
                      <p className="mt-1 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                        {t.kelasMin === 0 ? 'TK' : `Kelas ${t.kelasMin} - ${t.kelasMax}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <div className="relative w-36 sm:w-40">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        step={5000}
                        inputMode="numeric"
                        aria-label={`Tarif SPP ${labelFor(t)}`}
                        value={t.nominal}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTarifState((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, nominal: val } : item))
                          );
                        }}
                        className="w-full rounded-xl border border-black/[0.08] bg-white py-2 pl-8 pr-3 text-right font-mono text-xs font-semibold tabular-nums text-zinc-900 outline-none transition-all duration-300 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                      />
                    </div>
                    <span className="w-28 text-right font-mono text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(t.nominal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Registration fee + summary */}
        <div className="space-y-4 lg:col-span-5">
          <section className={`${PANEL} reveal`} style={{ animationDelay: '120ms' }}>
            <div className="border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
                Biaya Pendaftaran
              </h2>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Sekali bayar untuk siswa baru
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-zinc-400">
                  Rp
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  aria-label="Biaya pendaftaran siswa baru"
                  value={pendaftaranState}
                  onChange={(e) => setPendaftaranState(Number(e.target.value))}
                  className="w-full rounded-2xl border border-black/[0.08] bg-white py-4 pl-11 pr-4 font-mono text-2xl font-semibold tabular-nums text-zinc-900 outline-none transition-all duration-300 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-black/[0.02] px-3.5 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Tampilan
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {formatCurrency(pendaftaranState)}
                </span>
              </div>

              <p className="mt-3 text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Ditagihkan satu kali saat pendaftaran siswa baru di seluruh cabang.
              </p>
            </div>
          </section>

          <section className={`${PANEL} reveal`} style={{ animationDelay: '160ms' }}>
            <div className="border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
                Ringkasan SPP
              </h2>
            </div>

            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Tarif terendah
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {formatCurrency(minTarif)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Tarif tertinggi
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {formatCurrency(maxTarif)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Rata-rata
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                  {formatCurrency(avgTarif)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
