'use client';

import React from 'react';
import { AdminPageBrandBar } from '@/components/layout/AdminPageBrandBar';
import { cn } from '@/lib/utils';

type Accent = 'teal' | 'orange' | 'amber' | 'emerald' | 'sky' | 'violet';

const accentStyles: Record<Accent, { line: string; label: string; highlight: string }> = {
  teal: { line: 'bg-teal-500/40', label: 'text-teal-500', highlight: 'text-teal-400' },
  orange: { line: 'bg-orange-500/40', label: 'text-orange-500', highlight: 'text-orange-400' },
  amber: { line: 'bg-amber-500/40', label: 'text-amber-500', highlight: 'text-amber-400' },
  emerald: { line: 'bg-emerald-500/40', label: 'text-emerald-500', highlight: 'text-emerald-400' },
  sky: { line: 'bg-sky-500/40', label: 'text-sky-500', highlight: 'text-sky-400' },
  violet: { line: 'bg-violet-500/40', label: 'text-violet-500', highlight: 'text-violet-400' },
};

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  accent?: Accent;
  right?: React.ReactNode;
  className?: string;
  /** Use compact title styling for legacy shadcn pages. */
  compact?: boolean;
};

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  accent = 'teal',
  right,
  className,
  compact = false,
}: AdminPageHeaderProps) {
  const styles = accentStyles[accent];

  return (
    <AdminPageBrandBar
      className={className}
      left={
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn('h-[1px] w-12', styles.line)} />
            <span
              className={cn(
                'text-[13px] font-black uppercase tracking-[0.3em]',
                styles.label,
              )}
            >
              {eyebrow}
            </span>
          </div>
          <h2
            className={cn(
              compact
                ? 'text-2xl sm:text-3xl font-bold tracking-tight text-white'
                : 'text-5xl font-black tracking-tighter text-white uppercase italic leading-none',
            )}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={cn(
                compact
                  ? 'text-muted-foreground text-sm'
                  : 'text-slate-500 font-mono text-[15px] uppercase tracking-widest',
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      }
      right={right}
    />
  );
}
