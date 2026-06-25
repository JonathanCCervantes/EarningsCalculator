import { useState, useEffect, useCallback } from 'react';
import type { Transaction, Settings } from '../types';
import {
  loadFromStorage,
  saveToStorage,
  genId,
  activeTransactions,
  sumAmount,
  getCurrentCutoff,
  buildGraphPoints,
} from '../utils';

// ============================================================
// DEFAULT STATE
// ============================================================
const DEFAULT_SETTINGS: Settings = {
  rate: 60,
  currency: '₱',
  darkMode: false,
  personLabel: 'persons',
  userName: '',
  bgColor: '',
};

// ============================================================
// HOOK
// ============================================================
export function useWalletState() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // ---- Load from localStorage on mount ----
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      if (saved.transactions) setTransactions(saved.transactions);
      if (saved.settings) setSettings({ ...DEFAULT_SETTINGS, ...saved.settings });
    }
    setHydrated(true);
  }, []);

  // ---- Persist on every change ----
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(transactions, settings);
  }, [transactions, settings, hydrated]);

  // ---- Dark mode side-effect ----
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // ============================================================
  // DERIVED VALUES
  // ============================================================
  const activeTxs = activeTransactions(transactions);
  const thisTimeIncome = sumAmount(activeTxs);
  const allTimeIncome = sumAmount(transactions);
  const cutoff = getCurrentCutoff(transactions);
  const graphPoints = buildGraphPoints(transactions);

  // ============================================================
  // TRANSACTION ACTIONS
  // ============================================================

  /** Add a standard persons × rate transaction */
  const addStandard = useCallback((persons: number) => {
    const amount = persons * settings.rate;
    const tx: Transaction = {
      id: genId(),
      timestamp: Date.now(),
      persons,
      rate: settings.rate,
      amount,
      isArchived: false,
      isManual: false,
    };
    setTransactions(prev => [tx, ...prev]);
  }, [settings.rate]);

  /** Add a manual / previous-month revenue entry */
  const addManual = useCallback((amount: number, timestamp: number, note?: string) => {
    const tx: Transaction = {
      id: genId(),
      timestamp,
      persons: 0,
      rate: 0,
      amount,
      isArchived: false,
      isManual: true,
      note,
    };
    setTransactions(prev =>
      [tx, ...prev].sort((a, b) => b.timestamp - a.timestamp)
    );
  }, []);

  /** Save edits to an existing transaction */
  const editTransaction = useCallback((
    id: string,
    updates: Partial<Pick<Transaction, 'persons' | 'rate' | 'amount' | 'timestamp' | 'note'>>
  ) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id !== id) return tx;
        const updated = { ...tx, ...updates };
        // Recompute amount for standard entries
        if (!tx.isManual && (updates.persons !== undefined || updates.rate !== undefined)) {
          updated.amount = (updates.persons ?? tx.persons) * (updates.rate ?? tx.rate);
        }
        return updated;
      }).sort((a, b) => b.timestamp - a.timestamp)
    );
  }, []);

  /** Delete a single transaction (with confirm) */
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  /** Archive all active transactions (reset "This Time" balance, keep All Time) */
  const resetThisTime = useCallback(() => {
    setTransactions(prev => prev.map(t => ({ ...t, isArchived: true })));
  }, []);

  /** Permanently delete ALL transactions */
  const resetAllTime = useCallback(() => {
    setTransactions([]);
  }, []);

  /** Import transactions & settings from a JSON export payload */
  const importPayload = useCallback((raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      return true;
    } catch {
      return false;
    }
  }, []);

  // ============================================================
  // SETTINGS ACTIONS
  // ============================================================
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  return {
    // State
    transactions,
    settings,
    hydrated,
    // Derived
    activeTxs,
    thisTimeIncome,
    allTimeIncome,
    cutoff,
    graphPoints,
    // Actions
    addStandard,
    addManual,
    editTransaction,
    deleteTransaction,
    resetThisTime,
    resetAllTime,
    importPayload,
    updateSettings,
  };
}
