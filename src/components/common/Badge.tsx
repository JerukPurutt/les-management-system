import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30',
    purple: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
    neutral: 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight whitespace-nowrap leading-none border transition-colors shadow-2xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
