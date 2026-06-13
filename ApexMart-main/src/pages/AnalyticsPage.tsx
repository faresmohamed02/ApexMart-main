import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon, Download } from 'lucide-react';
import { useMonthlySeries, useCategorySeries, useNewCustomersSeries, useOrderVolumeSeries } from '../hooks/useStats';
import { SkeletonChart } from '../components/ui/Skeleton';
import { ErrorBanner } from '../components/ui/EmptyState';

type Period = '3M' | '6M' | '1Y';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>
      {payload.map((e: { name: string; value: number; color: string }) => (
        <div key={e.name} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-gray-300">{e.name}:</span>
          <span className="text-white font-semibold">{formatter ? formatter(e.value) : e.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('1Y');
  const { data: salesData, loading: salesLoading, error: salesError } = useMonthlySeries(period);
  const { data: catData, loading: catLoading } = useCategorySeries();
  const { data: customersData, loading: customersLoading } = useNewCustomersSeries();
  const { data: volumeData, loading: volumeLoading } = useOrderVolumeSeries();

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Detailed performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {(['3M','6M','1Y'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => exportCSV('revenue.csv', salesData)} className="btn-secondary text-xs h-8 gap-1.5 ml-2">
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Revenue trend */}
      <div className="glass-card p-6">
        {salesError && <ErrorBanner message={salesError} />}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h3 className="text-base font-semibold text-white">Revenue vs Expenses</h3>
        </div>
        {salesLoading ? <div className="h-72 animate-pulse bg-gray-800 rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={288}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip formatter={(v: number) => `$${v.toLocaleString()}`} />} />
              <Legend formatter={v => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#ag1)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#3b82f6" strokeWidth={2.5} fill="url(#ag2)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category donut */}
        {catLoading ? <SkeletonChart /> : (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon size={16} className="text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Revenue by Category</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catData} dataKey="sales" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#fff' }} />
                <Legend formatter={v => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* New customers — real DB data */}
        {customersLoading ? <SkeletonChart /> : (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-base font-semibold text-white">New Customers</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={customersData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="customers" name="New Customers" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Order volume by day & time — real DB data */}
      {volumeLoading ? <SkeletonChart /> : (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Order Volume by Day & Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={volumeData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={v => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="morning" name="Morning" fill="#34d399" radius={[3,3,0,0]} maxBarSize={18} />
              <Bar dataKey="afternoon" name="Afternoon" fill="#10b981" radius={[3,3,0,0]} maxBarSize={18} />
              <Bar dataKey="evening" name="Evening" fill="#065f46" radius={[3,3,0,0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
