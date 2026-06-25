import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { GraphPoint, Transaction } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  points: GraphPoint[];
  transactions: Transaction[];
  currency: string;
  thisTimeIncome: number;
  allTimeIncome: number;
  txCount: number;
  darkMode: boolean;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1.5 font-semibold">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-mono font-bold" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
};

// ---- Build "Previous" period graph points ----
// Previous = the previous bi-monthly period before "This Time"
function buildPeriodPoints(transactions: Transaction[]): {
  thisTimePts: { label: string; value: number }[];
  prevTimePts: { label: string; value: number }[];
} {
  const now = new Date();
  const day = now.getDate();
  const isFirst = day <= 15;
  const y = now.getFullYear();
  const m = now.getMonth();

  // Current period
  const curStart = new Date(y, m, isFirst ? 1 : 16).getTime();
  const curEnd = isFirst
    ? new Date(y, m, 15, 23, 59, 59, 999).getTime()
    : new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();

  // Previous period
  let prevStart: number, prevEnd: number;
  if (isFirst) {
    // Previous = 16th–end of last month
    prevEnd = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    prevStart = new Date(y, m - 1, 16).getTime();
  } else {
    // Previous = 1st–15th of this month
    prevStart = new Date(y, m, 1).getTime();
    prevEnd = new Date(y, m, 15, 23, 59, 59, 999).getTime();
  }

  const buildPts = (txs: Transaction[], start: number, end: number) => {
    const inPeriod = txs
      .filter(t => t.timestamp >= start && t.timestamp <= end)
      .sort((a, b) => a.timestamp - b.timestamp);
    let cum = 0;
    return inPeriod.map(tx => {
      cum += tx.amount;
      const d = new Date(tx.timestamp);
      return { label: `${d.getMonth() + 1}/${d.getDate()}`, value: cum };
    });
  };

  return {
    thisTimePts: buildPts(transactions.filter(t => !t.isArchived), curStart, curEnd),
    prevTimePts: buildPts(transactions, prevStart, prevEnd),
  };
}

// ---- Build 15-day buckets for bar chart (this, previous, before-last) ----
function buildFifteenDayBuckets(transactions: Transaction[]) {
  if (!transactions.length) return [];

  const dailyMap: Record<string, number> = {};
  transactions.forEach(tx => {
    const d = new Date(tx.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    dailyMap[key] = (dailyMap[key] ?? 0) + tx.amount;
  });

  const days = Object.keys(dailyMap).sort();
  if (!days.length) return [];

  const buckets: { label: string; total: number; idx: number }[] = [];
  let windowStart = new Date(days[0]);
  let idx = 0;

  while (true) {
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 14);

    const inWindow = days.filter(d => {
      const dt = new Date(d);
      return dt >= windowStart && dt <= windowEnd;
    });

    if (!inWindow.length) break;

    const total = inWindow.reduce((sum, d) => sum + dailyMap[d], 0);
    const label = `${windowStart.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}–${windowEnd.toLocaleDateString('en-PH', { day: 'numeric' })}`;
    buckets.push({ label, total, idx });
    idx++;

    windowStart = new Date(windowEnd);
    windowStart.setDate(windowStart.getDate() + 1);
    if (windowStart > new Date(days[days.length - 1])) break;
  }

  // Map last 3 buckets as: before-last, previous, this-time
  const result = buckets.slice(-3);
  return result.map((b, i) => {
    const keys = ['beforeLast', 'previous', 'thisTime'];
    return { label: b.label, [keys[i]]: b.total };
  });
}

// ---- Merge line chart data for 3 series: This Time, Previous, All Time ----
function buildComparisonLineData(
  points: GraphPoint[],
  thisTimePts: { label: string; value: number }[],
  prevTimePts: { label: string; value: number }[]
) {
  // Use allTime/thisTime from graphPoints, plus previous from prevTimePts
  // We'll show them as separate indexed series on a unified index
  const maxLen = Math.max(points.length, thisTimePts.length, prevTimePts.length, 1);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const entry: Record<string, number | string> = { idx: i };
    if (i < points.length) {
      entry.label = points[i].label;
      entry.allTime = points[i].allTime;
      entry.thisTime = points[i].thisTime;
    }
    if (i < prevTimePts.length) {
      entry.previous = prevTimePts[i].value;
    }
    result.push(entry);
  }
  return result;
}

export const IncomeGraph: React.FC<Props> = ({
  points,
  transactions,
  currency,
  thisTimeIncome,
  allTimeIncome,
  txCount,
  darkMode,
}) => {
  const dk = darkMode;
  const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');

  if (points.length === 0) return null;

  const avgPerTx = txCount > 0 ? thisTimeIncome / txCount : 0;
  const gridColor = dk ? '#2a2a38' : '#f1f5f9';
  const textColor = dk ? '#64748b' : '#94a3b8';

  const { thisTimePts, prevTimePts } = buildPeriodPoints(transactions);
  const lineData = buildComparisonLineData(points, thisTimePts, prevTimePts);
  const barData = buildFifteenDayBuckets(transactions);

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${dk ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-100'}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
            Income Growth
          </p>
          <p className={`text-sm font-semibold ${dk ? 'text-slate-200' : 'text-slate-700'}`}>
            {chartType === 'line' ? 'Period Comparison' : '15-Day Buckets'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`text-right text-[11px] ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
            <p>Avg/entry <span className={`font-mono font-bold ${dk ? 'text-slate-300' : 'text-slate-600'}`}>{formatCurrency(avgPerTx, currency)}</span></p>
            <p>{txCount} transaction{txCount !== 1 ? 's' : ''}</p>
          </div>
          {/* Chart type toggle */}
          <div className={`flex rounded-lg overflow-hidden border text-[10px] font-bold uppercase tracking-wider ${dk ? 'border-dark-border' : 'border-slate-200'}`}>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1.5 transition ${chartType === 'line' ? 'bg-brand-600 text-white' : dk ? 'bg-dark-base text-slate-500 hover:text-slate-300' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >Line</button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1.5 transition ${chartType === 'bar' ? 'bg-brand-600 text-white' : dk ? 'bg-dark-base text-slate-500 hover:text-slate-300' : 'bg-white text-slate-400 hover:text-slate-600'}`}
            >Bar</button>
          </div>
        </div>
      </div>

      {/* Line Chart — This Time vs Previous vs All Time */}
      {chartType === 'line' ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: textColor, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v) => `${currency}${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: textColor }}
              formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="allTime"
              name="All Time"
              stroke="#4040ef"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#4040ef', strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="thisTime"
              name="This Time"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Previous"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        /* Thin Bar Chart — This Time, Previous, Before Last (last 3 × 15-day buckets) */
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={barData}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            barCategoryGap="35%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: textColor, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={54}
              tickFormatter={(v) => `${currency}${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-dark-card border border-dark-border rounded-xl px-3 py-2 shadow-xl text-xs">
                    <p className="text-slate-400 mb-1.5 font-semibold">{label}</p>
                    {payload.map(p => (
                      <p key={p.name} className="font-mono font-bold" style={{ color: p.color }}>
                        {p.name}: {formatCurrency(p.value as number, currency)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: textColor }}
              formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
            />
            <Bar dataKey="beforeLast" name="Before Last" fill="#64748b" radius={[3,3,0,0]} maxBarSize={18} />
            <Bar dataKey="previous" name="Previous" fill="#f59e0b" radius={[3,3,0,0]} maxBarSize={18} />
            <Bar dataKey="thisTime" name="This Time" fill="#10b981" radius={[3,3,0,0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary pills */}
      <div className={`mt-4 pt-4 border-t grid grid-cols-3 gap-2 ${dk ? 'border-dark-border' : 'border-slate-100'}`}>
        <div className={`rounded-xl p-3 ${dk ? 'bg-dark-base' : 'bg-slate-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>This Time</p>
          <p className="font-mono font-bold text-emerald-500 text-sm">{formatCurrency(thisTimeIncome, currency)}</p>
        </div>
        <div className={`rounded-xl p-3 ${dk ? 'bg-dark-base' : 'bg-slate-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Previous</p>
          <p className="font-mono font-bold text-amber-500 text-sm">
            {formatCurrency(prevTimePts.at(-1)?.value ?? 0, currency)}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${dk ? 'bg-dark-base' : 'bg-slate-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>All Time</p>
          <p className="font-mono font-bold text-brand-500 text-sm">{formatCurrency(allTimeIncome, currency)}</p>
        </div>
      </div>
    </div>
  );
};
