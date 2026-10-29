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
  Menu,
  X,
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
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
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
  isMobileNavOpen,
  onToggleMobileNav,
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
    <header className="sticky top-0 z-40 w-full px-3 pb-2 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-[1.5rem] border border-black/[0.07] bg-[#F4F3EE]/85 px-2.5 py-2 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#08090A]/85 sm:gap-3 sm:px-3.5">
        {/* Brand & sidebar / menu controls */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={onToggleMobileNav}
            aria-label={isMobileNavOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isMobileNavOpen}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-600 transition-colors hover:bg-black/[0.04] hover:text-zinc-900 active:scale-95 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white lg:hidden"
          >
            {isMobileNavOpen ? (
              <X className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>

          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Buka / tutup sidebar"
            title="Buka / Tutup Sidebar"
            className="hidden h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-black/[0.04] hover:text-zinc-900 active:scale-95 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white lg:grid"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/[0.06] bg-white p-1 dark:border-white/10 dark:bg-white/[0.06]">
              <img
                src="/logo.png"
                alt="LKP Sang Siroju Lillah"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-xs font-semibold leading-tight tracking-tight text-zinc-900 dark:text-white">
                LKP Sang Siroju Lillah
              </div>
              <div className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Enterprise Management
              </div>
            </div>
          </div>
        </div>

        {/* Right toolbar */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Cron trigger */}
          <button
            onClick={onOpenCronModal}
            title="Simulasikan Cron Job Otomatis Tagihan SPP (Tgl 1)"
            aria-label="Simulasikan cron SPP tanggal 1"
            className="group flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-2.5 text-amber-700 transition-colors hover:bg-amber-500/[0.14] active:scale-95 dark:text-amber-300 sm:px-3"
          >
            <Sparkles
              className="h-3.5 w-3.5 text-amber-500 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
              strokeWidth={1.75}
            />
            <span className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.12em] md:inline">
              Cron SPP
            </span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-black/[0.07] bg-white/60 text-zinc-700 transition-colors hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200 dark:hover:bg-white/[0.09]"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-300" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4 text-sky-600" strokeWidth={1.75} />
            )}
          </button>

          {/* Account switcher */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              aria-label="Buka menu akun"
              aria-expanded={isAccountMenuOpen}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-black/[0.07] bg-white/60 py-1 pl-1 pr-2 text-left transition-colors hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] sm:pr-2.5"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-950 font-mono text-[10px] font-bold text-white dark:bg-white dark:text-zinc-950">
                {currentUser.nama.charAt(0)}
              </span>

              <span className="hidden min-w-0 md:block">
                <span className="block max-w-[110px] truncate text-[11px] font-semibold leading-tight text-zinc-900 dark:text-white">
                  {currentUser.nama.split(' ')[0]}
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  {currentUser.role}
                </span>
              </span>

              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-300 ${
                  isAccountMenuOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={1.75}
              />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-[1.25rem] border border-black/[0.07] bg-[#FBFAF7]/95 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0B0C0E]/95">
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Pilih Akun
                  </span>
                  <span className="rounded-full border border-black/[0.06] bg-white/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-400">
                    {allUsers.length} akun
                  </span>
                </div>

                <div className="max-h-64 space-y-0.5 overflow-y-auto py-0.5">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    const avatarClass =
                      u.role === 'pusat'
                        ? 'bg-sky-600 text-white'
                        : u.role === 'cabang'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white';

                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl p-2.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-sky-500/[0.08] dark:bg-sky-400/[0.1]'
                            : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold ${avatarClass}`}
                          >
                            {u.nama.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                              {u.nama}
                            </div>
                            <div className="truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Check
                            className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1 border-t border-black/[0.06] pt-1 dark:border-white/10">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/[0.08] dark:text-rose-400"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>Keluar dari akun</span>
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
