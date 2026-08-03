import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { ShoppingCart, Box, Clock, LogOut, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminCabangProvider, useAdminCabangData } from '../context/AdminCabangContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

function Sidebar() {
  const { logout, user } = useAuth();
  const { newOrders, lowStockItems } = useAdminCabangData();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/admin-cabang',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: '/admin-cabang/orders',
      label: 'Pesanan',
      icon: ShoppingCart,
      badge: newOrders,
    },
    {
      path: '/admin-cabang/inventory',
      label: 'Stok',
      icon: Box,
      badge: lowStockItems,
      badgeColor: 'bg-orange-500',
    },
    {
      path: '/admin-cabang/history',
      label: 'Riwayat',
      icon: Clock,
    },
  ];

  return (
    <div className="w-72 bg-white border-r flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="py-3 px-3 border-b border-green-100 bg-green-50 flex items-center gap-3">
        <div className="flex items-center justify-center shrink-0 h-16 w-16 overflow-hidden">
          <img src="/logo_hasil_bumi.png" alt="Logo Hasil Bumi" className="h-full w-full object-contain transform scale-[3.0] drop-shadow-sm" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100/80 px-1.5 py-0.5 rounded w-fit mb-0.5">
            Admin Cabang
          </span>
          <Link to="/profile" className="text-sm font-semibold text-gray-800 hover:text-green-600 truncate transition-colors" title="Lihat Profil">
            {user?.name || 'Kepala Cabang'}
          </Link>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon, badge, badgeColor, exact }) => {
          const isActive = exact
            ? location.pathname === path
            : location.pathname.startsWith(path);

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
                <Badge className={`${badgeColor ?? 'bg-red-500'} text-white text-xs`}>
                  {badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
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

function MainContent() {
  const { isLoading } = useAdminCabangData();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat data cabang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <Outlet />
    </div>
  );
}

export function AdminCabangLayout() {
  return (
    <AdminCabangProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <MainContent />
      </div>
    </AdminCabangProvider>
  );
}