import { useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router';
import { Package, ShoppingCart, AlertTriangle, LogOut, Clock, Box, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminCabangProvider, useAdminCabangData } from '../context/AdminCabangContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

function AdminCabangSidebar() {
  const { logout, user } = useAuth();
  const { newOrders, lowStockItems } = useAdminCabangData();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin-cabang', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin-cabang/orders', label: 'Pesanan', icon: ShoppingCart, badge: newOrders },
    { path: '/admin-cabang/inventory', label: 'Stok', icon: Box, badge: lowStockItems > 0 ? lowStockItems : 0 },
    { path: '/admin-cabang/history', label: 'Riwayat', icon: Clock },
  ];

  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-green-700">Admin Cabang</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon, badge, exact }) => {
          const isActive = exact
            ? location.pathname === path
            : location.pathname.startsWith(path) && path !== '/admin-cabang';

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
              {badge != null && badge > 0 && (
                <Badge className="bg-red-500 text-white text-xs">{badge}</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </Button>
      </div>
    </div>
  );
}

function AdminCabangContent() {
  const { isLoading } = useAdminCabangData();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Memuat data cabang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Outlet />
    </div>
  );
}

export function AdminCabang() {
  return (
    <AdminCabangProvider>
      <div className="flex h-screen bg-gray-50">
        <AdminCabangSidebar />
        <AdminCabangContent />
      </div>
    </AdminCabangProvider>
  );
}