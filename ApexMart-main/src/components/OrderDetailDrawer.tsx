import { useState } from 'react';
import { X, MapPin, Package, Check, Ban, Clock, Truck } from 'lucide-react';
import { useOrderDetail, updateOrderStatus } from '../hooks/useOrders';
import { Avatar } from './ui/Avatar';
import { StatusBadge } from './ui/StatusBadge';
import { Skeleton } from './ui/Skeleton';
import type { OrderStatus } from '../types/database';

interface Props {
  orderId: string | null;
  onClose: () => void;
  onStatusChange: () => void;
}

const STATUS_ACTIONS: { status: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'processing', label: 'Mark Processing', icon: Clock, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
  { status: 'delivered', label: 'Mark Delivered', icon: Truck, color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' },
  { status: 'cancelled', label: 'Cancel Order', icon: Ban, color: 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border-red-500/20' },
];

export default function OrderDetailDrawer({ orderId, onClose, onStatusChange }: Props) {
  const { order, loading } = useOrderDetail(orderId);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, status);
      onStatusChange();
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  if (!orderId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-950 border-l border-gray-800 z-50 flex flex-col animate-slide-up overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
          <div>
            <h2 className="text-base font-semibold text-white">{order?.order_number ?? 'Order Detail'}</h2>
            {order && <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>}
          </div>
          <button onClick={onClose} aria-label="Close drawer" className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : order ? (
          <div className="p-6 space-y-6 flex-1">
            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Status</p>
                <StatusBadge status={order.status} />
              </div>
              <Check size={16} className="text-gray-600" />
            </div>

            {/* Customer */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</p>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800">
                <Avatar initials={order.customer?.avatar_initials ?? '??'} color={order.customer?.avatar_color} size="md" />
                <div>
                  <p className="text-sm font-medium text-white">{order.customer?.name}</p>
                  <p className="text-xs text-gray-500">{order.customer?.email}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{order.customer?.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800">
                <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>{order.shipping_address?.line1 as string}</p>
                  <p>{order.shipping_address?.city as string}, {order.shipping_address?.state as string} {order.shipping_address?.zip as string}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
              <div className="space-y-2">
                {(order.items ?? []).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800">
                    <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ${Number(item.unit_price).toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">${Number(item.total_price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
              {[
                { label: 'Subtotal', value: order.subtotal },
                { label: 'Shipping', value: order.shipping },
                { label: 'Tax', value: order.tax },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-300">${Number(value).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-800 pt-2 flex justify-between">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-sm font-bold text-emerald-400">${Number(order.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
              <div className="space-y-2">
                {STATUS_ACTIONS.filter(a => a.status !== order.status).map(({ status, label, icon: Icon, color }) => (
                  <button key={status} onClick={() => handleStatusChange(status)} disabled={updating}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${color}`}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">Order not found</div>
        )}
      </div>
    </>
  );
}
