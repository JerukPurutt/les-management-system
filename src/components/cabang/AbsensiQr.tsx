import React, { useCallback, useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  RefreshCw,
  UserCheck,
  UserMinus,
  Clock,
  Inbox,
  Lock,
  Unlock,
  Filter,
  ArrowRightCircle,
  ArrowLeftCircle,
  History,
  CheckCircle2,
  Search,
  Users
} from 'lucide-react';
import { Cabang, Absensi, TipeAbsensi } from '../../types';
import { api } from '../../utils/api';

const ROTATE_MS = 5000; // QR regenerasi tiap 5 detik

interface AbsensiQrProps {
  currentCabang: Cabang;
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

export const AbsensiQr: React.FC<AbsensiQrProps> = ({ currentCabang }) => {
  // Mode tampilan: live QR / log riwayat
  const [viewMode, setViewMode] = useState<'live' | 'riwayat'>('live');

  // Tipe QR: datang vs pulang (beda QR)
  const [activeTipe, setActiveTipe] = useState<TipeAbsensi>('datang');

  // Status buka/tutup absensi per cabang & tipe
  const [statusSesi, setStatusSesi] = useState<{ datang: boolean; pulang: boolean }>({
    datang: true,
    pulang: true,
  });
  const [statusLoading, setStatusLoading] = useState(false);

  // Live QR data
  const [qrUrl, setQrUrl] = useState('');
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');

  // Rekap hari ini
  const [listHariIni, setListHariIni] = useState<Absensi[]>([]);

  // Log & Riwayat
  const [riwayatList, setRiwayatList] = useState<Absensi[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'lengkap' | 'belum_pulang'>('semua');

  // Fetch status buka/tutup cabang
  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.absensi.getStatus(currentCabang.id);
      setStatusSesi(res);
    } catch {
      // fallback
    }
  }, [currentCabang.id]);

  // Regenerasi QR token untuk tipe aktif (hanya jika sesi sedang dibuka)
  const isCurrentOpen = statusSesi[activeTipe];

  const regen = useCallback(async () => {
    if (!isCurrentOpen) {
      setQrUrl('');
      setToken('');
      return;
    }
    try {
      const r = await api.absensi.createQr(activeTipe);
      setToken(r.token);
      setQrUrl(await QRCode.toDataURL(r.token, { width: 320, margin: 2 }));
      setExpiresAt(Date.now() + r.expiresInMs);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Gagal generate QR');
    }
    try {
      setListHariIni(await api.absensi.listHariIni());
    } catch {
      /* list gagal tidak fatal */
    }
  }, [activeTipe, isCurrentOpen]);

  // Load status buka tutup awal
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto regenerate QR tiap ROTATE_MS
  useEffect(() => {
    regen();
    const rotate = setInterval(regen, ROTATE_MS);
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => {
      clearInterval(rotate);
      clearInterval(tick);
    };
  }, [regen]);

  // Toggle buka/tutup sesi
  const handleToggleStatus = async (tipe: TipeAbsensi) => {
    setStatusLoading(true);
    const current = statusSesi[tipe];
    const newStatus = !current;
    try {
      const res = await api.absensi.setStatus({ tipe, isOpen: newStatus });
      setStatusSesi(res.status);
      if (tipe === activeTipe && newStatus) {
        // Jika baru dibuka kembali, langsung regen
        setTimeout(() => regen(), 100);
      }
    } catch (e: any) {
      alert(e?.message || 'Gagal mengubah status sesi');
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch riwayat absensi
  const fetchRiwayat = useCallback(async () => {
    setLoadingRiwayat(true);
    try {
      const res = await api.absensi.listRiwayat({
        startDate,
        endDate,
        cabangId: currentCabang.id,
      });
      setRiwayatList(res);
    } catch (e: any) {
      console.error('Gagal fetch riwayat:', e);
    } finally {
      setLoadingRiwayat(false);
    }
  }, [currentCabang.id, startDate, endDate]);

  useEffect(() => {
    if (viewMode === 'riwayat') {
      fetchRiwayat();
    }
  }, [viewMode, fetchRiwayat]);

  // Filter riwayat
  const filteredRiwayat = useMemo(() => {
    return riwayatList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        (item.noPegawai && item.noPegawai.toLowerCase().includes(q));

      let matchStatus = true;
      if (statusFilter === 'lengkap') {
        matchStatus = Boolean(item.jamDatang && item.jamPulang);
      } else if (statusFilter === 'belum_pulang') {
        matchStatus = Boolean(item.jamDatang && !item.jamPulang);
      }

      return matchSearch && matchStatus;
    });
  }, [riwayatList, searchQuery, statusFilter]);

  const sisa = Math.max(0, Math.ceil((expiresAt - now) / 1000));

  // Hitungan statistik hari ini
  const totalHariIni = listHariIni.length;
  const sudahPulangHariIni = listHariIni.filter((a) => a.jamPulang).length;
  const belumPulangHariIni = totalHariIni - sudahPulangHariIni;

  return (
    <div className="space-y-4 text-xs">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Presensi QR Guru
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
            Cabang: <span className="font-semibold text-sky-600 dark:text-sky-300">{currentCabang.nama}</span>
          </p>
        </div>

        {/* View Switcher: Live QR vs Riwayat */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setViewMode('live')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'live'
                ? 'bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <QrCode className="w-4 h-4" /> Layar QR &amp; Live
          </button>
          <button
            onClick={() => setViewMode('riwayat')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'riwayat'
                ? 'bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <History className="w-4 h-4" /> Log &amp; Riwayat Presensi
          </button>
        </div>
      </div>

      {viewMode === 'live' ? (
        <div className="space-y-4">
          {/* Sesi Tabs (Datang vs Pulang - Beda QR) + Kontrol Buka/Tutup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Tab Datang */}
            <div
              onClick={() => setActiveTipe('datang')}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                activeTipe === 'datang'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTipe === 'datang'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <ArrowRightCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      QR Absen DATANG
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        statusSesi.datang
                          ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {statusSesi.datang ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Terbuka
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5" /> Ditutup
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Untuk guru yang baru tiba &amp; mulai mengajar
                  </p>
                </div>
              </div>

              {/* Tombol Buka/Tutup Datang */}
              <button
                type="button"
                disabled={statusLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus('datang');
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors shrink-0 ${
                  statusSesi.datang
                    ? 'border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                    : 'border-emerald-300 dark:border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {statusSesi.datang ? 'Tutup Sesi' : 'Buka Sesi'}
              </button>
            </div>

            {/* Tab Pulang */}
            <div
              onClick={() => setActiveTipe('pulang')}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                activeTipe === 'pulang'
                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTipe === 'pulang'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <ArrowLeftCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                      QR Absen PULANG
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        statusSesi.pulang
                          ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {statusSesi.pulang ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Terbuka
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5" /> Ditutup
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Untuk guru yang selesai jadwal &amp; meninggalkan cabang
                  </p>
                </div>
              </div>

              {/* Tombol Buka/Tutup Pulang */}
              <button
                type="button"
                disabled={statusLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus('pulang');
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors shrink-0 ${
                  statusSesi.pulang
                    ? 'border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                    : 'border-amber-300 dark:border-amber-700 bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {statusSesi.pulang ? 'Tutup Sesi' : 'Buka Sesi'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Tampilan QR Aktif */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 flex flex-col items-center gap-3 shadow-2xs">
              <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      activeTipe === 'datang'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {activeTipe === 'datang' ? (
                      <ArrowRightCircle className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowLeftCircle className="w-3.5 h-3.5" />
                    )}
                    Mode: Absen {activeTipe}
                  </span>
                </div>
                <button
                  onClick={regen}
                  disabled={!isCurrentOpen}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {!isCurrentOpen ? (
                /* Sesi Ditutup Banner */
                <div className="py-14 px-4 flex flex-col items-center text-center max-w-sm">
                  <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                    Sesi Absen {activeTipe.toUpperCase()} Sedang Ditutup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 mb-4 leading-relaxed">
                    Guru tidak dapat melakukan presensi {activeTipe} selama sesi ini ditutup oleh pimpinan cabang.
                  </p>
                  <button
                    onClick={() => handleToggleStatus(activeTipe)}
                    disabled={statusLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs"
                  >
                    <Unlock className="w-4 h-4" /> Buka Sesi Absen {activeTipe.toUpperCase()}
                  </button>
                </div>
              ) : error ? (
                <div className="py-16 text-center text-red-500">{error}</div>
              ) : qrUrl ? (
                <>
                  <div
                    className={`p-3 rounded-2xl bg-white border-2 shadow-xs ${
                      activeTipe === 'datang' ? 'border-emerald-400' : 'border-amber-400'
                    }`}
                  >
                    <img src={qrUrl} alt={`QR Absensi ${activeTipe}`} className="rounded-xl w-60 h-60 sm:w-64 sm:h-64 object-contain" />
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-semibold">
                      Kode Manual Absen {activeTipe.toUpperCase()}
                    </p>
                    <p className="font-mono text-2xl font-bold tracking-[0.25em] text-slate-900 dark:text-zinc-100">
                      {token}
                    </p>
                  </div>

                  <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="font-medium text-slate-600 dark:text-zinc-300">
                      Kode berganti otomatis dalam{' '}
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{sisa}s</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-slate-400 animate-pulse">Memuat QR...</div>
              )}

              <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center max-w-xs">
                Arahkan guru untuk scan QR ini di menu <b>Scan Absensi</b>, atau ketik kode manual jika kamera bermasalah.
              </p>
            </div>

            {/* Rekap Hari Ini */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2 mb-3">
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Rekap Hadir Hari Ini
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400">
                  {totalHariIni} guru
                </span>
              </div>

              {/* Stat Ringkas */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Total Hadir</p>
                  <p className="text-base font-bold text-slate-900 dark:text-zinc-100 font-mono mt-0.5">
                    {totalHariIni}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-center">
                  <p className="text-[10px] text-sky-700 dark:text-sky-300 font-medium">Di Cabang</p>
                  <p className="text-base font-bold text-sky-700 dark:text-sky-300 font-mono mt-0.5">
                    {belumPulangHariIni}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center">
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Sudah Pulang</p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                    {sudahPulangHariIni}
                  </p>
                </div>
              </div>

              {listHariIni.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 italic flex flex-col items-center gap-2 my-auto">
                  <Inbox className="w-6 h-6" /> Belum ada guru yang absen hari ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
                  {listHariIni.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-zinc-100 truncate text-xs">
                          {a.nama}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {a.noPegawai ? `NIP: ${a.noPegawai} • ` : ''}
                          Durasi: {hitungDurasi(a.jamDatang, a.jamPulang)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                          <UserCheck className="w-3 h-3" /> {jam(a.jamDatang)}
                        </span>
                        {a.jamPulang ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-mono text-[10px]">
                            <UserMinus className="w-3 h-3" /> {jam(a.jamPulang)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-[10px] font-medium">
                            Di Cabang
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
      ) : (
        /* Tab Log & Riwayat Presensi */
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Filter Riwayat
              </span>
              <button
                onClick={fetchRiwayat}
                disabled={loadingRiwayat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 hover:text-sky-600 font-medium text-xs transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRiwayat ? 'animate-spin' : ''}`} />
                Muat Ulang
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Tanggal Mulai */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Tanggal Akhir */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Filter Status */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="semua">Semua Status</option>
                  <option value="lengkap">Lengkap (Datang &amp; Pulang)</option>
                  <option value="belum_pulang">Belum Pulang</option>
                </select>
              </div>

              {/* Pencarian Guru */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                  Cari Nama / NIP
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Nama guru..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                Data Riwayat ({filteredRiwayat.length} entri)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Periode: {startDate} s/d {endDate}
              </span>
            </div>

            {loadingRiwayat ? (
              <div className="py-16 text-center text-slate-400 animate-pulse">Memuat data riwayat...</div>
            ) : filteredRiwayat.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-zinc-500 italic flex flex-col items-center gap-2">
                <Inbox className="w-7 h-7" /> Tidak ditemukan data absensi pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Nama Guru</th>
                      <th className="py-2.5 px-3">Datang</th>
                      <th className="py-2.5 px-3">Pulang</th>
                      <th className="py-2.5 px-3">Durasi</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                    {filteredRiwayat.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-950/40">
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800 dark:text-zinc-200">
                          {formatTanggalIndo(row.tanggal)}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900 dark:text-zinc-100">{row.nama}</p>
                          {row.noPegawai && (
                            <p className="text-[10px] text-slate-400 font-mono">NIP: {row.noPegawai}</p>
                          )}
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
        </div>
      )}
    </div>
  );
};
