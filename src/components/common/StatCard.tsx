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
    default: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">{title}</span>
        <div className={`p-1.5 rounded-lg border ${iconVariants[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
          {value}
        </div>
        {subtitle && <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <div className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>↑ {trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};
