import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ScanLine,
  Camera,
  Keyboard,
  LogIn,
  LogOut,
  XCircle,
  Clock,
  History,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { Guru, Absensi } from '../../types';
import { api } from '../../utils/api';

interface ScanAbsensiProps {
  currentGuru: Guru;
}

const jam = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';

const formatTanggalIndo = (tglStr?: string | null) => {
  if (!tglStr) return '—';
  try {
    return new Date(tglStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return tglStr;
  }
};

const hitungDurasi = (datang?: string | null, pulang?: string | null) => {
  if (!datang || !pulang) return '—';
  const diffMs = new Date(pulang).getTime() - new Date(datang).getTime();
  if (diffMs <= 0) return '0 mnt';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;
};

export const ScanAbsensi: React.FC<ScanAbsensiProps> = ({ currentGuru }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'riwayat'>('scan');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [kameraOn, setKameraOn] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; pesan?: string; status?: string; tipe?: string } | null>(null);
  const [manual, setManual] = useState('');
  const [proses, setProses] = useState(false);

  // Status hari ini & riwayat
  const [todayRecord, setTodayRecord] = useState<Absensi | null>(null);
  const [riwayatList, setRiwayatList] = useState<Absensi[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const loadRiwayat = useCallback(async () => {
    setLoadingRiwayat(true);
    try {
      const list = await api.absensi.listRiwayat();
      setRiwayatList(list);
      const today = list.find((a) => a.tanggal === todayStr) || null;
      setTodayRecord(today);
    } catch (e: any) {
      console.error('Gagal load riwayat absensi guru:', e);
    } finally {
      setLoadingRiwayat(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadRiwayat();
  }, [loadRiwayat]);

  const stopKamera = () => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setKameraOn(false);
  };

  const kirimToken = async (token: string) => {
    setProses(true);
    try {
      const r = await api.absensi.scan(token);
      setHasil({ ok: true, status: r.status, tipe: r.tipe });
      await loadRiwayat();
    } catch (e: any) {
      setHasil({ ok: false, pesan: e?.message || 'Gagal melakukan presensi' });
    } finally {
      setProses(false);
    }
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
          await kirimToken(text.trim());
        },
        () => {
          /* frame tanpa QR: abaikan */
        }
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
    await kirimToken(manual.trim().toUpperCase());
    setManual('');
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Presensi Guru
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
            Absen sebagai:{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-300">{currentGuru.nama}</span>
            {currentGuru.noPegawai && (
              <span className="text-slate-400 font-mono ml-1.5">(NIP: {currentGuru.noPegawai})</span>
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('scan')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'scan'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Camera className="w-4 h-4" /> Scan QR
          </button>
          <button
            onClick={() => {
              setActiveTab('riwayat');
              loadRiwayat();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'riwayat'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <History className="w-4 h-4" /> Riwayat Saya
          </button>
        </div>
      </div>

      {/* Banner Status Presensi Hari Ini */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              todayRecord?.jamDatang && todayRecord?.jamPulang
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                : todayRecord?.jamDatang
                ? 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-zinc-100 text-xs">
              Status Hari Ini ({formatTanggalIndo(todayStr)})
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {todayRecord?.jamDatang && todayRecord?.jamPulang ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Presensi lengkap: Datang {jam(todayRecord.jamDatang)} • Pulang {jam(todayRecord.jamPulang)} (Durasi: {hitungDurasi(todayRecord.jamDatang, todayRecord.jamPulang)})
                </span>
              ) : todayRecord?.jamDatang ? (
                <span className="text-sky-600 dark:text-sky-400 font-semibold">
                  Sudah absen Datang pukul {jam(todayRecord.jamDatang)} • Belum absen Pulang
                </span>
              ) : (
                <span className="text-slate-500 italic">Belum ada catatan presensi hari ini. Silakan scan QR Datang.</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {todayRecord?.jamDatang && todayRecord?.jamPulang ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lengkap
            </span>
          ) : todayRecord?.jamDatang ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              <Clock className="w-3.5 h-3.5" /> Di Cabang
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
              Belum Hadir
            </span>
          )}
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Kamera */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 flex flex-col items-center gap-3 shadow-2xs">
            <div
              id="qr-reader"
              className={`w-full max-w-xs rounded-xl overflow-hidden ${
                kameraOn ? 'border border-slate-200 dark:border-zinc-700' : ''
              }`}
            />
            {!kameraOn ? (
              <>
                <button
                  onClick={startKamera}
                  disabled={proses}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Camera className="w-4 h-4" /> Buka Kamera &amp; Scan
                </button>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center max-w-xs">
                  Arahkan kamera ke layar QR pimpinan cabang (pilih QR Datang saat baru tiba, atau QR Pulang saat selesai).
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
            <form
              onSubmit={submitManual}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs"
            >
              <p className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 text-sm">
                <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Input Kode Manual
              </p>
              <div className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="Kode manual (mis. AB12CD34)"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={proses || !manual.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  {proses ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Gunakan jika kamera bermasalah — masukkan kode yang tertera di bawah QR pimpinan cabang.
              </p>
            </form>

            {hasil && (
              <div
                className={`rounded-xl border p-4 flex items-start gap-3 shadow-2xs ${
                  hasil.ok
                    ? hasil.tipe === 'pulang'
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60'
                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60'
                }`}
              >
                {hasil.ok ? (
                  hasil.tipe === 'pulang' ? (
                    <LogOut className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  {hasil.ok ? (
                    hasil.tipe === 'pulang' ? (
                      <div>
                        <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                          Presensi PULANG Berhasil Dicatat ✔
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                          Terima kasih atas dedikasinya hari ini!
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                          Presensi DATANG Berhasil Dicatat ✔
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                          Selamat mengajar! Jangan lupa scan QR Pulang saat jadwal berakhir.
                        </p>
                      </div>
                    )
                  ) : (
                    <div>
                      <p className="font-bold text-red-800 dark:text-red-300 text-sm">Presensi Gagal</p>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{hasil.pesan}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    {new Date().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab Riwayat Saya */
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs space-y-3">
          <div className="p-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Riwayat Presensi Saya
            </span>
            <button
              onClick={loadRiwayat}
              disabled={loadingRiwayat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 font-medium text-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRiwayat ? 'animate-spin' : ''}`} />
              Segarkan
            </button>
          </div>

          {loadingRiwayat ? (
            <div className="py-16 text-center text-slate-400 animate-pulse">Memuat riwayat...</div>
          ) : riwayatList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-zinc-500 italic flex flex-col items-center gap-2">
              <Inbox className="w-7 h-7" /> Belum ada data riwayat presensi.
            </div>
          ) : (
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Cabang</th>
                    <th className="py-2.5 px-3">Jam Datang</th>
                    <th className="py-2.5 px-3">Jam Pulang</th>
                    <th className="py-2.5 px-3">Durasi</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                  {riwayatList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/40">
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800 dark:text-zinc-200">
                        {formatTanggalIndo(row.tanggal)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-zinc-300">
                        {row.cabangNama || 'Cabang'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        {jam(row.jamDatang)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-amber-600 dark:text-amber-400 font-medium">
                        {jam(row.jamPulang)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600 dark:text-zinc-400">
                        {hitungDurasi(row.jamDatang, row.jamPulang)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.jamDatang && row.jamPulang ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            <Clock className="w-3 h-3" /> Belum Pulang
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
