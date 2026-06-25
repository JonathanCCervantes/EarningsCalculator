import React, { useState, useEffect, useRef } from 'react';
import { useWalletState } from './hooks/useWalletState';
import { BalanceCard } from './components/BalanceCard';
import { NumpadCalculator } from './components/NumpadCalculator';
import { ManualEntry } from './components/ManualEntry';
import { TransactionHistory } from './components/TransactionHistory';
import { IncomeGraph } from './components/IncomeGraph';
import { SettingsPanel } from './components/SettingsPanel';

// -------- Header icons --------
const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2m-4.93-7.07-1.41 1.41M6.34 17.66l-1.41 1.41"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// -------- Tab type --------
type Tab = 'standard' | 'manual';

// -------- Live date hook --------
function useLiveDate() {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }));
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);
  return dateStr;
}

// -------- Name Modal --------
interface NameModalProps {
  darkMode: boolean;
  onConfirm: (name: string) => void;
  onSkip: () => void;
}
const NameModal: React.FC<NameModalProps> = ({ darkMode: dk, onConfirm, onSkip }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 ${dk ? 'bg-dark-surface border border-dark-border' : 'bg-white border border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0">
            <WalletIcon />
          </div>
          <div>
            <h2 className={`text-base font-bold ${dk ? 'text-slate-100' : 'text-slate-800'}`}>Welcome!</h2>
            <p className={`text-xs ${dk ? 'text-slate-400' : 'text-slate-500'}`}>What should we call you?</p>
          </div>
        </div>
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
            Your Name / Nickname
          </label>
          <input
            type="text"
            autoFocus
            placeholder="e.g. Jon, Boss, Admin…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirm(name.trim() || 'User'); }}
            maxLength={30}
            className={`w-full p-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500/30 transition
              ${dk ? 'bg-dark-base border-dark-border text-slate-100 focus:border-brand-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand-500'}`}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onSkip}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${dk ? 'bg-dark-muted text-slate-400 hover:bg-dark-border' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Skip for now
          </button>
          <button
            onClick={() => onConfirm(name.trim() || 'User')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition"
          >
            Set up ✓
          </button>
        </div>
        <p className={`text-[10px] text-center ${dk ? 'text-slate-600' : 'text-slate-400'}`}>
          You can always change this in Settings
        </p>
      </div>
    </div>
  );
};

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const {
    transactions,
    settings,
    activeTxs,
    thisTimeIncome,
    allTimeIncome,
    cutoff,
    graphPoints,
    addStandard,
    addManual,
    editTransaction,
    deleteTransaction,
    resetThisTime,
    resetAllTime,
    importPayload,
    updateSettings,
    hydrated,
  } = useWalletState();

  const [activeTab, setActiveTab] = useState<Tab>('standard');
  const [showSettings, setShowSettings] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const liveDate = useLiveDate();

  const dk = settings.darkMode;

  // Show name modal on first load if no name set
  useEffect(() => {
    if (hydrated && !settings.userName) {
      setShowNameModal(true);
    }
  }, [hydrated]);

  // Close settings when clicking outside
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      if (
        settingsRef.current && !settingsRef.current.contains(e.target as Node) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings]);

  // Apply custom bg color
  const bgStyle = settings.bgColor
    ? { backgroundColor: settings.bgColor }
    : {};

  const displayName = settings.userName || 'User';

  // Confirm wrappers
  const handleResetThisTime = () => {
    if (confirm("Reset \"This Time\" balance to ₱0?\n\nYour history stays in All Time. This action archives active transactions but doesn't delete them.")) {
      resetThisTime();
    }
  };

  const handleResetAllTime = () => {
    if (confirm("⚠️ Factory Reset — permanently delete ALL transaction data?\n\nThis cannot be undone. Export a backup first if needed.")) {
      resetAllTime();
    }
  };

  const handleNameConfirm = (name: string) => {
    updateSettings({ userName: name });
    setShowNameModal(false);
  };

  const handleNameSkip = () => {
    updateSettings({ userName: 'User' });
    setShowNameModal(false);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        settings.bgColor ? '' : dk ? 'bg-dark-base text-slate-100' : 'bg-slate-100 text-slate-800'
      } ${dk ? 'text-slate-100' : 'text-slate-800'}`}
      style={bgStyle}
    >
      {/* Name Modal */}
      {showNameModal && (
        <NameModal darkMode={dk} onConfirm={handleNameConfirm} onSkip={handleNameSkip} />
      )}

      {/* ---- Header ---- */}
      <header className={`sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b shadow-sm
        ${dk ? 'bg-dark-surface border-dark-border' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center gap-2.5">
          {/* Brand mark */}
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0">
            <WalletIcon />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className={`font-bold text-sm tracking-tight ${dk ? 'text-slate-100' : 'text-slate-800'}`}>
              Hey, {displayName}!
            </span>
            <span className={`text-[10px] ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
              Earnings Calculator
            </span>
          </div>
          {/* Green animated ping — online indicator */}
          <span className="relative flex h-2.5 w-2.5 hidden sm:inline-flex ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live date display */}
          <span className={`text-[11px] font-semibold hidden md:block ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
            {liveDate}
          </span>
          {/* Dark mode toggle */}
          <button
            onClick={() => updateSettings({ darkMode: !dk })}
            className={`p-2 rounded-xl transition ${dk ? 'bg-dark-muted text-slate-300 hover:bg-dark-border' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            aria-label="Toggle dark mode"
          >
            {dk ? <SunIcon /> : <MoonIcon />}
          </button>
          {/* Settings toggle */}
          <button
            ref={settingsBtnRef}
            onClick={() => setShowSettings(s => !s)}
            className={`p-2 rounded-xl transition ${showSettings
              ? 'bg-brand-600 text-white'
              : dk ? 'bg-dark-muted text-slate-300 hover:bg-dark-border' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* ---- Settings Drawer — animated dropdown ---- */}
      <div
        ref={settingsRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${showSettings ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ pointerEvents: showSettings ? 'auto' : 'none' }}
      >
        <SettingsPanel
          settings={settings}
          transactions={transactions}
          onUpdate={updateSettings}
          onImport={importPayload}
          darkMode={dk}
          onShowNameModal={() => setShowNameModal(true)}
        />
      </div>

      {/* ---- Main content ---- */}
      <main className="max-w-7xl mx-auto px-4 py-5 pb-16">

        {/* Balance Card — full width */}
        <div className="mb-5">
          <BalanceCard
            thisTimeIncome={thisTimeIncome}
            allTimeIncome={allTimeIncome}
            cutoff={cutoff}
            currency={settings.currency}
            darkMode={dk}
            onResetThisTime={handleResetThisTime}
            onResetAllTime={handleResetAllTime}
          />
        </div>

        {/* Two-column on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* LEFT COLUMN — Calculator */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-5">

            {/* Input area with tabs */}
            <div className={`rounded-2xl overflow-hidden border shadow-sm
              ${dk ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-100'}`}
            >
              {/* Tab row */}
              <div className={`flex border-b ${dk ? 'border-dark-border' : 'border-slate-100'}`}>
                {(['standard', 'manual'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition
                      ${activeTab === tab
                        ? 'text-brand-500 border-b-2 border-brand-500'
                        : dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {tab === 'standard' ? 'Standard Batch' : 'Manual / Previous'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'standard' ? (
                <NumpadCalculator
                  rate={settings.rate}
                  currency={settings.currency}
                  personLabel={settings.personLabel}
                  darkMode={dk}
                  onAdd={addStandard}
                />
              ) : (
                <ManualEntry
                  currency={settings.currency}
                  darkMode={dk}
                  onAdd={addManual}
                />
              )}
            </div>

            {/* Income Graph — below calculator on all screens */}
            {graphPoints.length > 1 && (
              <IncomeGraph
                points={graphPoints}
                transactions={transactions}
                currency={settings.currency}
                thisTimeIncome={thisTimeIncome}
                allTimeIncome={allTimeIncome}
                txCount={activeTxs.length}
                darkMode={dk}
              />
            )}
          </div>

          {/* RIGHT COLUMN — Transaction History */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-[10px] font-bold uppercase tracking-widest ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                Transaction History
              </h2>
              <span className={`text-[10px] font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                {transactions.length} record{transactions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <TransactionHistory
              transactions={transactions}
              settings={settings}
              onEdit={editTransaction}
              onDelete={deleteTransaction}
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 px-4 text-center text-[11px] ${dk ? 'border-dark-border text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        Made with Claude.&nbsp; All your data stays safely saved within your web browser.&nbsp;
        Vibe coded by&nbsp;
        <a
          href="https://www.linkedin.com/in/jonathan-cervantes-878484315"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-400 font-semibold underline underline-offset-2 transition"
        >
          Jonathan Cervantes
        </a>
      </footer>

    </div>
  );
}
