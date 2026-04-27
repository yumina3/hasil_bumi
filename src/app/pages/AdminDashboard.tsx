import { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown, Store, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { supabase } from '../../../utils/supabase/info'; // Pastikan path benar

export function AdminDashboard() {
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [productList, setProductList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil data dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: bData } = await supabase.from('cabang').select('*');
        const { data: pData } = await supabase.from('produk').select('*');
        
        if (bData) setBranchList(bData);
        if (pData) setProductList(pData);
      } catch (error) {
        console.error("Gagal sinkronisasi dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filter Produk berdasarkan Cabang yang dipilih
  // Catatan: Jika tabel produk kamu memiliki kolom 'cabang_id'
  const currentBranchProducts = productList.filter(p => p.cabang_id === selectedBranchId || !p.cabang_id);
  
  const lowStockItems = currentBranchProducts.filter((item) => (item.stock || 0) <= 25);
  const perishableItems = currentBranchProducts.filter((item) => item.is_perishable);
  const selectedBranch = branchList.find((b) => b.id === selectedBranchId);

  // Hitung Nilai Inventori
  const totalInventoryValue = currentBranchProducts.reduce((total, product) => {
    return total + ((product.harga_jual || 0) * (product.stock || 0));
  }, 0);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <span className="ml-2">Memuat data inventori...</span>
    </div>
  );

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-green-800">Dashboard Admin - Hasil Bumi</h1>
          <p className="text-gray-600">Manajemen Stok Real-Time dari Database</p>
        </div>

        {/* Branch Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-green-600" />
                <span className="font-medium">Pilih Cabang:</span>
              </div>
              <Select 
                value={selectedBranchId.toString()} 
                onValueChange={(value) => setSelectedBranchId(Number(value))}
              >
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Pilih Cabang" />
                </SelectTrigger>
                <SelectContent>
                  {branchList.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.nama_cabang} - {branch.lokasi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total SKU" value={currentBranchProducts.length} icon={<Package className="text-blue-600" />} />
          <StatCard title="Stok Rendah" value={lowStockItems.length} icon={<AlertTriangle className="text-red-600" />} isAlert={lowStockItems.length > 0} />
          <StatCard title="Barang Perishable" value={perishableItems.length} icon={<TrendingDown className="text-orange-600" />} />
          <StatCard title="Nilai Inventori" value={formatPrice(totalInventoryValue)} icon={<Store className="text-green-600" />} />
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">Peringatan Stok Rendah!</AlertTitle>
            <AlertDescription className="text-red-700">
              {lowStockItems.length} produk di {selectedBranch?.nama_cabang} segera habis.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Semua Produk</TabsTrigger>
            <TabsTrigger value="lowstock">Stok Rendah</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader><CardTitle>Inventori - {selectedBranch?.nama_cabang}</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2">SKU</th>
                        <th className="py-3 px-2">Nama Produk</th>
                        <th className="py-3 px-2 text-center">Stok</th>
                        <th className="py-3 px-2 text-right">Harga Jual</th>
                        <th className="py-3 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBranchProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2"><code className="text-xs bg-gray-100 px-2 py-1 rounded">{product.sku}</code></td>
                          <td className="py-3 px-2 font-medium">{product.nama_produk}</td>
                          <td className={`py-3 px-2 text-center ${(product.stock || 0) <= 25 ? 'text-red-600 font-bold' : ''}`}>
                            {product.stock || 0} {product.satuan}
                          </td>
                          <td className="py-3 px-2 text-right">{formatPrice(product.harga_jual)}</td>
                          <td className="py-3 px-2 text-center">
                            {(product.stock || 0) <= 25 ? <Badge variant="destructive">Restock</Badge> : <Badge className="bg-green-600">OK</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Komponen Pembantu
function StatCard({ title, value, icon, isAlert }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${isAlert ? 'text-red-600' : ''}`}>{value}</p>
          </div>
          <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}