import React, { useState } from 'react';
import { formatCurrency } from '../utils';

interface Props {
  rate: number;
  currency: string;
  personLabel: string;
  darkMode: boolean;
  onAdd: (persons: number) => void;
}

// Backspace key icon
const BackspaceIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/>
    <line x1="18" y1="9" x2="12" y2="15"/>
    <line x1="12" y1="9" x2="18" y2="15"/>
  </svg>
);

export const NumpadCalculator: React.FC<Props> = ({ rate, currency, personLabel, darkMode, onAdd }) => {
  const [input, setInput] = useState('');

  // Computed preview of the amount that would be added
  const preview = input !== '' ? parseFloat(input) * rate : null;

  const handleDigit = (val: string) => {
    // Only allow one decimal point
    if (val === '.' && input.includes('.')) return;
    // Prevent leading zeros (except "0.")
    if (input === '0' && val !== '.') return;
    setInput(prev => prev + val);
  };

  const handleBackspace = () => setInput(prev => prev.slice(0, -1));
  const handleClear = () => setInput('');

  const handleAdd = () => {
    const persons = parseFloat(input);
    if (isNaN(persons) || persons <= 0) return;
    onAdd(persons);
    setInput('');
  };

  // Key layout rows
  const rows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', 'C'],
  ];

  const dk = darkMode;

  return (
    <div className={`rounded-2xl overflow-hidden border shadow-sm ${dk ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-100'}`}>

      {/* Display */}
      <div className={`px-5 pt-5 pb-4 border-b ${dk ? 'border-dark-border' : 'border-slate-100'}`}>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
          {personLabel.charAt(0).toUpperCase() + personLabel.slice(1)} · Rate {formatCurrency(rate, currency)} each
        </p>
        <div className={`text-right font-mono text-3xl font-bold min-h-[2.5rem] tracking-tight ${dk ? 'text-slate-100' : 'text-slate-800'}`}>
          {input || <span className="opacity-20">0</span>}
        </div>
        {preview !== null && (
          <p className={`text-right text-sm mt-1 font-medium ${dk ? 'text-brand-400' : 'text-brand-600'}`}>
            = {formatCurrency(preview, currency)}
          </p>
        )}
      </div>

      {/* Numpad grid */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {/* Rows 0–3 (3 columns each) + Action column (col 4, rows 1–4) */}

        {rows.map((row, ri) =>
          row.map((key) => {
            const isClear = key === 'C';
            const isDecimal = key === '.';

            return (
              <button
                key={`${ri}-${key}`}
                onClick={isClear ? handleClear : () => handleDigit(key)}
                className={`
                  row-span-1 py-4 sm:py-5 text-lg font-semibold rounded-xl transition-all active:scale-95
                  ${isClear
                    ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                    : isDecimal
                      ? dk ? 'bg-dark-muted text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : dk ? 'bg-dark-muted text-slate-100 hover:bg-slate-600' : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-100'
                  }
                `}
              >
                {key}
              </button>
            );
          })
        )}

        {/* Backspace — spans 2 rows in col 4 */}
        <button
          onClick={handleBackspace}
          className="row-start-1 col-start-4 row-span-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center justify-center"
        >
          <BackspaceIcon />
        </button>

        {/* Add button — spans 2 rows in col 4 */}
        <button
          onClick={handleAdd}
          className="row-start-3 col-start-4 row-span-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-600/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-[10px] uppercase tracking-widest opacity-80">Add</span>
        </button>
      </div>
    </div>
  );
};
