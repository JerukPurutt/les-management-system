import React, { useState } from 'react';
import { Cabang, User } from '../../types';
import { Building2, Plus, KeyRound, Check, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CabangManagementProps {
  cabangList: Cabang[];
  onAddCabang: (nama: string, alamat: string) => Promise<{ newCabang: Cabang | null; newAccount: User | null }>;
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
    <div className="space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono font-medium bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Branch Network Control
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Manajemen Cabang LKP
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tambah, edit, hapus, dan atur status operasional cabang tempat les
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedAccountInfo(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Cabang Baru</span>
        </button>
      </div>

      {/* Cabang Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cabangList.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-xl p-8 text-zinc-400 dark:text-zinc-500 text-xs">
              Belum ada cabang yang terdaftar. Klik tombol di atas untuk menambah cabang baru.
            </div>
          </div>
        ) : (
          cabangList.map((cab) => (
            <div
              key={cab.id}
              className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs hover:border-zinc-300 dark:hover:border-white/20 transition-all group"
            >
              <div className="h-full bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={cab.status === 'aktif' ? 'success' : 'neutral'}>
                        {cab.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </Badge>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(cab)}
                        className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                        title="Edit Cabang"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmCabang(cab)}
                        className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                        title="Hapus Cabang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-3 tracking-tight">{cab.nama}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{cab.alamat}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">ID: {cab.id}</span>
                  <button
                    onClick={() => handleToggleStatus(cab)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer font-medium ${
                      cab.status === 'aktif'
                        ? 'border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                        : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {cab.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Cabang Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-1 rounded-2xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl max-w-md w-full">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Tambah Cabang & Leader
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!createdAccountInfo ? (
                <form onSubmit={handleSubmitAdd} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Nama Cabang *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="mis. Cabang Surabaya (Gubeng)"
                      value={namaInput}
                      onChange={(e) => setNamaInput(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Jl. Pemuda No. 88, Gubeng, Surabaya"
                      value={alamatInput}
                      onChange={(e) => setAlamatInput(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none font-medium"
                    ></textarea>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Sistem akan otomatis membuat akun <strong>Pimpinan Cabang</strong>.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Simpan Cabang
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Check className="w-4 h-4" /> Cabang & Akun Berhasil Dibuat!
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-white/10 text-xs font-mono space-y-1 text-zinc-800 dark:text-zinc-200">
                      <p>Email: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{createdAccountInfo.email}</span></p>
                      <p>Password: <span className="text-amber-600 dark:text-amber-400 font-bold">{createdAccountInfo.pass}</span></p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Tutup & Kembali
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Cabang Modal */}
      {editModalCabang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-1 rounded-2xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl max-w-md w-full">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500" /> Edit Data Cabang
                </h3>
                <button
                  onClick={() => setEditModalCabang(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nama Cabang *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editAlamat}
                    onChange={(e) => setEditAlamat(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none font-medium"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Status Operasional *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'aktif' | 'nonaktif')}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                  >
                    <option value="aktif">🟢 Aktif</option>
                    <option value="nonaktif">🔴 Nonaktif</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setEditModalCabang(null)}
                    className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCabang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-1 rounded-2xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl max-w-sm w-full">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Hapus Cabang LKP</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus cabang <strong className="text-zinc-900 dark:text-white">{deleteConfirmCabang.nama}</strong>? Cabang yang dihapus tidak akan dapat diakses kembali.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmCabang(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Ya, Hapus Cabang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
