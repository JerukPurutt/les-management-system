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
  ) => { newUser: User; newGuru: Guru };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput.trim() || !noTelpInput.trim()) return;

    const res = onAddGuruPusat(
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
    <div className="space-y-4 text-xs">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Daftar Guru & Akun Pengajar (Pusat)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Kelola akun guru, ubah peran Guru Biasa ↔ Pimpinan Cabang, & alokasi mengajar
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Guru & Buat Akun</span>
        </button>
      </div>

      {/* Guru Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                    {guru.nama}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                      <IdCard className="w-3 h-3" /> {nip}
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
                    className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-200 dark:border-amber-800/80 transition-colors cursor-pointer"
                    title="Lihat Detail Profil Guru"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenRoleModal(guru)}
                    className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
                    title="Ubah Peran (Guru Biasa / Pimpinan Cabang)"
                  >
                    <UserCog className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Slot Counter Indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Slot Siswa Diajar:
                  </span>
                  <span className={`font-mono font-bold ${assignedCount >= 6 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {assignedCount} / 6 {assignedCount >= 6 ? '(Penuh)' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800">
                  <div
                    className={`h-full transition-all duration-300 ${
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
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-[11px] overflow-hidden">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400 shrink-0" />
                <span className="text-slate-500 dark:text-zinc-400 text-[10px]">Cabang:</span>
                <div className="flex flex-wrap gap-1">
                  {assignedCabangNames.map((cName, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-medium"
                    >
                      {cName}
                    </span>
                  ))}
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
                            <span className="text-slate-800 dark:text-zinc-200 font-medium text-[11px]">{s.nama}</span>
                            <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10px]">
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

      {/* Add Guru & Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Tambah Guru & Buat Akun (Pusat)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!createdInfo ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Nama Guru & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Farhan Ramadhan, S.Pd"
                    value={namaInput}
                    onChange={(e) => setNamaInput(e.target.value)}
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
                      value={noPegawaiInput}
                      className="w-full bg-slate-200/60 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-zinc-300 font-mono font-bold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Tanggal Lahir (Password) *
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalLahirInput}
                      onChange={(e) => setTanggalLahirInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Alamat Lengkap Tempat Tinggal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Jl. Kebon Jeruk No. 45, Jakarta Barat"
                    value={alamatInput}
                    onChange={(e) => setAlamatInput(e.target.value)}
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
                      placeholder="08123456789"
                      value={noTelpInput}
                      onChange={(e) => setNoTelpInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Jenjang Kategori *
                    </label>
                    <select
                      value={jenjangInput}
                      onChange={(e) => setJenjangInput(e.target.value as Jenjang)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="TK">TK</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA_SMK">SMA / SMK</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Peran Hak Akses *
                  </label>
                  <select
                    value={accountRoleInput}
                    onChange={(e) => setAccountRoleInput(e.target.value as 'guru' | 'cabang')}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    <option value="guru">🎓 Guru Biasa</option>
                    <option value="cabang">🏢 Pimpinan Cabang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Penugasan Lokasi Cabang Mengajar:
                  </label>
                  <div className="space-y-1 bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                    {cabangList.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-[11px] cursor-pointer text-slate-800 dark:text-zinc-200">
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

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-2xs transition-colors"
                  >
                    Simpan & Buat Akun
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Check className="w-4 h-4" /> Guru & Akun Login Berhasil Dibuat!
                  </div>
                  <p className="text-[11px]">Gunakan NIP & Tanggal Lahir untuk masuk ke sistem:</p>
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded border border-slate-200 dark:border-zinc-800 text-[11px] font-mono space-y-1 text-slate-800 dark:text-zinc-200">
                    <p>Nama Guru: <span className="font-bold text-slate-900 dark:text-zinc-100">{createdInfo.nama}</span></p>
                    <p>No. Pegawai (NIP Login): <span className="text-indigo-600 dark:text-indigo-400 font-bold">{createdInfo.nip}</span></p>
                    <p>Password (Tgl Lahir): <span className="text-amber-600 dark:text-amber-400 font-bold">{createdInfo.pass}</span></p>
                    <p>Hak Akses: <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">{createdInfo.role === 'cabang' ? '🏢 Pimpinan Cabang' : '🎓 Guru Biasa'}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-1.5 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Tutup & Kembali
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Promotion Modal (Pimpinan Pusat Only) */}
      {selectedGuruForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Ubah Peran Guru
              </h3>
              <button
                onClick={() => setSelectedGuruForRole(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleChange} className="space-y-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{selectedGuruForRole.nama}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  {selectedGuruForRole.noPegawai || 'NIP-1001'} • {selectedGuruForRole.email}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                  Pilih Peran Baru:
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    targetRole === 'guru'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-700 dark:text-zinc-300'
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
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        Memiliki akses jadwal mengajar dan melihat daftar siswa yang diajar saja.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    targetRole === 'cabang'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-700 dark:text-zinc-300'
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
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        Memiliki akses penuh manajemen pendaftaran, siswa, keuangan & jadwal di cabang.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {targetRole === 'cabang' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Lokasi Cabang yang Dipimpin *
                  </label>
                  <select
                    value={targetCabangId}
                    onChange={(e) => setTargetCabangId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {cabangList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} ({c.alamat})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedGuruForRole(null)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-2xs transition-colors"
                >
                  Simpan Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Detail Guru Modal (Pusat) */}
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
                    <IdCard className="w-3.5 h-3.5" /> {detailModalGuru.noPegawai || 'NIP-1001'}
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
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    Cabang: {cabangList.filter((c) => detailModalGuru.cabangIds.includes(c.id)).map((c) => c.nama).join(', ')}
                  </span>
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

