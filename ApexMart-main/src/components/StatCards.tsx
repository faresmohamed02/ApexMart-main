import { DollarSign, TrendingUp, Users, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useAppContext } from '../context/AppContext';
import { SkeletonCard } from './ui/Skeleton';
import { ErrorBanner } from './ui/EmptyState';

export default function StatCards() {
  const { state } = useAppContext();
  const { stats, loading, error, refetch } = useStats(state.dateRange);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />;
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$0',
      change: stats?.revenueChange ?? 0,
      icon: DollarSign,
      gradient: 'from-emerald-500/20 to-emerald-500/0',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Monthly Sales',
      value: stats ? `$${stats.monthlySales.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$0',
      change: stats?.salesChange ?? 0,
      icon: TrendingUp,
      gradient: 'from-blue-500/20 to-blue-500/0',
      iconBg: 'bg-blue-500/10 text-blue-400',
    },
    {
      title: 'New Customers',
      value: stats ? stats.activeUsers.toString() : '0',
      change: stats?.usersChange ?? 0,
      icon: Users,
      gradient: 'from-sky-500/20 to-sky-500/0',
      iconBg: 'bg-sky-500/10 text-sky-400',
    },
    {
      title: 'Conversion Rate',
      value: stats ? `${stats.conversionRate}%` : '0%',
      change: stats?.conversionChange ?? 0,
      icon: Percent,
      gradient: 'from-amber-500/20 to-amber-500/0',
      iconBg: 'bg-amber-500/10 text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        return (
          <div key={card.title} className="stat-card group">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 rounded-2xl pointer-events-none`} />
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(card.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-600">
                  <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                    {isPositive ? '+' : ''}{card.change}%
                  </span>{' '}vs previous period
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
