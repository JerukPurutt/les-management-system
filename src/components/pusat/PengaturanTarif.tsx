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
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Pengaturan Tarif SPP & Pendaftaran Global
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Tarif SPP dan Biaya Pendaftaran berlaku global untuk seluruh lokasi cabang
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-2xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Simpan Perubahan Tarif</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4" /> Perubahan tarif SPP global berhasil disimpan!
        </div>
      )}

      {/* Warning Box */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold">Aturan Riwayat Tarif SPP:</p>
          <p className="mt-0.5 opacity-90">
            Perubahan nominal tarif hanya mempengaruhi tagihan SPP baru di masa mendatang.
            Riwayat tagihan SPP bulan sebelumnya tidak berubah.
          </p>
        </div>
      </div>

      {/* Registration Fee Card */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-2 shadow-2xs">
        <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-2">
          <BadgePercent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Biaya Pendaftaran Siswa Baru
        </h3>
        <div className="flex items-center gap-3 max-w-xs">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-slate-400 dark:text-zinc-500">Rp</span>
            <input
              type="number"
              value={pendaftaranState}
              onChange={(e) => setPendaftaranState(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            = {formatCurrency(pendaftaranState)}
          </span>
        </div>
      </div>

      {/* SPP Rates Table */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">Tarif SPP Per Jenjang / Kelas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Jenjang / Kelas</th>
                <th className="p-3">Rentang Kelas</th>
                <th className="p-3">SPP Per Bulan (Nominal Input)</th>
                <th className="p-3">Format Tampilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
              {tarifState.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">
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
                  <td className="p-3 font-mono text-slate-500 dark:text-zinc-400">
                    {t.kelasMin === 0 ? 'TK' : `Kelas ${t.kelasMin} - ${t.kelasMax}`}
                  </td>
                  <td className="p-3">
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
                      className="w-36 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none"
                    />
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(t.nominal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
