import React from 'react';
import { formatCurrency } from '../utils';
import type { CutoffPeriod } from '../types';

interface Props {
  thisTimeIncome: number;
  allTimeIncome: number;
  cutoff: CutoffPeriod;
  currency: string;
  darkMode: boolean;
  onResetThisTime: () => void;
  onResetAllTime: () => void;
}

// Small chevron-right for labeling
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export const BalanceCard: React.FC<Props> = ({
  thisTimeIncome,
  allTimeIncome,
  cutoff,
  currency,
  darkMode,
  onResetThisTime,
  onResetAllTime,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white select-none">

      {/* Decorative background circles — wallet aesthetic */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -right-4 -bottom-12 w-64 h-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute left-0 bottom-0 w-32 h-32 rounded-full bg-brand-500/20" />

      {/* Card chip decorative element */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/60 mb-0.5">
            This Time · Active Balance
          </p>
          {/* Period badge */}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/10 px-2 py-0.5 rounded-full text-white/80">
            <ChevronRight />
            {cutoff.label}: {formatCurrency(cutoff.amount, currency)}
          </span>
        </div>
        <button
          onClick={onResetThisTime}
          className="text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl backdrop-blur-sm"
        >
          Reset
        </button>
      </div>

      {/* Main balance number */}
      <div className="mb-5">
        <p className="font-mono text-4xl sm:text-5xl font-bold tracking-tight leading-none">
          {formatCurrency(thisTimeIncome, currency)}
        </p>
      </div>

      {/* Bottom row: all-time + factory reset */}
      <div className="flex items-end justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">All Time</p>
          <p className="font-mono text-lg font-semibold">{formatCurrency(allTimeIncome, currency)}</p>
        </div>
        <button
          onClick={onResetAllTime}
          className="text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-red-300 active:scale-95 transition-all"
        >
          Factory Reset
        </button>
      </div>
    </div>
  );
};
