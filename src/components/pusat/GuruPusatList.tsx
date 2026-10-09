import React, { useState } from 'react';
import { Guru, Cabang, Siswa, User, Jenjang } from '../../types';
import { Building2, GraduationCap, Plus, UserCheck, ShieldCheck, Check, X, UserCog, KeyRound, IdCard, Eye, ChevronDown, ChevronUp, Phone, MapPin, Calendar } from 'lucide-react';
import { countTeacherAssignedStudents, getJenjangLabel } from '../../utils/helpers';
import { Badge } from '../common/Badge';

interface GuruPusatListProps {
  guruList: Guru[];
  cabangList: Cabang[];
  siswaList: Siswa[];
  users: User[];
  onAddGuruPusat: (
    nama: string,
    noTelp: string,
    noPegawai: string,
    tanggalLahir: string,
    alamat: string,
    jenjang: Jenjang,
    cabangIds: string[],
    accountRole: 'guru' | 'cabang',
    assignedCabangId?: string
  ) => Promise<{ newUser: User | null; newGuru: Guru | null }>;
  onPromoteGuruRole: (
    guruId: string,
    newRole: 'guru' | 'cabang',
    assignedCabangId?: string
  ) => void;
}

export const GuruPusatList: React.FC<GuruPusatListProps> = ({
  guruList,
  cabangList,
  siswaList,
  users,
  onAddGuruPusat,
  onPromoteGuruRole,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [namaInput, setNamaInput] = useState('');
  const [noTelpInput, setNoTelpInput] = useState('');
  const [noPegawaiInput, setNoPegawaiInput] = useState('');
  const [tanggalLahirInput, setTanggalLahirInput] = useState('');
  const [alamatInput, setAlamatInput] = useState('');
  const [jenjangInput, setJenjangInput] = useState<Jenjang>('SD');
  const [accountRoleInput, setAccountRoleInput] = useState<'guru' | 'cabang'>('guru');
  const [selectedCabangIds, setSelectedCabangIds] = useState<string[]>(['cab-1']);
  const [createdInfo, setCreatedInfo] = useState<{ nip: string; pass: string; role: string; nama: string } | null>(null);

  // Role Promotion Modal State
  const [selectedGuruForRole, setSelectedGuruForRole] = useState<Guru | null>(null);
  const [targetRole, setTargetRole] = useState<'guru' | 'cabang'>('cabang');
  const [targetCabangId, setTargetCabangId] = useState<string>('cab-1');

  // Detail Modal & Accordion Expand States
  const [detailModalGuru, setDetailModalGuru] = useState<Guru | null>(null);
  const [expandedGuruIds, setExpandedGuruIds] = useState<string[]>([]);

  const toggleExpandGuru = (guruId: string) => {
    setExpandedGuruIds((prev) =>
      prev.includes(guruId) ? prev.filter((id) => id !== guruId) : [...prev, guruId]
    );
  };

  const toggleCabangSelect = (cabId: string) => {
    if (selectedCabangIds.includes(cabId)) {
      if (selectedCabangIds.length > 1) {
        setSelectedCabangIds(selectedCabangIds.filter((id) => id !== cabId));
      }
    } else {
      setSelectedCabangIds([...selectedCabangIds, cabId]);
    }
  };

  const handleOpenAddModal = () => {
    setCreatedInfo(null);
    setNamaInput('');
    setNoTelpInput('');
    setAlamatInput('');

    // Auto generate next NIP
    const nipNums = guruList
      .map((g) => {
        const m = (g.noPegawai || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);
    const maxNip = nipNums.length > 0 ? Math.max(...nipNums) : 3000;
    const autoNip = `NIP-${maxNip + 1}`;

    setNoPegawaiInput(autoNip);
    setTanggalLahirInput('1995-05-15');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput.trim() || !noTelpInput.trim()) return;

    const res = await onAddGuruPusat(
      namaInput,
      noTelpInput,
      noPegawaiInput,
      tanggalLahirInput || '1995-01-01',
      alamatInput,
      jenjangInput,
      selectedCabangIds,
      accountRoleInput,
      selectedCabangIds[0]
    );
    if (!res.newGuru || !res.newUser) return;

    setCreatedInfo({
      nama: res.newGuru.nama,
      nip: res.newUser.noPegawai || noPegawaiInput,
      pass: res.newUser.tanggalLahir || tanggalLahirInput,
      role: res.newUser.role,
    });

    setNamaInput('');
    setNoTelpInput('');
    setAlamatInput('');
  };

  const handleOpenRoleModal = (guru: Guru) => {
    const matchedUser = users.find(
      (u) => u.teacherId === guru.id || u.email.toLowerCase() === guru.email.toLowerCase()
    );
    const currentRole = matchedUser?.role === 'cabang' ? 'cabang' : 'guru';
    setSelectedGuruForRole(guru);
    setTargetRole(currentRole);
    setTargetCabangId(matchedUser?.cabangId || guru.cabangIds[0] || 'cab-1');
  };

  const handleSaveRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuruForRole) return;
    onPromoteGuruRole(selectedGuruForRole.id, targetRole, targetCabangId);
    setSelectedGuruForRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono font-medium bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Academic Staff Directory
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-indigo-500" /> Daftar Guru & Akun Pengajar (Pusat)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola akun guru, ubah peran Guru Biasa ↔ Pimpinan Cabang, & alokasi mengajar
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Guru & Buat Akun</span>
        </button>
      </div>

      {/* Guru Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guruList.map((guru) => {
          const assignedCount = countTeacherAssignedStudents(guru.id, siswaList);
          const assignedCabangNames = cabangList
            .filter((c) => guru.cabangIds.includes(c.id))
            .map((c) => c.nama);
          const mySiswa = siswaList.filter((s) => s.guruId === guru.id && !s.deletedAt && s.status === 'aktif');

          // Find user account matching this teacher
          const matchedUser = users.find(
            (u) => u.teacherId === guru.id || u.email.toLowerCase() === guru.email.toLowerCase()
          );
          const isBranchLeader = matchedUser?.role === 'cabang';
          const nip = guru.noPegawai || matchedUser?.noPegawai || 'NIP-1001';
          const isExpanded = expandedGuruIds.includes(guru.id);

          return (
            <div
              key={guru.id}
              className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs hover:border-zinc-300 dark:hover:border-white/20 transition-all group"
            >
              <div className="h-full bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight">
                      {guru.nama}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                        <IdCard className="w-3.5 h-3.5" /> {nip}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={guru.jenjang === 'SMA_SMK' ? 'purple' : guru.jenjang === 'SMP' ? 'info' : 'success'}>
                      {getJenjangLabel(guru.jenjang)}
                    </Badge>

                    {/* Role Badge: Pimpinan Cabang vs Guru Biasa */}
                    {isBranchLeader ? (
                      <Badge variant="warning" className="text-[9px]">
                        🏢 Pimpinan Cabang
                      </Badge>
                    ) : (
                      <Badge variant="info" className="text-[9px]">
                        🎓 Guru Biasa
                      </Badge>
                    )}

                    {/* Detail Button */}
                    <button
                      onClick={() => setDetailModalGuru(guru)}
                      className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                      title="Lihat Detail Profil Guru"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenRoleModal(guru)}
                      className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 transition-colors cursor-pointer"
                      title="Ubah Peran (Guru Biasa / Pimpinan Cabang)"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slot Counter Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                      <GraduationCap className="w-4 h-4 text-indigo-500" /> Slot Siswa Diajar:
                    </span>
                    <span className={`font-mono font-bold ${assignedCount >= 6 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {assignedCount} / 6 {assignedCount >= 6 ? '(Penuh)' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-200/40 dark:border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        assignedCount >= 6
                          ? 'bg-rose-500'
                          : assignedCount >= 4
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(assignedCount / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Cabang assignments */}
                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center gap-2 text-xs overflow-hidden">
                  <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider">Cabang:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedCabangNames.map((cName, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-200/60 dark:border-white/10 font-medium"
                      >
                        {cName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Collapsible Student list taught by this teacher */}
                <div className="pt-3 border-t border-zinc-100 dark:border-white/5 text-xs space-y-2">
                  <button
                    onClick={() => toggleExpandGuru(guru.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200/60 dark:border-white/5 transition-colors cursor-pointer text-left"
                  >
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                      Siswa Diajar ({mySiswa.length} Siswa)
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>{isExpanded ? 'Sembunyikan' : 'Tampilkan'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pt-1 space-y-1.5">
                      {mySiswa.length === 0 ? (
                        <p className="text-zinc-400 dark:text-zinc-500 italic text-xs p-2 text-center">
                          Belum ada siswa yang ditugaskan ke guru ini.
                        </p>
                      ) : (
                        mySiswa.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200/40 dark:border-white/5"
                          >
                            <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-xs">{s.nama}</span>
                            <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
                              {getJenjangLabel(s.jenjang, s.kelas, s.status)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Guru & Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-1 rounded-2xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" /> Tambah Guru & Buat Akun (Pusat)
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!createdInfo ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Nama Guru & Gelar *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="mis. Farhan Ramadhan, S.Pd"
                      value={namaInput}
                      onChange={(e) => setNamaInput(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                        <span>No. Pegawai (NIP)</span>
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">Auto</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={noPegawaiInput}
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Tanggal Lahir (Pass) *
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalLahirInput}
                        onChange={(e) => setTanggalLahirInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Alamat Lengkap Tempat Tinggal *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="mis. Jl. Kebon Jeruk No. 45, Jakarta Barat"
                      value={alamatInput}
                      onChange={(e) => setAlamatInput(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        No. WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="08123456789"
                        value={noTelpInput}
                        onChange={(e) => setNoTelpInput(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Jenjang Kategori *
                      </label>
                      <select
                        value={jenjangInput}
                        onChange={(e) => setJenjangInput(e.target.value as Jenjang)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                      >
                        <option value="TK">TK</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA_SMK">SMA / SMK</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Peran Hak Akses *
                    </label>
                    <select
                      value={accountRoleInput}
                      onChange={(e) => setAccountRoleInput(e.target.value as 'guru' | 'cabang')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-indigo-600 dark:text-indigo-400"
                    >
                      <option value="guru">🎓 Guru Biasa</option>
                      <option value="cabang">🏢 Pimpinan Cabang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Penugasan Lokasi Cabang Mengajar:
                    </label>
                    <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-white/10">
                      {cabangList.map((c) => (
                        <label key={c.id} className="flex items-center gap-2.5 text-xs cursor-pointer text-zinc-800 dark:text-zinc-200 font-medium">
                          <input
                            type="checkbox"
                            checked={selectedCabangIds.includes(c.id)}
                            onChange={() => toggleCabangSelect(c.id)}
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                          <span>{c.nama}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Simpan & Buat Akun
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Check className="w-4 h-4" /> Guru & Akun Login Berhasil Dibuat!
                    </div>
                    <p className="text-xs opacity-90">Gunakan NIP & Tanggal Lahir untuk masuk ke sistem:</p>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-white/10 text-xs font-mono space-y-1 text-zinc-800 dark:text-zinc-200">
                      <p>Nama Guru: <span className="font-bold text-zinc-900 dark:text-white">{createdInfo.nama}</span></p>
                      <p>No. Pegawai (NIP Login): <span className="text-indigo-600 dark:text-indigo-400 font-bold">{createdInfo.nip}</span></p>
                      <p>Password (Tgl Lahir): <span className="text-amber-600 dark:text-amber-400 font-bold">{createdInfo.pass}</span></p>
                      <p>Hak Akses: <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">{createdInfo.role === 'cabang' ? '🏢 Pimpinan Cabang' : '🎓 Guru Biasa'}</span></p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
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

      {/* Role Promotion Modal (Pimpinan Pusat Only) */}
      {selectedGuruForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-1 rounded-2xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl max-w-md w-full">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> Ubah Peran Guru
                </h3>
                <button
                  onClick={() => setSelectedGuruForRole(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRoleChange} className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-1">
                  <p className="font-bold text-zinc-900 dark:text-white text-xs">{selectedGuruForRole.nama}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {selectedGuruForRole.noPegawai || 'NIP-1001'} • {selectedGuruForRole.email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Pilih Peran Baru:
                  </label>
                  <div className="space-y-2.5">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetRole === 'guru'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200'
                        : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      <input
                        type="radio"
                        name="targetRole"
                        value="guru"
                        checked={targetRole === 'guru'}
                        onChange={() => setTargetRole('guru')}
                        className="mt-0.5 text-indigo-600 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-xs block">🎓 Guru Biasa</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Memiliki akses jadwal mengajar dan melihat daftar siswa yang diajar saja.
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetRole === 'cabang'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      <input
                        type="radio"
                        name="targetRole"
                        value="cabang"
                        checked={targetRole === 'cabang'}
                        onChange={() => setTargetRole('cabang')}
                        className="mt-0.5 text-amber-600 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-xs block">🏢 Pimpinan Cabang</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Memiliki akses penuh manajemen pendaftaran, siswa, keuangan & jadwal di cabang.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {targetRole === 'cabang' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Lokasi Cabang yang Dipimpin *
                    </label>
                    <select
                      value={targetCabangId}
                      onChange={(e) => setTargetCabangId(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                    >
                      {cabangList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama} ({c.alamat})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedGuruForRole(null)}
                    className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Simpan Peran
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Guru Modal (Pusat) */}
      {detailModalGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-1 rounded-2xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl max-w-md w-full">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-500" /> Detail Informasi Guru
                </h3>
                <button
                  onClick={() => setDetailModalGuru(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base shrink-0 border border-indigo-500/20">
                    {detailModalGuru.nama.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{detailModalGuru.nama}</h4>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs flex items-center gap-1 mt-0.5">
                      <IdCard className="w-3.5 h-3.5" /> {detailModalGuru.noPegawai || 'NIP-1001'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1 uppercase font-mono">Jenjang Mengajar</span>
                    <Badge variant="purple">{getJenjangLabel(detailModalGuru.jenjang)}</Badge>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1 uppercase font-mono">Password (Tgl Lahir)</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {detailModalGuru.tanggalLahir || '1995-01-01'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1 uppercase font-mono">No. WhatsApp / Telepon</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {detailModalGuru.noTelp}
                      </span>
                      <a
                        href={`https://wa.me/${detailModalGuru.noTelp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        Hubungi WA &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1 uppercase font-mono">Alamat Rumah</span>
                    <span className="text-zinc-700 dark:text-zinc-300 text-xs flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      {detailModalGuru.alamat || 'Alamat belum diisi.'}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-0.5 uppercase font-mono">Kapasitas Slot Siswa</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {countTeacherAssignedStudents(detailModalGuru.id, siswaList)} / 6 Siswa Terisi
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                      Cabang: {cabangList.filter((c) => detailModalGuru.cabangIds.includes(c.id)).map((c) => c.nama).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalGuru(null)}
                  className="px-5 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

