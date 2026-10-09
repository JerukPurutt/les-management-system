import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'indigo';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}) => {
  const iconVariants = {
    default: 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  return (
    <div className="p-1 rounded-2xl bg-zinc-200/50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-xs hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300">
      <div className="h-full bg-white dark:bg-[#09090b] border border-zinc-100 dark:border-white/5 rounded-[calc(1rem-0.25rem)] p-4 sm:p-5 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium">
            {title}
          </span>
          <div className={`p-2 rounded-xl border ${iconVariants[variant]} shadow-2xs`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal font-normal">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>↑ {trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

