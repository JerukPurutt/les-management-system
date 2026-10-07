import React, { useState } from 'react';
import { Cabang, Siswa, PembayaranSPP, Transaksi, Guru } from '../../types';
import { Wallet, PlusCircle, FileSpreadsheet, FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency, getMonthName } from '../../utils/helpers';
import { KwitansiModal } from './KwitansiModal';
import { Badge } from '../common/Badge';

interface KeuanganModuleProps {
  currentCabang: Cabang;
  siswaList: Siswa[];
  guruList?: Guru[];
  sppList: PembayaranSPP[];
  transaksiList: Transaksi[];
  onPaySPP: (sppId: string, namaPembayar: string, tanggalBayar: string) => void;
  onAddManualTransaksi: (trx: Omit<Transaksi, 'id'>) => void;
  onMarkSentWhatsApp: (sppId: string) => void;
}

export const KeuanganModule: React.FC<KeuanganModuleProps> = ({
  currentCabang,
  siswaList,
  guruList,
  sppList,
  transaksiList,
  onPaySPP,
  onAddManualTransaksi,
  onMarkSentWhatsApp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'spp' | 'transaksi' | 'laporan'>('spp');

  const [selectedSPPBilling, setSelectedSPPBilling] = useState<PembayaranSPP | null>(null);
  const [namaPembayarInput, setNamaPembayarInput] = useState('');
  const [tanggalBayarInput, setTanggalBayarInput] = useState(new Date().toISOString().split('T')[0]);

  const [activeKwitansiSPP, setActiveKwitansiSPP] = useState<PembayaranSPP | null>(null);

  const [isManualTrxOpen, setIsManualTrxOpen] = useState(false);
  const [trxTipe, setTrxTipe] = useState<'masuk' | 'keluar'>('keluar');
  const [trxKategori, setTrxKategori] = useState('Gaji Guru');
  const [trxNominal, setTrxNominal] = useState(500000);
  const [trxKeterangan, setTrxKeterangan] = useState('');
  const [trxTanggal, setTrxTanggal] = useState(new Date().toISOString().split('T')[0]);

  const cabangSpp = sppList.filter((s) => s.cabangId === currentCabang.id);
  const cabangTrx = transaksiList.filter((t) => t.cabangId === currentCabang.id);

  const totalPemasukan = cabangTrx
    .filter((t) => t.tipe === 'masuk')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPengeluaran = cabangTrx
    .filter((t) => t.tipe === 'keluar')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoKas = totalPemasukan - totalPengeluaran;

  const handlePaySPPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSPPBilling || !namaPembayarInput.trim()) return;

    onPaySPP(selectedSPPBilling.id, namaPembayarInput, tanggalBayarInput);

    const updatedSpp = {
      ...selectedSPPBilling,
      status: 'lunas' as const,
      namaPembayar: namaPembayarInput,
      tanggalBayar: tanggalBayarInput,
      noKwitansi: `KW/${currentCabang.id.toUpperCase()}/${selectedSPPBilling.tahun}/${selectedSPPBilling.bulan}/000${selectedSPPBilling.id}`,
    };
    setSelectedSPPBilling(null);
    setActiveKwitansiSPP(updatedSpp);
  };

  const handleManualTrxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxKeterangan.trim()) return;

    onAddManualTransaksi({
      cabangId: currentCabang.id,
      tipe: trxTipe,
      kategori: trxKategori,
      nominal: trxNominal,
      keterangan: trxKeterangan,
      tanggal: trxTanggal,
    });

    setIsManualTrxOpen(false);
    setTrxKeterangan('');
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Modul Keuangan & Kwitansi
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cabang: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentCabang.nama}</span>
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setActiveSubTab('spp')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeSubTab === 'spp'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            Pembayaran SPP
          </button>
          <button
            onClick={() => setActiveSubTab('transaksi')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeSubTab === 'transaksi'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            Jurnal Transaksi
          </button>
          <button
            onClick={() => setActiveSubTab('laporan')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeSubTab === 'laporan'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            Laporan Bulanan
          </button>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Pemasukan</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {formatCurrency(totalPemasukan)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Pengeluaran</span>
          <div className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {formatCurrency(totalPengeluaran)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Saldo Kas Akhir</span>
          <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
            {formatCurrency(saldoKas)}
          </div>
        </div>
      </div>

      {/* SUBTAB 1: PEMBAYARAN SPP */}
      {activeSubTab === 'spp' && (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
              Tagihan & Pembayaran SPP Siswa (Bulan Sep 2026)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Bulan Tagihan</th>
                  <th className="p-3">Nominal SPP</th>
                  <th className="p-3">Status SPP</th>
                  <th className="p-3">No. Kwitansi</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
                {cabangSpp.map((spp) => {
                  const siswaObj = siswaList.find((s) => s.id === spp.siswaId);
                  if (!siswaObj) return null;

                  return (
                    <tr key={spp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">
                        <div>{siswaObj.nama}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-mono font-normal">
                          Ortu: {siswaObj.noTelpOrtu}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-slate-700 dark:text-zinc-300">
                        {getMonthName(spp.bulan)} {spp.tahun}
                      </td>

                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(spp.nominal)}
                      </td>

                      <td className="p-3">
                        {spp.status === 'lunas' ? (
                          <Badge variant="success">🟢 Lunas</Badge>
                        ) : (
                          <Badge variant="danger">🔴 Belum Bayar</Badge>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        {spp.noKwitansi || '-'}
                      </td>

                      <td className="p-3 text-right">
                        {spp.status === 'belum_bayar' ? (
                          <button
                            onClick={() => {
                              setSelectedSPPBilling(spp);
                              setNamaPembayarInput(`${siswaObj.namaIbu} (Ibu)`);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg shadow-2xs"
                          >
                            Catat SPP
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveKwitansiSPP(spp)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[11px] font-medium rounded border border-slate-200 dark:border-zinc-700"
                          >
                            Lihat Kwitansi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PEMASUKAN & PENGELUARAN */}
      {activeSubTab === 'transaksi' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setIsManualTrxOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Catat Transaksi Manual
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">Jurnal Transaksi Keuangan</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
                  {cabangTrx.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px]">{trx.tanggal}</td>
                      <td className="p-3">
                        {trx.tipe === 'masuk' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/20 font-semibold">
                            <ArrowDownRight className="w-3 h-3" /> Pemasukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px] border border-rose-500/20 font-semibold">
                            <ArrowUpRight className="w-3 h-3" /> Pengeluaran
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-zinc-200">{trx.kategori}</td>
                      <td className="p-3 text-slate-700 dark:text-zinc-300">{trx.keterangan}</td>
                      <td
                        className={`p-3 text-right font-mono font-bold ${
                          trx.tipe === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {trx.tipe === 'masuk' ? '+' : '-'}{formatCurrency(trx.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: LAPORAN BULANAN */}
      {activeSubTab === 'laporan' && (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">
                Rekap Laporan Keuangan Bulanan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Bulan: <strong className="text-indigo-600 dark:text-indigo-400">September 2026</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Mengunduh Laporan Keuangan PDF...')}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold rounded-lg transition-all"
              >
                <FileText className="w-3.5 h-3.5" /> Unduh PDF
              </button>
              <button
                onClick={() => alert('Mengunduh Rekap Excel (.xlsx)...')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold text-slate-900 dark:text-zinc-200 text-xs">Ringkasan Kas September 2026:</h4>
              <div className="flex justify-between border-b border-slate-200 dark:border-zinc-800 pb-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Total Pemasukan:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalPemasukan)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-zinc-800 pb-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Total Pengeluaran:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(totalPengeluaran)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-900 dark:text-zinc-200 font-bold">Laba Bersih Cabang:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(saldoKas)}</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
              <h4 className="font-bold text-slate-900 dark:text-zinc-200 text-xs">Siswa Belum Bayar SPP:</h4>
              <div className="space-y-1">
                {cabangSpp
                  .filter((s) => s.status === 'belum_bayar')
                  .map((s) => {
                    const sisObj = siswaList.find((x) => x.id === s.siswaId);
                    return (
                      <div key={s.id} className="flex justify-between p-1.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[11px]">
                        <span>{sisObj?.nama} ({sisObj?.jenjang})</span>
                        <span className="font-mono font-bold">{formatCurrency(s.nominal)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay SPP Form Modal */}
      {selectedSPPBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm border-b border-slate-100 dark:border-zinc-800 pb-2">
              Catat Pembayaran SPP
            </h3>

            <form onSubmit={handlePaySPPSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400">Nominal SPP:</label>
                <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedSPPBilling.nominal)}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nama Pembayar *
                </label>
                <input
                  type="text"
                  required
                  value={namaPembayarInput}
                  onChange={(e) => setNamaPembayarInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Tanggal Bayar *
                </label>
                <input
                  type="date"
                  required
                  value={tanggalBayarInput}
                  onChange={(e) => setTanggalBayarInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedSPPBilling(null)}
                  className="px-3 py-1 text-xs text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-2xs"
                >
                  Simpan & Buat Kwitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Transaction Modal */}
      {isManualTrxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm border-b border-slate-100 dark:border-zinc-800 pb-2">
              Transaksi Keuangan Manual
            </h3>

            <form onSubmit={handleManualTrxSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTrxTipe('masuk')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border ${
                    trxTipe === 'masuk'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setTrxTipe('keluar')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border ${
                    trxTipe === 'keluar'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Gaji / Sewa / Listrik / Alat Tulis"
                  value={trxKategori}
                  onChange={(e) => setTrxKategori(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={trxNominal === 0 ? '' : trxNominal}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTrxNominal(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Keterangan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Keterangan transaksi"
                  value={trxKeterangan}
                  onChange={(e) => setTrxKeterangan(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsManualTrxOpen(false)}
                  className="px-3 py-1 text-xs text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kwitansi Modal */}
      {activeKwitansiSPP && (
        <KwitansiModal
          currentCabang={currentCabang}
          sppItem={activeKwitansiSPP}
          siswa={siswaList.find((s) => s.id === activeKwitansiSPP.siswaId)!}
          guruList={guruList}
          onClose={() => setActiveKwitansiSPP(null)}
          onMarkSentWhatsApp={onMarkSentWhatsApp}
        />
      )}
    </div>
  );
};
