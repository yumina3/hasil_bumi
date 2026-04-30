import { useState } from 'react';
import { CheckCircle, Truck, Store, Phone, MapPin, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useAdminCabangData } from '../../context/AdminCabangContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export function AdminCabangHistory() {
  const { orderHistory } = useAdminCabangData();
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  // 1. Perbaikan Filter (Menyesuaikan dengan hasil join di orderService)
  const filteredOrders = orderHistory.filter((order: any) => {
    // Di SQL kamu isinya 'pick_up' atau 'delivery'
    if (filterMethod !== 'all' && order.metode_ambil !== filterMethod) return false;
    
    // Pembayaran biasanya dalam bentuk array atau objek hasil join
    const paymentMethod = order.pembayaran?.metode_bayar || 'N/A';
    if (filterPayment !== 'all' && paymentMethod !== filterPayment) return false;
    
    return true;
  });

  // 2. Perbaikan Perhitungan Stats
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_bayar || 0), 0);
  const deliveryCount = filteredOrders.filter((o) => o.delivery_method === 'delivery').length;
  const pickupCount = filteredOrders.filter((o) => o.delivery_method === 'pick_up').length;

  // Mendapatkan daftar metode pembayaran unik untuk filter
  const paymentMethods = Array.from(
    new Set(orderHistory.map((o: any) => o.pembayaran?.metode_bayar).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">History Pesanan</h2>
        <p className="text-gray-600">Riwayat pesanan yang telah selesai di cabang ini</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Total Pesanan</p>
              <p className="text-3xl font-bold text-green-900">{totalOrders}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900">{formatPrice(totalRevenue)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-semibold">Delivery</p>
              <p className="text-3xl font-bold text-orange-900">{deliveryCount}</p>
            </div>
            <Truck className="h-10 w-10 text-orange-600 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-semibold">Pick Up</p>
              <p className="text-3xl font-bold text-purple-900">{pickupCount}</p>
            </div>
            <Store className="h-10 w-10 text-purple-600 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterMethod} onValueChange={setFilterMethod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Metode Ambil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Metode</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="pick_up">Pick Up</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Metode Bayar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Pembayaran</SelectItem>
            {paymentMethods.map((method: any) => (
              <SelectItem key={method} value={method}>{method}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="py-12 text-center text-gray-500">Data riwayat tidak ditemukan.</Card>
        ) : (
          filteredOrders.map((order: any) => (
            <Card key={order.id} className="border-2 hover:border-green-200 transition-colors">
              <CardHeader className="bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-md">Invoice: {order.no_invoice}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-700">{formatPrice(order.total_bayar)}</div>
                    <Badge className={order.metode_ambil === 'delivery' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                      {order.metode_ambil === 'delivery' ? 'Delivery' : 'Pick Up'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Informasi Pelanggan</p>
                  <p className="font-semibold text-gray-900">{order.users?.nama_lengkap || 'Tanpa Nama'}</p>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {order.users?.no_telepon || '-'}
                  </div>
                  <div className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{order.catatan || 'Tidak ada catatan alamat'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pembayaran</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{order.pembayaran?.metode_bayar || 'N/A'}</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {order.pembayaran?.status_pembayaran || 'Selesai'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}