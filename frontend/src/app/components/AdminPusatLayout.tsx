import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { Package, LogOut, Menu, ShoppingBag, Store, BarChart3, Home, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function AdminPusatLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin-pusat', label: 'Dashboard', icon: Home, exact: true },
    { path: '/admin-pusat/products', label: 'Kelola Produk', icon: ShoppingBag },
    { path: '/admin-pusat/branches', label: 'Monitor Cabang', icon: Store },
    { path: '/admin-pusat/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin-pusat/staff', label: 'Manajemen Staf', icon: Users },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-72 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Role Side-by-Side Header */}
          <div className="py-3 px-3 border-b border-green-100 bg-green-50 flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0 h-16 w-16 overflow-hidden">
              <img src="/logo_hasil_bumi.png" alt="Logo Hasil Bumi" className="h-full w-full object-contain transform scale-[3.0] drop-shadow-sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100/80 px-1.5 py-0.5 rounded w-fit mb-0.5">
                Admin Pusat
              </span>
              <Link to="/profile" className="text-sm font-semibold text-gray-800 hover:text-green-600 truncate transition-colors" title="Lihat Profil">
                {user?.name || 'Super Admin'}
              </Link>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Pusat</h1>
                <p className="text-sm text-gray-600">Kelola seluruh cabang Hasil Bumi</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
