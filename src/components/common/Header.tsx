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

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-white/10 bg-white/85 dark:bg-[#050505]/90 backdrop-blur-xl px-4 sm:px-6 py-2.5 transition-all duration-300">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors active:scale-95"
            title="Buka / Tutup Sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            ) : (
              <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 shrink-0">
              <img
                src="/logo.png"
                alt="LKP Sang Siroju Lillah"
                className="h-7 sm:h-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-xs tracking-tight text-zinc-900 dark:text-white leading-tight">
                LKP Sang Siroju Lillah
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Enterprise Management</div>
            </div>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Cron Trigger Button */}
          <button
            onClick={onOpenCronModal}
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all active:scale-95"
            title="Simulasikan Cron Job Otomatis Tagihan SPP (Tgl 1)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Cron SPP Tgl 1</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95"
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Account Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all text-left active:scale-95 shadow-2xs"
            >
              <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                {currentUser.nama.charAt(0)}
              </div>
              <div className="hidden sm:block text-[11px] leading-tight max-w-[120px] truncate">
                <div className="font-semibold text-zinc-900 dark:text-white truncate">
                  {currentUser.nama.split(' ')[0]}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize font-mono">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Account Switcher Dropdown Modal */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 p-2 rounded-2xl bg-zinc-200/60 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-xl p-2 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-white/10 font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                    <span className="text-xs tracking-tight">Pilih Akun Pengguna</span>
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400">Multi-User</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 py-1 custom-scrollbar">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                            isSelected
                              ? 'bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15'
                              : 'hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <div
                              className={`h-7 w-7 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 font-mono ${
                                u.role === 'pusat'
                                  ? 'bg-indigo-600 text-white'
                                  : u.role === 'cabang'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {u.nama.charAt(0)}
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-zinc-900 dark:text-white truncate">
                                {u.nama}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>

                          {isSelected && <Check className="w-4 h-4 text-zinc-900 dark:text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout Action */}
                  <div className="pt-1 border-t border-zinc-100 dark:border-white/10">
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Akun (Logout)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

