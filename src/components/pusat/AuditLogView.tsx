import React from 'react';
import { AuditLog } from '../../types';
import { History, ShieldCheck, Lock, Database } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      {/* Title & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono font-medium bg-zinc-200/60 dark:bg-white/5 border border-zinc-300/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Security & System Audit
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <History className="w-6 h-6 text-indigo-500" /> Audit Log & Keamanan Akses
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Catatan riwayat aktivitas penting sistem (Perubahan status SPP, soft delete, penugasan guru, login)
          </p>
        </div>
      </div>

      {/* Security Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs">
          <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500">Password Hashing</span>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Bcrypt / Argon2</p>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs">
          <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500">Isolasi Cabang</span>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Middleware cabang_id</p>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs">
          <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500">Soft Delete</span>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">deleted_at IS NULL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] overflow-hidden">
          <div className="p-5 border-b border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight">Riwayat Aktivitas Terbaru</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total {logs.length} entri riwayat tercatat dalam sesi ini
              </p>
            </div>
            <div className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">
              REALTIME AUDIT
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-widest border-b border-zinc-200/80 dark:border-white/10">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Aksi / Event</th>
                  <th className="p-4">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5 text-zinc-700 dark:text-zinc-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                      Belum ada audit log.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-white text-xs whitespace-nowrap">{log.userNama}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300 leading-relaxed">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
