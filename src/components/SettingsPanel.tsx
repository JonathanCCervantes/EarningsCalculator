import React, { useRef } from 'react';
import type { Settings } from '../types';
import { exportJSON, exportCSV } from '../utils';
import type { Transaction } from '../types';

interface Props {
  settings: Settings;
  transactions: Transaction[];
  onUpdate: (patch: Partial<Settings>) => void;
  onImport: (raw: string) => boolean;
  darkMode: boolean;
  onShowNameModal: () => void;
}

// -------- Icons --------
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const CsvIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

export const SettingsPanel: React.FC<Props> = ({ settings, transactions, onUpdate, onImport, onShowNameModal }) => {
  const dk = settings.darkMode;
  const fileRef = useRef<HTMLInputElement>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const inputCls = `w-full p-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 transition
    ${dk
      ? 'bg-dark-base border-dark-border text-slate-100 focus:border-brand-500'
      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand-500'
    }`;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const ok = onImport(raw);
      if (!ok) alert('Invalid file format. Please import a valid Earnings Wallet JSON export.');
      else alert('Data imported successfully!');
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  // CSV import: parse and add transactions
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      try {
        const lines = raw.split('\n').filter(l => l.trim());
        if (lines.length < 2) { alert('CSV appears empty.'); return; }
        // Build a fake JSON payload to import via onImport
        // We'll wrap in a JSON object manually here since onImport expects JSON
        const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        const amountIdx = header.findIndex(h => h.includes('amount'));
        const dateIdx = header.findIndex(h => h.includes('date'));
        const typeIdx = header.findIndex(h => h.includes('type'));
        const noteIdx = header.findIndex(h => h.includes('note') || h.includes('persons'));

        if (amountIdx < 0) { alert('CSV must have an "Amount" column.'); return; }

        const txs = lines.slice(1).map((line, i) => {
          const cols = line.match(/(".*?"|[^,]+)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) ?? [];
          const rawAmount = (cols[amountIdx] ?? '0').replace(/[^0-9.-]/g, '');
          const amount = parseFloat(rawAmount) || 0;
          let timestamp = Date.now() - i * 60000;
          if (dateIdx >= 0 && cols[dateIdx]) {
            const parsed = Date.parse(cols[dateIdx]);
            if (!isNaN(parsed)) timestamp = parsed;
          }
          const isManual = typeIdx >= 0 ? (cols[typeIdx] ?? '').toLowerCase() !== 'standard' : true;
          const note = noteIdx >= 0 ? cols[noteIdx] : undefined;
          return {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + i,
            timestamp,
            persons: 0,
            rate: 0,
            amount,
            isArchived: false,
            isManual,
            note: note || undefined,
          };
        }).filter(t => t.amount > 0);

        const payload = JSON.stringify({ transactions: txs, settings });
        const ok = onImport(payload);
        if (!ok) alert('Failed to import CSV data.');
        else alert(`Imported ${txs.length} transaction(s) from CSV.`);
      } catch {
        alert('Could not parse CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
    if (csvFileRef.current) csvFileRef.current.value = '';
  };

  return (
    <div className={`border-b px-4 py-5 space-y-5 ${dk ? 'bg-dark-surface border-dark-border' : 'bg-white border-slate-100'}`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
        Settings
      </h3>

      {/* Profile settings */}
      <div>
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
          Profile
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
              Display Name
            </label>
            <input
              type="text"
              maxLength={30}
              value={settings.userName}
              onChange={e => onUpdate({ userName: e.target.value })}
              placeholder="Your name / nickname"
              className={inputCls}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.bgColor || '#f1f5f9'}
                onChange={e => onUpdate({ bgColor: e.target.value })}
                className="w-10 h-10 rounded-xl border-2 cursor-pointer"
                style={{ borderColor: dk ? '#2a2a38' : '#e2e8f0', padding: '2px' }}
              />
              <div className="flex-1">
                <input
                  type="text"
                  maxLength={7}
                  value={settings.bgColor || ''}
                  onChange={e => onUpdate({ bgColor: e.target.value })}
                  placeholder="#ffffff"
                  className={inputCls}
                />
              </div>
              {settings.bgColor && (
                <button
                  onClick={() => onUpdate({ bgColor: '' })}
                  title="Reset background color"
                  className={`px-2 py-2.5 rounded-xl text-xs font-semibold transition ${dk ? 'bg-dark-muted text-slate-400 hover:bg-dark-border' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >✕</button>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onShowNameModal}
          className={`mt-2 text-[11px] font-semibold text-brand-500 hover:text-brand-400 transition`}
        >
          ↺ Re-run name setup
        </button>
      </div>

      {/* Calculator settings */}
      <div>
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
          Calculator
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
              Rate per person
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.rate}
              onChange={e => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
              Currency symbol
            </label>
            <input
              type="text"
              maxLength={5}
              value={settings.currency}
              onChange={e => onUpdate({ currency: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="col-span-2">
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
              Person label (e.g. "customers", "heads")
            </label>
            <input
              type="text"
              value={settings.personLabel}
              onChange={e => onUpdate({ personLabel: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Data actions */}
      <div>
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
          Data Export
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => exportJSON(transactions, settings)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition
              ${dk ? 'bg-dark-muted text-brand-400 hover:bg-dark-border' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
          >
            <DownloadIcon /> Export JSON
          </button>
          <button
            onClick={() => exportCSV(transactions, settings.currency)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition
              ${dk ? 'bg-dark-muted text-emerald-400 hover:bg-dark-border' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
          >
            <DownloadIcon /> Export CSV
          </button>
        </div>
        <p className={`text-[11px] font-semibold uppercase tracking-wider mt-4 mb-2 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
          Data Import
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer
            ${dk ? 'bg-dark-muted text-amber-400 hover:bg-dark-border' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
          >
            <UploadIcon /> Import JSON
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileImport} />
          </label>
          <label className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer
            ${dk ? 'bg-dark-muted text-teal-400 hover:bg-dark-border' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
          >
            <CsvIcon /> Import CSV
            <input ref={csvFileRef} type="file" accept=".csv,.tsv" className="hidden" onChange={handleCsvImport} />
          </label>
        </div>
        <p className={`text-[10px] mt-1.5 ${dk ? 'text-slate-600' : 'text-slate-400'}`}>
          CSV must have: Date, Type, Amount columns. Notes/persons are optional.
        </p>
      </div>
    </div>
  );
};
