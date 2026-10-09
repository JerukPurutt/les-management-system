import React from 'react';
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
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  setActiveTab,
  isCollapsed,
}) => {
  const pusatItems = [
    { id: 'dashboard-pusat', label: 'Dashboard Pusat', icon: LayoutDashboard },
    { id: 'manajemen-cabang', label: 'Manajemen Cabang', icon: Building2 },
    { id: 'daftar-guru-pusat', label: 'Daftar Guru (Semua)', icon: Users },
    { id: 'pengaturan-tarif', label: 'Pengaturan Tarif SPP', icon: BadgePercent },
    { id: 'audit-log', label: 'Audit Log Akses', icon: History },
  ];

  const cabangItems = [
    { id: 'dashboard-cabang', label: 'Dashboard Cabang', icon: LayoutDashboard },
    { id: 'pendaftaran-siswa', label: 'Pendaftaran Siswa', icon: UserPlus },
    { id: 'manajemen-siswa', label: 'Manajemen Siswa', icon: GraduationCap },
    { id: 'manajemen-guru-jadwal', label: 'Guru & Jadwal Les', icon: CalendarDays },
    { id: 'keuangan', label: 'Keuangan & Kwitansi', icon: Wallet },
  ];

  const guruItems = [
    { id: 'jadwal-guru', label: 'Jadwal Mengajar Saya', icon: CalendarCheck },
  ];

  const menuItems =
    currentRole === 'pusat'
      ? pusatItems
      : currentRole === 'cabang'
      ? cabangItems
      : guruItems;

  return (
    <aside
      className={`bg-white/80 dark:bg-[#050505]/95 backdrop-blur-xl border-r border-zinc-200/80 dark:border-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shrink-0 z-30 ${
        isCollapsed ? 'w-16 p-2' : 'w-60 p-3 sm:p-4'
      }`}
    >
      {!isCollapsed && (
        <div className="mb-4 px-3 pt-1">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-indigo-500" /> Navigation
          </p>
        </div>
      )}

      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-2xl text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md shadow-zinc-900/10 dark:shadow-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform duration-300 ${
                  isActive
                    ? 'scale-105'
                    : 'opacity-70 group-hover:opacity-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>

              {!isCollapsed && (
                <span className="truncate tracking-tight flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

