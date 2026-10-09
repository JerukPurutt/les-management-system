import React, { useState } from 'react';
import { TarifSPP } from '../../types';
import { BadgePercent, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface PengaturanTarifProps {
  tarifList: TarifSPP[];
  biayaPendaftaran: number;
  onUpdateTarif: (id: string, nominal: number) => void;
  onUpdateBiayaPendaftaran: (nominal: number) => void;
}

export const PengaturanTarif: React.FC<PengaturanTarifProps> = ({
  tarifList,
  biayaPendaftaran,
  onUpdateTarif,
  onUpdateBiayaPendaftaran,
}) => {
  const [tarifState, setTarifState] = useState(tarifList);
  const [pendaftaranState, setPendaftaranState] = useState(biayaPendaftaran);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    tarifState.forEach((t) => onUpdateTarif(t.id, t.nominal));
    onUpdateBiayaPendaftaran(pendaftaranState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono font-medium bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Global Pricing & Fees
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Pengaturan Tarif SPP & Pendaftaran
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tarif SPP dan Biaya Pendaftaran berlaku global untuk seluruh lokasi cabang
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Tarif</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
          <div className="bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-[calc(1rem-0.25rem)] p-4 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Perubahan tarif SPP global berhasil disimpan!
          </div>
        </div>
      )}

      {/* Warning Box */}
      <div className="p-1 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
        <div className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-[calc(1rem-0.25rem)] p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-bold">Aturan Riwayat Tarif SPP:</p>
            <p className="mt-0.5 opacity-90 leading-relaxed">
              Perubahan nominal tarif hanya mempengaruhi tagihan SPP baru di masa mendatang.
              Riwayat tagihan SPP bulan sebelumnya tidak berubah.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Fee Card */}
      <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs">
        <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-5 space-y-3">
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2 tracking-tight">
            <BadgePercent className="w-4 h-4 text-indigo-500" /> Biaya Pendaftaran Siswa Baru
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">Rp</span>
              <input
                type="number"
                value={pendaftaranState}
                onChange={(e) => setPendaftaranState(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-semibold"
              />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              = <strong className="text-zinc-900 dark:text-white font-bold">{formatCurrency(pendaftaranState)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* SPP Rates Table */}
      <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] overflow-hidden">
          <div className="p-5 border-b border-zinc-200/80 dark:border-white/10">
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight">Tarif SPP Per Jenjang / Kelas</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Atur besaran iuran SPP bulanan berdasarkan tingkatan pendidikan siswa
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-widest border-b border-zinc-200/80 dark:border-white/10">
                <tr>
                  <th className="p-4">Jenjang / Kelas</th>
                  <th className="p-4">Rentang Kelas</th>
                  <th className="p-4">SPP Per Bulan (Nominal Input)</th>
                  <th className="p-4">Format Tampilan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                {tarifState.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-zinc-900 dark:text-white text-xs">
                      {t.jenjang === 'TK'
                        ? 'TK (Taman Kanak-kanak)'
                        : t.jenjang === 'SD' && t.kelasMax <= 3
                        ? 'SD Kelas 1 sampai 3'
                        : t.jenjang === 'SD' && t.kelasMax > 3
                        ? 'SD Kelas 4 sampai 6'
                        : t.jenjang === 'SMP'
                        ? 'SMP'
                        : 'SMA / SMK'}
                    </td>
                    <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400">
                      {t.kelasMin === 0 ? 'TK' : `Kelas ${t.kelasMin} - ${t.kelasMax}`}
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        step={5000}
                        value={t.nominal}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTarifState((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, nominal: val } : item))
                          );
                        }}
                        className="w-40 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-semibold"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(t.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
