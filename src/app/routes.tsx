import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { Layout } from './components/Layout';
import { AdminPusatLayout } from './components/AdminPusatLayout';
import { AdminCabangLayout } from './components/AdminCabangLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { OrderSuccess } from './pages/OrderSuccess';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AdminPusat } from './pages/AdminPusat';
import { AdminPusatDashboard } from './pages/AdminPusat/Dashboard';
import { AdminPusatProducts } from './pages/AdminPusat/Products';
import { AdminPusatBranches } from './pages/AdminPusat/Branches';
import { AdminPusatAnalytics } from './pages/AdminPusat/Analytics';
import { AdminCabangDashboard } from './pages/AdminCabang/Dashboard';
import { AdminCabangOrders } from './pages/AdminCabang/Orders';
import { AdminCabangHistory } from './pages/AdminCabang/History';
import { AdminCabangInventory } from './pages/AdminCabang/Inventory';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', Component: Login },
      { path: '/register', Component: Register },
      { path: '/forgot-password', Component: ForgotPassword },
      { path: '/reset-password', Component: ResetPassword },
      {
        path: '/admin-pusat',
        element: (
          <ProtectedRoute allowedRoles={['admin_pusat']}>
            <AdminPusatLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: AdminPusatDashboard },
          { path: 'products', Component: AdminPusatProducts },
          { path: 'branches', Component: AdminPusatBranches },
          { path: 'analytics', Component: AdminPusatAnalytics },
        ],
      },
      {
        path: '/admin-cabang',
        element: (
          <ProtectedRoute allowedRoles={['admin_cabang']}>
            <AdminCabangLayout />  {/* Provider sudah di dalam AdminCabangLayout */}
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: AdminCabangDashboard },
          { path: 'orders', Component: AdminCabangOrders },
          { path: 'history', Component: AdminCabangHistory },
          { path: 'inventory', Component: AdminCabangInventory },
        ],
      },
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Home },
          { path: 'produk', Component: Products },
          { path: 'produk/:id', Component: ProductDetail },
          {
            path: 'cart',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <Cart />
              </ProtectedRoute>
            ),
          },
          {
            path: 'checkout',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <Checkout />
              </ProtectedRoute>
            ),
          },
          {
            path: 'payment',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <Payment />
              </ProtectedRoute>
            ),
          },
          {
            path: 'order-success',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <OrderSuccess />
              </ProtectedRoute>
            ),
          },
          {
            path: 'orders',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <Orders />
              </ProtectedRoute>
            ),
          },
          {
            path: 'order-tracking/:orderId',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <OrderTracking />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin',
            element: (
              <ProtectedRoute allowedRoles={['pelanggan']}>
                <AdminDashboard />
              </ProtectedRoute>
            ),
          },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);