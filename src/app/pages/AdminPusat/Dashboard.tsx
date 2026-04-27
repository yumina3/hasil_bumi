import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Store, ShoppingBag, TrendingUp, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { supabase } from '../../../../utils/supabase/info'; // Pastikan path benar

export function AdminPusatDashboard() {
  const [productList, setProductList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Ambil data Cabang
        const { data: branches } = await supabase.from('cabang').select('*');
        setBranchList(branches || []);

        // 2. Ambil data Produk
        const { data: products } = await supabase.from('produk').select('*');
        setProductList(products || []);

        // 3. Hitung Total Revenue dari tabel pesanan (Bulan Ini)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const { data: orders } = await supabase
          .from('pesanan')
          .select('total_bayar')
          .gte('created_at', firstDayOfMonth);

        if (orders) {
          const revenue = orders.reduce((sum, order) => sum + (order.total_bayar || 0), 0);
          setTotalRevenue(revenue);
        }

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Perhitungan Statistik Dinamis
  const totalBranches = branchList.length;
  const totalProducts = productList.length;
  const totalStock = productList.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockProducts = productList.filter((p) => (p.stock || 0) < 25);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Memuat data operasional...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, Admin Pusat!</h2>
        <p className="text-gray-600">Ringkasan seluruh operasional Hasil Bumi secara Real-Time</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 font-bold">Peringatan Stok Rendah!</AlertTitle>
          <AlertDescription className="text-orange-700">
            Ada <strong>{lowStockProducts.length} produk</strong> yang stoknya di bawah 25 unit. 
            Periksa detail di tabel produk.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Cabang" value={totalBranches} icon={<Store />} color="green" subtext="Aktif beroperasi" />
        <StatCard title="Total Produk" value={totalProducts} icon={<ShoppingBag />} color="blue" subtext="SKU terdaftar" />
        <StatCard title="Total Stok" value={totalStock.toLocaleString()} icon={<Package />} color="purple" subtext="Unit tersedia" />
        <StatCard 
          title="Revenue (Bulan Ini)" 
          value={`Rp ${(totalRevenue / 1000000).toFixed(1)}M`} 
          icon={<TrendingUp />} 
          color="amber" 
          subtext="Omzet kotor" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List Cabang */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Store className="h-5 w-5" /> Status Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {branchList.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-semibold text-sm">{branch.nama_cabang}</p>
                    <p className="text-xs text-gray-600">{branch.lokasi}</p>
                  </div>
                  <Badge className="bg-green-600">Aktif</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List Produk Stok Rendah */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" /> Produk Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-semibold text-sm">{product.nama_produk}</p>
                    <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    Sisa {product.stock} {product.satuan}
                  </Badge>
                </div>
              ))}
              {lowStockProducts.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">Semua stok aman.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Komponen Helper untuk Card Statistik
function StatCard({ title, value, icon, color, subtext }: any) {
  const colors: any = {
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold mb-1 opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs mt-2 opacity-70">{subtext}</p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-white/50`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}