import React, { useEffect, useState } from 'react';
import { User, Theme } from '../../types';
import { Eye, EyeOff, LogIn, Sun, Moon, ArrowUpRight, Lock, UserCheck, ShieldCheck, Building2, KeyRound } from 'lucide-react';
import { api } from '../../utils/api';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface PublicUser {
  id: string;
  nama: string;
  email: string;
  role: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme,
  setTheme,
}) => {
  const [identifierInput, setIdentifierInput] = useState('admin@lespintar.id');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<PublicUser[]>([]);

  useEffect(() => {
    api.usersPublic().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { user } = await api.login(identifierInput.trim(), passwordInput);
      if (!user.isActive) {
        setErrorMsg('Akun ini sedang dinonaktifkan.');
        return;
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.message === 'Kredensial salah'
        ? 'Email/NIP atau password salah.'
        : `Gagal masuk: ${err?.message || 'server tidak terjangkau'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: PublicUser) => {
    setIdentifierInput(u.email);
    setErrorMsg(null);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-[100dvh] w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans relative overflow-x-hidden overflow-y-auto transition-colors duration-500 ${
        isDark
          ? 'bg-[#050505] text-zinc-100 selection:bg-white/20 selection:text-white'
          : 'bg-slate-100/90 text-zinc-900 selection:bg-zinc-900 selection:text-white'
      }`}
    >
      {/* Background Spatial Mesh */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]'
            : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(0,0,0,0))]'
        }`}
      />

      {/* Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto z-20 shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-300 ${
              isDark
                ? 'bg-white/5 border border-white/10 backdrop-blur-md'
                : 'bg-white border border-slate-200/80 shadow-xs'
            }`}
          >
            <img src="/logo.png" alt="LKP Sang Siroju Lillah" className="h-6 sm:h-8 object-contain" />
          </div>
          <div>
            <span className={`font-semibold text-xs tracking-tight block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              LKP Sang Siroju Lillah
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Management System</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs flex items-center gap-2 backdrop-blur-xl transition-all duration-300 active:scale-95 ${
            isDark
              ? 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs'
          }`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          <span className="font-medium text-[11px]">{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>
      </header>

      {/* Main Grid Section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto py-4 sm:py-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch w-full">
          
          {/* Left Card: Login Form Outer Shell & Inner Core */}
          <div
            className={`p-1.5 sm:p-2 rounded-2xl sm:rounded-[2.25rem] border shadow-xl sm:shadow-2xl backdrop-blur-2xl transition-all duration-500 lg:col-span-6 ${
              isDark
                ? 'bg-white/[0.03] border-white/10'
                : 'bg-white/80 border-slate-200/80 shadow-slate-200/60'
            }`}
          >
            <div
              className={`h-full border rounded-xl sm:rounded-[calc(2.25rem-0.5rem)] p-5 sm:p-8 flex flex-col justify-between space-y-6 transition-colors duration-500 ${
                isDark
                  ? 'bg-[#0a0a0a] border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                  : 'bg-white border-slate-100 shadow-xs'
              }`}
            >
              <div className="space-y-2.5">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono font-medium ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-zinc-400'
                      : 'bg-slate-100 border border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Autentikasi Pengguna
                </div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Portal Akses
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                  Masuk ke sistem pengelolaan tempat les multi-cabang dengan NIP atau Email terverifikasi.
                </p>
              </div>

              {errorMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium backdrop-blur-md flex items-start gap-2.5 ${
                    isDark
                      ? 'bg-red-500/10 border-red-500/20 text-red-300'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className={`block text-[11px] font-mono uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Email / NIP Pegawai
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin@lespintar.id atau NIP-3101"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    className={`w-full border rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 text-xs focus:outline-none transition-all duration-300 font-mono ${
                      isDark
                        ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]'
                        : 'bg-slate-50 border-slate-200 text-zinc-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[11px] font-mono uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`w-full border rounded-xl sm:rounded-2xl pl-3.5 sm:pl-4 pr-11 py-3 text-xs focus:outline-none transition-all duration-300 font-mono ${
                        isDark
                          ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]'
                          : 'bg-slate-50 border-slate-200 text-zinc-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-3.5 flex items-center transition-colors duration-200 ${
                        isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Island Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full pl-5 pr-1.5 py-2 font-semibold text-xs rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between group active:scale-[0.98] disabled:opacity-50 mt-3 ${
                    isDark
                      ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10'
                  }`}
                >
                  <span className="tracking-tight">{loading ? 'Memeriksa Akses...' : 'Masuk ke Aplikasi'}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5 ${
                      isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                  </div>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" /> Enkripsi End-to-End API
                </span>
                <span>LKP Platform</span>
              </div>
            </div>
          </div>

          {/* Right Card: Account Directory Outer Shell & Inner Core */}
          <div
            className={`p-1.5 sm:p-2 rounded-2xl sm:rounded-[2.25rem] border shadow-xl sm:shadow-2xl backdrop-blur-2xl flex flex-col transition-all duration-500 lg:col-span-6 ${
              isDark
                ? 'bg-white/[0.02] border-white/10'
                : 'bg-white/80 border-slate-200/80 shadow-slate-200/60'
            }`}
          >
            <div
              className={`h-full border rounded-xl sm:rounded-[calc(2.25rem-0.5rem)] p-5 sm:p-8 flex flex-col justify-between space-y-5 transition-colors duration-500 ${
                isDark
                  ? 'bg-[#080808] border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'bg-white border-slate-100 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className={`text-xs font-mono uppercase tracking-[0.2em] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Direktori Akun Server
                  </h2>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-white/5 border border-white/10 text-zinc-400'
                        : 'bg-slate-100 border border-slate-200 text-slate-600'
                    }`}
                  >
                    {accounts.length} Akun
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-normal">
                  Pilih akun terdaftar di server untuk mengisi email otomatis:
                </p>
              </div>

              {/* Scrollable Accounts List */}
              <div className="space-y-2 max-h-[260px] sm:max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {accounts.map((u) => {
                  const isSelected = identifierInput.toLowerCase() === u.email.toLowerCase();
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className={`w-full text-left p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between group active:scale-[0.98] ${
                        isSelected
                          ? isDark
                            ? 'bg-white/10 border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs'
                          : isDark
                          ? 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05]'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl border shrink-0 ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-zinc-300'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {u.role === 'pusat' ? (
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                          ) : u.role === 'cabang' ? (
                            <Building2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-indigo-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {u.nama}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span
                          className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            isDark
                              ? 'bg-white/5 border border-white/10 text-zinc-400'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          {u.role}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-200" />
                      </div>
                    </button>
                  );
                })}

                {accounts.length === 0 && (
                  <div className="text-xs text-zinc-500 text-center py-8 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white/[0.01]">
                    Server tidak terjangkau. Jalankan backend dahulu (`cd backend && node index.js`).
                  </div>
                )}
              </div>

              {/* Password Hint */}
              <div
                className={`p-3 rounded-xl sm:rounded-2xl border flex items-center justify-between text-[11px] font-mono ${
                  isDark
                    ? 'bg-white/[0.03] border-white/5 text-zinc-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>Password Guru Default:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-lg ${
                    isDark
                      ? 'text-white bg-white/10 border border-white/10'
                      : 'text-zinc-900 bg-white border border-slate-200'
                  }`}
                >
                  1995-05-15
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-[11px] text-zinc-500 font-mono max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4 shrink-0 z-20">
        <span>© 2026 LKP Sang Siroju Lillah</span>
        <span className="tracking-widest uppercase text-[10px] text-zinc-400 dark:text-zinc-600">Enterprise Les Management</span>
      </footer>

    </div>
  );
};






