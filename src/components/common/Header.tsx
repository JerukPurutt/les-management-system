import React, { useState } from 'react';
import { Role, Cabang, User, Guru, Theme } from '../../types';
import {
  Sun,
  Moon,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  LogOut,
  Check,
} from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  selectedCabangId: string;
  setSelectedCabangId: (id: string) => void;
  cabangList: Cabang[];
  guruList: Guru[];
  selectedGuruId: string;
  setSelectedGuruId: (id: string) => void;
  onOpenCronModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  currentUser,
  setCurrentUser,
  allUsers,
  theme,
  setTheme,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  selectedCabangId,
  setSelectedCabangId,
  cabangList,
  guruList,
  selectedGuruId,
  setSelectedGuruId,
  onOpenCronModal,
  onLogout,
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSelectUser = (u: User) => {
    setCurrentUser(u);
    setCurrentRole(u.role);
    if (u.role === 'cabang' && u.cabangId) {
      setSelectedCabangId(u.cabangId);
    } else if (u.role === 'guru' && u.teacherId) {
      setSelectedGuruId(u.teacherId);
    }
    setIsAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 sm:px-4 py-2 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left Brand Section & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors"
            title="Buka / Tutup Sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            ) : (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-zinc-400" />
            )}
          </button>

          {/* Logo LKP Sang Siroju Lillah */}
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="LKP Sang Siroju Lillah"
              className="h-8 sm:h-9 object-contain max-w-[140px] sm:max-w-[200px]"
            />
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cron Trigger Button */}
          <button
            onClick={onOpenCronModal}
            className="hidden xs:flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            title="Simulasikan Cron Job Otomatis Tagihan SPP (Tgl 1)"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Cron SPP Tgl 1</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
            title={theme === 'dark' ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Account Switcher Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all text-left"
            >
              <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.nama.charAt(0)}
              </div>
              <div className="hidden sm:block text-[11px] leading-tight max-w-[120px] truncate">
                <div className="font-semibold text-slate-800 dark:text-zinc-100 truncate">
                  {currentUser.nama.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 capitalize font-mono">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Account Switcher Dropdown Modal */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-2 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Pilih Akun Pengguna</span>
                  <span className="text-[10px] font-normal text-slate-400">Multi-User</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 py-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <div
                            className={`h-6 w-6 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ${
                              u.role === 'pusat'
                                ? 'bg-indigo-600 text-white'
                                : u.role === 'cabang'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-purple-600 text-white'
                            }`}
                          >
                            {u.nama.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                              {u.nama}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Logout Action */}
                <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Akun (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
