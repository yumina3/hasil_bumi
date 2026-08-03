import { useState } from 'react';
import { CheckCircle, Truck, Store, Phone, MapPin, CreditCard, Calendar, Banknote } from 'lucide-react';
import { useAdminCabangData } from '../../context/AdminCabangContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export function AdminCabangHistory() {
  const { orderHistory } = useAdminCabangData();
  const [filterTime, setFilterTime] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  // Filter pakai field yang konsisten (waktu, delivery_method, metode_pembayaran, dan HANYA yang 'selesai')
  const filteredOrders = orderHistory.filter((order: any) => {
    if (order.status_pesanan !== 'selesai') return false;
    
    if (filterTime !== 'all' && order.created_at) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      if (filterTime === 'last_week') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < lastWeek) return false;
      } else if (filterTime === 'last_month') {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < lastMonth) return false;
      }
    }
    
    if (filterMethod !== 'all' && order.delivery_method !== filterMethod) return false;
    if (filterPayment !== 'all' && order.metode_pembayaran !== filterPayment) return false;
    return true;
  });

  // Stats counter pakai field yang sama dengan filter
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_bayar || 0), 0);
  const deliveryCount = filteredOrders.filter((o) => o.delivery_method === 'delivery').length;
  const pickupCount = filteredOrders.filter((o) => o.delivery_method === 'pick_up').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h2>
        <p className="text-gray-600">Riwayat pesanan yang telah selesai di cabang ini</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-green-700 font-semibold">Total Pesanan</p>
              <p className="text-3xl font-bold text-green-900">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Total Pendapatan</p>
              <p className="text-2xl font-bold text-blue-900">{formatPrice(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-orange-700 font-semibold">Delivery</p>
              <p className="text-3xl font-bold text-orange-900">{deliveryCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-purple-700 font-semibold">Pick Up</p>
              <p className="text-3xl font-bold text-purple-900">{pickupCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterTime} onValueChange={setFilterTime}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Waktu Pesanan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Waktu</SelectItem>
            <SelectItem value="last_week">1 Minggu Terakhir</SelectItem>
            <SelectItem value="last_month">1 Bulan Terakhir</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterMethod} onValueChange={setFilterMethod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Metode Ambil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Metode</SelectItem>
            {/* FIX 3: value harus match dengan nilai di DB */}
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
            {/* FIX 4: Hardcode opsi COD & QRIS, bukan dynamic dari relasi */}
            <SelectItem value="cod">COD (Tunai)</SelectItem>
            <SelectItem value="qris">QRIS</SelectItem>
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
                    {/* FIX 5: Pakai delivery_method (konsisten dengan checkout) */}
                    <Badge className={order.delivery_method === 'delivery' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                      {order.delivery_method === 'delivery' ? 'Delivery' : 'Pick Up'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Informasi Pelanggan</p>
                  {/* FIX 6: Baca dari nama_penerima & no_whatsapp */}
                  <p className="font-semibold text-gray-900">{order.nama_penerima || 'Tanpa Nama'}</p>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {order.no_whatsapp || '-'}
                  </div>
                  <div className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {/* FIX 7: Delivery tampil alamat, pick_up tampil catatan */}
                    <div className="flex-1">
                      {order.delivery_method === 'delivery' ? (
                        <>
                          <div className="mb-1">
                            {order.alamat_pengiriman 
                              ? order.alamat_pengiriman.split('| [')[0].trim() 
                              : 'Tidak ada alamat'}
                          </div>
                          {order.alamat_pengiriman && (
                            <a 
                              href={
                                order.alamat_pengiriman.includes('| [')
                                ? `https://www.google.com/maps/search/?api=1&query=${order.alamat_pengiriman.split('| [')[1].replace(']', '').replace(/\s/g, '')}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.alamat_pengiriman)}`
                              }
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <MapPin className="h-3 w-3" />
                              Buka Titik Peta Pelanggan
                            </a>
                          )}
                        </>
                      ) : (
                        order.catatan || 'Tidak ada catatan'
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Pembayaran</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    {/* FIX 8: Baca metode_pembayaran langsung dari tabel pesanan */}
                    <span className="font-medium uppercase">{order.metode_pembayaran || 'N/A'}</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {order.status_pesanan || 'Selesai'}
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