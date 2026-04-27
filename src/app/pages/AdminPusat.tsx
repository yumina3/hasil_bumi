import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Package,
  Users,
  Store,
  TrendingUp,
  DollarSign,
  Edit,
  Save,
  X,
  AlertCircle,
  LogOut,
  Menu,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { products as initialProducts } from '../data/products';
import { branches } from '../data/branches';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export function AdminPusat() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', price: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user?.role !== 'admin_pusat') {
    navigate('/login');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total revenue (mock data)
  const totalRevenue = 125750000;
  const totalProducts = products.length;
  const totalBranches = branches.length;
  const totalUsers = 1247; // mock

  // Calculate low stock items across ALL branches
  const lowStockAlerts = products.flatMap((product) => {
    return product.stockByBranch
      .filter((stock) => stock.stock < 25)
      .map((stock) => ({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        branchId: stock.branchId,
        branchName: branches.find((b) => b.id === stock.branchId)?.name || 'Unknown',
        currentStock: stock.stock,
        threshold: 25,
      }));
  });

  const handleEdit = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditingId(productId);
      setEditForm({
        name: product.name,
        category: product.category,
        price: product.price,
      });
    }
  };

  const handleSave = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, name: editForm.name, category: editForm.category, price: editForm.price }
          : p
      )
    );
    setEditingId(null);
    toast.success('Produk berhasil diperbarui');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', category: '', price: 0 });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Berhasil logout');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-white">
                <h2 className="font-bold text-lg">Hasil Bumi</h2>
                <p className="text-xs text-green-100">Admin Pusat</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <Badge className="mt-2 bg-green-600">Highest Authority</Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5" />
              Master Catalog
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Multi-Branch Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5" />
              User Management
            </button>
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin Pusat</h1>
                <p className="text-sm text-gray-600">Kelola seluruh sistem Hasil Bumi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Low Stock Alert - Across ALL Branches */}
          {lowStockAlerts.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 font-bold">
                ⚠️ MULTI-BRANCH LOW STOCK ALERT!
              </AlertTitle>
              <AlertDescription className="text-red-700">
                <strong>{lowStockAlerts.length} produk</strong> di berbagai cabang memiliki stok {"<"} 25 unit. Segera koordinasi restock dengan admin cabang!
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer font-semibold hover:underline">Lihat detail</summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto bg-white p-2 rounded">
                    {lowStockAlerts.map((alert, idx) => (
                      <div key={idx} className="text-xs border-b pb-1">
                        <span className="font-bold">{alert.productName}</span> ({alert.sku}) - {alert.branchName}: 
                        <span className="text-red-700 font-bold ml-1">{alert.currentStock} unit</span>
                      </div>
                    ))}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}

          {/* Global Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">System Notification</AlertTitle>
            <AlertDescription className="text-blue-700">
              Semua cabang beroperasi normal. Database sync terakhir: 15 Apr 2026, 14:30 WIB
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Semua cabang</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                    <p className="text-xs text-gray-500 mt-1">SKU Aktif</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Branches</p>
                    <p className="text-2xl font-bold">{totalBranches}</p>
                    <p className="text-xs text-gray-500 mt-1">Cabang Aktif</p>
                  </div>
                  <Store className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Pelanggan Aktif</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          {activeTab === 'catalog' && (
            <Card>
              <CardHeader>
                <CardTitle>Master Catalog - Product List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">SKU</th>
                        <th className="text-left py-3 px-2">Nama Produk</th>
                        <th className="text-left py-3 px-2">Kategori</th>
                        <th className="text-right py-3 px-2">Harga</th>
                        <th className="text-center py-3 px-2">Status</th>
                        <th className="text-center py-3 px-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const isEditing = editingId === product.id;
                        return (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {product.sku}
                              </code>
                            </td>
                            <td className="py-3 px-2">
                              {isEditing ? (
                                <Input
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, name: e.target.value })
                                  }
                                  className="max-w-xs"
                                />
                              ) : (
                                <span className="font-medium">{product.name}</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {isEditing ? (
                                <Input
                                  value={editForm.category}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, category: e.target.value })
                                  }
                                  className="max-w-xs"
                                />
                              ) : (
                                product.category
                              )}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editForm.price}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, price: Number(e.target.value) })
                                  }
                                  className="max-w-xs"
                                />
                              ) : (
                                formatPrice(product.price)
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {product.isPerishable ? (
                                <Badge variant="outline" className="text-orange-600">
                                  Perishable
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-600">Normal</Badge>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {isEditing ? (
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(product.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(product.id)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue per Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {branches.map((branch, index) => {
                      const revenue = [45000000, 42000000, 38750000][index];
                      return (
                        <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-sm text-gray-500">{branch.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">{formatPrice(revenue)}</p>
                            <p className="text-xs text-gray-500">Bulan ini</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600">Total Pelanggan</p>
                        <p className="text-3xl font-bold">1,247</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600">Admin Cabang</p>
                        <p className="text-3xl font-bold">3</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600">Admin Pusat</p>
                        <p className="text-3xl font-bold">1</p>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-sm text-gray-500 text-center py-8">
                    User management interface untuk create, edit, dan delete users
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}