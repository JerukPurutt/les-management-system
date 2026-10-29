import React, { useEffect } from 'react';
import { Role } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Users,
  BadgePercent,
  UserPlus,
  GraduationCap,
  CalendarDays,
  Wallet,
  CalendarCheck,
  History,
  QrCode,
  ScanLine,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}) => {
  const pusatItems = [
    { id: 'dashboard-pusat', label: 'Dashboard Pusat', icon: LayoutDashboard },
    { id: 'manajemen-cabang', label: 'Manajemen Cabang', icon: Building2 },
    { id: 'daftar-guru-pusat', label: 'Daftar Guru', icon: Users },
    { id: 'pengaturan-tarif', label: 'Pengaturan Tarif SPP', icon: BadgePercent },
    { id: 'audit-log', label: 'Audit Log Akses', icon: History },
  ];

  const cabangItems = [
    { id: 'dashboard-cabang', label: 'Dashboard Cabang', icon: LayoutDashboard },
    { id: 'absensi-qr', label: 'Absensi QR', icon: QrCode },
    { id: 'pendaftaran-siswa', label: 'Pendaftaran Siswa', icon: UserPlus },
    { id: 'manajemen-siswa', label: 'Manajemen Siswa', icon: GraduationCap },
    { id: 'manajemen-guru-jadwal', label: 'Guru & Jadwal Les', icon: CalendarDays },
    { id: 'keuangan', label: 'Keuangan & Kwitansi', icon: Wallet },
  ];

  const guruItems = [
    { id: 'jadwal-guru', label: 'Jadwal Mengajar Saya', icon: CalendarCheck },
    { id: 'scan-absensi', label: 'Scan Absensi', icon: ScanLine },
  ];

  const menuItems =
    currentRole === 'pusat'
      ? pusatItems
      : currentRole === 'cabang'
      ? cabangItems
      : guruItems;

  const roleLabel =
    currentRole === 'pusat'
      ? 'Pimpinan Pusat'
      : currentRole === 'cabang'
      ? 'Pimpinan Cabang'
      : 'Guru';

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onCloseMobile}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-black/[0.06] bg-[#FBFAF7] p-4 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:border-white/[0.08] dark:bg-[#0B0C0E] lg:inset-auto lg:sticky lg:top-24 lg:z-30 lg:h-[calc(100dvh-7rem)] lg:translate-x-0 lg:self-start lg:rounded-[1.5rem] lg:border lg:bg-transparent lg:p-3 lg:shadow-none lg:dark:bg-transparent ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[4.75rem] lg:p-2' : 'lg:w-60'}`}
      >
        {/* Mobile drawer header */}
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/[0.06] bg-white p-1 dark:border-white/10 dark:bg-white/[0.06]">
              <img src="/logo.png" alt="" className="h-7 w-auto object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold tracking-tight text-zinc-900 dark:text-white">
                LKP Sang Siroju Lillah
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Menu navigasi
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-black/[0.04] hover:text-zinc-800 active:scale-95 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Workspace label */}
        <div className="mb-4 px-2">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
            Workspace
          </p>
          <p
            className={`mt-1 truncate text-[11px] font-medium text-zinc-700 dark:text-zinc-300 ${
              isCollapsed ? 'lg:hidden' : ''
            }`}
          >
            {roleLabel}
          </p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl text-xs transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                  isCollapsed ? 'py-2.5 lg:justify-center lg:px-0 lg:py-3' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-sky-500/[0.08] font-semibold text-sky-800 dark:bg-sky-400/[0.1] dark:text-sky-300'
                    : 'font-medium text-zinc-600 hover:bg-black/[0.03] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-500" />
                )}

                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-300 ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400'
                      : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>

                <span
                  className={`flex-1 truncate text-left tracking-tight ${
                    isCollapsed ? 'lg:hidden' : ''
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-sky-500 ${
                      isCollapsed ? 'lg:hidden' : ''
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className={`mt-auto pt-6 lg:block ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div className="rounded-xl border border-black/[0.06] bg-white/60 px-3 py-2.5 dark:border-white/[0.07] dark:bg-white/[0.03]">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
              LKP Sang Siroju Lillah
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
              Sistem manajemen les
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
