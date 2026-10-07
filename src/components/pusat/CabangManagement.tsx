import React, { useState } from 'react';
import { Cabang, User } from '../../types';
import { Building2, Plus, KeyRound, Check, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CabangManagementProps {
  cabangList: Cabang[];
  onAddCabang: (nama: string, alamat: string) => { newCabang: Cabang; newAccount: User };
  onUpdateCabang: (id: string, nama: string, alamat: string, status: 'aktif' | 'nonaktif') => void;
  onDeleteCabang: (id: string) => void;
}

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

  // Edit Modal State
  const [editModalCabang, setEditModalCabang] = useState<Cabang | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editStatus, setEditStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  // Delete Confirm Modal State
  const [deleteConfirmCabang, setDeleteConfirmCabang] = useState<Cabang | null>(null);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput.trim() || !alamatInput.trim()) return;

    const res = onAddCabang(namaInput, alamatInput);
    setCreatedAccountInfo({
      email: res.newAccount.email,
      pass: 'pimpinan123#',
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
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Manajemen Cabang LKP
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Tambah, edit, hapus, dan atur status operasional cabang tempat les
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedAccountInfo(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Cabang Baru</span>
        </button>
      </div>

      {/* Cabang Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cabangList.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-xs">
            Belum ada cabang yang terdaftar. Klik tombol di atas untuk menambah cabang baru.
          </div>
        ) : (
          cabangList.map((cab) => (
            <div
              key={cab.id}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={cab.status === 'aktif' ? 'success' : 'neutral'}>
                      {cab.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </Badge>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(cab)}
                      className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
                      title="Edit Cabang"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteConfirmCabang(cab)}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                      title="Hapus Cabang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-2">{cab.nama}</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{cab.alamat}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">ID: {cab.id}</span>
                <button
                  onClick={() => handleToggleStatus(cab)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer font-medium ${
                    cab.status === 'aktif'
                      ? 'border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                      : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {cab.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Cabang Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Tambah Cabang & Leader
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!createdAccountInfo ? (
              <form onSubmit={handleSubmitAdd} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Nama Cabang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Cabang Surabaya (Gubeng)"
                    value={namaInput}
                    onChange={(e) => setNamaInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Jl. Pemuda No. 88, Gubeng, Surabaya"
                    value={alamatInput}
                    onChange={(e) => setAlamatInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Sistem akan otomatis membuat akun <strong>Pimpinan Cabang</strong>.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                  >
                    Simpan Cabang
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Check className="w-4 h-4" /> Cabang & Akun Berhasil Dibuat!
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded border border-slate-200 dark:border-zinc-800 text-[11px] font-mono space-y-0.5 text-slate-800 dark:text-zinc-200">
                    <p>Email: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{createdAccountInfo.email}</span></p>
                    <p>Password: <span className="text-amber-600 dark:text-amber-400 font-bold">{createdAccountInfo.pass}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full py-1.5 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Tutup & Kembali
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Cabang Modal */}
      {editModalCabang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-amber-500" /> Edit Data Cabang
              </h3>
              <button onClick={() => setEditModalCabang(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nama Cabang *
                </label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Status Operasional *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="aktif">🟢 Aktif</option>
                  <option value="nonaktif">🔴 Nonaktif</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditModalCabang(null)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Hapus Cabang LKP</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Apakah Anda yakin ingin menghapus cabang <strong className="text-slate-900 dark:text-zinc-100">{deleteConfirmCabang.nama}</strong>? Cabang yang dihapus tidak akan dapat diakses kembali.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmCabang(null)}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Ya, Hapus Cabang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
