import React, { useState } from 'react';
import { Cabang, Siswa, Guru, PembayaranSPP, StudentStatus, Jenjang } from '../../types';
import {
  GraduationCap,
  Search,
  UserCheck,
  Trash2,
  AlertTriangle,
  Sparkles,
  X,
  Eye,
  Pencil,
  Phone,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Upload,
  Download,
  FileUp,
  CheckCircle,
  Zap,
  CheckSquare,
} from 'lucide-react';
import {
  getJenjangLabel,
  countTeacherAssignedStudents,
  isTeacherEligibleForStudent,
} from '../../utils/helpers';
import {
  parseSiswaExcel,
  downloadTemplateSiswaExcel,
  ParsedSiswaRow,
} from '../../utils/excelHelpers';
import { Badge } from '../common/Badge';

interface ManajemenSiswaProps {
  currentCabang: Cabang;
  siswaList: Siswa[];
  guruList: Guru[];
  sppList: PembayaranSPP[];
  onUpdateSiswaStatus: (siswaId: string, status: StudentStatus) => void;
  onAssignGuru: (siswaId: string, guruId: string | null) => Promise<{ success: boolean; message?: string }>;
  onBatchAssignGuru?: (siswaIds: string[], guruId: string | null) => Promise<{ success: boolean; message?: string; assignedCount?: number }>;
  onAutoAssignStudents?: () => Promise<{ assignedCount: number; message: string }>;
  onUpdateSiswa?: (updatedSiswa: Siswa) => void;
  onSoftDeleteSiswa: (siswaId: string) => void;
  onUpdateSiswaClass?: (siswaId: string, newKelas: number) => void;
  onBatchNaikKelas: () => void;
  onBatchRegisterStudents?: (students: ParsedSiswaRow[]) => void;
}

export const ManajemenSiswa: React.FC<ManajemenSiswaProps> = ({
  currentCabang,
  siswaList,
  guruList,
  sppList,
  onUpdateSiswaStatus,
  onAssignGuru,
  onBatchAssignGuru,
  onAutoAssignStudents,
  onUpdateSiswa,
  onSoftDeleteSiswa,
  onBatchNaikKelas,
  onBatchRegisterStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenjang, setFilterJenjang] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSPP, setFilterSPP] = useState<string>('all');

  // Modal states
  const [assignModalSiswa, setAssignModalSiswa] = useState<Siswa | null>(null);
  const [assignGuruSelected, setAssignGuruSelected] = useState<string>('');
  const [assignErrorMessage, setAssignErrorMessage] = useState<string | null>(null);

  const [detailModalSiswa, setDetailModalSiswa] = useState<Siswa | null>(null);
  const [editModalSiswa, setEditModalSiswa] = useState<Siswa | null>(null);
  const [deleteConfirmSiswa, setDeleteConfirmSiswa] = useState<Siswa | null>(null);

  // Excel Import State
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [parsedExcelSiswa, setParsedExcelSiswa] = useState<ParsedSiswaRow[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileSiswaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImportError(null);
    try {
      const rows = await parseSiswaExcel(files[0]);
      if (rows.length === 0) {
        setImportError('File Excel tidak berisi data siswa yang valid atau format kolom tidak dikenali.');
      } else {
        setParsedExcelSiswa(rows);
      }
    } catch (err: any) {
      setImportError(`Gagal membaca file Excel: ${err?.message || 'Format file salah'}`);
    }
    e.target.value = '';
  };

  const handleConfirmImportSiswa = () => {
    if (parsedExcelSiswa.length === 0) return;
    if (onBatchRegisterStudents) {
      onBatchRegisterStudents(parsedExcelSiswa);
    }
    setIsImportExcelOpen(false);
    setParsedExcelSiswa([]);
    setImportError(null);
  };

  // Batch Multi-Select State
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);
  const [batchGuruSelected, setBatchGuruSelected] = useState<string>('');
  const [batchActionBanner, setBatchActionBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggleSelectAll = () => {
    if (selectedSiswaIds.length === filteredSiswa.length) {
      setSelectedSiswaIds([]);
    } else {
      setSelectedSiswaIds(filteredSiswa.map((s) => s.id));
    }
  };

  const handleToggleSelectSiswa = (id: string) => {
    if (selectedSiswaIds.includes(id)) {
      setSelectedSiswaIds(selectedSiswaIds.filter((item) => item !== id));
    } else {
      setSelectedSiswaIds([...selectedSiswaIds, id]);
    }
  };

  const handleExecuteBatchAssign = async () => {
    if (selectedSiswaIds.length === 0 || !onBatchAssignGuru) return;
    setBatchActionBanner(null);

    const targetGuruId = batchGuruSelected === '' ? null : batchGuruSelected;
    const res = await onBatchAssignGuru(selectedSiswaIds, targetGuruId);

    if (!res.success) {
      setBatchActionBanner({ type: 'error', message: res.message || 'Gagal menugaskan massal.' });
    } else {
      setBatchActionBanner({
        type: 'success',
        message: `Berhasil menugaskan ${selectedSiswaIds.length} siswa terpilih!`,
      });
      setSelectedSiswaIds([]);
      setBatchGuruSelected('');
    }
  };

  const handleRunAutoAssign = async () => {
    if (!onAutoAssignStudents) return;
    setBatchActionBanner(null);
    const res = await onAutoAssignStudents();
    setBatchActionBanner({
      type: res.assignedCount > 0 ? 'success' : 'error',
      message: res.message,
    });
  };

  // Edit form states
  const [editNama, setEditNama] = useState('');
  const [editTempatLahir, setEditTempatLahir] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editNamaIbu, setEditNamaIbu] = useState('');
  const [editNoTelpOrtu, setEditNoTelpOrtu] = useState('');
  const [editJenjang, setEditJenjang] = useState<Jenjang>('SD');
  const [editKelas, setEditKelas] = useState<number>(1);

  const currentMonth = 9;
  const currentYear = 2026;

  const cabangSiswa = siswaList.filter(
    (s) => s.cabangId === currentCabang.id && !s.deletedAt
  );

  const filteredSiswa = cabangSiswa.filter((s) => {
    if (searchTerm && !s.nama.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterJenjang !== 'all' && s.jenjang !== filterJenjang) {
      return false;
    }
    if (filterStatus !== 'all' && s.status !== filterStatus) {
      return false;
    }
    if (filterSPP !== 'all') {
      const bill = sppList.find(
        (b) => b.siswaId === s.id && b.bulan === currentMonth && b.tahun === currentYear
      );
      const sppStatus = bill ? bill.status : 'belum_bayar';
      if (filterSPP !== sppStatus) return false;
    }
    return true;
  });

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalSiswa) return;
    setAssignErrorMessage(null);

    const targetGuruId = assignGuruSelected === '' ? null : assignGuruSelected;
    const res = await onAssignGuru(assignModalSiswa.id, targetGuruId);

    if (!res.success) {
      setAssignErrorMessage(res.message || 'Penugasan guru gagal.');
    } else {
      setAssignModalSiswa(null);
    }
  };

  const handleOpenEditModal = (siswa: Siswa) => {
    setEditModalSiswa(siswa);
    setEditNama(siswa.nama);
    setEditTempatLahir(siswa.tempatLahir);
    setEditTanggalLahir(siswa.tanggalLahir);
    setEditAlamat(siswa.alamat);
    setEditNamaIbu(siswa.namaIbu);
    setEditNoTelpOrtu(siswa.noTelpOrtu);
    setEditJenjang(siswa.jenjang);
    setEditKelas(siswa.kelas);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalSiswa || !onUpdateSiswa) return;

    const updated: Siswa = {
      ...editModalSiswa,
      nama: editNama,
      tempatLahir: editTempatLahir,
      tanggalLahir: editTanggalLahir,
      alamat: editAlamat,
      namaIbu: editNamaIbu,
      noTelpOrtu: editNoTelpOrtu,
      jenjang: editJenjang,
      kelas: editKelas,
    };

    onUpdateSiswa(updated);
    setEditModalSiswa(null);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Manajemen Siswa Cabang
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cabang: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentCabang.nama}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onAutoAssignStudents && (
            <button
              onClick={handleRunAutoAssign}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
              title="Secara otomatis menugaskan semua siswa belum berguru ke pengajar yang cocok"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Assign Otomatis</span>
            </button>
          )}

          <button
            onClick={() => {
              setParsedExcelSiswa([]);
              setImportError(null);
              setIsImportExcelOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
            <span>Import Excel Siswa</span>
          </button>

          <button
            onClick={onBatchNaikKelas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 font-medium text-xs transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Aksi Massal "Naik Kelas"</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterJenjang}
            onChange={(e) => setFilterJenjang(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Jenjang</option>
            <option value="TK">TK</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA_SMK">SMA / SMK</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Status Siswa</option>
            <option value="aktif">🟢 Aktif</option>
            <option value="cuti">🟡 Cuti Sementara</option>
            <option value="keluar">⚫ Keluar</option>
          </select>
        </div>

        <div>
          <select
            value={filterSPP}
            onChange={(e) => setFilterSPP(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Badge SPP</option>
            <option value="lunas">🟢 Lunas</option>
            <option value="belum_bayar">🔴 Belum Bayar</option>
          </select>
        </div>
      </div>

      {/* Batch Multi-Select Action Bar */}
      {selectedSiswaIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-500/30 rounded-xl transition-all shadow-md">
          <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300 text-xs">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{selectedSiswaIds.length} Siswa Terpilih (Centang Massal)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={batchGuruSelected}
              onChange={(e) => setBatchGuruSelected(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none"
            >
              <option value="">-- Pilih Guru Penugasan Massal --</option>
              {guruList
                .filter((g) => g.isActive && g.cabangIds.includes(currentCabang.id))
                .map((g) => {
                  const slotsUsed = countTeacherAssignedStudents(g.id, siswaList);
                  return (
                    <option key={g.id} value={g.id} disabled={slotsUsed >= 6}>
                      {g.nama} ({g.jenjang} • {slotsUsed}/6 Slot) {slotsUsed >= 6 ? '[KUOTA PENUH]' : ''}
                    </option>
                  );
                })}
            </select>

            <button
              onClick={handleExecuteBatchAssign}
              disabled={!batchGuruSelected}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Tugaskan ({selectedSiswaIds.length} Siswa)
            </button>

            <button
              onClick={async () => {
                setBatchGuruSelected('');
                if (onBatchAssignGuru) {
                  await onBatchAssignGuru(selectedSiswaIds, null);
                  setSelectedSiswaIds([]);
                  setBatchActionBanner({ type: 'success', message: `Berhasil mengosongkan penugasan ${selectedSiswaIds.length} siswa.` });
                }
              }}
              className="px-2.5 py-1 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Kosongkan Guru
            </button>

            <button
              onClick={() => setSelectedSiswaIds([])}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              title="Batal Pilih"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {batchActionBanner && (
        <div
          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
            batchActionBanner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            {batchActionBanner.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{batchActionBanner.message}</span>
          </div>
          <button onClick={() => setBatchActionBanner(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Student Data Table */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-2.5 sm:p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filteredSiswa.length > 0 && selectedSiswaIds.length === filteredSiswa.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-2.5 sm:p-3">Nama Siswa</th>
                <th className="p-2.5 sm:p-3">Kelas</th>
                <th className="p-2.5 sm:p-3">Guru Pengajar</th>
                <th className="p-2.5 sm:p-3">Badge SPP</th>
                <th className="p-2.5 sm:p-3">Status Siswa</th>
                <th className="p-2.5 sm:p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    Tidak ada data siswa.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((siswa) => {
                  const assignedGuru = guruList.find((g) => g.id === siswa.guruId);
                  const sppBill = sppList.find(
                    (b) =>
                      b.siswaId === siswa.id &&
                      b.bulan === currentMonth &&
                      b.tahun === currentYear
                  );
                  const isLunas = sppBill?.status === 'lunas';

                  return (
                    <tr
                      key={siswa.id}
                      className={`hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors ${
                        selectedSiswaIds.includes(siswa.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-2.5 sm:p-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSiswaIds.includes(siswa.id)}
                          onChange={() => handleToggleSelectSiswa(siswa.id)}
                          className="rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      {/* Name Only (no phone subtext) */}
                      <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-zinc-100">
                        <div className="truncate max-w-[150px] sm:max-w-[200px]">{siswa.nama}</div>
                      </td>

                      {/* Class */}
                      <td className="p-2.5 sm:p-3 whitespace-nowrap font-medium text-slate-700 dark:text-zinc-200">
                        {getJenjangLabel(siswa.jenjang, siswa.kelas, siswa.status)}
                      </td>

                      {/* Teacher */}
                      <td className="p-2.5 sm:p-3 whitespace-nowrap">
                        {assignedGuru ? (
                          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[130px]">{assignedGuru.nama.split(',')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-500 italic text-[11px]">
                            Belum ditugaskan
                          </span>
                        )}
                      </td>

                      {/* SPP Badge */}
                      <td className="p-2.5 sm:p-3 whitespace-nowrap">
                        {siswa.status === 'cuti' ? (
                          <Badge variant="warning">🟡 Cuti</Badge>
                        ) : siswa.status === 'keluar' ? (
                          <Badge variant="neutral">⚫ Keluar</Badge>
                        ) : isLunas ? (
                          <Badge variant="success">🟢 Lunas</Badge>
                        ) : (
                          <Badge variant="danger">🔴 Belum Bayar</Badge>
                        )}
                      </td>

                      {/* Status Dropdown Badge */}
                      <td className="p-2.5 sm:p-3 whitespace-nowrap">
                        <select
                          value={siswa.status}
                          onChange={(e) =>
                            onUpdateSiswaStatus(siswa.id, e.target.value as StudentStatus)
                          }
                          className="bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-[11px] rounded px-2 py-0.5 text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                        >
                          <option value="aktif">🟢 Aktif</option>
                          <option value="cuti">🟡 Cuti</option>
                          <option value="keluar">⚫ Keluar</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-2.5 sm:p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAssignModalSiswa(siswa);
                              setAssignGuruSelected(siswa.guruId || '');
                              setAssignErrorMessage(null);
                            }}
                            className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium transition-colors"
                          >
                            Tugaskan Guru
                          </button>

                          <button
                            onClick={() => setDetailModalSiswa(siswa)}
                            className="p-1.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded border border-sky-200 dark:border-sky-800 transition-colors"
                            title="Card Detail Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(siswa)}
                            className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded border border-amber-200 dark:border-amber-800 transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmSiswa(siswa)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Teacher Modal */}
      {assignModalSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                Penugasan Guru ke Siswa
              </h3>
              <button onClick={() => setAssignModalSiswa(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs">
              <span className="text-slate-400 dark:text-zinc-400">Siswa Target:</span>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">
                {assignModalSiswa.nama} ({getJenjangLabel(assignModalSiswa.jenjang, assignModalSiswa.kelas, assignModalSiswa.status)})
              </p>
            </div>

            {assignErrorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{assignErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Pilih Guru (Jenjang {assignModalSiswa.jenjang}, Slot &lt; 6)
                </label>
                <select
                  value={assignGuruSelected}
                  onChange={(e) => setAssignGuruSelected(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="">-- Kosongkan Penugasan --</option>
                  {guruList
                    .filter(
                      (g) =>
                        g.isActive &&
                        isTeacherEligibleForStudent(g, assignModalSiswa) &&
                        g.cabangIds.includes(currentCabang.id)
                    )
                    .map((g) => {
                      const slotsUsed = countTeacherAssignedStudents(g.id, siswaList);
                      const isFull = slotsUsed >= 6 && assignModalSiswa.guruId !== g.id;

                      return (
                        <option key={g.id} value={g.id} disabled={isFull}>
                          {g.nama} ({slotsUsed}/6 Slot) {isFull ? '- [KUOTA PENUH]' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAssignModalSiswa(null)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors"
                >
                  Simpan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rich Student Detail Card Modal */}
      {detailModalSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Card Detail Data Siswa
              </h3>
              <button
                onClick={() => setDetailModalSiswa(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Summary Header */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                {detailModalSiswa.nama.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate">
                  {detailModalSiswa.nama}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  {getJenjangLabel(detailModalSiswa.jenjang, detailModalSiswa.kelas, detailModalSiswa.status)} • Cabang {currentCabang.nama}
                </p>
              </div>
              <Badge variant={detailModalSiswa.status === 'aktif' ? 'success' : detailModalSiswa.status === 'cuti' ? 'warning' : 'neutral'}>
                {detailModalSiswa.status.toUpperCase()}
              </Badge>
            </div>

            {/* Detailed Grid Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Nama Ibu Kandung:
                </span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{detailModalSiswa.namaIbu || '-'}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" /> No. WhatsApp Ortu:
                </span>
                <a
                  href={`https://wa.me/${detailModalSiswa.noTelpOrtu.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {detailModalSiswa.noTelpOrtu} ↗
                </a>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Tempat, Tanggal Lahir:
                </span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">
                  {detailModalSiswa.tempatLahir}, {detailModalSiswa.tanggalLahir}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-indigo-500" /> Guru Pengajar:
                </span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">
                  {guruList.find((g) => g.id === detailModalSiswa.guruId)?.nama || 'Belum Ditugaskan'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5 sm:col-span-2">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" /> Alamat Rumah Lengkap:
                </span>
                <p className="font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {detailModalSiswa.alamat || '-'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-500" /> Status SPP Bulan Ini:
                </span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">
                  {sppList.find((b) => b.siswaId === detailModalSiswa.id && b.bulan === currentMonth && b.tahun === currentYear)?.status === 'lunas' ? '🟢 LUNAS' : '🔴 BELUM BAYAR'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" /> Tanggal Pendaftaran:
                </span>
                <p className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                  {new Date(detailModalSiswa.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  const target = detailModalSiswa;
                  setDetailModalSiswa(null);
                  handleOpenEditModal(target);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Data Siswa
              </button>
              <button
                onClick={() => setDetailModalSiswa(null)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editModalSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-amber-500" /> Edit Data Siswa
              </h3>
              <button onClick={() => setEditModalSiswa(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Tempat Lahir *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTempatLahir}
                    onChange={(e) => setEditTempatLahir(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={editTanggalLahir}
                    onChange={(e) => setEditTanggalLahir(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Nama Ibu Kandung *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaIbu}
                    onChange={(e) => setEditNamaIbu(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    No. WA Ortu *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNoTelpOrtu}
                    onChange={(e) => setEditNoTelpOrtu(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Alamat Rumah Lengkap *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Jenjang Pendidikan *
                  </label>
                  <select
                    value={editJenjang}
                    onChange={(e) => {
                      const val = e.target.value as Jenjang;
                      setEditJenjang(val);
                      if (val === 'TK') setEditKelas(0);
                      else if (val === 'SD') setEditKelas(1);
                      else if (val === 'SMP') setEditKelas(7);
                      else setEditKelas(10);
                    }}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="TK">TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA_SMK">SMA / SMK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Kelas *
                  </label>
                  <select
                    value={editKelas}
                    onChange={(e) => setEditKelas(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {editJenjang === 'TK' && <option value={0}>TK</option>}
                    {editJenjang === 'SD' && [1, 2, 3, 4, 5, 6].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
                    {editJenjang === 'SMP' && [7, 8, 9].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
                    {editJenjang === 'SMA_SMK' && [10, 11, 12].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditModalSiswa(null)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      {deleteConfirmSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xl space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Soft Delete Siswa</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Hapus siswa <strong className="text-slate-900 dark:text-zinc-100">{deleteConfirmSiswa.nama}</strong>? Data akan disembunyikan dan riwayat keuangan tetap disimpan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmSiswa(null)}
                className="px-3 py-1 text-xs text-slate-400"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onSoftDeleteSiswa(deleteConfirmSiswa.id);
                  setDeleteConfirmSiswa(null);
                }}
                className="px-3 py-1 bg-rose-600 text-white font-medium text-xs rounded-lg shadow-2xs"
              >
                Ya, Soft Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal for Siswa */}
      {isImportExcelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 relative text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Import Data Siswa via Excel (.xlsx / .csv)
              </h3>
              <button
                onClick={() => {
                  setIsImportExcelOpen(false);
                  setParsedExcelSiswa([]);
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Template Download & File Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5 text-indigo-500" /> 1. Unduh Format Contoh
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Gunakan format kolom resmi agar data dapat terdeteksi otomatis (Nama, Kelas, Tempat Lahir, Tanggal Lahir, No WA, Alamat).
                </p>
                <button
                  type="button"
                  onClick={downloadTemplateSiswaExcel}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Download Format Excel (.xlsx)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                  <Upload className="w-3.5 h-3.5 text-emerald-500" /> 2. Upload File Excel
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Pilih file Excel yang telah diisi data siswa baru.
                </p>
                <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer">
                  <FileUp className="w-3.5 h-3.5" /> Pilih File Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileSiswaChange}
                  />
                </label>
              </div>
            </div>

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Preview Parsed Table */}
            {parsedExcelSiswa.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Preview Data Siswa Ready ({parsedExcelSiswa.length} Siswa)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Otomatis: Kelas 1-6 = SD, 7-9 = SMP, 10-12 = SMA/SMK
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 text-[10px] font-mono sticky top-0">
                      <tr>
                        <th className="p-2">No</th>
                        <th className="p-2">Nama Siswa</th>
                        <th className="p-2">Jenjang & Kelas</th>
                        <th className="p-2">TTL</th>
                        <th className="p-2">No. WA Ortu</th>
                        <th className="p-2">Alamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {parsedExcelSiswa.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="p-2 font-mono text-[10px] text-slate-400">{i + 1}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-zinc-100">{row.nama}</td>
                          <td className="p-2 font-medium">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono">
                              {getJenjangLabel(row.jenjang, row.kelas)}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 dark:text-zinc-300">{row.tempatLahir}, {row.tanggalLahir}</td>
                          <td className="p-2 font-mono text-slate-600 dark:text-zinc-300">{row.noTelpOrtu}</td>
                          <td className="p-2 text-slate-500 dark:text-zinc-400 truncate max-w-[140px]">{row.alamat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsImportExcelOpen(false);
                  setParsedExcelSiswa([]);
                  setImportError(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Batal
              </button>
              {parsedExcelSiswa.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmImportSiswa}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Import {parsedExcelSiswa.length} Siswa Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

