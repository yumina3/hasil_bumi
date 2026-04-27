import { useState } from 'react';
import { Clock, CheckCircle, Box, Truck, Store, Phone, MapPin, CreditCard,Calendar } from 'lucide-react';
import { useAdminCabangData } from '../../context/AdminCabangContext';
import { orderService } from '../orderService'; // Pastikan path benar
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';

export function AdminCabangOrders() {
  // Ambil fungsi refreshAllData dari context untuk sinkronisasi ulang setelah update
  const { orders, refreshAllData } = useAdminCabangData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      // Gunakan service untuk update ke Supabase
      await orderService.updateStatus(orderId, newStatus);
      
      const statusMessages: { [key: string]: string } = {
        confirmed: '✓ Pesanan dikonfirmasi',
        packing: '📦 Pesanan sedang dikemas',
        shipping: '🚚 Pesanan sedang dikirim',
        ready: '✓ Pesanan siap diambil',
        completed: '🎉 Pesanan selesai',
      };

      toast.success(statusMessages[newStatus] || 'Status pesanan diupdate');
      
      // Refresh data global di context agar UI sinkron dengan DB
      await refreshAllData();
    } catch (error: any) {
      toast.error("Gagal update status: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: { [key: string]: { color: string; icon: any; label: string } } = {
      menunggu_pembayaran: { color: 'bg-yellow-600', icon: Clock, label: 'Menunggu Bayar' },
      new: { color: 'bg-blue-500', icon: Clock, label: 'Pesanan Baru' },
      confirmed: { color: 'bg-blue-700', icon: CheckCircle, label: 'Dikonfirmasi' },
      packing: { color: 'bg-purple-600', icon: Box, label: 'Dikemas' },
      shipping: { color: 'bg-orange-600', icon: Truck, label: 'Dikirim' },
      ready: { color: 'bg-green-600', icon: Store, label: 'Siap Diambil' },
    };

    const config = configs[status] || configs['new'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getNextAction = (order: any) => {
    // Sesuaikan dengan enum di SQL: 'pick_up' dan 'delivery'
    if (order.metode_ambil === 'delivery') {
      const actions: { [key: string]: { label: string; status: string } } = {
        new: { label: 'Konfirmasi Pesanan', status: 'confirmed' },
        confirmed: { label: 'Mulai Packing', status: 'packing' },
        packing: { label: 'Kirim Pesanan', status: 'shipping' },
        shipping: { label: 'Selesaikan Pesanan', status: 'completed' },
      };
      return actions[order.status_pesanan];
    } else {
      const actions: { [key: string]: { label: string; status: string } } = {
        new: { label: 'Konfirmasi Pesanan', status: 'confirmed' },
        confirmed: { label: 'Mulai Packing', status: 'packing' },
        packing: { label: 'Siap Diambil', status: 'ready' },
        ready: { label: 'Selesaikan Pesanan', status: 'completed' },
      };
      return actions[order.status_pesanan];
    }
  };

  // Filter menggunakan kolom database: status_pesanan dan metode_ambil
  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all' && order.status_pesanan !== filterStatus) return false;
    if (filterMethod !== 'all' && order.metode_ambil !== filterMethod) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Kelola pesanan cabang dan update status pengiriman</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="new">Pesanan Baru</SelectItem>
              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
              <SelectItem value="packing">Dikemas</SelectItem>
              <SelectItem value="shipping">Dikirim</SelectItem>
              <SelectItem value="ready">Siap Diambil</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Metode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="pick_up">Pick Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>Tidak ada pesanan aktif yang ditemukan.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order: any) => {
          const nextAction = getNextAction(order);

          return (
            <Card key={order.id} className="border-2 shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">#{order.no_invoice}</CardTitle>
                    {getStatusBadge(order.status_pesanan)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Customer Info - Mengambil data dari hasil join tabel users */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Penerima</p>
                    <div className="space-y-2">
                      <p className="font-bold text-gray-900">{order.users?.nama_lengkap || 'Pelanggan'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" /> {order.users?.no_telepon || '-'}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{order.catatan || 'Ambil di Toko'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Payment & Total */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pembayaran</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{order.pembayaran?.metode_bayar || 'Belum Bayar'}</span>
                      </div>
                      <Badge variant="outline" className={order.metode_ambil === 'delivery' ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-green-600 border-green-200 bg-green-50'}>
                        {order.metode_ambil === 'delivery' ? '🚚 Delivery' : '🏪 Pick Up'}
                      </Badge>
                      <div className="pt-2">
                        <p className="text-xs text-gray-400">Total Tagihan</p>
                        <p className="text-xl font-black text-green-700">{formatPrice(order.total_bayar)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kendali Pesanan</p>
                    {nextAction && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, nextAction.status)}
                        className="w-full bg-green-600 hover:bg-green-700 font-bold py-6 text-md shadow-md"
                      >
                        {nextAction.label}
                      </Button>
                    )}
                    
                    {/* Visual Status Indicator */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                       <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase">Progress</p>
                       <div className="flex items-center w-full">
                          {['new', 'confirmed', 'packing', order.metode_ambil === 'delivery' ? 'shipping' : 'ready', 'completed'].map((step, i, arr) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className={`h-3 w-3 rounded-full ${
                                order.status_pesanan === step || arr.indexOf(order.status_pesanan) > i ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              {i !== arr.length - 1 && <div className={`h-[2px] flex-1 ${arr.indexOf(order.status_pesanan) > i ? 'bg-green-500' : 'bg-gray-300'}`} />}
                            </div>
                          ))}
                       </div>
                    </div>
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