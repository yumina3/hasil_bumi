import { Link } from 'react-router';
import { ShoppingCart, Menu, X, User, LogIn, Package, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const totalItems = getTotalItems();

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">HB</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-xl text-gray-900">Hasil Bumi</h1>
              <p className="text-xs text-gray-500">Fresh & Organic</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Beranda
            </Link>
            <Link to="/produk" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Produk
            </Link>
            {isAuthenticated && user?.role === 'pelanggan' && (
              <Link to="/orders" className="text-gray-700 hover:text-green-600 font-medium transition-colors flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pesanan
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg mr-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{user?.name}</span>
                </div>
                {user?.role === 'pelanggan' && (
                  <Link to="/cart">
                    <Button variant="outline" className="relative gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="hidden sm:inline">Keranjang</span>
                      {totalItems > 0 && (
                        <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-600">
                          {totalItems}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Keluar</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/register" className="hidden md:block">
                  <Button variant="ghost" className="gap-2">
                    Daftar
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-green-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/produk"
                className="text-gray-700 hover:text-green-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Produk
              </Link>
              {isAuthenticated && user?.role === 'pelanggan' && (
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-green-600 font-medium flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  Pesanan
                </Link>
              )}
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-green-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Masuk
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}