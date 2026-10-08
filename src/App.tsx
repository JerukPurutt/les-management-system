import React, { useState, useEffect } from 'react';
import {
  Role,
  Theme,
  Cabang,
  User,
  Guru,
  Siswa,
  TarifSPP,
  PembayaranSPP,
  Transaksi,
  Jadwal,
  AuditLog,
  StudentStatus,
  Jenjang,
} from './types';
import { ParsedSiswaRow, ParsedGuruRow } from './utils/excelHelpers';
import { api } from './utils/api';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPusat } from './components/pusat/DashboardPusat';
import { CabangManagement } from './components/pusat/CabangManagement';
import { GuruPusatList } from './components/pusat/GuruPusatList';
import { PengaturanTarif } from './components/pusat/PengaturanTarif';
import { AuditLogView } from './components/pusat/AuditLogView';
import { DashboardCabang } from './components/cabang/DashboardCabang';
import { PendaftaranSiswa } from './components/cabang/PendaftaranSiswa';
import { ManajemenSiswa } from './components/cabang/ManajemenSiswa';
import { ManajemenGuruJadwal } from './components/cabang/ManajemenGuruJadwal';
import { KeuanganModule } from './components/cabang/KeuanganModule';
import { JadwalGuruView } from './components/guru/JadwalGuruView';
import { CronSimulatorModal } from './components/cron/CronSimulatorModal';
import {
  countTeacherAssignedStudents,
  isTeacherEligibleForStudent,
  checkScheduleConflict,
  calculateSPPRate,
  generateReceiptNumber,
} from './utils/helpers';

export function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Theme & Collapse State
  const [theme, setTheme] = useState<Theme>('light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // User Accounts & Role State (diisi dari API saat login)
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: '', nama: '', email: '', role: 'cabang', isActive: false, createdAt: '',
  });
  const [currentRole, setCurrentRole] = useState<Role>('cabang');
  const [dataReady, setDataReady] = useState<boolean>(false);

  // Selection States
  const [selectedCabangId, setSelectedCabangId] = useState<string>('cab-1');
  const [selectedGuruId, setSelectedGuruId] = useState<string>('guru-1');
  const [activeTab, setActiveTab] = useState<string>('dashboard-cabang');
  const [isCronModalOpen, setIsCronModalOpen] = useState(false);

  // Core Data Lists (diisi dari API saat login)
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [tarifList, setTarifList] = useState<TarifSPP[]>([]);
  const [biayaPendaftaranBase, setBiayaPendaftaranBase] = useState(100000);
  const [sppList, setSppList] = useState<PembayaranSPP[]>([]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-09-30T10:00:00Z',
      userId: 'usr-2',
      userNama: 'Ibu Ratna (Cabang Jaksel)',
      action: 'LOGIN',
      details: 'Pengguna berhasil masuk ke sistem.',
    },
  ]);

  // Sync dark/light class on html root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Active Cabang & Guru Objects
  const currentCabang = cabangList.find((c) => c.id === selectedCabangId) || cabangList[0];
  const currentGuru = guruList.find((g) => g.id === selectedGuruId) || guruList[0];

  const logAudit = (action: string, details: string, u?: User) => {
    const who = u || currentUser;
    if (!who.id) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: who.id,
      userNama: `${who.nama}`,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Muat semua data dari API setelah login
  const reloadAll = async (user: User) => {
    const [cabang, guru, siswa, spp, trx, tarif, jadwal] = await Promise.all([
      api.cabang.list(),
      api.guru.list(),
      api.siswa.list(),
      api.spp.list(),
      api.transaksi.list(),
      api.tarif.list(),
      api.jadwal.list(),
    ]);
    setCabangList(cabang);
    setGuruList(guru);
    setSiswaList(siswa);
    setSppList(spp);
    setTransaksiList(trx);
    setTarifList(tarif);
    setJadwalList(jadwal);
    try {
      const biaya = await api.setting.get('biaya_pendaftaran');
      setBiayaPendaftaranBase(Number(biaya.value) || 100000);
    } catch { /* default lokal */ }
    if (user.role === 'pusat') {
      try {
        setUsers(await api.listUsers());
      } catch { setUsers([user]); }
    } else {
      setUsers([user]);
    }
    if (user.cabangId) setSelectedCabangId(user.cabangId);
    else if (cabang[0]) setSelectedCabangId(cabang[0].id);
    if (user.teacherId) setSelectedGuruId(user.teacherId);
    else if (guru[0]) setSelectedGuruId(guru[0].id);
    setDataReady(true);
  };

  const refresh = () => reloadAll(currentUser);

  // Bungkus mutasi API: gagal -> alert + batal (tanpa ubah state lokal)
  const save = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e: any) {
      alert(`Gagal simpan ke server: ${e?.message || e}`);
      return null;
    }
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'pusat') {
      setActiveTab('dashboard-pusat');
    } else if (user.role === 'cabang') {
      setActiveTab('dashboard-cabang');
    } else if (user.role === 'guru') {
      setActiveTab('jadwal-guru');
    }
    await reloadAll(user);
    setIsAuthenticated(true);
    logAudit('LOGIN', `Pengguna ${user.nama} berhasil masuk ke sistem.`, user);
  };

  const handleLogout = () => {
    logAudit('LOGOUT', `Pengguna ${currentUser.nama} keluar dari sistem.`);
    api.logout();
    setIsAuthenticated(false);
    setDataReady(false);
  };

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    if (role === 'pusat') setActiveTab('dashboard-pusat');
    else if (role === 'cabang') setActiveTab('dashboard-cabang');
    else setActiveTab('jadwal-guru');
  };

  // PUSAT HANDLERS
  const handleAddCabang = async (nama: string, alamat: string) => {
    const r = await save(() => api.cabang.create(nama, alamat));
    if (!r) return { newCabang: null as any, newAccount: null as any };
    await refresh();
    const newCab: Cabang = { id: r.id, nama, alamat, status: 'aktif', createdAt: new Date().toISOString() };
    const newAcc = { id: `usr-${Date.now()}`, nama: `Pimpinan ${nama}`, email: r.loginEmail, role: 'cabang' as Role, cabangId: r.id, isActive: true, createdAt: new Date().toISOString() } as User;
    logAudit('TAMBAH_CABANG', `Membuat ${nama} & akun leader ${r.loginEmail}`);
    return { newCabang: newCab, newAccount: newAcc };
  };

  const handleAddGuruPusat = async (
    nama: string,
    noTelp: string,
    noPegawai: string,
    tanggalLahir: string,
    alamat: string,
    jenjang: Jenjang,
    cabangIds: string[],
    accountRole: 'guru' | 'cabang',
    assignedCabangId?: string
  ) => {
    const r = await save(() => api.guru.create({
      nama, noTelp, noPegawai, tanggalLahir, alamat, jenjang,
      cabangIds: cabangIds.length > 0 ? cabangIds : [selectedCabangId],
    }));
    if (!r) return { newUser: null as any, newGuru: null as any };
    if (accountRole === 'cabang') {
      const us = await api.listUsers().catch(() => [] as User[]);
      const acc = us.find((x) => x.teacherId === r.id);
      if (acc) await save(() => api.setUserRole(acc.id, 'cabang', assignedCabangId || cabangIds[0] || selectedCabangId));
    }
    await refresh();
    logAudit('TAMBAH_GURU_PUSAT', `Pusat menambah guru NIP ${noPegawai} (${nama}) & akun ${accountRole.toUpperCase()}`);

    // info modal saja (data asli sudah reload dari server)
    return {
      newUser: { id: '', nama, email: r.email, noPegawai, tanggalLahir, role: accountRole, isActive: true, createdAt: '' } as User,
      newGuru: { id: r.id, userId: '', nama, email: r.email, noTelp, jenjang, cabangIds, isActive: true } as Guru,
    };
  };

  const handlePromoteGuruRole = async (
    guruId: string,
    newRole: 'guru' | 'cabang',
    assignedCabangId?: string
  ) => {
    const targetGuru = guruList.find((g) => g.id === guruId);
    if (!targetGuru) return;
    const matched = users.find(
      (u) => u.teacherId === guruId || u.email.toLowerCase() === targetGuru.email.toLowerCase()
    );
    if (!matched) return;
    const ok = await save(() => api.setUserRole(matched.id, newRole, assignedCabangId || targetGuru.cabangIds[0]));
    if (!ok) return;
    await refresh();

    logAudit(
      'UBAH_PERAN_GURU',
      `Pimpinan Pusat mengubah peran guru ${targetGuru.nama} menjadi ${newRole === 'cabang' ? 'Pimpinan Cabang' : 'Guru Biasa'}`
    );
  };

  const handleUpdateCabang = async (
    id: string,
    nama: string,
    alamat: string,
    status: 'aktif' | 'nonaktif'
  ) => {
    const ok = await save(() => api.cabang.update(id, { nama, alamat, status }));
    if (!ok) return;
    await refresh();
    logAudit('UPDATE_CABANG', `Mengubah data cabang ${nama}`);
  };

  const handleDeleteCabang = async (id: string) => {
    const targetCabang = cabangList.find((c) => c.id === id);
    const ok = await save(() => api.cabang.remove(id));
    if (!ok) return;
    await refresh();
    logAudit('HAPUS_CABANG', `Menghapus cabang ${targetCabang?.nama || id}`);
  };

  const handleUpdateTarif = async (id: string, nominal: number) => {
    const ok = await save(() => api.tarif.update(id, nominal));
    if (!ok) return;
    await refresh();
  };

  const handleUpdateBiayaPendaftaran = async (v: number) => {
    await save(() => api.setting.set('biaya_pendaftaran', String(v)));
    setBiayaPendaftaranBase(v);
  };

  // CABANG HANDLERS
  const handleRegisterStudent = async (formData: {
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
  }) => {
    const r = await save(() => api.siswa.create({ ...formData, cabangId: currentCabang.id }));
    if (!r) return;
    await refresh();

    logAudit('DAFTAR_SISWA', `Mendaftarkan siswa baru ${formData.nama} di ${currentCabang.nama}`);
  };

  const handleBatchRegisterStudents = async (students: ParsedSiswaRow[]) => {
    const ok = await save(async () => {
      for (const s of students) await api.siswa.create({ ...s, cabangId: currentCabang.id });
    });
    if (!ok) return;
    await refresh();

    logAudit('IMPORT_EXCEL_SISWA', `Berhasil mengimpor ${students.length} siswa baru via Excel di ${currentCabang.nama}`);
  };

  const handleUpdateSiswaStatus = async (siswaId: string, status: StudentStatus) => {
    const ok = await save(() => api.siswa.setStatus(siswaId, status));
    if (!ok) return;
    await refresh();

    logAudit('UPDATE_STATUS_SISWA', `Mengubah status siswa ID ${siswaId} menjadi ${status}`);
  };

  const handleAssignGuru = async (siswaId: string, guruId: string | null) => {
    try {
      await api.siswa.assign(siswaId, guruId);
    } catch (e: any) {
      return { success: false, message: e?.message || 'Penugasan gagal' };
    }
    await refresh();

    logAudit('TUGASKAN_GURU', `Menugaskan guru ${guruId} ke siswa ${siswaId}`);
    return { success: true };
  };

  const handleBatchAssignGuru = async (siswaIds: string[], guruId: string | null) => {
    try {
      for (const id of siswaIds) await api.siswa.assign(id, guruId);
    } catch (e: any) {
      return { success: false, message: e?.message || 'Penugasan massal gagal' };
    }
    await refresh();

    const teacherName = guruList.find((g) => g.id === guruId)?.nama || 'Kosong';
    logAudit('BATCH_TUGASKAN_GURU', `Menugaskan ${siswaIds.length} siswa sekaligus ke guru ${teacherName}`);
    return { success: true, assignedCount: siswaIds.length };
  };

  const handleAutoAssignStudents = async () => {
    let r;
    try {
      r = await api.siswa.autoAssign(currentCabang.id);
    } catch (e: any) {
      return { assignedCount: 0, message: e?.message || 'Auto-assign gagal' };
    }
    await refresh();
    logAudit('AUTO_ASSIGN_SISWA', `Auto-assign menugaskan ${r.assignedCount} siswa di cabang ${currentCabang.nama}`);
    return {
      assignedCount: r.assignedCount,
      message: r.assignedCount > 0
        ? `Berhasil menugaskan ${r.assignedCount} siswa secara otomatis!`
        : 'Tidak ada slot guru yang tersedia atau semua siswa sudah berguru.',
    };
  };

  const handleUpdateSiswa = async (updatedSiswa: Siswa) => {
    const ok = await save(() => api.siswa.update(updatedSiswa.id, {
      nama: updatedSiswa.nama,
      tempatLahir: updatedSiswa.tempatLahir,
      tanggalLahir: updatedSiswa.tanggalLahir,
      alamat: updatedSiswa.alamat,
      namaIbu: updatedSiswa.namaIbu,
      noTelpOrtu: updatedSiswa.noTelpOrtu,
      jenjang: updatedSiswa.jenjang,
      kelas: updatedSiswa.kelas,
    }));
    if (!ok) return;
    await refresh();
    logAudit('UPDATE_SISWA', `Mengubah data siswa ${updatedSiswa.nama}`);
  };

  const handleSoftDeleteSiswa = async (siswaId: string) => {
    const ok = await save(() => api.siswa.remove(siswaId));
    if (!ok) return;
    await refresh();
    logAudit('SOFT_DELETE_SISWA', `Soft delete data siswa ID ${siswaId}`);
  };

  const handleBatchNaikKelas = async () => {
    const ok = await save(async () => {
      for (const s of siswaList) {
        if (s.status !== 'aktif' || s.deletedAt || s.cabangId !== currentCabang.id) continue;
        if (s.jenjang === 'SD' && s.kelas === 6) {
          await api.siswa.update(s.id, { jenjang: 'SMP', kelas: 7 });
        } else if (s.jenjang === 'SMP' && s.kelas === 9) {
          await api.siswa.update(s.id, { jenjang: 'SMA_SMK', kelas: 10 });
        } else if (s.jenjang === 'SMA_SMK' && s.kelas >= 12) {
          await api.siswa.setStatus(s.id, 'keluar');
        } else {
          await api.siswa.update(s.id, { kelas: s.kelas + 1 });
        }
      }
    });
    if (!ok) return;
    await refresh();

    logAudit('MASS_NAIK_KELAS', `Aksi massal Naik Kelas dilaksanakan di cabang ${currentCabang.nama}`);
  };

  const handleAddGuru = async (
    nama: string,
    noTelp: string,
    noPegawai: string,
    tanggalLahir: string,
    alamat: string,
    jenjang: Jenjang
  ) => {
    const r = await save(() => api.guru.create({
      nama, noTelp, noPegawai, tanggalLahir, alamat,
      jenjangList: [jenjang], cabangIds: [currentCabang.id],
    }));
    if (!r) return;
    // Jadwal default Senin-Jumat 18:00-20:00
    const defaultDays: Jadwal['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    await save(async () => {
      for (const hari of defaultDays) {
        await api.jadwal.create({ guruId: r.id, siswaId: null, cabangId: currentCabang.id, hari, jamMulai: '18:00', jamSelesai: '20:00' });
      }
    });
    await refresh();

    logAudit('TAMBAH_GURU_CABANG', `Pimpinan Cabang ${currentCabang.nama} membuat akun GURU BIASA (NIP ${noPegawai}): ${nama}`);
  };

  const handleUpdateGuru = async (
    guruId: string,
    nama: string,
    noTelp: string,
    tanggalLahir: string,
    alamat: string,
    jenjang: Jenjang
  ) => {
    const ok = await save(() => api.guru.update(guruId, { nama, noTelp, tanggalLahir, alamat, jenjang }));
    if (!ok) return;
    await refresh();
    logAudit('UPDATE_GURU', `Mengubah data guru ${nama}`);
  };

  const handleDeleteGuru = async (guruId: string) => {
    const targetGuru = guruList.find((g) => g.id === guruId);
    const ok = await save(() => api.guru.remove(guruId));
    if (!ok) return;
    await refresh();
    logAudit('HAPUS_GURU', `Menghapus akun guru ${targetGuru?.nama || guruId}`);
  };

  const handleBatchAddGuru = async (teachers: ParsedGuruRow[]) => {
    const ok = await save(async () => {
      for (const g of teachers) {
        await api.guru.create({
          nama: g.nama, noTelp: g.noTelp, alamat: g.alamat,
          jenjangList: g.jenjangList, cabangIds: [currentCabang.id],
        });
      }
    });
    if (!ok) return;
    await refresh();

    logAudit('IMPORT_EXCEL_GURU', `Berhasil mengimpor ${teachers.length} guru baru via Excel di ${currentCabang.nama}`);
  };

  const handleAddOrUpdateJadwal = async (jadwalData: Omit<Jadwal, 'id'>, editJadwalId?: string) => {
    const conflictResult = checkScheduleConflict(jadwalData, jadwalList, editJadwalId);
    if (conflictResult.conflict) {
      return { success: false, message: conflictResult.reason };
    }

    if (editJadwalId) {
      const ok = await save(() => api.jadwal.update(editJadwalId, {
        guruId: jadwalData.guruId,
        siswaId: jadwalData.siswaId || null,
        cabangId: jadwalData.cabangId,
        hari: jadwalData.hari,
        jamMulai: jadwalData.jamMulai,
        jamSelesai: jadwalData.jamSelesai,
      }));
      if (!ok) return { success: false, message: 'Gagal simpan ke server' };
      await refresh();
      logAudit('UPDATE_JADWAL', `Jadwal diubah: Hari ${jadwalData.hari} jam ${jadwalData.jamMulai}`);
    } else {
      const ok = await save(() => api.jadwal.create({
        guruId: jadwalData.guruId,
        siswaId: jadwalData.siswaId || null,
        cabangId: jadwalData.cabangId,
        hari: jadwalData.hari,
        jamMulai: jadwalData.jamMulai,
        jamSelesai: jadwalData.jamSelesai,
      }));
      if (!ok) return { success: false, message: 'Gagal simpan ke server' };
      await refresh();
      logAudit('TAMBAH_JADWAL', `Jadwal baru dibuat: Hari ${jadwalData.hari} jam ${jadwalData.jamMulai}`);
    }
    return { success: true };
  };

  const handleDeleteJadwal = async (jadwalId: string) => {
    const ok = await save(() => api.jadwal.remove(jadwalId));
    if (!ok) return;
    await refresh();
  };

  const handlePaySPP = async (sppId: string, namaPembayar: string, tanggalBayar: string) => {
    const targetSpp = sppList.find((s) => s.id === sppId);
    if (!targetSpp) return;

    let noKwitansi = '';
    try {
      const r = await api.spp.pay(sppId, namaPembayar, tanggalBayar);
      noKwitansi = r.noKwitansi;
    } catch (e: any) {
      alert(`Gagal simpan ke server: ${e?.message || e}`);
      return;
    }
    await refresh();

    const targetSiswa = siswaList.find((x) => x.id === targetSpp.siswaId);
    logAudit('CATAT_SPP', `Mencatat SPP Lunas untuk ${targetSiswa?.nama} (${noKwitansi})`);
  };

  const handleAddManualTransaksi = async (trx: Omit<Transaksi, 'id'>) => {
    const ok = await save(() => api.transaksi.create(trx));
    if (!ok) return;
    await refresh();
    logAudit('TRANSAKSI_MANUAL', `Mencatat ${trx.tipe} Rp${trx.nominal} (${trx.kategori})`);
  };

  const handleMarkSentWhatsApp = async (sppId: string) => {
    const ok = await save(() => api.spp.markSent(sppId));
    if (!ok) return;
    await refresh();
    logAudit('KIRIM_WA_KWITANSI', `Kwitansi SPP ID ${sppId} dikirim ke WhatsApp orang tua`);
  };

  const handleRunCron = async (bulan: number, tahun: number) => {
    let r;
    try {
      r = await api.spp.billing(bulan, tahun);
    } catch (e: any) {
      return { createdCount: 0, skippedCount: 0 };
    }
    await refresh();

    logAudit('CRON_JOB_RUN', `Simulasi Cron SPP Tgl 1 (Bulan ${bulan}/${tahun}): ${r.created} dibuat, ${r.skipped} dilewati`);
    return { createdCount: r.created, skippedCount: r.skipped };
  };

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  if (!dataReady || !currentCabang) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-500 text-sm">
        Memuat data dari server...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col transition-colors">
      {/* Header Toolbar */}
      <Header
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        theme={theme}
        setTheme={setTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        selectedCabangId={selectedCabangId}
        setSelectedCabangId={setSelectedCabangId}
        cabangList={cabangList}
        guruList={guruList}
        selectedGuruId={selectedGuruId}
        setSelectedGuruId={setSelectedGuruId}
        onOpenCronModal={() => setIsCronModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto">
          {/* PIMPINAN PUSAT VIEWS */}
          {currentRole === 'pusat' && activeTab === 'dashboard-pusat' && (
            <DashboardPusat
              cabangList={cabangList}
              siswaList={siswaList}
              guruList={guruList}
            />
          )}
          {currentRole === 'pusat' && activeTab === 'manajemen-cabang' && (
            <CabangManagement
              cabangList={cabangList}
              onAddCabang={handleAddCabang}
              onUpdateCabang={handleUpdateCabang}
              onDeleteCabang={handleDeleteCabang}
            />
          )}
          {currentRole === 'pusat' && activeTab === 'daftar-guru-pusat' && (
            <GuruPusatList
              guruList={guruList}
              cabangList={cabangList}
              siswaList={siswaList}
              users={users}
              onAddGuruPusat={handleAddGuruPusat}
              onPromoteGuruRole={handlePromoteGuruRole}
            />
          )}
          {currentRole === 'pusat' && activeTab === 'pengaturan-tarif' && (
            <PengaturanTarif
              tarifList={tarifList}
              biayaPendaftaran={biayaPendaftaranBase}
              onUpdateTarif={handleUpdateTarif}
              onUpdateBiayaPendaftaran={handleUpdateBiayaPendaftaran}
            />
          )}
          {currentRole === 'pusat' && activeTab === 'audit-log' && (
            <AuditLogView logs={auditLogs} />
          )}

          {/* PIMPINAN CABANG VIEWS */}
          {currentRole === 'cabang' && activeTab === 'dashboard-cabang' && (
            <DashboardCabang
              currentCabang={currentCabang}
              siswaList={siswaList}
              guruList={guruList}
              sppList={sppList}
              transaksiList={transaksiList}
            />
          )}
          {currentRole === 'cabang' && activeTab === 'pendaftaran-siswa' && (
            <PendaftaranSiswa
              currentCabang={currentCabang}
              biayaPendaftaranBase={biayaPendaftaranBase}
              onRegisterStudent={handleRegisterStudent}
              onSuccessNavigate={() => setActiveTab('manajemen-siswa')}
            />
          )}
          {currentRole === 'cabang' && activeTab === 'manajemen-siswa' && (
            <ManajemenSiswa
              currentCabang={currentCabang}
              siswaList={siswaList}
              guruList={guruList}
              sppList={sppList}
              onUpdateSiswaStatus={handleUpdateSiswaStatus}
              onAssignGuru={handleAssignGuru}
              onBatchAssignGuru={handleBatchAssignGuru}
              onAutoAssignStudents={handleAutoAssignStudents}
              onUpdateSiswa={handleUpdateSiswa}
              onSoftDeleteSiswa={handleSoftDeleteSiswa}
              onUpdateSiswaClass={async (id, newK) => {
                const ok = await save(() => api.siswa.update(id, { kelas: newK }));
                if (ok) await refresh();
              }}
              onBatchNaikKelas={handleBatchNaikKelas}
              onBatchRegisterStudents={handleBatchRegisterStudents}
            />
          )}
          {currentRole === 'cabang' && activeTab === 'manajemen-guru-jadwal' && (
            <ManajemenGuruJadwal
              currentCabang={currentCabang}
              cabangList={cabangList}
              guruList={guruList}
              siswaList={siswaList}
              jadwalList={jadwalList}
              onAddGuru={handleAddGuru}
              onBatchAddGuru={handleBatchAddGuru}
              onUpdateGuru={handleUpdateGuru}
              onDeleteGuru={handleDeleteGuru}
              onAddOrUpdateJadwal={handleAddOrUpdateJadwal}
              onDeleteJadwal={handleDeleteJadwal}
            />
          )}
          {currentRole === 'cabang' && activeTab === 'keuangan' && (
            <KeuanganModule
              currentCabang={currentCabang}
              siswaList={siswaList}
              guruList={guruList}
              sppList={sppList}
              transaksiList={transaksiList}
              onPaySPP={handlePaySPP}
              onAddManualTransaksi={handleAddManualTransaksi}
              onMarkSentWhatsApp={handleMarkSentWhatsApp}
            />
          )}

          {/* GURU VIEW */}
          {currentRole === 'guru' && (
            <JadwalGuruView
              currentGuru={currentGuru}
              cabangList={cabangList}
              siswaList={siswaList}
              jadwalList={jadwalList}
            />
          )}
        </main>
      </div>

      {/* Cron Simulator Modal */}
      {isCronModalOpen && (
        <CronSimulatorModal
          siswaList={siswaList}
          sppList={sppList}
          tarifList={tarifList}
          onRunCron={handleRunCron}
          onClose={() => setIsCronModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
