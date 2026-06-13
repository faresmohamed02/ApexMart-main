import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types/database';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetch };
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<{ store_name: string; currency: string; timezone: string; accent_color: string; notify_orders: boolean; notify_low_stock: boolean; notify_customers: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('store_settings').select('*').maybeSingle().then(({ data }) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const save = async (values: typeof settings) => {
    if (!values) return;
    const { data: existing } = await supabase.from('store_settings').select('id').maybeSingle();
    if (existing) {
      await supabase.from('store_settings').update(values).eq('id', existing.id);
    } else {
      await supabase.from('store_settings').insert(values);
    }
    setSettings(values);
  };

  return { settings, loading, save };
}

export async function globalSearch(query: string) {
  if (!query.trim()) return { products: [], orders: [], customers: [] };
  const q = `%${query}%`;
  const [p, o, c] = await Promise.all([
    supabase.from('products').select('id, name, sku, category, price').or(`name.ilike.${q},sku.ilike.${q}`).limit(5),
    supabase.from('orders').select('id, order_number, total, status').ilike('order_number', q).limit(5),
    supabase.from('customers').select('id, name, email, avatar_initials, avatar_color').or(`name.ilike.${q},email.ilike.${q}`).limit(5),
  ]);
  return { products: p.data ?? [], orders: o.data ?? [], customers: c.data ?? [] };
}
