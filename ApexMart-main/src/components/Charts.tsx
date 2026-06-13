import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { useMonthlySeries, useCategorySeries } from '../hooks/useStats';
import { SkeletonChart } from './ui/Skeleton';
import { ErrorBanner } from './ui/EmptyState';

type Period = '3M' | '6M' | '1Y';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-semibold">{formatter ? formatter(entry.value) : entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function Charts() {
  const [period, setPeriod] = useState<Period>('1Y');
  const { data: salesData, loading: salesLoading, error: salesError } = useMonthlySeries(period);
  const { data: catData, loading: catLoading, error: catError } = useCategorySeries();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Area Chart */}
      <div className="xl:col-span-2 glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              Revenue vs Expenses
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Performance over selected period</p>
          </div>
          <div className="flex items-center gap-1">
            {(['3M','6M','1Y'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {salesError && <ErrorBanner message={salesError} />}
        {salesLoading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="w-full h-full animate-pulse bg-gray-800 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Expenses</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip formatter={(v: number) => `$${v.toLocaleString()}`} />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#022c22', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gExp)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#1e3a5f', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Bar Chart */}
      {catLoading ? <SkeletonChart /> : (
        <div className="glass-card p-6">
          {catError && <ErrorBanner message={catError} />}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart2 size={16} className="text-emerald-400" />
              Category Sales
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Sales vs returns by category</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={catData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal vertical={false} />
              <XAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[4,4,0,0]} maxBarSize={20} />
              <Bar dataKey="returns" name="Returns" fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
