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
    default: 'border-black/[0.07] bg-black/[0.02] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400',
    danger: 'border-rose-500/15 bg-rose-500/[0.06] text-rose-600 dark:text-rose-400',
    success: 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400',
    warning: 'border-amber-500/15 bg-amber-500/[0.06] text-amber-600 dark:text-amber-400',
    indigo: 'border-sky-500/15 bg-sky-500/[0.06] text-sky-600 dark:text-sky-400',
  };

  return (
    <div className="group relative h-full overflow-hidden rounded-[1.75rem] border border-black/[0.07] bg-white/90 p-5 transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-black/[0.12] dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:border-white/[0.16] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${iconVariants[variant]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      </div>

      <div className="mt-6">
        <div className="font-mono text-3xl font-semibold tracking-[-0.05em] tabular-nums text-zinc-950 dark:text-white sm:text-4xl">
          {value}
        </div>
        {subtitle && (
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="mt-3 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            ↑ {trend}
          </div>
        )}
      </div>
    </div>
  );
};
