import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../../utils/supabase/info';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Produk {
  id: number;
  kategori_id: number;
  sku: string;
  nama_produk: string;
  deskripsi: string | null;
  foto_url: string | null;
  satuan: string;
  harga_jual: number;
  is_perishable: boolean;
  is_active: boolean;
  created_at: string;
  update_at: string;
  stok: number;
}

interface StokPerCabang {
  cabang_id: number;
  nama_cabang: string;
  produk_id: number;
  nama_produk: string;
  jumlah_stok: number;
  threshold_stok: number;
  status_stok: string;
}

interface RekapPenjualan {
  tanggal: string;
  nama_cabang: string;
  sku: string;
  nama_produk: string;
  nama_kategori: string;
  total_terjual: number;
  total_pendapatan: number;
}

interface EditForm {
  nama_produk: string;
  harga_jual: number;
  satuan: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPusat() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics' | 'users'>('catalog');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Produk[]>([]);
  const [stokPerCabang, setStokPerCabang] = useState<StokPerCabang[]>([]);
  const [rekapPenjualan, setRekapPenjualan] = useState<RekapPenjualan[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Loading & error
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ nama_produk: '', harga_jual: 0, satuan: '' });
  const [saving, setSaving] = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (user && user.role !== 'admin_pusat') {
      navigate('/login');
    }
  }, [user, navigate]);

  // ── Fetch catalog ──
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('nama_produk', { ascending: true });

      if (error) {
        toast.error('Gagal memuat katalog produk');
        console.error(error);
      } else {
        setProducts(data || []);
      }
      setLoadingCatalog(false);
    };
    fetchCatalog();
  }, []);

  // ── Fetch stok per cabang (for low stock alerts) ──
  useEffect(() => {
    const fetchStok = async () => {
      const { data, error } = await supabase
        .from('view_stok_per_cabang')
        .select('*');

      if (error) {
        console.error('Gagal memuat stok cabang:', error.message);
      } else {
        setStokPerCabang(data || []);
      }
    };
    fetchStok();
  }, []);

  // ── Fetch rekap penjualan ──
  useEffect(() => {
    const fetchRekap = async () => {
      setLoadingAnalytics(true);
      const { data, error } = await supabase
        .from('view_rekap_penjualan')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        toast.error('Gagal memuat data analytics');
        console.error(error);
      } else {
        setRekapPenjualan(data || []);
      }
      setLoadingAnalytics(false);
    };
    fetchRekap();
  }, []);

  // ── Fetch total users ──
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setTotalUsers(count);
      }
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  // Low stock alerts dari view_stok_per_cabang
  const lowStockAlerts = stokPerCabang.filter(
    (s) => s.status_stok === 'Rendah' || s.status_stok === 'Habis'
  );

  // Revenue per cabang dari view_rekap_penjualan
  const revenuePerCabang = rekapPenjualan.reduce<Record<string, number>>((acc, row) => {
    acc[row.nama_cabang] = (acc[row.nama_cabang] || 0) + row.total_pendapatan;
    return acc;
  }, {});

  const totalRevenue = Object.values(revenuePerCabang).reduce((a, b) => a + b, 0);
  const totalCabang = Object.keys(revenuePerCabang).length;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleEdit = (product: Produk) => {
    setEditingId(product.id);
    setEditForm({
      nama_produk: product.nama_produk,
      harga_jual: product.harga_jual,
      satuan: product.satuan,
    });
  };

  const handleSave = async (productId: number) => {
    setSaving(true);
    const { error } = await supabase
      .from('produk')
      .update({
        nama_produk: editForm.nama_produk,
        harga_jual: editForm.harga_jual,
        satuan: editForm.satuan,
        update_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      toast.error('Gagal menyimpan perubahan: ' + error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, ...editForm }
            : p
        )
      );
      toast.success('Produk berhasil diperbarui');
      setEditingId(null);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ nama_produk: '', harga_jual: 0, satuan: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Berhasil logout');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── Sidebar ── */}
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
            {(
              [
                { key: 'catalog', label: 'Master Catalog', Icon: Package },
                { key: 'analytics', label: 'Multi-Branch Analytics', Icon: TrendingUp },
                { key: 'users', label: 'User Management', Icon: Users },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === key
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
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

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
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
            <LayoutDashboard className="h-5 w-5 text-green-600" />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          {/* Low Stock Alert */}
          {lowStockAlerts.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 font-bold">
                ⚠️ MULTI-BRANCH LOW STOCK ALERT!
              </AlertTitle>
              <AlertDescription className="text-red-700">
                <strong>{lowStockAlerts.length} produk</strong> di berbagai cabang memiliki stok rendah atau habis. Segera koordinasi restock!
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer font-semibold hover:underline">Lihat detail</summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto bg-white p-2 rounded">
                    {lowStockAlerts.map((alert, idx) => (
                      <div key={idx} className="text-xs border-b pb-1 flex justify-between">
                        <span>
                          <span className="font-bold">{alert.nama_produk}</span> — {alert.nama_cabang}
                        </span>
                        <span
                          className={`font-bold ml-2 ${
                            alert.status_stok === 'Habis' ? 'text-red-700' : 'text-orange-600'
                          }`}
                        >
                          {alert.jumlah_stok} unit ({alert.status_stok})
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}

          {/* System Notification */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">System Notification</AlertTitle>
            <AlertDescription className="text-blue-700">
              Data diambil secara real-time dari Supabase. Semua cabang beroperasi normal.
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
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
                    <p className="text-2xl font-bold">{products.length}</p>
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
                    <p className="text-2xl font-bold">{totalCabang}</p>
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
                    <p className="text-2xl font-bold">
                      {loadingUsers ? <Loader2 className="h-6 w-6 animate-spin" /> : totalUsers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pelanggan Aktif</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Tab: Master Catalog ── */}
          {activeTab === 'catalog' && (
            <Card>
              <CardHeader>
                <CardTitle>Master Catalog — Daftar Produk</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCatalog ? (
                  <div className="flex items-center justify-center py-16 text-green-600">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" />
                    <span className="text-gray-500">Memuat data produk...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-3 font-semibold">SKU</th>
                          <th className="text-left py-3 px-3 font-semibold">Nama Produk</th>
                          <th className="text-left py-3 px-3 font-semibold">Satuan</th>
                          <th className="text-right py-3 px-3 font-semibold">Harga Jual</th>
                          <th className="text-center py-3 px-3 font-semibold">Stok</th>
                          <th className="text-center py-3 px-3 font-semibold">Tipe</th>
                          <th className="text-center py-3 px-3 font-semibold">Status</th>
                          <th className="text-center py-3 px-3 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const isEditing = editingId === product.id;
                          return (
                            <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-3">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {product.sku}
                                </code>
                              </td>

                              {/* Nama Produk */}
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <Input
                                    value={editForm.nama_produk}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, nama_produk: e.target.value })
                                    }
                                    className="max-w-xs h-8"
                                  />
                                ) : (
                                  <span className="font-medium">{product.nama_produk}</span>
                                )}
                              </td>

                              {/* Satuan */}
                              <td className="py-3 px-3">
                                {isEditing ? (
                                  <Input
                                    value={editForm.satuan}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, satuan: e.target.value })
                                    }
                                    className="max-w-[100px] h-8"
                                  />
                                ) : (
                                  product.satuan
                                )}
                              </td>

                              {/* Harga Jual */}
                              <td className="py-3 px-3 text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editForm.harga_jual}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, harga_jual: Number(e.target.value) })
                                    }
                                    className="max-w-[150px] h-8 text-right ml-auto"
                                  />
                                ) : (
                                  formatPrice(product.harga_jual)
                                )}
                              </td>

                              {/* Stok */}
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`font-semibold ${
                                    product.stok === 0
                                      ? 'text-red-600'
                                      : product.stok < 25
                                      ? 'text-orange-500'
                                      : 'text-green-700'
                                  }`}
                                >
                                  {product.stok}
                                </span>
                              </td>

                              {/* Tipe */}
                              <td className="py-3 px-3 text-center">
                                {product.is_perishable ? (
                                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                                    Perishable
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-600 text-white">Normal</Badge>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3 text-center">
                                {product.is_active ? (
                                  <Badge className="bg-green-100 text-green-700 border border-green-300">
                                    Aktif
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500">
                                    Nonaktif
                                  </Badge>
                                )}
                              </td>

                              {/* Aksi */}
                              <td className="py-3 px-3 text-center">
                                {isEditing ? (
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSave(product.id)}
                                      disabled={saving}
                                      className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                    >
                                      {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Save className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancel}
                                      disabled={saving}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(product)}
                                    className="h-8"
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
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Tab: Analytics ── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-16 text-green-600">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span className="text-gray-500">Memuat data analytics...</span>
                </div>
              ) : (
                <>
                  {/* Revenue per Cabang */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue per Cabang</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(revenuePerCabang).map(([cabang, revenue]) => (
                          <div
                            key={cabang}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Store className="h-5 w-5 text-green-600" />
                              </div>
                              <p className="font-medium">{cabang}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">{formatPrice(revenue)}</p>
                              <p className="text-xs text-gray-500">Total pendapatan</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top 10 Produk Terlaris */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top 10 Produk Terlaris</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-3 px-3 font-semibold">#</th>
                              <th className="text-left py-3 px-3 font-semibold">Produk</th>
                              <th className="text-left py-3 px-3 font-semibold">Kategori</th>
                              <th className="text-left py-3 px-3 font-semibold">Cabang</th>
                              <th className="text-right py-3 px-3 font-semibold">Terjual</th>
                              <th className="text-right py-3 px-3 font-semibold">Pendapatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...rekapPenjualan]
                              .sort((a, b) => b.total_terjual - a.total_terjual)
                              .slice(0, 10)
                              .map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-3 text-gray-500 font-medium">{idx + 1}</td>
                                  <td className="py-3 px-3 font-medium">{row.nama_produk}</td>
                                  <td className="py-3 px-3 text-gray-500">{row.nama_kategori}</td>
                                  <td className="py-3 px-3 text-gray-500">{row.nama_cabang}</td>
                                  <td className="py-3 px-3 text-right font-semibold text-blue-700">
                                    {row.total_terjual.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-3 px-3 text-right font-semibold text-green-700">
                                    {formatPrice(row.total_pendapatan)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ── Tab: User Management ── */}
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
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold">
                          {loadingUsers ? (
                            <Loader2 className="h-7 w-7 animate-spin text-green-600" />
                          ) : (
                            totalUsers.toLocaleString('id-ID')
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600">Admin Cabang</p>
                        <p className="text-3xl font-bold">{totalCabang}</p>
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
                    User management interface untuk create, edit, dan delete users akan tersedia di sini.
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