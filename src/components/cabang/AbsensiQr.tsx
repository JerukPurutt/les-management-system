import React, { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, RefreshCw, UserCheck, UserMinus, Clock, Inbox } from 'lucide-react';
import { Cabang, Absensi } from '../../types';
import { api } from '../../utils/api';

const ROTATE_MS = 5000; // QR regenerasi tiap 5 detik

interface AbsensiQrProps {
  currentCabang: Cabang;
}

const jam = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';

export const AbsensiQr: React.FC<AbsensiQrProps> = ({ currentCabang }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [list, setList] = useState<Absensi[]>([]);
  const [error, setError] = useState('');

  const regen = useCallback(async () => {
    try {
      const r = await api.absensi.createQr();
      setToken(r.token);
      setQrUrl(await QRCode.toDataURL(r.token, { width: 320, margin: 2 }));
      setExpiresAt(Date.now() + r.expiresInMs);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Gagal generate QR');
    }
    try {
      setList(await api.absensi.listHariIni());
    } catch { /* list gagal tidak fatal */ }
  }, []);

  useEffect(() => {
    regen();
    const rotate = setInterval(regen, ROTATE_MS);
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => { clearInterval(rotate); clearInterval(tick); };
  }, [regen]);

  const sisa = Math.max(0, Math.ceil((expiresAt - now) / 1000));

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Absensi QR
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
            Kode berubah otomatis tiap 5 detik • Cabang: <span className="font-semibold text-sky-600 dark:text-sky-300">{currentCabang.nama}</span>
          </p>
        </div>
        <button
          onClick={regen}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Regenerasi sekarang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* QR Display */}
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 flex flex-col items-center gap-3 shadow-2xs">
          {error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : qrUrl ? (
            <>
              <img src={qrUrl} alt="QR absensi" className="rounded-xl border border-slate-200 dark:border-zinc-700" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500">Kode manual (fallback)</p>
                <p className="font-mono text-2xl font-bold tracking-[0.3em] text-slate-900 dark:text-zinc-100">{token}</p>
              </div>
              <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="font-medium text-slate-600 dark:text-zinc-300">
                  Ganti kode baru dalam <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{sisa}s</span>
                </span>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 animate-pulse">Memuat QR...</div>
          )}
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center max-w-xs">
            Tampilkan layar ini di tempat absensi. Guru membuka menu <b>Scan Absensi</b> untuk scan, atau ketik kode manual bila kamera rusak.
          </p>
        </div>

        {/* Rekap hari ini */}
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2 mb-3">
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Absensi Hari Ini</span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{list.length} guru tercatat</span>
          </div>
          {list.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-zinc-500 italic flex flex-col items-center gap-2">
              <Inbox className="w-6 h-6" /> Belum ada guru yang absen hari ini.
            </div>
          ) : (
            <div className="space-y-2 max-h-[24rem] overflow-y-auto">
              {list.map((a) => (
                <div key={a.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-zinc-100 truncate">{a.nama}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">{a.tanggal}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                      <UserCheck className="w-3 h-3" /> Datang {jam(a.jamDatang)}
                    </span>
                    {a.jamPulang ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-mono text-[10px]">
                        <UserMinus className="w-3 h-3" /> Pulang {jam(a.jamPulang)}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-[10px] italic">
                        belum pulang
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
