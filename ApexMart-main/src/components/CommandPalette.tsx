import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Package, ShoppingCart, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../hooks/useAppData';
import { useAppContext } from '../context/AppContext';

interface SearchResult {
  products: { id: string; name: string; sku: string; category: string; price: number }[];
  orders: { id: string; order_number: string; total: number; status: string }[];
  customers: { id: string; name: string; email: string; avatar_initials: string; avatar_color: string }[];
}

export default function CommandPalette() {
  const { state, setSearchOpen } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [state.searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    const res = await globalSearch(q);
    setResults(res as SearchResult);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const go = (path: string) => {
    navigate(path);
    setSearchOpen(false);
  };

  const hasResults = results && (results.products.length + results.orders.length + results.customers.length > 0);

  if (!state.searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800">
          <Search size={16} className="text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, orders, customers…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            aria-label="Global search"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-600 hover:text-gray-400 transition-colors" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
          <kbd className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-600">Searching…</div>
          )}

          {!loading && query && !hasResults && (
            <div className="px-4 py-6 text-center text-sm text-gray-600">No results for "{query}"</div>
          )}

          {!loading && hasResults && (
            <div className="py-2">
              {results!.products.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</p>
                  {results!.products.map(p => (
                    <button key={p.id} onClick={() => go('/products')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left group">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.sku} · {p.category}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-300">${p.price}</span>
                      <ArrowRight size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {results!.orders.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</p>
                  {results!.orders.map(o => (
                    <button key={o.id} onClick={() => go('/orders')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left group">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart size={14} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{o.order_number}</p>
                        <p className="text-xs text-gray-500 capitalize">{o.status}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-300">${Number(o.total).toLocaleString()}</span>
                      <ArrowRight size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {results!.customers.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customers</p>
                  {results!.customers.map(c => (
                    <button key={c.id} onClick={() => go('/customers')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left group">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatar_color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                        {c.avatar_initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.email}</p>
                      </div>
                      <ArrowRight size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!query && (
            <div className="px-4 py-6">
              <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider font-semibold">Quick navigation</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Products', icon: Package, path: '/products' },
                  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
                  { label: 'Customers', icon: Users, path: '/customers' },
                ].map(({ label, icon: Icon, path }) => (
                  <button key={path} onClick={() => go(path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white">
                    <Icon size={16} />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
