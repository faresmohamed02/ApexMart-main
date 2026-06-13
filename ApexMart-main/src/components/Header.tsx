import { Search, RefreshCw, Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import NotificationPanel from './NotificationPanel';
import { Avatar } from './ui/Avatar';

export default function Header() {
  const { toggleSidebar, setSearchOpen } = useAppContext();

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-2.5 transition-all group w-48 md:w-72"
          aria-label="Open search"
        >
          <Search size={14} className="text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-600 group-hover:text-gray-500 flex-1 text-left">Search…</span>
          <kbd className="text-xs text-gray-700 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 hidden sm:inline">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          aria-label="Refresh data"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
        >
          <RefreshCw size={16} />
        </button>

        <NotificationPanel />

        <div className="w-px h-5 bg-gray-800 mx-1" />

        <div className="flex items-center gap-2.5 cursor-pointer group px-1">
          <Avatar initials="AK" size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">Alex Kim</p>
            <p className="text-xs text-gray-500 mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
