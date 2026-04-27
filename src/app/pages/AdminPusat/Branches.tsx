import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Store, Package, AlertTriangle, Phone, MapPin, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { supabase } from '../../../../utils/supabase/info';

export function AdminPusatBranches() {
  const [branchList, setBranchList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data Cabang dan Produk dari Supabase
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const { data: branches, error: bError } = await supabase.from('branches').select('*');
        const { data: products, error: pError } = await supabase.from('product').select('*');

        if (bError) throw bError;
        if (pError) throw pError;

        setBranchList(branches || []);
        setProductList(products || []);
      } catch (err: any) {
        console.error("Gagal memuat data monitor cabang:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Menghubungkan ke pusat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Monitor Cabang</h2>
        <p className="text-gray-600">Pantau stok dan operasional setiap cabang secara real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branchList.map((branch) => {
          // Filter produk yang ada di cabang ini (Asumsi: ada kolom cabang_id di tabel product)
          // Jika produk bersifat global, abaikan filter ini
          const branchProducts = productList.filter((p) => p.cabang_id === branch.id || !p.cabang_id);

          const totalStock = branchProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
          const lowStockCount = branchProducts.filter((p) => (p.stock || 0) < 25 && (p.stock || 0) > 0).length;
          const outOfStockCount = branchProducts.filter((p) => (p.stock || 0) === 0).length;

          return (
            <Card key={branch.id} className="border-2">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{branch.name}</CardTitle>
                      <p className="text-sm text-gray-600">{branch.city}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Aktif</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Branch Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{branch.address}</p>
                      <p className="text-gray-600">{branch.city}, {branch.postal_code || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-700">{branch.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-700">{branch.open_hours || '08:00 - 20:00'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-900">{totalStock}</p>
                    <p className="text-xs text-blue-600 mt-1">Total Stok</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                    <p className="text-2xl font-bold text-orange-900">{lowStockCount}</p>
                    <p className="text-xs text-orange-600 mt-1">Low Stock</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-900">{outOfStockCount}</p>
                    <p className="text-xs text-red-600 mt-1">Habis</p>
                  </div>
                </div>

                {/* Alerts */}
                {lowStockCount > 0 && (
                  <Alert className="bg-orange-50 border-orange-200 mb-3">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700 text-sm">
                      <strong>{lowStockCount} produk</strong> di bawah 25 unit
                    </AlertDescription>
                  </Alert>
                )}

                {outOfStockCount > 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 text-sm">
                      <strong>{outOfStockCount} produk</strong> habis stok
                    </AlertDescription>
                  </Alert>
                )}

                {/* Product List Detail */}
                <div className="mt-4">
                  <p className="font-semibold text-sm text-gray-700 mb-3">Detail Stok Produk:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {branchProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-2 rounded border text-sm ${
                          (product.stock || 0) === 0
                            ? 'bg-red-50 border-red-200'
                            : (product.stock || 0) < 25
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.nama_produk}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${(product.stock || 0) === 0 ? 'text-red-700' : (product.stock || 0) < 25 ? 'text-orange-700' : 'text-green-700'}`}>
                            {product.stock || 0} {product.satuan}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}