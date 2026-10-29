import React, { useState } from 'react';
import { Cabang, User } from '../../types';
import {
  Building2,
  Plus,
  KeyRound,
  Check,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CabangManagementProps {
  cabangList: Cabang[];
  onAddCabang: (nama: string, alamat: string) => Promise<{ newCabang: Cabang | null; newAccount: User | null }>;
  onUpdateCabang: (id: string, nama: string, alamat: string, status: 'aktif' | 'nonaktif') => void;
  onDeleteCabang: (id: string) => void;
}

const INPUT =
  'w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-zinc-500 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-400';

const LABEL = 'mb-1.5 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300';

export const CabangManagement: React.FC<CabangManagementProps> = ({
  cabangList,
  onAddCabang,
  onUpdateCabang,
  onDeleteCabang,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [namaInput, setNamaInput] = useState('');
  const [alamatInput, setAlamatInput] = useState('');
  const [createdAccountInfo, setCreatedAccountInfo] = useState<{ email: string; pass: string } | null>(null);

  const [editModalCabang, setEditModalCabang] = useState<Cabang | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editStatus, setEditStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  const [deleteConfirmCabang, setDeleteConfirmCabang] = useState<Cabang | null>(null);

  const activeCount = cabangList.filter((c) => c.status === 'aktif').length;

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput.trim() || !alamatInput.trim()) return;

    const res = await onAddCabang(namaInput, alamatInput);
    if (!res.newAccount) return;
    setCreatedAccountInfo({
      email: res.newAccount.email,
      pass: 'cabang123',
    });
    setNamaInput('');
    setAlamatInput('');
  };

  const handleOpenEdit = (cab: Cabang) => {
    setEditModalCabang(cab);
    setEditNama(cab.nama);
    setEditAlamat(cab.alamat);
    setEditStatus(cab.status);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCabang || !editNama.trim() || !editAlamat.trim()) return;

    onUpdateCabang(editModalCabang.id, editNama.trim(), editAlamat.trim(), editStatus);
    setEditModalCabang(null);
  };

  const handleToggleStatus = (cab: Cabang) => {
    onUpdateCabang(cab.id, cab.nama, cab.alamat, cab.status === 'aktif' ? 'nonaktif' : 'aktif');
  };

  const handleDeleteSubmit = () => {
    if (!deleteConfirmCabang) return;
    onDeleteCabang(deleteConfirmCabang.id);
    setDeleteConfirmCabang(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Masthead */}
      <header className="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
            Pusat · Branch Network
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-5xl">
            Manajemen <span className="text-sky-700 dark:text-sky-400">Cabang</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Kelola data, status operasional, dan akun pimpinan setiap cabang LKP Sang Siroju
            Lillah.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedAccountInfo(null);
            setIsAddModalOpen(true);
          }}
          className="group inline-flex cursor-pointer items-center gap-3 self-start rounded-full bg-zinc-950 py-2 pl-5 pr-2 text-xs font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 lg:self-auto"
        >
          <span>Tambah Cabang</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90 dark:bg-zinc-950/10">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </button>
      </header>

      {/* Network summary strip */}
      <div className="reveal grid grid-cols-3 divide-x divide-black/[0.06] overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-white/70 dark:divide-white/[0.06] dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
            {cabangList.length}
          </div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
            Total cabang
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
            Aktif
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-semibold tabular-nums text-zinc-400">
            {cabangList.length - activeCount}
          </div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
            Nonaktif
          </div>
        </div>
      </div>

      {/* Branch directory */}
      <section className="reveal overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-white/90 dark:border-white/[0.08] dark:bg-white/[0.035]">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06] sm:px-6">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              Direktori Cabang
            </h2>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {cabangList.length} lokasi terdaftar di jaringan
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
            Operasional
          </span>
        </div>

        {cabangList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-black/[0.07] bg-black/[0.02] text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
              <Building2 className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Belum ada cabang terdaftar
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Tambah cabang pertama untuk memulai jaringan LKP.
              </p>
            </div>
            <button
              onClick={() => {
                setCreatedAccountInfo(null);
                setIsAddModalOpen(true);
              }}
              className="cursor-pointer rounded-full border border-black/[0.08] px-4 py-2 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.05]"
            >
              Tambah Cabang
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
            {cabangList.map((cab, index) => (
              <div
                key={cab.id}
                className="group grid grid-cols-1 gap-4 px-5 py-5 transition-colors duration-300 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-black/[0.07] bg-black/[0.02] font-mono text-[11px] font-semibold text-zinc-500 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-sky-500/20 group-hover:bg-sky-500/[0.06] group-hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:group-hover:text-sky-400">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-white">
                        {cab.nama}
                      </h3>
                      <Badge variant={cab.status === 'aktif' ? 'success' : 'neutral'}>
                        {cab.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    <p className="mt-1 flex max-w-xl items-start gap-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={1.75} />
                      <span className="line-clamp-2">{cab.alamat}</span>
                    </p>

                    <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
                      <span className="truncate">ID {cab.id}</span>
                      <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                      <span>{cab.status === 'aktif' ? 'Operasional' : 'Ditutup'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    onClick={() => handleToggleStatus(cab)}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-all duration-300 active:scale-95 ${
                      cab.status === 'aktif'
                        ? 'border-rose-500/20 text-rose-600 hover:bg-rose-500/[0.06] dark:text-rose-400'
                        : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/[0.06] dark:text-emerald-400'
                    }`}
                  >
                    {cab.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cab)}
                    aria-label={`Edit ${cab.nama}`}
                    title="Edit Cabang"
                    className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-black/[0.07] text-zinc-500 transition-all duration-300 hover:border-amber-500/25 hover:bg-amber-500/[0.06] hover:text-amber-600 active:scale-95 dark:border-white/10 dark:text-zinc-400 dark:hover:text-amber-400"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmCabang(cab)}
                    aria-label={`Hapus ${cab.nama}`}
                    title="Hapus Cabang"
                    className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-black/[0.07] text-zinc-500 transition-all duration-300 hover:border-rose-500/25 hover:bg-rose-500/[0.06] hover:text-rose-600 active:scale-95 dark:border-white/10 dark:text-zinc-400 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Cabang Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-4">
          <div role="dialog" aria-modal="true" aria-label="Dialog manajemen cabang" className="reveal max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)] dark:bg-[#0D0E10]">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-sky-500/15 bg-sky-500/[0.06] text-sky-600 dark:text-sky-400">
                  <Building2 className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Tambah Cabang
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Akun pimpinan dibuat otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Tutup"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-black/[0.04] hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {!createdAccountInfo ? (
              <form onSubmit={handleSubmitAdd} className="space-y-4 px-5 py-5 sm:px-6">
                <div>
                  <label className={LABEL}>Nama Cabang</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="mis. Cabang Surabaya (Gubeng)"
                    value={namaInput}
                    onChange={(e) => setNamaInput(e.target.value)}
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className={LABEL}>Alamat Lengkap</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Jl. Pemuda No. 88, Gubeng, Surabaya"
                    value={alamatInput}
                    onChange={(e) => setAlamatInput(e.target.value)}
                    className={`${INPUT} resize-none`}
                  />
                </div>

                <div className="flex items-start gap-2.5 rounded-r-xl border-l-2 border-sky-500 bg-sky-500/[0.06] px-3.5 py-3 text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>
                    Sistem akan otomatis membuat akun <strong>Pimpinan Cabang</strong>.
                  </span>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.06] sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="cursor-pointer rounded-full px-4 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[0.03] hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                  >
                    Simpan Cabang
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Cabang & akun berhasil dibuat
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-emerald-700/80 dark:text-emerald-400/80">
                      Simpan kredensial berikut sebelum menutup dialog.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-xl border border-black/[0.06] bg-black/[0.02] p-3.5 font-mono text-[11px] text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-300">
                  <p>
                    Email:{' '}
                    <span className="font-semibold text-sky-700 dark:text-sky-400">
                      {createdAccountInfo.email}
                    </span>
                  </p>
                  <p>
                    Password:{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {createdAccountInfo.pass}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full cursor-pointer rounded-full bg-zinc-950 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Cabang Modal */}
      {editModalCabang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-4">
          <div role="dialog" aria-modal="true" aria-label="Dialog manajemen cabang" className="reveal max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)] dark:bg-[#0D0E10]">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-500/15 bg-amber-500/[0.06] text-amber-600 dark:text-amber-400">
                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Edit Cabang
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Perbarui data operasional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalCabang(null)}
                aria-label="Tutup"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-black/[0.04] hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 px-5 py-5 sm:px-6">
              <div>
                <label className={LABEL}>Nama Cabang</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Alamat Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className={`${INPUT} resize-none`}
                />
              </div>

              <div>
                <label className={LABEL}>Status Operasional</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className={INPUT}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.06] sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalCabang(null)}
                  className="cursor-pointer rounded-full px-4 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[0.03] hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCabang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-4">
          <div role="dialog" aria-modal="true" aria-label="Dialog manajemen cabang" className="reveal max-h-[calc(100dvh-1.5rem)] w-full max-w-sm overflow-y-auto rounded-[1.75rem] border border-white/10 bg-white p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)] dark:bg-[#0D0E10] sm:p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-rose-500/15 bg-rose-500/[0.06] text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            </span>

            <h3 className="mt-4 text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              Hapus cabang?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
                {deleteConfirmCabang.nama}
              </strong>{' '}
              akan dihapus permanen dan tidak dapat diakses kembali.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                onClick={() => setDeleteConfirmCabang(null)}
                className="cursor-pointer rounded-full px-4 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[0.03] hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="cursor-pointer rounded-full bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-rose-500 active:scale-[0.98]"
              >
                Hapus Cabang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
