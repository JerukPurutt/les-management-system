import React from 'react';
import { AuditLog } from '../../types';
import { History, ShieldCheck, Lock, Database } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Audit Log & Keamanan Akses
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Catatan riwayat aktivitas penting sistem (Perubahan status SPP, soft delete, penugasan guru, login)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Password Hashing</span>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Bcrypt / Argon2</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Isolasi Cabang</span>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Middleware cabang_id</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Soft Delete</span>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">deleted_at IS NULL</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">Riwayat Aktivitas Terbaru</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna</th>
                <th className="p-3">Aksi / Event</th>
                <th className="p-3">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    Belum ada audit log.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">{log.userNama}</td>
                    <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">{log.action}</td>
                    <td className="p-3 text-slate-700 dark:text-zinc-300">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
