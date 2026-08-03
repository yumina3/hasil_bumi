import { Card, CardContent } from '../../components/ui/card';
import { Clock, Box, Truck, Store, AlertTriangle, ShoppingCart, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useAdminCabangData } from '../../context/AdminCabangContext';

export function AdminCabangDashboard() {
  const { lowStockItems, newOrders, deliveryOrdersToday } = useAdminCabangData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Ringkasan operasional cabang Anda</p>
      </div>

      {/* Alerts */}
      {lowStockItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">LOW STOCK ALERT!</AlertTitle>
          <AlertDescription className="text-red-700">
            <strong>{lowStockItems} produk</strong> memiliki stok di bawah 25 unit. Segera lakukan restock untuk menghindari kehabisan stok!
          </AlertDescription>
        </Alert>
      )}

      {deliveryOrdersToday >= 90 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 font-bold">Kuota Delivery Hampir Penuh!</AlertTitle>
          <AlertDescription className="text-orange-700">
            Hari ini sudah ada <strong>{deliveryOrdersToday}/100</strong> pesanan delivery. Maksimal 100 pesanan per hari.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-semibold mb-1">Stok Rendah</p>
                <p className="text-4xl font-bold text-red-900">{lowStockItems}</p>
                <p className="text-xs text-red-600 mt-2">Produk {"<"} 25 unit</p>
              </div>
              <div className="h-16 w-16 bg-red-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold mb-1">Pesanan Baru</p>
                <p className="text-4xl font-bold text-blue-900">{newOrders}</p>
                <p className="text-xs text-blue-600 mt-2">Perlu konfirmasi</p>
              </div>
              <div className="h-16 w-16 bg-blue-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold mb-1">Delivery Hari Ini</p>
                <p className="text-4xl font-bold text-green-900">{deliveryOrdersToday}<span className="text-2xl">/100</span></p>
                <p className="text-xs text-green-600 mt-2">Kuota harian</p>
              </div>
              <div className="h-16 w-16 bg-green-200 rounded-full flex items-center justify-center">
                <Truck className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold mb-1">Total Produk</p>
                <p className="text-4xl font-bold text-purple-900">24</p>
                <p className="text-xs text-purple-600 mt-2">SKU tersedia</p>
              </div>
              <div className="h-16 w-16 bg-purple-200 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/admin-cabang/orders'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Kelola Pesanan</p>
                <p className="text-sm text-gray-600">Proses pesanan masuk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/admin-cabang/inventory'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Box className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Kelola Stok</p>
                <p className="text-sm text-gray-600">Update inventory</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/admin-cabang/history'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Lihat History</p>
                <p className="text-sm text-gray-600">Riwayat pesanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}