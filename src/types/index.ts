// ============================================================
// CORE DATA TYPES
// ============================================================

/** A single recorded income transaction */
export interface Transaction {
  id: string;
  timestamp: number;           // Unix ms
  persons: number;             // Number of persons (0 if manual entry)
  rate: number;                // Rate per person at time of entry (0 if manual)
  amount: number;              // Final computed amount
  isArchived: boolean;         // True if moved to All Time via "Reset This Time"
  isManual: boolean;           // True if added as custom revenue (not persons × rate)
  note?: string;               // Optional note / label on the transaction
}

/** User-adjustable global settings */
export interface Settings {
  rate: number;                // Default rate per person
  currency: string;            // Currency symbol, e.g. "₱"
  darkMode: boolean;
  personLabel: string;         // What "persons" is called, e.g. "persons" or "customers"
  userName: string;            // User's display name/nickname
  bgColor: string;             // Custom background color (hex)
}

/** Shape of the JSON file exported / imported by the user */
export interface ExportPayload {
  version: 1;
  exportedAt: string;          // ISO date string
  transactions: Transaction[];
  settings: Settings;
}

/** One data point for the income graph */
export interface GraphPoint {
  label: string;               // Display label on X axis
  thisTime: number;            // Cumulative "this time" income
  allTime: number;             // Cumulative all-time income
  timestamp: number;
}

/** Return type of the bi-monthly cutoff calculation */
export interface CutoffPeriod {
  label: string;               // "1st – 15th" or "16th – End of Month"
  start: number;               // Unix ms of period start
  end: number;                 // Unix ms of period end
  amount: number;              // Earnings in period (active transactions only)
}
