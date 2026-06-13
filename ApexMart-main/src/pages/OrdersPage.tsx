import OrdersTable from '../components/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-screen-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Orders</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage and track all store orders</p>
      </div>
      <OrdersTable />
    </div>
  );
}
