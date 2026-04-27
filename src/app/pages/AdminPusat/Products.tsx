import { useState, useEffect } from 'react';
import { Edit, Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '../../../../utils/supabase/info'; 


export function AdminPusatProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama_produk: '', harga_jual: 0 });

  // 1. Ambil data dari Supabase
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('produk') // Sesuaikan jika nama tabelnya 'produk' atau 'product'
        .select('*')
        .order('nama_produk', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Gagal mengambil data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      nama_produk: product.nama_produk,
      harga_jual: product.harga_jual,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // 2. Simpan perubahan ke Supabase
  const handleSave = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('product')
        .update({
          nama_produk: editForm.nama_produk,
          harga_jual: editForm.harga_jual,
          update_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (error) throw error;

      // Update state lokal agar UI langsung berubah
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, nama_produk: editForm.nama_produk, harga_jual: editForm.harga_jual }
            : p
        )
      );
      
      setEditingId(null);
      toast.success('✓ Produk berhasil diperbarui di database!');
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kelola Produk & Harga (Pusat)</h2>
        <p className="text-gray-600">Atur harga jual dan informasi produk secara terpusat</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-700">
          <strong>Catatan:</strong> Perubahan <strong>Harga Jual</strong> akan langsung sinkron ke seluruh katalog pelanggan dan admin cabang.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Katalog Produk Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-4 px-3">SKU</th>
                    <th className="text-left py-4 px-3">Nama Produk</th>
                    <th className="text-right py-4 px-3">Harga Jual</th>
                    <th className="text-center py-4 px-3">Satuan</th>
                    <th className="text-center py-4 px-3">Status</th>
                    <th className="text-center py-4 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isEditing = editingId === product.id;

                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {product.sku || 'N/A'}
                          </code>
                        </td>
                        <td className="py-4 px-3">
                          {isEditing ? (
                            <Input
                              value={editForm.nama_produk}
                              onChange={(e) => setEditForm({ ...editForm, nama_produk: e.target.value })}
                              className="h-9"
                            />
                          ) : (
                            <div>
                              <p className="font-medium">{product.nama_produk}</p>
                              {product.is_perishable && (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  Perishable
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editForm.harga_jual}
                              onChange={(e) => setEditForm({ ...editForm, harga_jual: Number(e.target.value) })}
                              className="h-9 text-right"
                            />
                          ) : (
                            <span className="font-semibold text-green-700">{formatPrice(product.harga_jual)}</span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center text-gray-600">
                          {product.satuan}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {product.is_active ? (
                            <Badge className="bg-green-600">Aktif</Badge>
                          ) : (
                            <Badge variant="secondary">Non-Aktif</Badge>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex gap-2 justify-center">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(product.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}