import StatCards from '../components/StatCards';
import Charts from '../components/Charts';
import OrdersTable from '../components/OrdersTable';
import QuickActions from '../components/QuickActions';
import TopProducts from '../components/TopProducts';
import DateRangePicker from '../components/DateRangePicker';
import { Download } from 'lucide-react';
import { useState } from 'react';
import AddProductModal from '../components/AddProductModal';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Alex. Here's your store at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          <button className="btn-primary text-xs h-9">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      <StatCards />
      <Charts />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <OrdersTable />
        </div>
        <div className="space-y-6">
          <QuickActions onAddProduct={() => setModalOpen(true)} />
          <TopProducts />
        </div>
      </div>

      <AddProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => setModalOpen(false)}
      />
    </div>
  );
}
