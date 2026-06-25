import type { Transaction, CutoffPeriod, GraphPoint } from '../types';

// ============================================================
// CURRENCY / FORMATTING
// ============================================================

/** Format a number as currency with the given symbol */
export function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a unix timestamp as a human-readable date + time */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Format a timestamp to the datetime-local input value format (YYYY-MM-DDTHH:mm) */
export function toDatetimeLocal(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ============================================================
// ID GENERATION
// ============================================================

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ============================================================
// INCOME CALCULATIONS
// ============================================================

/** Transactions that count toward "This Time" (not archived) */
export function activeTransactions(txs: Transaction[]): Transaction[] {
  return txs.filter(t => !t.isArchived);
}

/** Sum of amount for a list of transactions */
export function sumAmount(txs: Transaction[]): number {
  return txs.reduce((acc, t) => acc + t.amount, 0);
}

/**
 * Calculate the current bi-monthly cutoff period and earnings within it.
 * Periods: 1st–15th and 16th–end-of-month.
 */
export function getCurrentCutoff(txs: Transaction[]): CutoffPeriod {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();
  const isFirst = day <= 15;

  const start = new Date(y, m, isFirst ? 1 : 16).getTime();
  const endDate = isFirst
    ? new Date(y, m, 15, 23, 59, 59, 999)
    : new Date(y, m + 1, 0, 23, 59, 59, 999); // last day of month
  const end = endDate.getTime();

  const periodTxs = activeTransactions(txs).filter(t => t.timestamp >= start && t.timestamp <= end);

  return {
    label: isFirst ? '1st – 15th' : '16th – End of Month',
    start,
    end,
    amount: sumAmount(periodTxs),
  };
}

/**
 * Build graph data points from transactions.
 * Returns one point per transaction sorted chronologically.
 */
export function buildGraphPoints(txs: Transaction[]): GraphPoint[] {
  const sorted = [...txs].sort((a, b) => a.timestamp - b.timestamp);
  let allTimeCumulative = 0;
  let thisTimeCumulative = 0;

  return sorted.map(tx => {
    allTimeCumulative += tx.amount;
    if (!tx.isArchived) thisTimeCumulative += tx.amount;
    const d = new Date(tx.timestamp);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    return {
      label,
      thisTime: thisTimeCumulative,
      allTime: allTimeCumulative,
      timestamp: tx.timestamp,
    };
  });
}

// ============================================================
// LOCAL STORAGE
// ============================================================
const STORAGE_KEY = 'wallet-calc-v1';

export function loadFromStorage(): { transactions: Transaction[]; settings: Partial<import('../types').Settings> } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveToStorage(transactions: Transaction[], settings: import('../types').Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, settings }));
  } catch {
    // Silently fail (e.g. private mode storage quota)
  }
}

// ============================================================
// EXPORT / IMPORT
// ============================================================

export function exportJSON(transactions: Transaction[], settings: import('../types').Settings): void {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `earnings_wallet_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(transactions: Transaction[], currency: string): void {
  const header = ['ID', 'Date', 'Time', 'Type', 'Persons/Note', 'Rate', 'Amount', 'Status'];
  const rows = transactions.map(tx => {
    const d = new Date(tx.timestamp);
    return [
      tx.id,
      d.toLocaleDateString('en-PH'),
      d.toLocaleTimeString('en-PH'),
      tx.isManual ? 'Manual' : 'Standard',
      tx.isManual ? (tx.note ?? 'Manual Entry') : String(tx.persons),
      tx.isManual ? '' : String(tx.rate),
      formatCurrency(tx.amount, currency),
      tx.isArchived ? 'Archived' : 'Active',
    ];
  });
  const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `earnings_wallet_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
