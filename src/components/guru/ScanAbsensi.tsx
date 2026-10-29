import React, { useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, Camera, Keyboard, LogIn, LogOut, AlertTriangle, XCircle } from 'lucide-react';
import { Guru } from '../../types';
import { api } from '../../utils/api';

interface ScanAbsensiProps {
  currentGuru: Guru;
}

const kirim = async (token: string): Promise<{ ok: boolean; pesan?: string; status?: string }> => {
  try {
    const r = await api.absensi.scan(token);
    return { ok: true, status: r.status };
  } catch (e: any) {
    return { ok: false, pesan: e?.message || 'Gagal scan' };
  }
};

export const ScanAbsensi: React.FC<ScanAbsensiProps> = ({ currentGuru }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [kameraOn, setKameraOn] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; pesan?: string; status?: string } | null>(null);
  const [manual, setManual] = useState('');
  const [proses, setProses] = useState(false);

  const stopKamera = () => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setKameraOn(false);
  };

  const startKamera = async () => {
    setHasil(null);
    setKameraOn(true);
    await new Promise((r) => setTimeout(r, 50)); // tunggu div render
    const s = new Html5Qrcode('qr-reader');
    scannerRef.current = s;
    try {
      await s.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          await s.stop().catch(() => {});
          scannerRef.current = null;
          setKameraOn(false);
          setProses(true);
          setHasil(await kirim(text.trim()));
          setProses(false);
        },
        () => { /* frame tanpa QR: abaikan */ }
      );
    } catch (e: any) {
      scannerRef.current = null;
      setKameraOn(false);
      setHasil({ ok: false, pesan: 'Kamera gagal dibuka: ' + (e?.message || e) });
    }
  };

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manual.trim() || proses) return;
    setProses(true);
    setHasil(await kirim(manual.trim().toUpperCase()));
    setProses(false);
    setManual('');
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Scan Absensi
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
            Absen sebagai: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{currentGuru.nama}</span>
          </p>
        </div>
        <div className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-950 rounded text-[10px] text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 self-start">
          Scan pertama = Datang, scan kedua = Pulang
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Kamera */}
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 flex flex-col items-center gap-3 shadow-2xs">
          <div id="qr-reader" className={`w-full max-w-xs rounded-xl overflow-hidden ${kameraOn ? 'border border-slate-200 dark:border-zinc-700' : ''}`} />
          {!kameraOn ? (
            <>
              <button
                onClick={startKamera}
                disabled={proses}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> Buka Kamera &amp; Scan
              </button>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center max-w-xs">
                Arahkan kamera ke QR yang ditampilkan pimpinan cabang. Kamera akan berhenti otomatis setelah QR terbaca.
              </p>
            </>
          ) : (
            <button
              onClick={stopKamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-zinc-950"
            >
              <XCircle className="w-4 h-4" /> Tutup Kamera
            </button>
          )}
        </div>

        {/* Manual + hasil */}
        <div className="space-y-3">
          <form onSubmit={submitManual}
            className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs"
          >
            <p className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 text-sm">
              <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Input Kode Manual
            </p>
            <div className="flex gap-2">
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="Masukkan kode (mis. AB12CD34)"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={proses || !manual.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {proses ? 'Mengirim...' : 'Absen'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Untuk kamera tidak tersedia — minta kode yang muncul di bawah QR pimpinan cabang. Kode berubah tiap 5 detik.
            </p>
          </form>

          {hasil && (
            <div className={`rounded-xl border p-4 flex items-start gap-3 shadow-2xs ${
              hasil.ok
                ? hasil.status === 'sudah_lengkap'
                  ? 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'
                  : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60'
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60'
            }`}>
              {hasil.ok ? (
                hasil.status === 'datang' ? <LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                : hasil.status === 'pulang' ? <LogOut className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-5 h-5 text-slate-500 dark:text-zinc-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                {hasil.ok ? (
                  hasil.status === 'datang' ? <p className="font-bold text-emerald-700 dark:text-emerald-300">Absen DATANG tercatat ✔</p>
                  : hasil.status === 'pulang' ? <p className="font-bold text-emerald-700 dark:text-emerald-300">Absen PULANG tercatat ✔</p>
                  : <p className="font-bold text-slate-700 dark:text-zinc-200">Kamu sudah absen datang &amp; pulang hari ini.</p>
                ) : (
                  <p className="font-bold text-red-700 dark:text-red-300">{hasil.pesan}</p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {new Date().toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
