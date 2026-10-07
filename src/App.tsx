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
import {
  INITIAL_CABANG,
  INITIAL_USERS,
  INITIAL_GURU,
  INITIAL_SISWA,
  INITIAL_TARIF,
  INITIAL_PEMBAYARAN_SPP,
  INITIAL_TRANSAKSI,
  INITIAL_JADWAL,
} from './data/initialData';
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

  // User Accounts & Role State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Default Ibu Ratna
  const [currentRole, setCurrentRole] = useState<Role>(INITIAL_USERS[1].role);

  // Selection States
  const [selectedCabangId, setSelectedCabangId] = useState<string>('cab-1');
  const [selectedGuruId, setSelectedGuruId] = useState<string>('guru-1');
  const [activeTab, setActiveTab] = useState<string>('dashboard-cabang');
  const [isCronModalOpen, setIsCronModalOpen] = useState(false);

  // Core Data Lists
  const [cabangList, setCabangList] = useState<Cabang[]>(INITIAL_CABANG);
  const [guruList, setGuruList] = useState<Guru[]>(INITIAL_GURU);
  const [siswaList, setSiswaList] = useState<Siswa[]>(INITIAL_SISWA);
  const [tarifList, setTarifList] = useState<TarifSPP[]>(INITIAL_TARIF);
  const [biayaPendaftaranBase, setBiayaPendaftaranBase] = useState(100000);
  const [sppList, setSppList] = useState<PembayaranSPP[]>(INITIAL_PEMBAYARAN_SPP);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(INITIAL_TRANSAKSI);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>(INITIAL_JADWAL);
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

  const logAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userNama: `${currentUser.nama}`,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role === 'pusat') {
      setActiveTab('dashboard-pusat');
    } else if (user.role === 'cabang') {
      if (user.cabangId) setSelectedCabangId(user.cabangId);
      setActiveTab('dashboard-cabang');
    } else if (user.role === 'guru') {
      if (user.teacherId) setSelectedGuruId(user.teacherId);
      setActiveTab('jadwal-guru');
    }
    setIsAuthenticated(true);
    logAudit('LOGIN', `Pengguna ${user.nama} berhasil masuk ke sistem.`);
  };

  const handleLogout = () => {
    logAudit('LOGOUT', `Pengguna ${currentUser.nama} keluar dari sistem.`);
    setIsAuthenticated(false);
  };

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    if (role === 'pusat') setActiveTab('dashboard-pusat');
    else if (role === 'cabang') setActiveTab('dashboard-cabang');
    else setActiveTab('jadwal-guru');
  };

  // PUSAT HANDLERS
  const handleAddCabang = (nama: string, alamat: string) => {
    const newCabId = `cab-${Date.now()}`;
    const newCab: Cabang = {
      id: newCabId,
      nama,
      alamat,
      status: 'aktif',
      createdAt: new Date().toISOString(),
    };

    const newAccId = `usr-${Date.now()}`;
    const cleanEmail = `cabang.${nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;
    const newAcc: User = {
      id: newAccId,
      nama: `Pimpinan ${nama}`,
      email: cleanEmail,
      password: 'cabang123',
      role: 'cabang',
      cabangId: newCabId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCabangList((prev) => [...prev, newCab]);
    setUsers((prev) => [...prev, newAcc]);
    logAudit('TAMBAH_CABANG', `Membuat ${nama} & akun leader ${cleanEmail}`);

    return { newCabang: newCab, newAccount: newAcc };
  };

  const handleAddGuruPusat = (
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
    const newGuruId = `guru-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;
    const autoEmail = `${noPegawai.toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;

    const newUser: User = {
      id: newUserId,
      nama,
      email: autoEmail,
      noPegawai,
      tanggalLahir,
      password: tanggalLahir,
      role: accountRole,
      cabangId: accountRole === 'cabang' ? (assignedCabangId || cabangIds[0] || 'cab-1') : null,
      teacherId: newGuruId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const newGuru: Guru = {
      id: newGuruId,
      userId: newUserId,
      nama,
      email: autoEmail,
      noTelp,
      noPegawai,
      tanggalLahir,
      alamat,
      jenjang,
      cabangIds: cabangIds.length > 0 ? cabangIds : [selectedCabangId],
      isActive: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setGuruList((prev) => [...prev, newGuru]);
    logAudit('TAMBAH_GURU_PUSAT', `Pusat menambah guru NIP ${noPegawai} (${nama}) & akun ${accountRole.toUpperCase()}`);

    return { newUser, newGuru };
  };

  const handlePromoteGuruRole = (
    guruId: string,
    newRole: 'guru' | 'cabang',
    assignedCabangId?: string
  ) => {
    const targetGuru = guruList.find((g) => g.id === guruId);
    if (!targetGuru) return;

    setUsers((prev) => {
      const userIndex = prev.findIndex(
        (u) => u.teacherId === guruId || u.email.toLowerCase() === targetGuru.email.toLowerCase()
      );

      if (userIndex !== -1) {
        return prev.map((u, i) =>
          i === userIndex
            ? {
                ...u,
                role: newRole,
                cabangId: newRole === 'cabang' ? (assignedCabangId || targetGuru.cabangIds[0] || 'cab-1') : null,
              }
            : u
        );
      } else {
        const newAcc: User = {
          id: `usr-${Date.now()}`,
          nama: targetGuru.nama,
          email: targetGuru.email,
          noPegawai: targetGuru.noPegawai || `NIP-${Math.floor(1000 + Math.random() * 9000)}`,
          tanggalLahir: targetGuru.tanggalLahir || '1995-01-01',
          password: targetGuru.tanggalLahir || '1995-01-01',
          role: newRole,
          cabangId: newRole === 'cabang' ? (assignedCabangId || targetGuru.cabangIds[0] || 'cab-1') : null,
          teacherId: guruId,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newAcc];
      }
    });

    logAudit(
      'UBAH_PERAN_GURU',
      `Pimpinan Pusat mengubah peran guru ${targetGuru.nama} menjadi ${newRole === 'cabang' ? 'Pimpinan Cabang' : 'Guru Biasa'}`
    );
  };

  const handleUpdateCabang = (
    id: string,
    nama: string,
    alamat: string,
    status: 'aktif' | 'nonaktif'
  ) => {
    setCabangList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nama, alamat, status } : c))
    );
    logAudit('UPDATE_CABANG', `Mengubah data cabang ${nama}`);
  };

  const handleDeleteCabang = (id: string) => {
    const targetCabang = cabangList.find((c) => c.id === id);
    setCabangList((prev) => prev.filter((c) => c.id !== id));
    logAudit('HAPUS_CABANG', `Menghapus cabang ${targetCabang?.nama || id}`);
  };

  const handleUpdateTarif = (id: string, nominal: number) => {
    setTarifList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, nominal } : t))
    );
  };

  // CABANG HANDLERS
  const handleRegisterStudent = (formData: {
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
    const newSiswaId = `sis-${Date.now()}`;
    const newSiswa: Siswa = {
      id: newSiswaId,
      cabangId: currentCabang.id,
      nama: formData.nama,
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      alamat: formData.alamat,
      namaIbu: formData.namaIbu,
      noTelpOrtu: formData.noTelpOrtu,
      jenjang: formData.jenjang,
      kelas: formData.kelas,
      guruId: null,
      status: 'aktif',
      createdAt: new Date().toISOString(),
    };

    setSiswaList((prev) => [newSiswa, ...prev]);

    const netRegistration = Math.max(0, biayaPendaftaranBase - formData.diskon);
    const newTrx: Transaksi = {
      id: `trx-${Date.now()}`,
      cabangId: currentCabang.id,
      tipe: 'masuk',
      kategori: 'Pendaftaran',
      nominal: netRegistration,
      keterangan: `Pendaftaran Siswa Baru: ${formData.nama} ${
        formData.diskon > 0 ? `(Diskon Rp${formData.diskon.toLocaleString()})` : ''
      }`,
      tanggal: new Date().toISOString().split('T')[0],
      referensiId: newSiswaId,
    };
    setTransaksiList((prev) => [newTrx, ...prev]);

    const sppRate = calculateSPPRate(formData.jenjang, formData.kelas);
    const newSPP: PembayaranSPP = {
      id: `spp-${Date.now()}`,
      siswaId: newSiswaId,
      cabangId: currentCabang.id,
      bulan: 9,
      tahun: 2026,
      nominal: sppRate,
      status: 'belum_bayar',
      createdAt: new Date().toISOString(),
    };
    setSppList((prev) => [newSPP, ...prev]);

    logAudit('DAFTAR_SISWA', `Mendaftarkan siswa baru ${formData.nama} di ${currentCabang.nama}`);
  };

  const handleBatchRegisterStudents = (students: ParsedSiswaRow[]) => {
    const newSiswaItems: Siswa[] = [];
    const newTrxItems: Transaksi[] = [];
    const newSppItems: PembayaranSPP[] = [];
    const baseTime = Date.now();

    students.forEach((s, idx) => {
      const newSiswaId = `sis-${baseTime}-${idx}`;
      const newSiswa: Siswa = {
        id: newSiswaId,
        cabangId: currentCabang.id,
        nama: s.nama,
        tempatLahir: s.tempatLahir,
        tanggalLahir: s.tanggalLahir,
        alamat: s.alamat,
        namaIbu: s.namaIbu,
        noTelpOrtu: s.noTelpOrtu,
        jenjang: s.jenjang,
        kelas: s.kelas,
        guruId: null,
        status: 'aktif',
        createdAt: new Date().toISOString(),
      };
      newSiswaItems.push(newSiswa);

      const netRegistration = Math.max(0, biayaPendaftaranBase - s.diskon);
      const newTrx: Transaksi = {
        id: `trx-${baseTime}-${idx}`,
        cabangId: currentCabang.id,
        tipe: 'masuk',
        kategori: 'Pendaftaran',
        nominal: netRegistration,
        keterangan: `Pendaftaran Siswa (Import Excel): ${s.nama} ${
          s.diskon > 0 ? `(Diskon Rp${s.diskon.toLocaleString()})` : ''
        }`,
        tanggal: new Date().toISOString().split('T')[0],
        referensiId: newSiswaId,
      };
      newTrxItems.push(newTrx);

      const sppRate = calculateSPPRate(s.jenjang, s.kelas);
      const newSPP: PembayaranSPP = {
        id: `spp-${baseTime}-${idx}`,
        siswaId: newSiswaId,
        cabangId: currentCabang.id,
        bulan: 9,
        tahun: 2026,
        nominal: sppRate,
        status: 'belum_bayar',
        createdAt: new Date().toISOString(),
      };
      newSppItems.push(newSPP);
    });

    setSiswaList((prev) => [...newSiswaItems, ...prev]);
    setTransaksiList((prev) => [...newTrxItems, ...prev]);
    setSppList((prev) => [...newSppItems, ...prev]);

    logAudit('IMPORT_EXCEL_SISWA', `Berhasil mengimpor ${students.length} siswa baru via Excel di ${currentCabang.nama}`);
  };

  const handleUpdateSiswaStatus = (siswaId: string, status: StudentStatus) => {
    setSiswaList((prev) =>
      prev.map((s) => {
        if (s.id === siswaId) {
          const isKeluar = status === 'keluar';
          return {
            ...s,
            status,
            guruId: isKeluar ? null : s.guruId,
          };
        }
        return s;
      })
    );

    if (status === 'keluar') {
      setJadwalList((prev) => prev.filter((j) => j.siswaId !== siswaId));
    }

    logAudit('UPDATE_STATUS_SISWA', `Mengubah status siswa ID ${siswaId} menjadi ${status}`);
  };

  const handleAssignGuru = (siswaId: string, guruId: string | null) => {
    if (guruId) {
      const teacherObj = guruList.find((g) => g.id === guruId);
      const studentObj = siswaList.find((s) => s.id === siswaId);

      if (teacherObj && studentObj) {
        if (!isTeacherEligibleForStudent(teacherObj, studentObj)) {
          return {
            success: false,
            message: `Guru ${teacherObj.nama} (${teacherObj.jenjang}) tidak cocok untuk siswa jenjang ${studentObj.jenjang}.`,
          };
        }

        const currentCount = countTeacherAssignedStudents(guruId, siswaList);

        if (studentObj.guruId !== guruId && currentCount >= 6) {
          return {
            success: false,
            message: `Penugasan ditolak sistem! Guru ${teacherObj.nama} sudah mengajar 6/6 siswa (Batas Maksimal Kuota).`,
          };
        }
      }
    }

    setSiswaList((prev) =>
      prev.map((s) => (s.id === siswaId ? { ...s, guruId } : s))
    );

    logAudit('TUGASKAN_GURU', `Menugaskan guru ${guruId} ke siswa ${siswaId}`);
    return { success: true };
  };

  const handleBatchAssignGuru = (siswaIds: string[], guruId: string | null) => {
    if (guruId) {
      const teacherObj = guruList.find((g) => g.id === guruId);
      if (teacherObj) {
        const currentCount = countTeacherAssignedStudents(guruId, siswaList);
        const newAssignees = siswaIds.filter((id) => {
          const s = siswaList.find((st) => st.id === id);
          return s && s.guruId !== guruId;
        });

        if (currentCount + newAssignees.length > 6) {
          const availableSlots = Math.max(0, 6 - currentCount);
          return {
            success: false,
            message: `Guru ${teacherObj.nama} hanya memiliki sisa ${availableSlots} slot kuota (maksimal 6 siswa).`,
          };
        }
      }
    }

    setSiswaList((prev) =>
      prev.map((s) => (siswaIds.includes(s.id) ? { ...s, guruId } : s))
    );

    const teacherName = guruList.find((g) => g.id === guruId)?.nama || 'Kosong';
    logAudit('BATCH_TUGASKAN_GURU', `Menugaskan ${siswaIds.length} siswa sekaligus ke guru ${teacherName}`);
    return { success: true, assignedCount: siswaIds.length };
  };

  const handleAutoAssignStudents = () => {
    const unassignedStudents = siswaList.filter(
      (s) => s.cabangId === currentCabang.id && s.status === 'aktif' && !s.deletedAt && !s.guruId
    );

    if (unassignedStudents.length === 0) {
      return {
        assignedCount: 0,
        message: 'Semua siswa aktif di cabang ini sudah memiliki guru penanggung jawab!',
      };
    }

    const availableTeachers = guruList.filter(
      (g) => g.isActive && g.cabangIds.includes(currentCabang.id)
    );

    const teacherSlots: Record<string, number> = {};
    availableTeachers.forEach((g) => {
      teacherSlots[g.id] = countTeacherAssignedStudents(g.id, siswaList);
    });

    const updates: Record<string, string> = {};
    let totalAssigned = 0;

    const jenjangList: Jenjang[] = ['SD', 'SMP', 'SMA_SMK', 'TK'];

    jenjangList.forEach((j) => {
      const jenjangStudents = unassignedStudents.filter((s) => s.jenjang === j);
      const jenjangTeachers = availableTeachers.filter((g) => g.jenjang === j);

      if (jenjangStudents.length === 0 || jenjangTeachers.length === 0) return;

      jenjangStudents.forEach((s) => {
        const eligibleTeacher = jenjangTeachers
          .filter((g) => teacherSlots[g.id] < 6)
          .sort((a, b) => teacherSlots[a.id] - teacherSlots[b.id])[0];

        if (eligibleTeacher) {
          updates[s.id] = eligibleTeacher.id;
          teacherSlots[eligibleTeacher.id] += 1;
          totalAssigned += 1;
        }
      });
    });

    if (totalAssigned > 0) {
      setSiswaList((prev) =>
        prev.map((s) => (updates[s.id] ? { ...s, guruId: updates[s.id] } : s))
      );
      logAudit('AUTO_ASSIGN_SISWA', `Auto-assign berhasil menugaskan ${totalAssigned} siswa ke guru di cabang ${currentCabang.nama}`);
      return {
        assignedCount: totalAssigned,
        message: `Berhasil menugaskan ${totalAssigned} siswa secara otomatis ke guru yang sesuai!`,
      };
    }

    return {
      assignedCount: 0,
      message: 'Tidak ada slot guru yang tersedia atau jenjang guru tidak cocok dengan siswa yang belum ditugaskan.',
    };
  };

  const handleUpdateSiswa = (updatedSiswa: Siswa) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id === updatedSiswa.id ? updatedSiswa : s))
    );
    logAudit('UPDATE_SISWA', `Mengubah data siswa ${updatedSiswa.nama}`);
  };

  const handleSoftDeleteSiswa = (siswaId: string) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id === siswaId ? { ...s, deletedAt: new Date().toISOString() } : s))
    );
    setJadwalList((prev) => prev.filter((j) => j.siswaId !== siswaId));
    logAudit('SOFT_DELETE_SISWA', `Soft delete data siswa ID ${siswaId}`);
  };

  const handleBatchNaikKelas = () => {
    setSiswaList((prev) =>
      prev.map((s) => {
        if (s.status !== 'aktif' || s.deletedAt) return s;

        if (s.jenjang === 'SD' && s.kelas === 6) {
          return { ...s, jenjang: 'SMP', kelas: 7 };
        } else if (s.jenjang === 'SMP' && s.kelas === 9) {
          return { ...s, jenjang: 'SMA_SMK', kelas: 10 };
        } else if (s.jenjang === 'SMA_SMK' && s.kelas >= 12) {
          return { ...s, status: 'keluar', kelas: 12 };
        } else {
          return { ...s, kelas: s.kelas + 1 };
        }
      })
    );

    logAudit('MASS_NAIK_KELAS', `Aksi massal Naik Kelas dilaksanakan di cabang ${currentCabang.nama}`);
  };

  const handleAddGuru = (
    nama: string,
    noTelp: string,
    noPegawai: string,
    tanggalLahir: string,
    alamat: string,
    jenjang: Jenjang
  ) => {
    const newGuruId = `guru-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;
    const autoEmail = `${noPegawai.toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;

    const newUser: User = {
      id: newUserId,
      nama,
      email: autoEmail,
      noPegawai,
      tanggalLahir,
      password: tanggalLahir,
      role: 'guru', // Pimpinan Cabang can ONLY create Guru Biasa accounts
      cabangId: null,
      teacherId: newGuruId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const newGuru: Guru = {
      id: newGuruId,
      userId: newUserId,
      nama,
      email: autoEmail,
      noTelp,
      noPegawai,
      tanggalLahir,
      alamat,
      jenjang,
      cabangIds: [currentCabang.id],
      isActive: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setGuruList((prev) => [...prev, newGuru]);

    // Auto generate default schedule (Senin - Jumat, Sesi 2: 18:00 - 20:00)
    const defaultDays: Jadwal['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const defaultJadwals: Jadwal[] = defaultDays.map((hari, idx) => ({
      id: `jdw-${Date.now()}-${idx}`,
      guruId: newGuruId,
      siswaId: '',
      cabangId: currentCabang.id,
      hari,
      jamMulai: '18:00',
      jamSelesai: '20:00',
    }));
    setJadwalList((prev) => [...prev, ...defaultJadwals]);

    logAudit('TAMBAH_GURU_CABANG', `Pimpinan Cabang ${currentCabang.nama} membuat akun GURU BIASA (NIP ${noPegawai}): ${nama}`);
  };

  const handleUpdateGuru = (
    guruId: string,
    nama: string,
    noTelp: string,
    tanggalLahir: string,
    alamat: string,
    jenjang: Jenjang
  ) => {
    setGuruList((prev) =>
      prev.map((g) =>
        g.id === guruId
          ? { ...g, nama, noTelp, tanggalLahir, alamat, jenjang }
          : g
      )
    );
    setUsers((prev) =>
      prev.map((u) =>
        u.teacherId === guruId
          ? { ...u, nama, tanggalLahir, password: tanggalLahir }
          : u
      )
    );
    logAudit('UPDATE_GURU', `Mengubah data guru ${nama}`);
  };

  const handleDeleteGuru = (guruId: string) => {
    const targetGuru = guruList.find((g) => g.id === guruId);
    setGuruList((prev) => prev.filter((g) => g.id !== guruId));
    setUsers((prev) => prev.filter((u) => u.teacherId !== guruId));
    setSiswaList((prev) =>
      prev.map((s) => (s.guruId === guruId ? { ...s, guruId: null } : s))
    );
    setJadwalList((prev) => prev.filter((j) => j.guruId !== guruId));
    logAudit('HAPUS_GURU', `Menghapus akun guru ${targetGuru?.nama || guruId}`);
  };

  const handleBatchAddGuru = (teachers: ParsedGuruRow[]) => {
    const newUsers: User[] = [];
    const newGurus: Guru[] = [];
    const baseTime = Date.now();

    const nipNums = guruList
      .map((g) => {
        const m = (g.noPegawai || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);
    let maxNip = nipNums.length > 0 ? Math.max(...nipNums) : 3000;

    teachers.forEach((g, idx) => {
      maxNip += 1;
      const noPegawai = `NIP-${maxNip}`;
      const newGuruId = `guru-${baseTime}-${idx}`;
      const newUserId = `usr-${baseTime}-${idx}`;
      const autoEmail = `${noPegawai.toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;
      const tanggalLahir = '1995-05-15';

      const newUser: User = {
        id: newUserId,
        nama: g.nama,
        email: autoEmail,
        noPegawai,
        tanggalLahir,
        password: tanggalLahir,
        role: 'guru',
        cabangId: null,
        teacherId: newGuruId,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      newUsers.push(newUser);

      const newGuru: Guru = {
        id: newGuruId,
        userId: newUserId,
        nama: g.nama,
        email: autoEmail,
        noTelp: g.noTelp,
        noPegawai,
        tanggalLahir,
        alamat: g.alamat,
        jenjang: g.jenjang,
        cabangIds: [currentCabang.id],
        isActive: true,
      };
      newGurus.push(newGuru);
    });

    setUsers((prev) => [...prev, ...newUsers]);
    setGuruList((prev) => [...prev, ...newGurus]);

    logAudit('IMPORT_EXCEL_GURU', `Berhasil mengimpor ${teachers.length} guru baru via Excel di ${currentCabang.nama}`);
  };

  const handleAddOrUpdateJadwal = (jadwalData: Omit<Jadwal, 'id'>, editJadwalId?: string) => {
    const conflictResult = checkScheduleConflict(jadwalData, jadwalList, editJadwalId);
    if (conflictResult.conflict) {
      return { success: false, message: conflictResult.reason };
    }

    if (editJadwalId) {
      setJadwalList((prev) =>
        prev.map((j) => (j.id === editJadwalId ? { ...j, ...jadwalData } : j))
      );
      logAudit('UPDATE_JADWAL', `Jadwal diubah: Hari ${jadwalData.hari} jam ${jadwalData.jamMulai}`);
    } else {
      const newJadwal: Jadwal = {
        id: `jdw-${Date.now()}`,
        ...jadwalData,
      };
      setJadwalList((prev) => [...prev, newJadwal]);
      logAudit('TAMBAH_JADWAL', `Jadwal baru dibuat: Hari ${jadwalData.hari} jam ${jadwalData.jamMulai}`);
    }
    return { success: true };
  };

  const handleDeleteJadwal = (jadwalId: string) => {
    setJadwalList((prev) => prev.filter((j) => j.id !== jadwalId));
  };

  const handlePaySPP = (sppId: string, namaPembayar: string, tanggalBayar: string) => {
    const targetSpp = sppList.find((s) => s.id === sppId);
    if (!targetSpp) return;

    const noKwitansi = generateReceiptNumber(currentCabang.id, targetSpp.tahun, targetSpp.bulan, sppList.length + 1);
    const kwitansiUrl = `https://lespintar.id/kwitansi/token-${Math.random().toString(36).substr(2, 9)}`;

    setSppList((prev) =>
      prev.map((s) =>
        s.id === sppId
          ? {
              ...s,
              status: 'lunas',
              namaPembayar,
              tanggalBayar,
              noKwitansi,
              kwitansiUrl,
            }
          : s
      )
    );

    const targetSiswa = siswaList.find((x) => x.id === targetSpp.siswaId);
    const newIncomeTrx: Transaksi = {
      id: `trx-${Date.now()}`,
      cabangId: currentCabang.id,
      tipe: 'masuk',
      kategori: 'SPP',
      nominal: targetSpp.nominal,
      keterangan: `Pembayaran SPP Bulan ${targetSpp.bulan}/${targetSpp.tahun}: ${targetSiswa?.nama}`,
      tanggal: tanggalBayar,
      referensiId: sppId,
    };
    setTransaksiList((prev) => [newIncomeTrx, ...prev]);

    logAudit('CATAT_SPP', `Mencatat SPP Lunas untuk ${targetSiswa?.nama} (${noKwitansi})`);
  };

  const handleAddManualTransaksi = (trx: Omit<Transaksi, 'id'>) => {
    const newTrx: Transaksi = {
      id: `trx-${Date.now()}`,
      ...trx,
    };
    setTransaksiList((prev) => [newTrx, ...prev]);
    logAudit('TRANSAKSI_MANUAL', `Mencatat ${trx.tipe} Rp${trx.nominal} (${trx.kategori})`);
  };

  const handleMarkSentWhatsApp = (sppId: string) => {
    setSppList((prev) =>
      prev.map((s) => (s.id === sppId ? { ...s, dikirimAt: new Date().toISOString() } : s))
    );
    logAudit('KIRIM_WA_KWITANSI', `Kwitansi SPP ID ${sppId} dikirim ke WhatsApp orang tua`);
  };

  const handleRunCron = (bulan: number, tahun: number) => {
    let createdCount = 0;
    let skippedCount = 0;

    const activeStudents = siswaList.filter((s) => s.status === 'aktif' && !s.deletedAt);
    const newBills: PembayaranSPP[] = [];

    activeStudents.forEach((siswa) => {
      const existing = sppList.find(
        (b) => b.siswaId === siswa.id && b.bulan === bulan && b.tahun === tahun
      );

      if (existing) {
        skippedCount++;
      } else {
        const rate = calculateSPPRate(siswa.jenjang, siswa.kelas);
        newBills.push({
          id: `spp-${Date.now()}-${siswa.id}`,
          siswaId: siswa.id,
          cabangId: siswa.cabangId,
          bulan,
          tahun,
          nominal: rate,
          status: 'belum_bayar',
          createdAt: new Date().toISOString(),
        });
        createdCount++;
      }
    });

    if (newBills.length > 0) {
      setSppList((prev) => [...newBills, ...prev]);
    }

    logAudit('CRON_JOB_RUN', `Simulasi Cron SPP Tgl 1 (Bulan ${bulan}/${tahun}): ${createdCount} dibuat, ${skippedCount} diwaspadai/diewati`);
    return { createdCount, skippedCount };
  };

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        allUsers={users}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        setTheme={setTheme}
      />
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
              onUpdateBiayaPendaftaran={setBiayaPendaftaranBase}
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
              onUpdateSiswaClass={(id, newK) =>
                setSiswaList((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, kelas: newK } : s))
                )
              }
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
