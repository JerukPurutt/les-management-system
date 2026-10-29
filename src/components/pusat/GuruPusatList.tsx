import React, { useState } from 'react';
import { Guru, Cabang, Siswa, User, Jenjang } from '../../types';
import {
  Building2,
  GraduationCap,
  Plus,
  UserCheck,
  ShieldCheck,
  Check,
  X,
  UserCog,
  IdCard,
  Eye,
  ChevronDown,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
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

const INPUT =
  'w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-zinc-500 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-400';

const LABEL = 'mb-1.5 block text-[11px] font-medium text-zinc-600 dark:text-zinc-300';

const MODAL =
  'reveal max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto rounded-[1.75rem] border border-white/10 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.4)] dark:bg-[#0D0E10]';

const modalButton =
  'grid h-8 w-8 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-black/[0.04] hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200';

const iconButton =
  'grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-black/[0.07] text-zinc-500 transition-all duration-300 active:scale-95 dark:border-white/10 dark:text-zinc-400';

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

  const [selectedGuruForRole, setSelectedGuruForRole] = useState<Guru | null>(null);
  const [targetRole, setTargetRole] = useState<'guru' | 'cabang'>('cabang');
  const [targetCabangId, setTargetCabangId] = useState<string>('cab-1');

  const [detailModalGuru, setDetailModalGuru] = useState<Guru | null>(null);
  const [expandedGuruIds, setExpandedGuruIds] = useState<string[]>([]);

  const findAccount = (guru: Guru) =>
    users.find((u) => u.teacherId === guru.id || u.email.toLowerCase() === guru.email.toLowerCase());

  const leaderCount = guruList.filter((g) => findAccount(g)?.role === 'cabang').length;
  const totalAssigned = guruList.reduce(
    (sum, g) => sum + countTeacherAssignedStudents(g.id, siswaList),
    0
  );
  const totalCapacity = guruList.length * 6;

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

    const nipNums = guruList
      .map((g) => {
        const m = (g.noPegawai || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);
    const maxNip = nipNums.length > 0 ? Math.max(...nipNums) : 3000;

    setNoPegawaiInput(`NIP-${maxNip + 1}`);
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
    const matchedUser = findAccount(guru);
    setSelectedGuruForRole(guru);
    setTargetRole(matchedUser?.role === 'cabang' ? 'cabang' : 'guru');
    setTargetCabangId(matchedUser?.cabangId || guru.cabangIds[0] || 'cab-1');
  };

  const handleSaveRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuruForRole) return;
    onPromoteGuruRole(selectedGuruForRole.id, targetRole, targetCabangId);
    setSelectedGuruForRole(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Masthead */}
      <header className="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
            Pusat · Academic Staff
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-5xl">
            Daftar <span className="text-sky-700 dark:text-sky-400">Guru</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Kelola akun pengajar, atur peran guru dan pimpinan cabang, serta pantau alokasi
            siswa di seluruh jaringan.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="group inline-flex cursor-pointer items-center gap-3 self-start rounded-full bg-zinc-950 py-2 pl-5 pr-2 text-xs font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 lg:self-auto"
        >
          <span>Tambah Guru</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90 dark:bg-zinc-950/10">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </button>
      </header>

      {/* Roster summary */}
      <div className="reveal grid grid-cols-3 divide-x divide-black/[0.06] overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-white/70 dark:divide-white/[0.06] dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
            {guruList.length}
          </div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
            Total guru
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {leaderCount}
          </div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
            Pimpinan cabang
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-semibold tabular-nums text-sky-700 dark:text-sky-400">
            {totalAssigned}
            <span className="text-sm font-normal text-zinc-400"> / {totalCapacity}</span>
          </div>
          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:text-[10px]">
            Slot terisi
          </div>
        </div>
      </div>

      {/* Staff roster */}
      <section className="reveal overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-white/90 dark:border-white/[0.08] dark:bg-white/[0.035]">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06] sm:px-6">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              Roster Pengajar
            </h2>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Kapasitas ideal 6 siswa per guru · klik baris untuk melihat siswa
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
            {guruList.length} akun
          </span>
        </div>

        {guruList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-black/[0.07] bg-black/[0.02] text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
              <UserCheck className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Belum ada guru terdaftar
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Tambah guru pertama untuk mulai mengelola pengajar.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="cursor-pointer rounded-full border border-black/[0.08] px-4 py-2 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/[0.05]"
            >
              Tambah Guru
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
            {guruList.map((guru) => {
              const assignedCount = countTeacherAssignedStudents(guru.id, siswaList);
              const assignedCabangNames = cabangList
                .filter((c) => guru.cabangIds.includes(c.id))
                .map((c) => c.nama);
              const mySiswa = siswaList.filter(
                (s) => s.guruId === guru.id && !s.deletedAt && s.status === 'aktif'
              );

              const matchedUser = findAccount(guru);
              const isBranchLeader = matchedUser?.role === 'cabang';
              const nip = guru.noPegawai || matchedUser?.noPegawai || 'NIP-1001';
              const isExpanded = expandedGuruIds.includes(guru.id);
              const slotRatio = Math.min(1, assignedCount / 6);

              return (
                <div key={guru.id} className="group">
                  <div className="grid grid-cols-1 gap-4 px-5 py-5 transition-colors duration-300 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_auto] md:items-center md:px-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-black/[0.07] bg-black/[0.02] font-mono text-xs font-semibold text-zinc-500 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-sky-500/20 group-hover:bg-sky-500/[0.06] group-hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:group-hover:text-sky-400">
                        {guru.nama.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-white">
                            {guru.nama}
                          </h3>
                          <Badge variant={isBranchLeader ? 'warning' : 'info'}>
                            {isBranchLeader ? 'Pimpinan Cabang' : 'Guru Biasa'}
                          </Badge>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400">
                            <IdCard className="h-3 w-3" strokeWidth={1.75} /> {nip}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          <span>{getJenjangLabel(guru.jenjang)}</span>
                          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          <span>{mySiswa.length} siswa aktif</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-medium text-zinc-500 dark:text-zinc-400">Slot siswa</span>
                        <span
                          className={`font-mono font-semibold tabular-nums ${
                            assignedCount >= 6
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {assignedCount} / 6
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                        <div
                          className={`h-full w-full origin-left rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            assignedCount >= 6
                              ? 'bg-rose-500'
                              : assignedCount >= 4
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ transform: `scaleX(${slotRatio})` }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {assignedCabangNames.length === 0 ? (
                          <span className="text-[9px] font-mono text-zinc-400">Tanpa cabang</span>
                        ) : (
                          assignedCabangNames.map((cName) => (
                            <span
                              key={cName}
                              className="rounded-full border border-black/[0.06] bg-black/[0.02] px-2 py-0.5 text-[9px] font-medium text-zinc-600 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-zinc-300"
                            >
                              {cName}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        onClick={() => setDetailModalGuru(guru)}
                        aria-label={`Lihat detail ${guru.nama}`}
                        title="Lihat Detail Profil Guru"
                        className={`${iconButton} hover:border-amber-500/25 hover:bg-amber-500/[0.06] hover:text-amber-600 dark:hover:text-amber-400`}
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>

                      <button
                        onClick={() => handleOpenRoleModal(guru)}
                        aria-label={`Ubah peran ${guru.nama}`}
                        title="Ubah Peran (Guru Biasa / Pimpinan Cabang)"
                        className={`${iconButton} hover:border-sky-500/25 hover:bg-sky-500/[0.06] hover:text-sky-700 dark:hover:text-sky-400`}
                      >
                        <UserCog className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>

                      <button
                        onClick={() => toggleExpandGuru(guru.id)}
                        aria-label={isExpanded ? `Sembunyikan siswa ${guru.nama}` : `Tampilkan siswa ${guru.nama}`}
                        aria-expanded={isExpanded}
                        className={`${iconButton} hover:border-zinc-400/30 hover:bg-black/[0.03] hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-white`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-black/[0.05] bg-black/[0.015] px-5 py-4 dark:border-white/[0.05] dark:bg-white/[0.02] sm:px-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400">
                          Siswa diajar
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {mySiswa.length} siswa
                        </span>
                      </div>

                      {mySiswa.length === 0 ? (
                        <p className="py-3 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
                          Belum ada siswa yang ditugaskan ke guru ini.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {mySiswa.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.05] bg-white/70 px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.03]"
                            >
                              <span className="truncate text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                                {s.nama}
                              </span>
                              <span className="shrink-0 font-mono text-[9px] text-zinc-500 dark:text-zinc-400">
                                {getJenjangLabel(s.jenjang, s.kelas, s.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Guru & Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-4">
          <div role="dialog" aria-modal="true" aria-label="Tambah guru" className={`${MODAL} max-w-lg`}>
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-sky-500/15 bg-sky-500/[0.06] text-sky-600 dark:text-sky-400">
                  <UserCheck className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Tambah Guru
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Akun login dibuat otomatis
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} aria-label="Tutup" className={modalButton}>
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {!createdInfo ? (
              <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
                <div>
                  <label className={LABEL}>Nama Guru & Gelar</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="mis. Farhan Ramadhan, S.Pd"
                    value={namaInput}
                    onChange={(e) => setNamaInput(e.target.value)}
                    className={INPUT}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`${LABEL} flex items-center justify-between`}>
                      <span>No. Pegawai (NIP)</span>
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-sky-700 dark:text-sky-400">
                        Auto
                      </span>
                    </label>
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={noPegawaiInput}
                      className={`${INPUT} cursor-not-allowed bg-black/[0.02] font-mono text-zinc-600 dark:bg-white/[0.03] dark:text-zinc-300`}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Tanggal Lahir (Password)</label>
                    <input
                      type="date"
                      required
                      value={tanggalLahirInput}
                      onChange={(e) => setTanggalLahirInput(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Alamat Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Jl. Kebon Jeruk No. 45, Jakarta Barat"
                    value={alamatInput}
                    onChange={(e) => setAlamatInput(e.target.value)}
                    className={INPUT}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL}>No. WhatsApp</label>
                    <input
                      type="text"
                      required
                      placeholder="08123456789"
                      value={noTelpInput}
                      onChange={(e) => setNoTelpInput(e.target.value)}
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Jenjang Kategori</label>
                    <select
                      value={jenjangInput}
                      onChange={(e) => setJenjangInput(e.target.value as Jenjang)}
                      className={INPUT}
                    >
                      <option value="TK">TK</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA_SMK">SMA / SMK</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Peran Hak Akses</label>
                  <select
                    value={accountRoleInput}
                    onChange={(e) => setAccountRoleInput(e.target.value as 'guru' | 'cabang')}
                    className={INPUT}
                  >
                    <option value="guru">Guru Biasa</option>
                    <option value="cabang">Pimpinan Cabang</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL}>Penugasan Cabang</label>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {cabangList.map((c) => {
                      const selected = selectedCabangIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-[11px] font-medium transition-all duration-300 ${
                            selected
                              ? 'border-sky-500/30 bg-sky-500/[0.06] text-sky-800 dark:text-sky-300'
                              : 'border-black/[0.07] text-zinc-600 hover:bg-black/[0.02] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="truncate">{c.nama}</span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleCabangSelect(c.id)}
                            className="h-3.5 w-3.5 rounded border-zinc-300 text-sky-600 focus:ring-sky-500/30 dark:border-zinc-600"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.06] sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer rounded-full px-4 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[0.03] hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                  >
                    Simpan & Buat Akun
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
                      Guru & akun login berhasil dibuat
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-emerald-700/80 dark:text-emerald-400/80">
                      Gunakan NIP dan tanggal lahir untuk masuk ke sistem.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-xl border border-black/[0.06] bg-black/[0.02] p-3.5 font-mono text-[11px] text-zinc-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-300">
                  <p>
                    Nama:{' '}
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {createdInfo.nama}
                    </span>
                  </p>
                  <p>
                    NIP Login:{' '}
                    <span className="font-semibold text-sky-700 dark:text-sky-400">
                      {createdInfo.nip}
                    </span>
                  </p>
                  <p>
                    Password:{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {createdInfo.pass}
                    </span>
                  </p>
                  <p>
                    Hak akses:{' '}
                    <span className="font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                      {createdInfo.role === 'cabang' ? 'Pimpinan Cabang' : 'Guru Biasa'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full cursor-pointer rounded-full bg-zinc-950 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Promotion Modal */}
      {selectedGuruForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-4">
          <div role="dialog" aria-modal="true" aria-label="Ubah peran guru" className={`${MODAL} max-w-md`}>
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-500/15 bg-amber-500/[0.06] text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Ubah Peran
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Atur hak akses pengajar
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedGuruForRole(null)} aria-label="Tutup" className={modalButton}>
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSaveRoleChange} className="space-y-4 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 font-mono text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
                  {selectedGuruForRole.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                    {selectedGuruForRole.nama}
                  </p>
                  <p className="truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                    {selectedGuruForRole.noPegawai || 'NIP-1001'} · {selectedGuruForRole.email}
                  </p>
                </div>
              </div>

              <div>
                <label className={LABEL}>Pilih Peran Baru</label>
                <div className="space-y-2">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                      targetRole === 'guru'
                        ? 'border-sky-500/30 bg-sky-500/[0.06]'
                        : 'border-black/[0.07] hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetRole"
                      value="guru"
                      checked={targetRole === 'guru'}
                      onChange={() => setTargetRole('guru')}
                      className="mt-1 h-3.5 w-3.5 text-sky-600 focus:ring-sky-500/30"
                    />
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                        <GraduationCap className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        Guru Biasa
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                        Akses jadwal mengajar dan daftar siswa yang diajar.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                      targetRole === 'cabang'
                        ? 'border-amber-500/30 bg-amber-500/[0.06]'
                        : 'border-black/[0.07] hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetRole"
                      value="cabang"
                      checked={targetRole === 'cabang'}
                      onChange={() => setTargetRole('cabang')}
                      className="mt-1 h-3.5 w-3.5 text-amber-600 focus:ring-amber-500/30"
                    />
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white">
                        <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Pimpinan Cabang
                      </span>
                      <span className="mt-1 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                        Akses penuh manajemen pendaftaran, siswa, keuangan, dan jadwal cabang.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {targetRole === 'cabang' && (
                <div>
                  <label className={LABEL}>Lokasi Cabang yang Dipimpin</label>
                  <select
                    value={targetCabangId}
                    onChange={(e) => setTargetCabangId(e.target.value)}
                    className={INPUT}
                  >
                    {cabangList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} ({c.alamat})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.06] sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGuruForRole(null)}
                  className="cursor-pointer rounded-full px-4 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-black/[0.03] hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  Simpan Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Guru Modal */}
      {detailModalGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-4">
          <div role="dialog" aria-modal="true" aria-label="Detail guru" className={`${MODAL} max-w-md`}>
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.06] sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-500/15 bg-amber-500/[0.06] text-amber-600 dark:text-amber-400">
                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Profil Guru
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Informasi akun dan penugasan
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailModalGuru(null)} aria-label="Tutup" className={modalButton}>
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 font-mono text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                  {detailModalGuru.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {detailModalGuru.nama}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-sky-700 dark:text-sky-400">
                      <IdCard className="h-3 w-3" strokeWidth={1.75} />
                      {detailModalGuru.noPegawai || 'NIP-1001'}
                    </span>
                    <Badge
                      variant={
                        findAccount(detailModalGuru)?.role === 'cabang' ? 'warning' : 'info'
                      }
                    >
                      {findAccount(detailModalGuru)?.role === 'cabang'
                        ? 'Pimpinan Cabang'
                        : 'Guru Biasa'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06] dark:divide-white/[0.05] dark:border-white/[0.06]">
                <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    Jenjang
                  </span>
                  <Badge variant="neutral">{getJenjangLabel(detailModalGuru.jenjang)}</Badge>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    Tanggal lahir
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
                    {detailModalGuru.tanggalLahir || '1995-01-01'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    WhatsApp
                  </span>
                  <a
                    href={`https://wa.me/${detailModalGuru.noTelp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {detailModalGuru.noTelp}
                  </a>
                </div>

                <div className="flex items-start justify-between gap-4 px-3.5 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    Alamat
                  </span>
                  <span className="flex max-w-[65%] items-start gap-1.5 text-right text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" strokeWidth={1.75} />
                    {detailModalGuru.alamat || 'Alamat belum diisi.'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    Slot siswa
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                    {countTeacherAssignedStudents(detailModalGuru.id, siswaList)} / 6 terisi
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 px-3.5 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    Cabang
                  </span>
                  <span className="max-w-[65%] text-right text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {cabangList
                      .filter((c) => detailModalGuru.cabangIds.includes(c.id))
                      .map((c) => c.nama)
                      .join(', ') || 'Belum ditugaskan'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setDetailModalGuru(null)}
                  className="cursor-pointer rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
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
