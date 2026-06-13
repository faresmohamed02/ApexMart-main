import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import { Skeleton } from './components/ui/Skeleton';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage  = lazy(() => import('./pages/ProductsPage'));
const OrdersPage    = lazy(() => import('./pages/OrdersPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage  = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="px-4 lg:px-6 py-6 space-y-4 max-w-screen-2xl mx-auto">
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32 ml-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

interface ErrorBoundaryState { hasError: boolean; message: string }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠</span>
            </div>
            <h1 className="text-lg font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-400 mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#030712' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/"          element={<DashboardPage />} />
                    <Route path="/products"  element={<ProductsPage />} />
                    <Route path="/orders"    element={<OrdersPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings"  element={<SettingsPage />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
            <CommandPalette />
          </div>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
