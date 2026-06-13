import { Plus, Download, RefreshCw, Share2, Megaphone } from 'lucide-react';

interface QuickActionsProps {
  onAddProduct: () => void;
}

export default function QuickActions({ onAddProduct }: QuickActionsProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3">
        <button
          onClick={onAddProduct}
          className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            <Plus size={18} />
          </div>
          <span className="text-xs font-medium text-center">Add Product</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200 group">
          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
            <Download size={18} />
          </div>
          <span className="text-xs font-medium text-center">Export Data</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200 group">
          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
            <Megaphone size={18} />
          </div>
          <span className="text-xs font-medium text-center">Campaign</span>
        </button>

        <button className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200 group">
          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
            <Share2 size={18} />
          </div>
          <span className="text-xs font-medium text-center">Share Report</span>
        </button>
      </div>
    </div>
  );
}
