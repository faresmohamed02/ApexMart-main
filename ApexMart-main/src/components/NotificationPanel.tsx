import { useState, useRef, useEffect } from 'react';
import { Bell, X, ShoppingCart, Package, Users, Info, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useAppData';
import type { Notification } from '../types/database';

const typeIcons: Record<Notification['type'], React.ElementType> = {
  order_placed: ShoppingCart,
  low_stock: Package,
  new_customer: Users,
  system: Info,
};

const typeColors: Record<Notification['type'], string> = {
  order_placed: 'text-blue-400 bg-blue-500/10',
  low_stock: 'text-amber-400 bg-amber-500/10',
  new_customer: 'text-emerald-400 bg-emerald-500/10',
  system: 'text-gray-400 bg-gray-500/10',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-gray-950" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors" aria-label="Mark all as read">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close notifications" className="text-gray-600 hover:text-gray-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="px-5 py-8 text-center text-sm text-gray-600">Loading…</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-600">No notifications</div>
            )}
            {!loading && notifications.map(n => {
              const Icon = typeIcons[n.type];
              const color = typeColors[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50 last:border-0 ${!n.read ? 'bg-gray-800/20' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-snug ${n.read ? 'text-gray-300' : 'text-white'}`}>{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" aria-label="Unread" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-700 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
