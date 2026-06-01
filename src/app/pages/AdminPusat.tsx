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
  Plus,
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
  updated_at: string;
  stok: number;
}

interface KategoriProduk {
  id: number;
  nama_kategori: string;
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

interface TambahProdukForm {
  kategori_id: string;
  sku: string;
  nama_produk: string;
  deskripsi: string;
  foto_url: string;
  satuan: string;
  harga_jual: string;
  is_perishable: boolean;
  is_active: boolean;
}

const INITIAL_TAMBAH_FORM: TambahProdukForm = {
  kategori_id: '',
  sku: '',
  nama_produk: '',
  deskripsi: '',
  foto_url: '',
  satuan: '',
  harga_jual: '',
  is_perishable: true,
  is_active: true,
};

// Prefix SKU per kategori sesuai data Supabase
const SKU_PREFIX_MAP: Record<string, string> = {
  'Sayuran':       'SAY',
  'Bumbu Dapur':   'BDR',
  'Bumbu Instan':  'BIN',
  'Rempah Instan': 'RMP',
  'Buah':          'BUH',
  'Frozen Food':   'FRZ',
  'Lauk':          'LAU',
  'Aneka Daging':  'DAG',
  'Sembako':       'SMB',
  'Kerupuk':       'KRP',
  'Snack/Camilan': 'SNK',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPusat() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics' | 'users'>('catalog');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Produk[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriProduk[]>([]);
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

  // ── Tambah Produk Modal state ──
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [tambahForm, setTambahForm] = useState<TambahProdukForm>(INITIAL_TAMBAH_FORM);
  const [savingTambah, setSavingTambah] = useState(false);
  const [tambahErrors, setTambahErrors] = useState<Partial<TambahProdukForm>>({});

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

  // ── Fetch kategori produk ──
  useEffect(() => {
    const fetchKategori = async () => {
      const { data, error } = await supabase
        .from('kategori_produk')
        .select('id, nama_kategori')
        .order('nama_kategori', { ascending: true });

      if (!error && data) {
        setKategoriList(data);
      }
    };
    fetchKategori();
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

  const lowStockAlerts = stokPerCabang.filter(
    (s) => s.status_stok === 'Rendah' || s.status_stok === 'Habis'
  );

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
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      toast.error('Gagal menyimpan perubahan: ' + error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, ...editForm } : p
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

  // ── Tambah Produk Handlers ──

  const validateTambahForm = (): boolean => {
    const errors: Partial<TambahProdukForm> = {};

    if (!tambahForm.kategori_id) errors.kategori_id = 'Kategori wajib dipilih';
    if (!tambahForm.sku.trim()) errors.sku = 'SKU wajib diisi';
    if (!tambahForm.nama_produk.trim()) errors.nama_produk = 'Nama produk wajib diisi';
    if (!tambahForm.satuan.trim()) errors.satuan = 'Satuan wajib diisi';
    if (!tambahForm.harga_jual || Number(tambahForm.harga_jual) <= 0)
      errors.harga_jual = 'Harga jual harus lebih dari 0';

    setTambahErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // Auto-generate SKU prefix saat pilih kategori
  const handleKategoriChange = (kategoriId: string) => {
    const kategori = kategoriList.find((k) => String(k.id) === kategoriId);
    const prefix = kategori ? (SKU_PREFIX_MAP[kategori.nama_kategori] ?? 'PRD') : '';
    const existing = products.filter((p) => p.sku.startsWith(prefix + '-'));
    const nextNum = existing.length + 1;
    const suggestedSku = prefix ? `${prefix}-${String(nextNum).padStart(3, '0')}` : '';
    setTambahForm((prev) => ({ ...prev, kategori_id: kategoriId, sku: suggestedSku }));
    setTambahErrors((prev) => ({ ...prev, kategori_id: undefined, sku: undefined }));
  };
  const handleTambahProduk = async () => {
    if (!validateTambahForm()) return;

    setSavingTambah(true);
    const { data, error } = await supabase
      .from('produk')
      .insert({
        kategori_id: Number(tambahForm.kategori_id),
        sku: tambahForm.sku.trim().toUpperCase(),
        nama_produk: tambahForm.nama_produk.trim(),
        deskripsi: tambahForm.deskripsi.trim() || null,
        foto_url: tambahForm.foto_url.trim() || null,
        satuan: tambahForm.satuan.trim(),
        harga_jual: Number(tambahForm.harga_jual),
        is_perishable: tambahForm.is_perishable,
        is_active: tambahForm.is_active,
        stok: 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('SKU sudah digunakan, gunakan SKU yang berbeda');
        setTambahErrors({ sku: 'SKU sudah digunakan' });
      } else {
        toast.error('Gagal menambah produk: ' + error.message);
      }
    } else {
      // Tambahkan ke state lokal
      setProducts((prev) =>
        [...prev, { ...data, stok: 0 }].sort((a, b) =>
          a.nama_produk.localeCompare(b.nama_produk)
        )
      );
      toast.success(`Produk "${data.nama_produk}" berhasil ditambahkan dan otomatis tersedia di semua cabang!`);
      setShowTambahModal(false);
      setTambahForm(INITIAL_TAMBAH_FORM);
      setTambahErrors({});
    }
    setSavingTambah(false);
  };

  const handleCloseTambahModal = () => {
    if (savingTambah) return;
    setShowTambahModal(false);
    setTambahForm(INITIAL_TAMBAH_FORM);
    setTambahErrors({});
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
            <Badge className="mt-2 bg-green-600">Super Admin</Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {(
              [
                { key: 'catalog', label: 'Kelola Produk', Icon: Package },
                { key: 'analytics', label: 'Monitor Cabang', Icon: TrendingUp },
                { key: 'users', label: 'Analytics', Icon: Users },
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Pusat</h1>
                <p className="text-sm text-gray-600">Kelola seluruh cabang Hasil Bumi</p>
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
                <strong>{lowStockAlerts.length} produk</strong> di berbagai cabang memiliki stok rendah atau habis.
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
            <AlertTitle className="text-blue-800">Catatan:</AlertTitle>
            <AlertDescription className="text-blue-700">
              Perubahan <strong>Harga Jual</strong> akan langsung sinkron ke seluruh katalog pelanggan dan admin cabang.
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

          {/* ── Tab: Kelola Produk (Catalog) ── */}
          {activeTab === 'catalog' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kelola Produk &amp; Harga (Pusat)</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Atur harga jual dan informasi produk secara terpusat</p>
                  </div>
                  {/* ── BUTTON TAMBAH PRODUK ── */}
                  <Button
                    onClick={() => setShowTambahModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Produk
                  </Button>
                </div>
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
                                  <span className="text-green-700 font-semibold">
                                    {formatPrice(product.harga_jual)}
                                  </span>
                                )}
                              </td>

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

                              <td className="py-3 px-3 text-center">
                                {product.is_perishable ? (
                                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                                    Perishable
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-600 text-white">Normal</Badge>
                                )}
                              </td>

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

      {/* ═══════════════════════════════════════════════════════════
          MODAL TAMBAH PRODUK
      ═══════════════════════════════════════════════════════════ */}
      {showTambahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseTambahModal}
          />

          {/* Modal Panel */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tambah Produk Baru</h2>
                  <p className="text-xs text-green-100">Produk akan langsung tersedia di semua cabang</p>
                </div>
              </div>
              <button
                onClick={handleCloseTambahModal}
                disabled={savingTambah}
                className="text-white hover:text-green-200 transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Info banner */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Produk yang ditambahkan di sini akan otomatis masuk ke katalog <strong>semua cabang</strong> dan dapat dipesan pelanggan.
                </span>
              </div>

              {/* Row 1: Kategori + SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tambahForm.kategori_id}
                    onChange={(e) => handleKategoriChange(e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      tambahErrors.kategori_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kategori}
                      </option>
                    ))}
                  </select>
                  {tambahErrors.kategori_id && (
                    <p className="text-xs text-red-500 mt-1">{tambahErrors.kategori_id}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="contoh: DAG-020"
                    value={tambahForm.sku}
                    onChange={(e) => {
                      setTambahForm({ ...tambahForm, sku: e.target.value.toUpperCase() });
                      setTambahErrors({ ...tambahErrors, sku: undefined });
                    }}
                    className={`uppercase ${tambahErrors.sku ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  {tambahErrors.sku && (
                    <p className="text-xs text-red-500 mt-1">{tambahErrors.sku}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Otomatis terisi saat pilih kategori. Prefix: SAY=Sayuran, BDR=Bumbu Dapur, DAG=Aneka Daging, dll. Bisa diedit manual.
                  </p>
                </div>
              </div>

              {/* Row 2: Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="contoh: Ayam Broiler Segar"
                  value={tambahForm.nama_produk}
                  onChange={(e) => {
                    setTambahForm({ ...tambahForm, nama_produk: e.target.value });
                    setTambahErrors({ ...tambahErrors, nama_produk: undefined });
                  }}
                  className={tambahErrors.nama_produk ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {tambahErrors.nama_produk && (
                  <p className="text-xs text-red-500 mt-1">{tambahErrors.nama_produk}</p>
                )}
              </div>

              {/* Row 3: Harga Jual + Satuan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Harga Jual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="contoh: 35000"
                    min={0}
                    value={tambahForm.harga_jual}
                    onChange={(e) => {
                      setTambahForm({ ...tambahForm, harga_jual: e.target.value });
                      setTambahErrors({ ...tambahErrors, harga_jual: undefined });
                    }}
                    className={tambahErrors.harga_jual ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {tambahErrors.harga_jual && (
                    <p className="text-xs text-red-500 mt-1">{tambahErrors.harga_jual}</p>
                  )}
                  {tambahForm.harga_jual && Number(tambahForm.harga_jual) > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      = {formatPrice(Number(tambahForm.harga_jual))}
                    </p>
                  )}
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tambahForm.satuan}
                    onChange={(e) => {
                      setTambahForm({ ...tambahForm, satuan: e.target.value });
                      setTambahErrors({ ...tambahErrors, satuan: undefined });
                    }}
                    className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      tambahErrors.satuan ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Pilih Satuan --</option>
                    <option value="ekor">ekor</option>
                    <option value="pack">pack</option>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                    <option value="ikat">ikat</option>
                    <option value="biji">biji</option>
                    <option value="lusin">lusin</option>
                  </select>
                  {tambahErrors.satuan && (
                    <p className="text-xs text-red-500 mt-1">{tambahErrors.satuan}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  placeholder="Deskripsi singkat tentang produk..."
                  value={tambahForm.deskripsi}
                  onChange={(e) => setTambahForm({ ...tambahForm, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Row 5: Foto URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Foto <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <Input
                  placeholder="https://example.com/foto-produk.jpg"
                  value={tambahForm.foto_url}
                  onChange={(e) => setTambahForm({ ...tambahForm, foto_url: e.target.value })}
                />
              </div>

              {/* Row 6: Toggle Perishable + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Perishable */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Produk Perishable</p>
                    <p className="text-xs text-gray-500">Produk mudah basi/kadaluarsa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTambahForm({ ...tambahForm, is_perishable: !tambahForm.is_perishable })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tambahForm.is_perishable ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tambahForm.is_perishable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Status Aktif */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status Aktif</p>
                    <p className="text-xs text-gray-500">Produk tersedia untuk dipesan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTambahForm({ ...tambahForm, is_active: !tambahForm.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tambahForm.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tambahForm.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <Button
                variant="outline"
                onClick={handleCloseTambahModal}
                disabled={savingTambah}
              >
                Batal
              </Button>
              <Button
                onClick={handleTambahProduk}
                disabled={savingTambah}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 min-w-[140px]"
              >
                {savingTambah ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Tambah Produk
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}