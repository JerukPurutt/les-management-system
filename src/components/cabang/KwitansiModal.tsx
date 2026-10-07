import React from 'react';
import { Cabang, Siswa, PembayaranSPP, Guru } from '../../types';
import { formatCurrency, generateWhatsAppLink, getMonthName } from '../../utils/helpers';
import { Printer, MessageSquare, ShieldCheck, X } from 'lucide-react';

interface KwitansiModalProps {
  currentCabang: Cabang;
  sppItem: PembayaranSPP;
  siswa: Siswa;
  guruList?: Guru[];
  onClose: () => void;
  onMarkSentWhatsApp: (sppId: string) => void;
}

export const KwitansiModal: React.FC<KwitansiModalProps> = ({
  currentCabang,
  sppItem,
  siswa,
  guruList,
  onClose,
  onMarkSentWhatsApp,
}) => {
  const assignedTeacher = guruList?.find((g) => g.id === siswa.guruId);

  const waLink = generateWhatsAppLink(
    siswa.noTelpOrtu,
    siswa.nama,
    `${getMonthName(sppItem.bulan)} ${sppItem.tahun}`,
    sppItem.nominal,
    sppItem.kwitansiUrl || `https://lespintar.id/kwitansi/token-${sppItem.id}`
  );

  const handleSendWA = () => {
    onMarkSentWhatsApp(sppItem.id);
    window.open(waLink, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 relative my-6 text-xs">
        {/* Top Actions (No Print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-zinc-100 text-xs">Kwitansi Resmi SPP</span>
            {sppItem.dikirimAt && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                ✓ WA dikirim {new Date(sppItem.dikirimAt).toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 font-medium rounded-lg text-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print PDF
            </button>
            <button
              onClick={handleSendWA}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-2xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Kirim WhatsApp
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Kwitansi Card */}
        <div className="bg-white text-zinc-900 rounded-lg p-5 sm:p-6 space-y-4 border border-zinc-200 shadow-xs">
          {/* Header with uploaded logo */}
          <div className="flex justify-between items-start border-b-2 border-sky-500 pb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="LKP Sang Siroju Lillah" className="h-10 object-contain" />
              <div>
                <p className="text-[11px] font-semibold text-zinc-700">{currentCabang.nama}</p>
                <p className="text-[10px] text-zinc-500">{currentCabang.alamat}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-900 text-[11px] font-bold rounded">
                KWITANSI SPP
              </span>
              <p className="text-[11px] font-mono font-semibold text-zinc-700 mt-1">
                No: {sppItem.noKwitansi || `KW/${currentCabang.id}/${sppItem.tahun}/${sppItem.bulan}/0001`}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-zinc-500 text-[10px]">Telah Diterima Dari:</p>
              <p className="font-bold text-zinc-900">{sppItem.namaPembayar || 'Orang Tua Siswa'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Tanggal Bayar:</p>
              <p className="font-semibold text-zinc-800">{sppItem.tanggalBayar || new Date().toISOString().split('T')[0]}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Untuk Siswa:</p>
              <p className="font-bold text-zinc-900">{siswa.nama} ({siswa.jenjang})</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px]">Bulan & Tahun SPP:</p>
              <p className="font-semibold text-zinc-800">{getMonthName(sppItem.bulan)} {sppItem.tahun}</p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-sky-50/60 border border-sky-200 p-3 rounded-lg flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Jumlah Pembayaran</span>
            <span className="text-xl font-bold font-mono text-sky-700">
              {formatCurrency(sppItem.nominal)}
            </span>
          </div>

          {/* Footer & Signature */}
          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-start text-center">
              {/* Bottom Left: Diterima oleh Guru Pengajar */}
              <div className="flex flex-col items-center min-w-[140px]">
                <p className="text-[11px] font-medium text-zinc-700">Diterima oleh,</p>
                <div className="h-10"></div>
                <div className="border-b border-zinc-400 w-36 mb-1"></div>
                <p className="text-[11px] font-bold text-zinc-800 truncate max-w-[180px]">
                  ( {assignedTeacher?.nama || 'Guru Pengajar'} )
                </p>
              </div>

              {/* Bottom Right: Mengetahui Pimpinan LBB */}
              <div className="flex flex-col items-center min-w-[180px]">
                <p className="text-[11px] font-medium text-zinc-700">Mengetahui,</p>
                <p className="text-[11px] font-bold text-zinc-800">Pimpinan LBB Sang Siroju Lillah</p>
                <div className="h-7"></div>
                <div className="border-b border-zinc-400 w-44 mb-1"></div>
                <p className="text-[11px] font-bold text-zinc-900">
                  Siti Wannisa` Nirma Yanti S.pd
                </p>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-zinc-100 text-[10px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: Lunas & Terverifikasi System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
