import React, { useState } from 'react';
import type { Transaction, Settings } from '../types';
import { formatCurrency, formatDateTime, toDatetimeLocal } from '../utils';

interface Props {
  transactions: Transaction[];
  settings: Settings;
  onEdit: (id: string, updates: Partial<Pick<Transaction, 'persons' | 'rate' | 'amount' | 'timestamp' | 'note'>>) => void;
  onDelete: (id: string) => void;
}

// -------- Icons --------
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// -------- Inline Editor --------
interface EditRowProps {
  tx: Transaction;
  dk: boolean;
  personLabel: string;
  onSave: (updates: Partial<Pick<Transaction, 'persons' | 'rate' | 'amount' | 'timestamp' | 'note'>>) => void;
  onCancel: () => void;
}

const EditRow: React.FC<EditRowProps> = ({ tx, dk, personLabel, onSave, onCancel }) => {
  const [persons, setPersons] = useState(String(tx.persons));
  const [rate, setRate] = useState(String(tx.rate));
  const [amount, setAmount] = useState(String(tx.amount));
  const [dateStr, setDateStr] = useState(toDatetimeLocal(tx.timestamp));
  const [note, setNote] = useState(tx.note ?? '');

  const inputCls = `w-full p-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 
    ${dk
      ? 'bg-dark-base border-dark-border text-slate-100 focus:border-brand-500'
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand-500'
    }`;

  const handleSave = () => {
    const ts = new Date(dateStr).getTime();
    if (tx.isManual) {
      onSave({ amount: parseFloat(amount) || tx.amount, timestamp: ts, note: note.trim() || undefined });
    } else {
      const p = parseFloat(persons) || tx.persons;
      const r = parseFloat(rate) || tx.rate;
      onSave({ persons: p, rate: r, amount: p * r, timestamp: ts, note: note.trim() || undefined });
    }
  };

  return (
    <div className="space-y-2.5 pt-1">
      {tx.isManual ? (
        <div>
          <label className={`text-[10px] uppercase tracking-widest font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Amount</label>
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`text-[10px] uppercase tracking-widest font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>{personLabel}</label>
            <input type="number" step="0.01" value={persons} onChange={e => setPersons(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={`text-[10px] uppercase tracking-widest font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Rate</label>
            <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className={inputCls} />
          </div>
        </div>
      )}
      <div>
        <label className={`text-[10px] uppercase tracking-widest font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Date & Time</label>
        <input type="datetime-local" value={dateStr} onChange={e => setDateStr(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={`text-[10px] uppercase tracking-widest font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Note</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note" className={inputCls} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${dk ? 'bg-dark-muted hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
          <XIcon /> Cancel
        </button>
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition">
          <CheckIcon /> Save
        </button>
      </div>
    </div>
  );
};

// -------- Main Component --------
export const TransactionHistory: React.FC<Props> = ({ transactions, settings, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const dk = settings.darkMode;

  // Filter transactions by search query
  const filtered = transactions.filter(tx => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const dateStr = new Date(tx.timestamp).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).toLowerCase();
    const label = tx.isManual
      ? (tx.note ?? 'manual revenue').toLowerCase()
      : `${tx.persons} ${settings.personLabel}`.toLowerCase();
    const amount = tx.amount.toFixed(2);
    const persons = String(tx.persons);
    return (
      dateStr.includes(q) ||
      label.includes(q) ||
      amount.includes(q) ||
      persons.includes(q)
    );
  });

  if (transactions.length === 0) {
    return (
      <div className={`p-8 text-center rounded-2xl border border-dashed ${dk ? 'border-dark-border text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <p className="text-sm">No transactions recorded yet.</p>
        <p className="text-xs mt-1 opacity-70">Add a batch above to get started.</p>
      </div>
    );
  }

  return (
    // Center content on tablet & mobile, normal on large screens
    <div className="space-y-2.5 lg:mx-0 mx-auto max-w-lg lg:max-w-none">
      {/* Search bar */}
      <div className="relative">
        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by date, persons, order name, amount…"
          className={`w-full pl-8 pr-3 py-2 rounded-xl border text-[12px] outline-none focus:ring-2 focus:ring-brand-500/30 transition
            ${dk
              ? 'bg-dark-base border-dark-border text-slate-100 placeholder-slate-600 focus:border-brand-500'
              : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-400'
            }`}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded ${dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
          >✕</button>
        )}
      </div>

      {/* Scrollable list — 9 rows visible */}
      <div className="overflow-y-auto max-h-[calc(9*5.25rem)] pr-0.5 space-y-2.5 scrollbar-thin">

        {filtered.map(tx => {
          const isEditing = editingId === tx.id;
          const isArchived = tx.isArchived;

          return (
            <div
              key={tx.id}
              className={`rounded-xl border p-4 transition-all
                ${isArchived ? 'opacity-50' : ''}
                ${dk ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-100 shadow-sm'}
              `}
            >
              {isEditing ? (
                <EditRow
                  tx={tx}
                  dk={dk}
                  personLabel={settings.personLabel}
                  onSave={(updates) => {
                    onEdit(tx.id, updates);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-3">
                  {/* Avatar badge */}
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${isArchived ? (dk ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400')
                      : tx.isManual
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-brand-500/10 text-brand-500'}`}
                  >
                    {tx.isManual ? 'M' : tx.persons}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${dk ? 'text-slate-100' : 'text-slate-800'}`}>
                      {tx.isManual
                        ? (tx.note ?? 'Manual Revenue')
                        : `${tx.persons} ${settings.personLabel} × ${formatCurrency(tx.rate, settings.currency)}`}
                      {isArchived && (
                        <span className={`ml-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${dk ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          Archived
                        </span>
                      )}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatDateTime(tx.timestamp)}
                    </p>
                  </div>

                  {/* Amount + actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className={`font-mono text-sm font-bold ${isArchived ? (dk ? 'text-slate-500' : 'text-slate-400') : 'text-emerald-500'}`}>
                      +{formatCurrency(tx.amount, settings.currency)}
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingId(tx.id)}
                        className={`p-1.5 rounded-lg transition ${dk ? 'text-slate-500 hover:text-brand-400 hover:bg-brand-500/10' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this transaction?')) onDelete(tx.id);
                        }}
                        className={`p-1.5 rounded-lg transition ${dk ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* No search results message */}
        {filtered.length === 0 && search && (
          <div className={`p-6 text-center text-sm rounded-xl border border-dashed ${dk ? 'border-dark-border text-slate-600' : 'border-slate-200 text-slate-400'}`}>
            No results for "<span className="font-semibold">{search}</span>"
          </div>
        )}

      </div>{/* end scrollable */}
    </div>
  );
};
