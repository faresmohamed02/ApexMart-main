import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { DateRange } from '../types/database';

const PRESETS: { label: string; range: () => DateRange }[] = [
  {
    label: 'Last 30 days',
    range: () => {
      const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 30);
      return { from, to };
    },
  },
  {
    label: 'Last 3 months',
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), to.getMonth() - 2, 1);
      return { from, to };
    },
  },
  {
    label: 'Last 6 months',
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), to.getMonth() - 5, 1);
      return { from, to };
    },
  },
  {
    label: 'This year',
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), 0, 1);
      return { from, to };
    },
  },
  {
    label: 'Last 12 months',
    range: () => {
      const to = new Date();
      const from = new Date(to.getFullYear(), to.getMonth() - 11, 1);
      return { from, to };
    },
  },
];

function fmt(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function DateRangePicker() {
  const { state, setDateRange } = useAppContext();
  const [open, setOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState('Last 12 months');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const apply = (preset: typeof PRESETS[0]) => {
    setDateRange(preset.range());
    setActiveLabel(preset.label);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="btn-secondary text-xs h-9 gap-2"
      >
        <Calendar size={13} />
        <span className="hidden sm:inline">{activeLabel}</span>
        <span className="text-gray-600 hidden sm:inline">·</span>
        <span className="text-gray-400 hidden sm:inline text-xs">{fmt(state.dateRange.from)} – {fmt(state.dateRange.to)}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-40 overflow-hidden animate-slide-up">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => apply(p)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                activeLabel === p.label
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {p.label}
              {activeLabel === p.label && <Check size={13} className="text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
