import React, { useState } from 'react';
import { User, Theme } from '../../types';
import { Lock, UserCheck, Eye, EyeOff, ShieldCheck, Building2, LogIn, Sun, Moon, CreditCard } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LoginPageProps {
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  allUsers,
  onLoginSuccess,
  theme,
  setTheme,
}) => {
  const [identifierInput, setIdentifierInput] = useState('NIP-2001');
  const [passwordInput, setPasswordInput] = useState('1990-04-12');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const term = identifierInput.trim().toLowerCase();
    const userMatch = allUsers.find(
      (u) =>
        u.email.toLowerCase() === term ||
        (u.noPegawai && u.noPegawai.toLowerCase() === term)
    );

    if (!userMatch) {
      setErrorMsg('Nomor Pegawai (NIP) / Email tidak terdaftar dalam sistem.');
      return;
    }

    const cleanTgl = userMatch.tanggalLahir ? userMatch.tanggalLahir.replace(/-/g, '') : '';
    const ddmmyyyy = userMatch.tanggalLahir
      ? userMatch.tanggalLahir.split('-').reverse().join('')
      : '';

    const isValidPassword =
      passwordInput === userMatch.password ||
      passwordInput === userMatch.tanggalLahir ||
      passwordInput === cleanTgl ||
      passwordInput === ddmmyyyy ||
      passwordInput === `${userMatch.role}123`;

    if (!isValidPassword) {
      setErrorMsg('Password (Tanggal Lahir) yang Anda masukkan salah.');
      return;
    }

    if (!userMatch.isActive) {
      setErrorMsg('Akun ini sedang dinonaktifkan.');
      return;
    }

    onLoginSuccess(userMatch);
  };

  const handleQuickSelect = (u: User) => {
    setIdentifierInput(u.noPegawai || u.email);
    setPasswordInput(u.tanggalLahir || u.password || `${u.role}123`);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="LKP Sang Siroju Lillah" className="h-9 object-contain" />
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-xs flex items-center gap-1.5"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          <span className="hidden sm:inline font-medium">{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>
      </div>

      {/* Center Main Card Container */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-center">
        {/* Left Side: Login Form */}
        <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Masuk ke Sistem
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Gunakan Nomor Pegawai (NIP) & Password Tanggal Lahir
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Nomor Pegawai (NIP) / Email *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="mis. NIP-2001 atau cabang.jaksel@lespintar.id"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                Password (Tanggal Lahir YYYY-MM-DD / Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="mis. 1990-04-12 atau cabang123"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" /> Masuk ke Aplikasi
            </button>
          </form>
        </div>

        {/* Right Side: Quick Demo Accounts Selection */}
        <div className="md:col-span-6 space-y-3">
          <div className="px-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Akun Login Per Role (Quick Select NIP)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Klik salah satu akun demo untuk auto-fill Nomor Pegawai & Tanggal Lahir:
            </p>
          </div>

          <div className="space-y-2">
            {allUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickSelect(u)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  identifierInput.toLowerCase() === (u.noPegawai?.toLowerCase() || u.email.toLowerCase())
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      u.role === 'pusat'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : u.role === 'cabang'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {u.role === 'pusat' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : u.role === 'cabang' ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
                      {u.nama}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      No. Pegawai: <span className="font-bold text-indigo-600 dark:text-indigo-400">{u.noPegawai || 'NIP-1001'}</span> • Tgl Lahir: <span className="font-bold text-slate-700 dark:text-zinc-200">{u.tanggalLahir || '1990-01-01'}</span>
                    </div>
                  </div>
                </div>

                <Badge variant={u.role === 'pusat' ? 'purple' : u.role === 'cabang' ? 'warning' : 'info'}>
                  {u.role === 'cabang' ? '🏢 Cabang' : u.role === 'pusat' ? '👑 Pusat' : '🎓 Guru'}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-[11px] text-slate-400 dark:text-zinc-500 font-mono py-2">
        © 2026 LKP Sang Siroju Lillah • Sistem Manajemen Tempat Les Multi-Cabang
      </div>
    </div>
  );
};
