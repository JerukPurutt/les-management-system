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
      className={`bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/80 transition-all duration-300 shrink-0 ${
        isCollapsed ? 'w-14 sm:w-16 p-2' : 'w-56 p-3'
      }`}
    >
      {!isCollapsed && (
        <div className="mb-3 px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
            Menu ({currentRole})
          </p>
        </div>
      )}

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 rounded-lg text-xs font-medium transition-all ${
                isCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'
              } ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
