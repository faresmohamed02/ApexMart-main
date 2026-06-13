import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTopProducts } from '../hooks/useProducts';
import { Skeleton } from './ui/Skeleton';

export default function TopProducts() {
  const { data, loading } = useTopProducts();

  const maxRevenue = data.length > 0 ? Math.max(...data.map(p => p.revenue)) : 1;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          Top Products
        </h3>
        <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">View all</button>
      </div>

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))
          : data.map((product, i) => (
              <div key={product.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-gray-600 w-5 flex-shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sold.toLocaleString()} sold</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-white">${(product.revenue / 1000).toFixed(1)}k</p>
                    <p className={`text-xs flex items-center justify-end gap-0.5 ${product.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {product.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(product.change)}%
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
