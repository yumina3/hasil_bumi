import { useState } from 'react';
import { Package, AlertTriangle, Edit, Save, X, Plus, Minus } from 'lucide-react';
import { useAdminCabangData } from '../../context/AdminCabangContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

export function AdminCabangInventory() {
  const { inventory, setInventory, lowStockItems } = useAdminCabangData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEditStart = (product: any) => {
    setEditingId(product.id);
    setEditStock(product.currentStock);
  };

  const handleSaveStock = (productId: number) => {
    setInventory((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: editStock } : p))
    );
    setEditingId(null);
    toast.success('Stock berhasil diupdate');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditStock(0);
  };

  const handleQuickAdjust = (productId: number, amount: number) => {
    setInventory((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, currentStock: Math.max(0, p.currentStock + amount) }
          : p
      )
    );
    toast.success(amount > 0 ? `+${amount} unit ditambahkan` : `${amount} unit dikurangi`);
  };

  // Get unique categories
  const categories = Array.from(new Set(inventory.map((p) => p.category)));

  // Filter inventory
  const filteredInventory = inventory.filter((product) => {
    if (filterCategory !== 'all' && product.category !== filterCategory) return false;
    if (filterStatus === 'low' && product.currentStock >= 25) return false;
    if (filterStatus === 'out' && product.currentStock !== 0) return false;
    if (filterStatus === 'ok' && product.currentStock < 25) return false;
    return true;
  });

  // Calculate stats
  const totalStock = inventory.reduce((sum, p) => sum + p.currentStock, 0);
  const outOfStock = inventory.filter((p) => p.currentStock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Control</h2>
        <p className="text-gray-600">Kelola stok produk di cabang Anda</p>
      </div>

      {/* Alerts */}
      {lowStockItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">⚠️ LOW STOCK ALERT!</AlertTitle>
          <AlertDescription className="text-red-700">
            <strong>{lowStockItems} produk</strong> memiliki stok di bawah 25 unit. Segera lakukan restock!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">Total Stok</p>
                <p className="text-3xl font-bold text-blue-900">{totalStock}</p>
                <p className="text-xs text-blue-600 mt-1">Unit tersedia</p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-semibold">Stok Rendah</p>
                <p className="text-3xl font-bold text-orange-900">{lowStockItems}</p>
                <p className="text-xs text-orange-600 mt-1">Produk {"<"} 25 unit</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-semibold">Habis Stok</p>
                <p className="text-3xl font-bold text-red-900">{outOfStock}</p>
                <p className="text-xs text-red-600 mt-1">Perlu restock</p>
              </div>
              <X className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status Stok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="ok">✓ Stok Cukup</SelectItem>
            <SelectItem value="low">⚠️ Stok Rendah</SelectItem>
            <SelectItem value="out">❌ Habis Stok</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Alert className="bg-blue-50 border-blue-200 py-2 px-4">
            <AlertDescription className="text-blue-700 text-sm">
              <strong>Info:</strong> Admin Cabang hanya dapat mengelola stok. Untuk edit harga, hubungi Admin Pusat.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-3">SKU</th>
                  <th className="text-left py-4 px-3">Nama Produk</th>
                  <th className="text-left py-4 px-3">Kategori</th>
                  <th className="text-right py-4 px-3">Harga (Read-Only)</th>
                  <th className="text-center py-4 px-3">Stok Saat Ini</th>
                  <th className="text-center py-4 px-3">Status</th>
                  <th className="text-center py-4 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((product) => {
                  const isEditing = editingId === product.id;
                  const stockStatus =
                    product.currentStock === 0
                      ? 'out'
                      : product.currentStock < 25
                      ? 'low'
                      : 'ok';

                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {product.sku}
                        </code>
                      </td>
                      <td className="py-4 px-3">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.isPerishable && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Perishable
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-gray-600">{product.category}</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="font-semibold text-gray-500">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditStock(Math.max(0, editStock - 10))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(Number(e.target.value))}
                              className="w-20 h-9 text-center"
                              min="0"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditStock(editStock + 10)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-lg">{product.currentStock}</span>
                            <span className="text-gray-500 text-sm ml-1">{product.unit}</span>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAdjust(product.id, -5)}
                                className="h-7 px-2"
                              >
                                -5
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAdjust(product.id, 5)}
                                className="h-7 px-2"
                              >
                                +5
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAdjust(product.id, 10)}
                                className="h-7 px-2"
                              >
                                +10
                              </Button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3 text-center">
                        {stockStatus === 'out' && (
                          <Badge className="bg-red-600">❌ Habis</Badge>
                        )}
                        {stockStatus === 'low' && (
                          <Badge className="bg-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                        {stockStatus === 'ok' && (
                          <Badge className="bg-green-600">✓ Baik</Badge>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex gap-2 justify-center">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveStock(product.id)}
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
                              onClick={() => handleEditStart(product)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}