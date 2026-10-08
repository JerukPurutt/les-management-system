import React, { useState } from 'react';
import { Cabang, Guru, Siswa, Jadwal, Jenjang } from '../../types';
import { CalendarDays, Plus, AlertCircle, X, IdCard, Info, Pencil, Trash2, AlertTriangle, FileSpreadsheet, Download, Upload, FileUp, CheckCircle, Eye, ChevronDown, ChevronUp, Phone, MapPin, Calendar } from 'lucide-react';
import {
  countTeacherAssignedStudents,
  getJenjangLabel,
} from '../../utils/helpers';
import {
  parseGuruExcel,
  downloadTemplateGuruExcel,
  ParsedGuruRow,
} from '../../utils/excelHelpers';
import { Badge } from '../common/Badge';


interface ManajemenGuruJadwalProps {
  currentCabang: Cabang;
  cabangList?: Cabang[];
  guruList: Guru[];
  siswaList: Siswa[];
  jadwalList: Jadwal[];
  onAddGuru: (nama: string, noTelp: string, noPegawai: string, tanggalLahir: string, alamat: string, jenjang: Jenjang) => void;
  onBatchAddGuru?: (teachers: ParsedGuruRow[]) => void;
  onUpdateGuru?: (guruId: string, nama: string, noTelp: string, tanggalLahir: string, alamat: string, jenjang: Jenjang) => void;
  onDeleteGuru?: (guruId: string) => void;
  onAddOrUpdateJadwal: (jadwalData: Omit<Jadwal, 'id'>, editJadwalId?: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteJadwal: (jadwalId: string) => void;
}

export const ManajemenGuruJadwal: React.FC<ManajemenGuruJadwalProps> = ({
  currentCabang,
  cabangList,
  guruList,
  siswaList,
  jadwalList,
  onAddGuru,
  onBatchAddGuru,
  onUpdateGuru,
  onDeleteGuru,
  onAddOrUpdateJadwal,
  onDeleteJadwal,
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'jadwal'>('guru');

  const [isAddGuruOpen, setIsAddGuruOpen] = useState(false);
  const [newGuruNama, setNewGuruNama] = useState('');
  const [newGuruPegawai, setNewGuruPegawai] = useState('');
  const [newGuruTanggalLahir, setNewGuruTanggalLahir] = useState('');
  const [newGuruAlamat, setNewGuruAlamat] = useState('');
  const [newGuruTelp, setNewGuruTelp] = useState('');
  const [newGuruJenjang, setNewGuruJenjang] = useState<Jenjang>('SD');

  const [isAddJadwalOpen, setIsAddJadwalOpen] = useState(false);
  const [editJadwalModal, setEditJadwalModal] = useState<Jadwal | null>(null);
  const [deleteConfirmJadwal, setDeleteConfirmJadwal] = useState<Jadwal | null>(null);
  const [selectedGuruId, setSelectedGuruId] = useState('');
  const [selectedHari, setSelectedHari] = useState<Jadwal['hari']>('Senin');
  const [jamMulai, setJamMulai] = useState('18:00');
  const [jamSelesai, setJamSelesai] = useState('20:00');
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Edit Guru Modal State
  const [editGuruModal, setEditGuruModal] = useState<Guru | null>(null);
  const [editGuruNama, setEditGuruNama] = useState('');
  const [editGuruTelp, setEditGuruTelp] = useState('');
  const [editGuruTanggalLahir, setEditGuruTanggalLahir] = useState('');
  const [editGuruAlamat, setEditGuruAlamat] = useState('');
  const [editGuruJenjang, setEditGuruJenjang] = useState<Jenjang>('SD');

  // Delete Confirm Guru State
  const [deleteConfirmGuru, setDeleteConfirmGuru] = useState<Guru | null>(null);

  // Detail Modal & Accordion Expand States
  const [detailModalGuru, setDetailModalGuru] = useState<Guru | null>(null);
  const [expandedGuruIds, setExpandedGuruIds] = useState<string[]>([]);

  const toggleExpandGuru = (guruId: string) => {
    setExpandedGuruIds((prev) =>
      prev.includes(guruId) ? prev.filter((id) => id !== guruId) : [...prev, guruId]
    );
  };

  // Excel Import Guru State
  const [isImportGuruExcelOpen, setIsImportGuruExcelOpen] = useState(false);
  const [parsedExcelGuru, setParsedExcelGuru] = useState<ParsedGuruRow[]>([]);
  const [importGuruError, setImportGuruError] = useState<string | null>(null);

  const handleFileGuruChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImportGuruError(null);
    try {
      const rows = await parseGuruExcel(files[0]);
      if (rows.length === 0) {
        setImportGuruError('File Excel tidak berisi data guru yang valid.');
      } else {
        setParsedExcelGuru(rows);
      }
    } catch (err: any) {
      setImportGuruError(`Gagal membaca file Excel: ${err?.message || 'Format file salah'}`);
    }
    e.target.value = '';
  };

  const handleConfirmImportGuru = () => {
    if (parsedExcelGuru.length === 0) return;
    if (onBatchAddGuru) {
      onBatchAddGuru(parsedExcelGuru);
    }
    setIsImportGuruExcelOpen(false);
    setParsedExcelGuru([]);
    setImportGuruError(null);
  };

  const cabangGuru = guruList.filter((g) => g.cabangIds.includes(currentCabang.id) && g.isActive);
  const cabangSiswa = siswaList.filter((s) => s.cabangId === currentCabang.id && !s.deletedAt && s.status === 'aktif');
  const cabangJadwal = jadwalList.filter((j) => j.cabangId === currentCabang.id);

  const handleOpenAddGuru = () => {
    setNewGuruNama('');
    setNewGuruAlamat('');
    setNewGuruTelp('');

    // Auto generate next NIP
    const nipNums = guruList
      .map((g) => {
        const m = (g.noPegawai || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);
    const maxNip = nipNums.length > 0 ? Math.max(...nipNums) : 3000;
    const autoNip = `NIP-${maxNip + 1}`;

    setNewGuruPegawai(autoNip);
    setNewGuruTanggalLahir('1995-06-20');
    setNewGuruJenjang('SD');
    setIsAddGuruOpen(true);
  };

  const handleAddGuruSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuruNama.trim() || !newGuruTelp.trim()) return;
    onAddGuru(
      newGuruNama,
      newGuruTelp,
      newGuruPegawai,
      newGuruTanggalLahir || '1995-01-01',
      newGuruAlamat,
      newGuruJenjang
    );
    setIsAddGuruOpen(false);
    setNewGuruNama('');
    setNewGuruTelp('');
    setNewGuruAlamat('');
  };

  const handleOpenEditGuru = (guru: Guru) => {
    setEditGuruModal(guru);
    setEditGuruNama(guru.nama);
    setEditGuruTelp(guru.noTelp);
    setEditGuruTanggalLahir(guru.tanggalLahir || '1995-01-01');
    setEditGuruAlamat(guru.alamat || '');
    setEditGuruJenjang(guru.jenjang);
  };

  const handleEditGuruSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuruModal || !editGuruNama.trim() || !editGuruTelp.trim()) return;

    if (onUpdateGuru) {
      onUpdateGuru(
        editGuruModal.id,
        editGuruNama.trim(),
        editGuruTelp.trim(),
        editGuruTanggalLahir,
        editGuruAlamat.trim(),
        editGuruJenjang
      );
    }
    setEditGuruModal(null);
  };

  const handleDeleteGuruSubmit = () => {
    if (!deleteConfirmGuru) return;
    if (onDeleteGuru) {
      onDeleteGuru(deleteConfirmGuru.id);
    }
    setDeleteConfirmGuru(null);
  };

  const handleOpenAddJadwal = () => {
    setEditJadwalModal(null);
    setSelectedGuruId(cabangGuru[0]?.id || '');
    setSelectedHari('Senin');
    setJamMulai('18:00');
    setJamSelesai('20:00');
    setScheduleError(null);
    setIsAddJadwalOpen(true);
  };

  const handleOpenEditJadwal = (jdw: Jadwal) => {
    setEditJadwalModal(jdw);
    setSelectedGuruId(jdw.guruId);
    setSelectedHari(jdw.hari);
    setJamMulai(jdw.jamMulai || '18:00');
    setJamSelesai(jdw.jamSelesai || '20:00');
    setScheduleError(null);
    setIsAddJadwalOpen(true);
  };

  const handleAddJadwalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);

    if (!selectedGuruId) {
      setScheduleError('Pilih Guru pengajar terlebih dahulu.');
      return;
    }

    const res = await onAddOrUpdateJadwal(
      {
        guruId: selectedGuruId,
        siswaId: '',
        cabangId: currentCabang.id,
        hari: selectedHari,
        jamMulai,
        jamSelesai,
      },
      editJadwalModal ? editJadwalModal.id : undefined
    );

    if (!res.success) {
      setScheduleError(res.message || 'Gagal menyimpan jadwal.');
    } else {
      setIsAddJadwalOpen(false);
      setEditJadwalModal(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Guru & Jadwal Les
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cabang: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentCabang.nama}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('guru')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'guru' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Daftar Guru & Slot
            </button>
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'jadwal' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Jadwal Mengajar
            </button>
          </div>

          {activeTab === 'guru' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setParsedExcelGuru([]);
                  setImportGuruError(null);
                  setIsImportGuruExcelOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" /> Import Excel Guru
              </button>

              <button
                onClick={handleOpenAddGuru}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Buat Akun Guru
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenAddJadwal}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Atur Jadwal Sesi
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: GURU LIST & SLOTS */}
      {activeTab === 'guru' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cabangGuru.map((guru) => {
            const assignedCount = countTeacherAssignedStudents(guru.id, siswaList);
            const mySiswa = siswaList.filter((s) => s.guruId === guru.id && !s.deletedAt && s.status === 'aktif');
            const nip = guru.noPegawai || 'NIP-2001';
            const isExpanded = expandedGuruIds.includes(guru.id);

            return (
              <div
                key={guru.id}
                className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">{guru.nama}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                        <IdCard className="w-3 h-3" /> {nip}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="purple">{getJenjangLabel(guru.jenjang)}</Badge>

                    {/* Detail Button */}
                    <button
                      onClick={() => setDetailModalGuru(guru)}
                      className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-200 dark:border-amber-800/80 transition-colors cursor-pointer"
                      title="Lihat Detail Profil Guru"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {onUpdateGuru && (
                      <button
                        onClick={() => handleOpenEditGuru(guru)}
                        className="p-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-lg border border-sky-200 dark:border-sky-800/80 transition-colors cursor-pointer"
                        title="Edit Data Guru"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteGuru && (
                      <button
                        onClick={() => setDeleteConfirmGuru(guru)}
                        className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-800/80 transition-colors cursor-pointer"
                        title="Hapus Akun Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-zinc-400">Kapasitas Slot (Maks 6 Total):</span>
                    <span className={`font-bold ${assignedCount >= 6 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {assignedCount} / 6 Siswa
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800">
                    <div
                      className={`h-full transition-all ${
                        assignedCount >= 6 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(assignedCount / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Collapsible Student list taught by this teacher */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-2">
                  <button
                    onClick={() => toggleExpandGuru(guru.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/50 hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 transition-colors cursor-pointer text-left"
                  >
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                      Siswa Diajar ({mySiswa.length} Siswa)
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                      <span>{isExpanded ? 'Sembunyikan' : 'Tampilkan'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div>
                      {mySiswa.length === 0 ? (
                        <p className="text-slate-400 dark:text-zinc-500 italic text-[11px] p-2 text-center">
                          Belum ada siswa yang ditugaskan ke guru ini.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {mySiswa.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800"
                            >
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="text-slate-800 dark:text-zinc-200 font-medium text-[11px] truncate">{s.nama}</span>
                                {s.cabangId !== currentCabang.id && (
                                  <span className="text-[9px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-medium shrink-0">
                                    {cabangList?.find((c) => c.id === s.cabangId)?.nama || 'Cabang Lain'}
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10px] shrink-0">
                                {getJenjangLabel(s.jenjang, s.kelas, s.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: JADWAL LIST */}
      {activeTab === 'jadwal' && (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                Daftar Sesi Jadwal Mengajar Cabang
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Pengaturan alokasi hari & sesi les guru di {currentCabang.nama}
              </p>
            </div>
            <button
              onClick={handleOpenAddJadwal}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Atur Jadwal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-2.5 sm:p-3">Hari</th>
                  <th className="p-2.5 sm:p-3">Sesi & Jam Belajar</th>
                  <th className="p-2.5 sm:p-3">Guru Pengajar</th>
                  <th className="p-2.5 sm:p-3">Jenjang Guru</th>
                  <th className="p-2.5 sm:p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
                {cabangJadwal.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                      Belum ada jadwal mengajar.
                    </td>
                  </tr>
                ) : (
                  cabangJadwal.map((jdw) => {
                    const guruObj = guruList.find((g) => g.id === jdw.guruId);
                    const isSesi2 = jdw.jamMulai === '18:00';

                    return (
                      <tr key={jdw.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-2.5 sm:p-3 font-bold text-indigo-600 dark:text-indigo-400">{jdw.hari}</td>
                        <td className="p-2.5 sm:p-3">
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-sans font-bold">
                              {isSesi2 ? 'Sesi 2' : 'Sesi 1'}
                            </span>
                            <span>{jdw.jamMulai} - {jdw.jamSelesai}</span>
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-zinc-100">
                          {guruObj?.nama || 'N/A'}
                        </td>
                        <td className="p-2.5 sm:p-3 font-medium">
                          <Badge variant="purple">{guruObj ? getJenjangLabel(guruObj.jenjang) : '-'}</Badge>
                        </td>
                        <td className="p-2.5 sm:p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditJadwal(jdw)}
                              className="p-1 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded border border-sky-200 dark:border-sky-800/80 transition-colors cursor-pointer"
                              title="Edit Sesi Jadwal"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmJadwal(jdw)}
                              className="p-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-800/80 transition-colors cursor-pointer"
                              title="Hapus Sesi Jadwal"
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
      )}

      {/* Add Guru Modal */}
      {isAddGuruOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Buat Akun Guru Pengajar Baru</h3>
              <button onClick={() => setIsAddGuruOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div>
                <span className="font-bold block">Ketentuan Hak Akses Pimpinan Cabang:</span>
                Pimpinan Cabang hanya dapat membuat akun <strong>Guru Biasa</strong>. Hak mengubah Guru Biasa menjadi Pimpinan Cabang hanya dimiliki Pimpinan Pusat.
              </div>
            </div>

            <form onSubmit={handleAddGuruSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Budi Santoso, S.Pd"
                  value={newGuruNama}
                  onChange={(e) => setNewGuruNama(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                    <span>No. Pegawai (NIP Login)</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">Auto</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={newGuruPegawai}
                    className="w-full bg-slate-200/60 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-zinc-300 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Tanggal Lahir (Password) *</label>
                  <input
                    type="date"
                    required
                    value={newGuruTanggalLahir}
                    onChange={(e) => setNewGuruTanggalLahir(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Alamat Lengkap Tempat Tinggal *</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Jl. Sudirman No. 88, Jakarta"
                  value={newGuruAlamat}
                  onChange={(e) => setNewGuruAlamat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={newGuruTelp}
                    onChange={(e) => setNewGuruTelp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Jenjang Kategori *</label>
                  <select
                    value={newGuruJenjang}
                    onChange={(e) => setNewGuruJenjang(e.target.value as Jenjang)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="TK">TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA_SMK">SMA / SMK</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddGuruOpen(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-2xs transition-colors"
                >
                  Simpan & Buat Akun Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      {isAddJadwalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                {editJadwalModal ? 'Edit Sesi Jadwal Mengajar' : 'Atur Sesi Jadwal Mengajar'}
              </h3>
              <button onClick={() => setIsAddJadwalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {scheduleError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}

            <form onSubmit={handleAddJadwalSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Guru Pengajar *</label>
                <select
                  value={selectedGuruId}
                  onChange={(e) => setSelectedGuruId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="">-- Pilih Guru --</option>
                  {cabangGuru.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama} ({getJenjangLabel(g.jenjang)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">Hari *</label>
                <select
                  value={selectedHari}
                  onChange={(e) => setSelectedHari(e.target.value as Jadwal['hari'])}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                  Pilih Sesi Jam Belajar (Default: Sesi 2) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJamMulai('16:00');
                      setJamSelesai('18:00');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      jamMulai === '16:00' && jamSelesai === '18:00'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Sesi 1</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                        16:00 - 18:00
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-1">
                      Jam Les Sore (2 Jam)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setJamMulai('18:00');
                      setJamSelesai('20:00');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      jamMulai === '18:00' && jamSelesai === '20:00'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1">
                        <span>Sesi 2</span>
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded font-normal">Default</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                        18:00 - 20:00
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mt-1">
                      Jam Les Malam (2 Jam)
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddJadwalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {editJadwalModal ? 'Simpan Perubahan' : 'Simpan Jadwal Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Schedule Confirmation Modal */}
      {deleteConfirmJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Konfirmasi Hapus Sesi Jadwal</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Apakah Anda yakin ingin menghapus sesi jadwal mengajar ini?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                Guru: {guruList.find((g) => g.id === deleteConfirmJadwal.guruId)?.nama || 'N/A'}
              </p>
              <p className="text-slate-600 dark:text-zinc-400 text-xs font-mono">
                Hari: <span className="font-bold text-indigo-600 dark:text-indigo-400">{deleteConfirmJadwal.hari}</span> • {deleteConfirmJadwal.jamMulai === '16:00' ? 'Sesi 1 (16:00 - 18:00)' : deleteConfirmJadwal.jamMulai === '18:00' ? 'Sesi 2 (18:00 - 20:00)' : `${deleteConfirmJadwal.jamMulai} - ${deleteConfirmJadwal.jamSelesai}`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmJadwal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteJadwal(deleteConfirmJadwal.id);
                  setDeleteConfirmJadwal(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Ya, Hapus Sesi Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guru Modal */}
      {editGuruModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-amber-500" /> Edit Data Guru
              </h3>
              <button onClick={() => setEditGuruModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditGuruSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={editGuruNama}
                  onChange={(e) => setEditGuruNama(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    No. WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editGuruTelp}
                    onChange={(e) => setEditGuruTelp(e.target.value)}
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
                    value={editGuruTanggalLahir}
                    onChange={(e) => setEditGuruTanggalLahir(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Jenjang Mengajar *
                </label>
                <select
                  value={editGuruJenjang}
                  onChange={(e) => setEditGuruJenjang(e.target.value as Jenjang)}
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
                  Alamat Rumah
                </label>
                <textarea
                  rows={2}
                  value={editGuruAlamat}
                  onChange={(e) => setEditGuruAlamat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditGuruModal(null)}
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

      {/* Delete Confirm Guru Modal */}
      {deleteConfirmGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Hapus Akun Guru</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Apakah Anda yakin ingin menghapus guru <strong className="text-slate-900 dark:text-zinc-100">{deleteConfirmGuru.nama}</strong>? Penugasan siswa dan jadwal mengajar guru ini akan dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmGuru(null)}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteGuruSubmit}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Ya, Hapus Guru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal for Guru */}
      {isImportGuruExcelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 relative text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Import Data Guru via Excel (.xlsx / .csv)
              </h3>
              <button
                onClick={() => {
                  setIsImportGuruExcelOpen(false);
                  setParsedExcelGuru([]);
                  setImportGuruError(null);
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
                  Format kolom resmi untuk import guru: Nama Guru, No WA, Jenjang Mengajar (SD/SMP/SMA/TK), Alamat.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplateGuruExcel}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Download Format Excel Guru (.xlsx)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                  <Upload className="w-3.5 h-3.5 text-emerald-500" /> 2. Upload File Excel Guru
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Pilih file Excel yang telah diisi data pengajar baru.
                </p>
                <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer">
                  <FileUp className="w-3.5 h-3.5" /> Pilih File Excel Guru
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileGuruChange}
                  />
                </label>
              </div>
            </div>

            {importGuruError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importGuruError}</span>
              </div>
            )}

            {/* Preview Parsed Table */}
            {parsedExcelGuru.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Preview Data Guru Ready ({parsedExcelGuru.length} Guru)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Sistem akan membuat NIP otomatis untuk setiap akun guru
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 text-[10px] font-mono sticky top-0">
                      <tr>
                        <th className="p-2">No</th>
                        <th className="p-2">Nama Guru</th>
                        <th className="p-2">No. WA</th>
                        <th className="p-2">Jenjang</th>
                        <th className="p-2">Alamat Rumah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {parsedExcelGuru.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="p-2 font-mono text-[10px] text-slate-400">{i + 1}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-zinc-100">{row.nama}</td>
                          <td className="p-2 font-mono text-slate-600 dark:text-zinc-300">{row.noTelp}</td>
                          <td className="p-2 font-medium">
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-[10px] font-mono">
                              {row.jenjang}
                            </span>
                          </td>
                          <td className="p-2 text-slate-500 dark:text-zinc-400 truncate max-w-[160px]">{row.alamat}</td>
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
                  setIsImportGuruExcelOpen(false);
                  setParsedExcelGuru([]);
                  setImportGuruError(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Batal
              </button>
              {parsedExcelGuru.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmImportGuru}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Import {parsedExcelGuru.length} Guru Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Guru Modal */}
      {detailModalGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" /> Detail Informasi Guru
              </h3>
              <button
                onClick={() => setDetailModalGuru(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                  {detailModalGuru.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{detailModalGuru.nama}</h4>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs flex items-center gap-1 mt-0.5">
                    <IdCard className="w-3.5 h-3.5" /> {detailModalGuru.noPegawai || 'NIP-2001'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-1">Jenjang Mengajar</span>
                  <Badge variant="purple">{getJenjangLabel(detailModalGuru.jenjang)}</Badge>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-1">Password (Tgl Lahir)</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {detailModalGuru.tanggalLahir || '1995-01-01'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-1">No. WhatsApp / Telepon</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {detailModalGuru.noTelp}
                    </span>
                    <a
                      href={`https://wa.me/${detailModalGuru.noTelp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Hubungi WA &rarr;
                    </a>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-1">Alamat Rumah</span>
                  <span className="text-slate-700 dark:text-zinc-300 text-xs flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    {detailModalGuru.alamat || 'Alamat belum diisi.'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mb-0.5">Kapasitas Slot Siswa</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {countTeacherAssignedStudents(detailModalGuru.id, siswaList)} / 6 Siswa Terisi
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Cabang: {currentCabang.nama}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalGuru(null)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
