import React, { useState } from 'react';
import { Siswa, PembayaranSPP, TarifSPP } from '../../types';
import { Sparkles, CheckCircle2, Play, X } from 'lucide-react';
import { getMonthName } from '../../utils/helpers';

interface CronSimulatorModalProps {
  siswaList: Siswa[];
  sppList: PembayaranSPP[];
  tarifList: TarifSPP[];
  onRunCron: (bulan: number, tahun: number) => { createdCount: number; skippedCount: number };
  onClose: () => void;
}

export const CronSimulatorModal: React.FC<CronSimulatorModalProps> = ({
  siswaList,
  sppList,
  tarifList,
  onRunCron,
  onClose,
}) => {
  const [selectedBulan, setSelectedBulan] = useState(10);
  const [selectedTahun, setSelectedTahun] = useState(2026);
  const [lastResult, setLastResult] = useState<{ createdCount: number; skippedCount: number } | null>(null);

  const handleExecute = () => {
    const res = onRunCron(selectedBulan, selectedTahun);
    setLastResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Simulator Cron Job (Tgl 1 00:05)
          </h3>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
          <p>
            Sistem membuat tagihan SPP baru berstatus 🔴 <strong>Belum Bayar</strong> untuk seluruh siswa berstatus <strong>Aktif</strong>.
          </p>
          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-0.5 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Pengecekan Idempotensi DB:</p>
            <p>Constraint Unik (siswa_id + bulan + tahun).</p>
            <p>Menjalankan Cron Job 2x tidak membuat tagihan ganda!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
          <div>
            <label className="block text-slate-500 dark:text-zinc-400 mb-1 text-[11px]">Bulan:</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded px-2 py-1 text-xs focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-zinc-400 mb-1 text-[11px]">Tahun:</label>
            <input
              type="number"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded px-2 py-1 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {lastResult && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> Eksekusi Cron Job Selesai!
            </div>
            <p>Target: <strong>{getMonthName(selectedBulan)} {selectedTahun}</strong></p>
            <p>- Tagihan Baru: <strong>{lastResult.createdCount} Siswa</strong></p>
            <p>- Diewati (Idempotent): <strong>{lastResult.skippedCount} Siswa</strong></p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs text-slate-500"
          >
            Tutup
          </button>
          <button
            onClick={handleExecute}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Jalankan Cron Job</span>
          </button>
        </div>
      </div>
    </div>
  );
};
