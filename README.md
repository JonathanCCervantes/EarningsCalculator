# 💼 Earnings Wallet

A fast, offline-first per-person income calculator styled like a wallet. Built with React + TypeScript + Vite + Tailwind CSS.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Standard Batch** | Numpad input → persons × rate = income added instantly |
| **Manual / Previous Entry** | Add past revenue with custom date, time & note |
| **Editable History** | Edit persons, rate, amount, date/time or note inline |
| **Deletable Entries** | Remove any transaction with one tap |
| **This Time vs All Time** | Reset "This Time" balance without touching All Time data |
| **Bi-monthly Cutoff** | Automatic earnings summary for 1st–15th and 16th–End of Month |
| **Income Graph** | Cumulative area chart of This Time and All Time earnings |
| **Persistent Storage** | All data saved to `localStorage` — survives tab/window close |
| **Export JSON** | Full data export for backup or transfer |
| **Export CSV** | Spreadsheet-friendly transaction log |
| **Import JSON** | Restore from any previous export |
| **Dark / Light Mode** | Toggle in header, respects preference |
| **Customizable Rate** | Editable rate per person in Settings |
| **Customizable Currency** | Change the currency symbol (default: ₱) |
| **Customizable Person Label** | Rename "persons" to "customers", "heads", etc. |
| **Decimal Support** | Input supports fractional persons (e.g. 1.5) |
| **Responsive UI** | Works on mobile, tablet, and desktop |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- npm ≥ 9

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is in `/dist`.

### Preview Production Build

```bash
npm run preview
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project**.
3. Import your GitHub repository.
4. Vercel auto-detects Vite — no configuration needed.
5. Click **Deploy**. Your app is live in ~30 seconds.

> **Framework preset:** Vite  
> **Build command:** `npm run build`  
> **Output directory:** `dist`

---

## 🎨 Web Icon / Favicon

The favicon is an SVG file at `public/wallet-icon.svg`. To change it:

1. Replace `/public/wallet-icon.svg` with your own icon.
2. For PNG or ICO, edit the `<link rel="icon">` line in `index.html`.
3. For Apple home screen icon, add a `apple-touch-icon.png` (180×180px) to `/public/`.

Recommended tools:
- [favicon.io](https://favicon.io) — generate from emoji, text, or image
- [realfavicongenerator.net](https://realfavicongenerator.net) — multi-platform icon generator

---

## 🗂️ Project Structure

```
wallet-calculator/
├── public/
│   └── wallet-icon.svg          # App favicon (replace to customize)
├── src/
│   ├── components/
│   │   ├── BalanceCard.tsx      # Main wallet balance display
│   │   ├── NumpadCalculator.tsx # Numpad input for standard batch
│   │   ├── ManualEntry.tsx      # Form for custom revenue entries
│   │   ├── TransactionHistory.tsx # Editable transaction list
│   │   ├── IncomeGraph.tsx      # Recharts area chart
│   │   └── SettingsPanel.tsx    # Settings + data export/import
│   ├── hooks/
│   │   └── useWalletState.ts    # All state, persistence, and actions
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── index.ts             # Formatting, storage, CSV/JSON export
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind + global styles
├── index.html                   # HTML shell (favicon config here)
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🧠 Logic Reference

```
Standard Batch:
  persons (input) × rate (settings) = amount added

This Time Income:
  sum of all non-archived transaction amounts

All Time Income:
  sum of ALL transaction amounts (including archived)

Bi-monthly Period:
  1st–15th  → shows earnings from the 1st to the 15th of current month
  16th–End  → shows earnings from the 16th to the last day of current month

Reset "This Time":
  marks all active transactions as `isArchived = true`
  → thisTimeIncome resets to ₱0
  → allTimeIncome is unchanged

Factory Reset:
  deletes ALL transactions permanently
```

---

## 📦 Tech Stack

- [React 18](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Recharts 2](https://recharts.org/) — for the income graph
- [Lucide React](https://lucide.dev/) — icons

---

## 📄 License

MIT — free to use, modify, and deploy.
