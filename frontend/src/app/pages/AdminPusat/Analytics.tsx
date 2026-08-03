import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3, TrendingUp, ShoppingCart, Package } from 'lucide-react';

export function AdminPusatAnalytics() {
  // Mock data
  const salesData = [
    { month: 'Jan', sales: 45000000 },
    { month: 'Feb', sales: 52000000 },
    { month: 'Mar', sales: 48000000 },
    { month: 'Apr', sales: 65000000 },
  ];

  const topProducts = [
    { name: 'Bayam Organik', sold: 1250, revenue: 18750000 },
    { name: 'Wortel Premium', sold: 980, revenue: 29400000 },
    { name: 'Tomat Segar', sold: 875, revenue: 21875000 },
    { name: 'Kangkung Fresh', sold: 1450, revenue: 14500000 },
    { name: 'Brokoli Segar', sold: 650, revenue: 19500000 },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="text-gray-600">Analisis performa penjualan dan tren produk</p>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold mb-1">Total Sales (Bulan Ini)</p>
                <p className="text-3xl font-bold text-green-900">Rp 65M</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold">+15.3%</p>
                </div>
              </div>
              <div className="h-14 w-14 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-900">3,456</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <p className="text-xs text-blue-600 font-semibold">+8.2%</p>
                </div>
              </div>
              <div className="h-14 w-14 bg-blue-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-900">Rp 188K</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <p className="text-xs text-purple-600 font-semibold">+6.5%</p>
                </div>
              </div>
              <div className="h-14 w-14 bg-purple-200 rounded-full flex items-center justify-center">
                <Package className="h-7 w-7 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tren Penjualan (4 Bulan Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((data, index) => {
                const maxSales = Math.max(...salesData.map((d) => d.sales));
                const percentage = (data.sales / maxSales) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{data.month} 2026</span>
                      <span className="text-sm font-bold text-green-700">
                        {formatPrice(data.sales)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top 5 Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.sold.toLocaleString()} unit terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700 text-sm">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
