import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useCustomers, useCustomerOrders, type CustomersFilter } from '../hooks/useCustomers';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SortableTh } from '../components/ui/SortableTh';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { EmptyCustomers, ErrorBanner } from '../components/ui/EmptyState';
import type { Customer, CustomerStatus } from '../types/database';

const STATUS_FILTERS: (CustomerStatus | 'All')[] = ['All', 'active', 'inactive', 'blocked'];

function CustomerDrawer({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { orders, loading } = useCustomerOrders(customer.id);
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-950 border-l border-gray-800 z-50 flex flex-col overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 sticky top-0 bg-gray-950">
          <h2 className="text-base font-semibold text-white">Customer Profile</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Profile */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-900 border border-gray-800">
            <Avatar initials={customer.avatar_initials} color={customer.avatar_color} size="lg" />
            <div>
              <h3 className="text-base font-semibold text-white">{customer.name}</h3>
              <p className="text-sm text-gray-400">{customer.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
              <div className="mt-2"><StatusBadge status={customer.status} /></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Lifetime Value', value: `$${Number(customer.lifetime_value).toLocaleString()}` },
              { label: 'Total Orders', value: customer.total_orders.toString() },
              { label: 'Member Since', value: new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
              { label: 'Last Order', value: customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never' },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Order history */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order History</p>
            {loading ? <p className="text-sm text-gray-600">Loading…</p> : orders.length === 0
              ? <p className="text-sm text-gray-600">No orders yet</p>
              : (
                <div className="space-y-2">
                  {orders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
                      <div>
                        <p className="text-sm font-medium text-white">{o.order_number}</p>
                        <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">${Number(o.total).toLocaleString()}</p>
                        <StatusBadge status={o.status as CustomerStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function CustomersPage() {
  const [filter, setFilter] = useState<CustomersFilter>({
    search: '', status: 'All', sortColumn: 'created_at', sortAsc: false, page: 0,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const { customers, total, pageSize, loading, error, refetch } = useCustomers(filter);

  const applySearch = useCallback(() => { setFilter(f => ({ ...f, search: searchInput, page: 0 })); }, [searchInput]);

  const toggleSort = (col: string) => {
    setFilter(f => ({ ...f, sortColumn: col as CustomersFilter['sortColumn'], sortAsc: f.sortColumn === col ? !f.sortAsc : false, page: 0 }));
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total customers</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" placeholder="Search name, email…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applySearch(); }}
              onBlur={applySearch}
              className="input-field pl-8 pr-8 h-9 text-xs w-full" />
            {searchInput && <button onClick={() => { setSearchInput(''); setFilter(f => ({ ...f, search: '', page: 0 })); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X size={12} /></button>}
          </div>
          <div className="flex gap-2">
            {STATUS_FILTERS.map(s => (
              <button key={s}
                onClick={() => setFilter(f => ({ ...f, status: s, page: 0 }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter.status === s ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-4"><ErrorBanner message={error} onRetry={refetch} /></div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Customer</th>
                <SortableTh column="lifetime_value" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort} className="hidden sm:table-cell">LTV</SortableTh>
                <SortableTh column="total_orders" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort} className="hidden md:table-cell">Orders</SortableTh>
                <SortableTh column="created_at" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort} className="hidden lg:table-cell">Joined</SortableTh>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : customers.length === 0
                  ? <tr><td colSpan={5}><EmptyCustomers /></td></tr>
                  : customers.map(c => (
                      <tr key={c.id} onClick={() => setSelected(c)}
                        className="hover:bg-gray-800/30 transition-colors cursor-pointer group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={c.avatar_initials} color={c.avatar_color} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">{c.name}</p>
                              <p className="text-xs text-gray-500 truncate">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell"><span className="text-sm font-semibold text-white">${Number(c.lifetime_value).toLocaleString()}</span></td>
                        <td className="px-6 py-4 hidden md:table-cell"><span className="text-sm text-gray-300">{c.total_orders}</span></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><span className="text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                        <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
        <Pagination page={filter.page} total={total} pageSize={pageSize} onChange={p => setFilter(f => ({ ...f, page: p }))} />
      </div>

      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
