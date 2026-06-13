import { useState, useEffect } from 'react';
import { Store, Bell, Palette, Save, Check } from 'lucide-react';
import { useStoreSettings } from '../hooks/useAppData';

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Asia/Tokyo', 'Australia/Sydney',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

export default function SettingsPage() {
  const { settings, loading, save } = useStoreSettings();
  const [form, setForm] = useState(settings ?? {
    store_name: 'ApexMart', currency: 'USD', timezone: 'America/New_York',
    accent_color: 'emerald', notify_orders: true, notify_low_stock: true, notify_customers: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await save(form);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  if (loading) {
    return (
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-48 animate-pulse bg-gray-900 rounded-2xl border border-gray-800" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your store preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store Info */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Store size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Store Information</h3>
              <p className="text-xs text-gray-500">Basic store configuration</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="store-name" className="block text-xs font-medium text-gray-300 mb-1.5">Store Name</label>
              <input id="store-name" type="text" value={form.store_name} onChange={e => update('store_name', e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="currency" className="block text-xs font-medium text-gray-300 mb-1.5">Currency</label>
                <select id="currency" value={form.currency} onChange={e => update('currency', e.target.value)} className="select-field">
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="timezone" className="block text-xs font-medium text-gray-300 mb-1.5">Timezone</label>
                <select id="timezone" value={form.timezone} onChange={e => update('timezone', e.target.value)} className="select-field">
                  {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Palette size={16} className="text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Appearance</h3>
              <p className="text-xs text-gray-500">Customize the look of your dashboard</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-300 mb-3">Accent Color</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
                { label: 'Blue', value: 'blue', bg: 'bg-blue-500' },
                { label: 'Sky', value: 'sky', bg: 'bg-sky-500' },
                { label: 'Teal', value: 'teal', bg: 'bg-teal-500' },
                { label: 'Amber', value: 'amber', bg: 'bg-amber-500' },
                { label: 'Rose', value: 'rose', bg: 'bg-rose-500' },
              ].map(({ label, value, bg }) => (
                <button key={value} type="button" onClick={() => update('accent_color', value)}
                  title={label}
                  className={`relative w-8 h-8 rounded-full ${bg} transition-all hover:scale-110 ${form.accent_color === value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                  aria-pressed={form.accent_color === value}
                  aria-label={label}
                >
                  {form.accent_color === value && <Check size={13} className="text-white absolute inset-0 m-auto" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bell size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
              <p className="text-xs text-gray-500">Choose which events trigger alerts</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'notify_orders' as const, label: 'New Orders', desc: 'Get notified when a customer places a new order' },
              { key: 'notify_low_stock' as const, label: 'Low Stock Alerts', desc: 'Alert when products fall below 10 units' },
              { key: 'notify_customers' as const, label: 'New Customers', desc: 'Notify when a new customer registers' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <div className="relative flex-shrink-0 ml-4">
                  <input type="checkbox" className="sr-only peer" checked={form[key]} onChange={e => update(key, e.target.checked)} />
                  <div className="w-10 h-6 bg-gray-700 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary gap-2 disabled:opacity-50">
            {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving…' : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
