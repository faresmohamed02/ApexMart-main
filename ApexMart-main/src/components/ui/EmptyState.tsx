import { type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, PackageSearch, ShoppingCart, Users, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 text-gray-600">
        {icon ?? <PackageSearch size={24} />}
      </div>
      <h3 className="text-sm font-semibold text-gray-300 mb-1">{title}</h3>
      {message && <p className="text-xs text-gray-600 max-w-xs">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-4 text-xs">
          {action.label}
        </button>
      )}
    </div>
  );
}

export function EmptyOrders({ onClear }: { onClear: () => void }) {
  return <EmptyState icon={<ShoppingCart size={24} />} title="No orders found" message="Try adjusting your search or filter." action={{ label: 'Clear filters', onClick: onClear }} />;
}
export function EmptyProducts({ onAdd }: { onAdd: () => void }) {
  return <EmptyState icon={<PackageSearch size={24} />} title="No products yet" message="Add your first product to get started." action={{ label: 'Add product', onClick: onAdd }} />;
}
export function EmptyCustomers() {
  return <EmptyState icon={<Users size={24} />} title="No customers found" message="Try a different search term." />;
}
export function EmptyAnalytics() {
  return <EmptyState icon={<BarChart3 size={24} />} title="No data for this period" message="Try selecting a wider date range." />;
}

interface ErrorBannerProps { message: string; onRetry?: () => void; }

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
      <AlertTriangle size={16} className="flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1.5 text-xs font-medium hover:text-red-300 transition-colors">
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}
