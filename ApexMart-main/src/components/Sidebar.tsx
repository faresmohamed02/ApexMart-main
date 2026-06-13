import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, Settings, Zap, ChevronRight, X,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './ui/Avatar';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package, end: false },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/customers', label: 'Customers', icon: Users, end: false },
];

const reportItems = [
  { to: '/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: React.ElementType; end: boolean }) {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
  const { setSidebar } = useAppContext();

  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => setSidebar(false)}
      className={`nav-item w-full ${isActive ? 'active' : ''}`}
    >
      <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'} />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto text-emerald-400" />}
    </NavLink>
  );
}

export default function Sidebar() {
  const { state, setSidebar } = useAppContext();

  return (
    <>
      {/* Mobile overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-950 border-r border-gray-800/50 z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">ApexMart</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebar(false)}
            aria-label="Close sidebar"
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-4 mb-4">Main Menu</p>
          {navItems.map(item => <NavItem key={item.to} {...item} />)}

          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-4 mb-4 mt-6">Reports</p>
          {reportItems.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* User profile */}
        <div className="px-4 py-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
            <Avatar initials="AK" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Alex Kim</p>
              <p className="text-xs text-gray-500 truncate">Super Admin</p>
            </div>
            <Settings size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
}
