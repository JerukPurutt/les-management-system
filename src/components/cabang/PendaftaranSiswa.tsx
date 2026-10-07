import React, { useState } from 'react';
import { Cabang, Jenjang } from '../../types';
import { UserPlus, CheckCircle2, Wallet, FileText } from 'lucide-react';
import { calculateSPPRate, formatCurrency, getJenjangLabel } from '../../utils/helpers';

interface PendaftaranSiswaProps {
  currentCabang: Cabang;
  biayaPendaftaranBase: number;
  onRegisterStudent: (formData: {
    nama: string;
    tempatLahir: string;
    tanggalLahir: string;
    alamat: string;
    namaIbu: string;
    noTelpOrtu: string;
    jenjang: Jenjang;
    kelas: number;
    diskon: number;
    keteranganDiskon: string;
  }) => void;
  onSuccessNavigate: () => void;
}

export const PendaftaranSiswa: React.FC<PendaftaranSiswaProps> = ({
  currentCabang,
  biayaPendaftaranBase,
  onRegisterStudent,
  onSuccessNavigate,
}) => {
  const [nama, setNama] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [alamat, setAlamat] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [noTelpOrtu, setNoTelpOrtu] = useState('');
  const [jenjang, setJenjang] = useState<Jenjang>('SD');
  const [kelas, setKelas] = useState<number>(4);
  const [diskon, setDiskon] = useState<number>(0);
  const [keteranganDiskon, setKeteranganDiskon] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPendaftaran = Math.max(0, biayaPendaftaranBase - diskon);
  const sppEstimate = calculateSPPRate(jenjang, kelas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noTelpOrtu.trim() || !tanggalLahir) return;

    onRegisterStudent({
      nama,
      tempatLahir,
      tanggalLahir,
      alamat,
      namaIbu,
      noTelpOrtu,
      jenjang,
      kelas,
      diskon,
      keteranganDiskon,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onSuccessNavigate();
    }, 1500);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-xs">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Form Pendaftaran Siswa Baru
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Cabang: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentCabang.nama}</span>
        </p>
      </div>

      {isSuccess ? (
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300">Pendaftaran Siswa Berhasil!</h3>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Pendaftaran tercatat sebagai pemasukan cabang & tagihan SPP bulan ini otomatis dibuat (🔴 Belum Bayar).
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Student Name */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                placeholder="mis. Muhammad Rizky"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Nama Ibu Kandung *
              </label>
              <input
                type="text"
                required
                placeholder="mis. Ibu Ratnasari"
                value={namaIbu}
                onChange={(e) => setNamaIbu(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Birth Place */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Tempat Lahir *
              </label>
              <input
                type="text"
                required
                placeholder="mis. Jakarta"
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Parent Phone Number */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                No. Telepon Orang Tua (WhatsApp) *
              </label>
              <input
                type="text"
                required
                placeholder="08123456789"
                value={noTelpOrtu}
                onChange={(e) => setNoTelpOrtu(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Grade level selection */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Jenjang Pendidikan *
              </label>
              <select
                value={jenjang}
                onChange={(e) => {
                  const val = e.target.value as Jenjang;
                  setJenjang(val);
                  if (val === 'TK') setKelas(0);
                  else if (val === 'SD') setKelas(1);
                  else if (val === 'SMP') setKelas(7);
                  else setKelas(10);
                }}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="TK">TK (Taman Kanak-kanak)</option>
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP</option>
                <option value="SMA_SMK">SMA / SMK</option>
              </select>
            </div>

            {/* Class number */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Kelas *
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {jenjang === 'TK' && <option value={0}>TK</option>}
                {jenjang === 'SD' && [1, 2, 3, 4, 5, 6].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
                {jenjang === 'SMP' && [7, 8, 9].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
                {jenjang === 'SMA_SMK' && [10, 11, 12].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Alamat Rumah *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Alamat lengkap tempat tinggal siswa"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Registration Fee & Discount Calculation Section */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-semibold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Rincian Biaya & Diskon Pendaftaran
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Biaya Standar</label>
                <p className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">
                  {formatCurrency(biayaPendaftaranBase)}
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Diskon (Nominal Manual)</label>
                <input
                  type="number"
                  min={0}
                  max={biayaPendaftaranBase}
                  placeholder="0"
                  value={diskon === 0 ? '' : diskon}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDiskon(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Total Pendaftaran Dibayar</label>
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPendaftaran)}
                </p>
              </div>
            </div>

            {diskon > 0 && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Keterangan Diskon
                </label>
                <input
                  type="text"
                  placeholder="mis. Diskon Promo Awal Tahun / Anak Alumnus"
                  value={keteranganDiskon}
                  onChange={(e) => setKeteranganDiskon(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 space-y-0.5">
              <p className="font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Estimasi Tagihan SPP Pertama:
              </p>
              <p>
                SPP Bulan Ini untuk {getJenjangLabel(jenjang, kelas)} ={' '}
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(sppEstimate)}</strong>{' '}
                (Status: 🔴 Belum Bayar).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all"
            >
              Proses Pendaftaran Siswa
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
