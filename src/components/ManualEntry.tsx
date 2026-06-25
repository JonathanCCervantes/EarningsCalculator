import React, { useState } from 'react';

interface Props {
  currency: string;
  darkMode: boolean;
  onAdd: (amount: number, timestamp: number, note?: string) => void;
}

export const ManualEntry: React.FC<Props> = ({ currency, darkMode, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const dk = darkMode;
  const inputBase = `w-full p-3 rounded-xl border text-sm transition outline-none focus:ring-2 focus:ring-brand-500/30
    ${dk
      ? 'bg-dark-base border-dark-border text-slate-100 placeholder-slate-500 focus:border-brand-500'
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-brand-500'
    }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed === 0) return;
    const timestamp = date ? new Date(date).getTime() : Date.now();
    onAdd(parsed, timestamp, note.trim() || undefined);
    setAmount('');
    setDate('');
    setNote('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
          Amount ({currency})
        </label>
        <input
          type="number"
          step="0.01"
          required
          placeholder="e.g. 5 000.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className={inputBase}
        />
      </div>

      <div>
        <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
          Date & Time
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={inputBase}
        />
        <p className={`text-[11px] mt-1 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
          Leave blank to use the current time.
        </p>
      </div>

      <div>
        <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
          Note <span className="normal-case font-normal opacity-60">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. October summary"
          value={note}
          onChange={e => setNote(e.target.value)}
          className={inputBase}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 text-white font-bold bg-brand-600 rounded-xl hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-600/25 text-sm tracking-wide"
      >
        Add Revenue Entry
      </button>
    </form>
  );
};
