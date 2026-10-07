import React from 'react';
import { Guru, Cabang, Siswa, Jadwal } from '../../types';
import { CalendarCheck, Building2, Clock, Shield, CheckCircle } from 'lucide-react';
import { getJenjangLabel } from '../../utils/helpers';
import { Badge } from '../common/Badge';

interface JadwalGuruViewProps {
  currentGuru: Guru;
  cabangList: Cabang[];
  siswaList: Siswa[];
  jadwalList: Jadwal[];
}

export const JadwalGuruView: React.FC<JadwalGuruViewProps> = ({
  currentGuru,
  cabangList,
  siswaList,
  jadwalList,
}) => {
  const myJadwal = jadwalList.filter((j) => j.guruId === currentGuru.id);
  const daysOrder: Jadwal['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  return (
    <div className="space-y-4 text-xs">
      {/* Header Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Jadwal Mengajar Saya (Senin - Jumat)
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
            Pengajar: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{currentGuru.nama}</span> • NIP: {currentGuru.noPegawai || 'NIP-3001'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">{getJenjangLabel(currentGuru.jenjang)}</Badge>
          <div className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-950 rounded text-[10px] text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Akses Read-Only
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid (Senin - Jumat) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {daysOrder.map((hari) => {
          const dayJadwals = myJadwal.filter((j) => j.hari === hari);

          // Get unique sessions based on time and branch
          const sessionKeys: string[] = [];
          const uniqueSessions: { jamMulai: string; jamSelesai: string; cabangId: string }[] = [];

          dayJadwals.forEach((j) => {
            const key = `${j.jamMulai}-${j.jamSelesai}-${j.cabangId}`;
            if (!sessionKeys.includes(key)) {
              sessionKeys.push(key);
              uniqueSessions.push({
                jamMulai: j.jamMulai,
                jamSelesai: j.jamSelesai,
                cabangId: j.cabangId,
              });
            }
          });

          return (
            <div
              key={hari}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 space-y-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2 mb-3">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{hari}</span>
                  <span className="text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                    {uniqueSessions.length} Sesi Terjadwal
                  </span>
                </div>

                {uniqueSessions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs italic">
                    Tidak ada jadwal mengajar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uniqueSessions.map((ses, idx) => {
                      const cabObj = cabangList.find((c) => c.id === ses.cabangId);
                      const isSesi2 = ses.jamMulai === '18:00';

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-2 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isSesi2 ? 'Sesi 2' : 'Sesi 1'}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {ses.jamMulai} - {ses.jamSelesai}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cabObj?.nama || 'Cabang'}</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Mengajar
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
