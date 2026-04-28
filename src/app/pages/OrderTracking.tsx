import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Package, CheckCircle, Truck, MapPin, Store, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { supabase } from "../../../utils/supabase/info";

type DeliveryMethod = 'delivery' | 'pick_up';

// =============================================
// PICKUP: 3 step
// =============================================
const PICKUP_STEPS = [
  
  {
    key: 'dikonfirmasi',
    status: 'Pesanan Dikonfirmasi Toko',
    description: 'Pesanan telah dikonfirmasi oleh toko dan sedang disiapkan.',
    icon: CheckCircle,
  },
  {
    key: 'dibuat',
    status: 'Pesanan Dibuat',
    description: 'Pesanan Anda telah dibuat dan menunggu konfirmasi toko.',
    icon: Package,
  },
  {
    key: 'siap_diambil',
    status: 'Pesanan Siap Diambil',
    description: 'Silakan ambil pesanan Anda di toko.',
    icon: Store,
  },
];

// =============================================
// DELIVERY: 5 step
// =============================================
const DELIVERY_STEPS = [
  
  {
    key: 'dikonfirmasi',
    status: 'Pesanan Dikonfirmasi',
    description: 'Pesanan telah dikonfirmasi oleh toko.',
    icon: CheckCircle,
  },
  {
    key: 'dibuat',
    status: 'Pesanan Dibuat',
    description: 'Pesanan Anda telah dibuat dan menunggu konfirmasi.',
    icon: Package,
  },
  {
    key: 'dikemas',
    status: 'Pesanan Sedang Dikemas',
    description: 'Toko sedang mengemas pesanan Anda dengan teliti.',
    icon: Package,
  },
  {
    key: 'dikirim',
    status: 'Pesanan Dalam Pengiriman',
    description: 'Pesanan sedang dalam perjalanan menuju lokasi Anda.',
    icon: Truck,
  },
  {
    key: 'selesai',
    status: 'Pesanan Selesai',
    description: 'Pesanan telah diterima. Terima kasih telah berbelanja!',
    icon: CheckCircle,
  },
];

// =============================================
// STATUS DB → INDEX STEP
// =============================================
const STATUS_TO_STEP_PICKUP: Record<string, number> = {
  'menunggu_pembayaran': 0,
  'dibayar':             0,
  'diproses':            1, // dikonfirmasi toko
  'siap_diambil':        2,
  'selesai':             2,
  'dibatalkan':          -1,
};

const STATUS_TO_STEP_DELIVERY: Record<string, number> = {
  'menunggu_pembayaran': 0,
  'dibayar':             0,
  'diproses':            1, // dikonfirmasi
  'dikemas':             2,
  'dikirim':             3,
  'selesai':             4,
  'dibatalkan':          -1,
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  'menunggu_pembayaran': { label: 'Menunggu Pembayaran', color: 'bg-yellow-500' },
  'dibayar':             { label: 'Dibayar', color: 'bg-blue-500' },
  'diproses':            { label: 'Diproses', color: 'bg-orange-500' },
  'dikemas':             { label: 'Dikemas', color: 'bg-purple-500' },
  'dikirim':             { label: 'Dalam Pengiriman', color: 'bg-indigo-500' },
  'siap_diambil':        { label: 'Siap Diambil', color: 'bg-teal-500' },
  'selesai':             { label: 'Selesai', color: 'bg-green-600' },
  'dibatalkan':          { label: 'Dibatalkan', color: 'bg-red-500' },
};

export function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [pengiriman, setPengiriman] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;

      const parsedId = Number(orderId);
      if (isNaN(parsedId)) {
        console.error('orderId tidak valid:', orderId);
        setLoading(false);
        return;
      }

      // Fetch pesanan
      const { data: orderData, error: orderError } = await supabase
        .from('pesanan')
        .select('*')
        .eq('id', parsedId)
        .maybeSingle();

      if (orderError || !orderData) {
        console.error('Gagal fetch pesanan:', orderError?.message);
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // Fetch cabang
      if (orderData.cabang_id) {
        const { data: cabangData } = await supabase
          .from('cabang')
          .select('*')
          .eq('id', orderData.cabang_id)
          .maybeSingle();
        if (cabangData) setCabang(cabangData);
      }

      // Fetch pengiriman hanya jika delivery
      if (orderData.delivery_method === 'delivery') {
        const { data: pengirimanData } = await supabase
          .from('pengiriman')
          .select('id, pesanan_id, nama_kurir, no_resi_lokal, jarak_km, ongkos_kirim, status_pengiriman, jadwal_kirim, updated_at')
          .eq('pesanan_id', parsedId)
          .maybeSingle();
        if (pengirimanData) setPengiriman(pengirimanData);
      }

      setLoading(false);
    };

    fetchData();
  }, [orderId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price ?? 0);

  const formatDate = (ts: string) => {
    if (!ts) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(ts));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-green-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pesanan tidak ditemukan.</p>
          <Link to="/orders">
            <Button variant="outline">Kembali ke Pesanan</Button>
          </Link>
        </div>
      </div>
    );
  }

  const deliveryMethod = (order.delivery_method ?? 'delivery') as DeliveryMethod;
  const isPickup = deliveryMethod === 'pick_up';
  const steps = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const statusMap = isPickup ? STATUS_TO_STEP_PICKUP : STATUS_TO_STEP_DELIVERY;
  const currentStepIndex = statusMap[order.status_pesanan] ?? 0;
  const isCancelled = order.status_pesanan === 'dibatalkan';
  const currentStatus = STATUS_LABEL[order.status_pesanan] ?? { label: order.status_pesanan, color: 'bg-gray-500' };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <Link to="/orders">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Pesanan
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold mb-1">Lacak Pesanan</h1>
              <p className="text-gray-500 text-sm">
                No. Invoice: <span className="font-semibold text-gray-800">{order.no_invoice}</span>
              </p>
            </div>
            <Badge className={`${currentStatus.color} text-white px-4 py-2 text-sm`}>
              {currentStatus.label}
            </Badge>
          </div>
        </div>

        {/* Tracking Steps */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isPickup ? 'Status Pengambilan' : 'Status Pengiriman'}
              </CardTitle>
              <Badge variant="outline" className="font-normal">
                {isPickup ? '🏪 Ambil di Toko' : '🚚 Diantar ke Rumah'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <div className="text-center py-6">
                <p className="text-red-500 font-semibold text-lg">Pesanan Dibatalkan</p>
                <p className="text-gray-500 text-sm mt-1">Pesanan ini telah dibatalkan.</p>
              </div>
            ) : (
              <div className="relative">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isDikirimStep = !isPickup && index === 3; // step "Dalam Pengiriman"

                  return (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      {/* Icon + Garis */}
                      <div className="relative flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-600 text-white shadow-md shadow-green-200'
                            : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                            style={{ minHeight: '40px' }}
                          />
                        )}
                      </div>

                      {/* Konten Step */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-start justify-between mb-1 flex-wrap gap-1">
                          <h3 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.status}
                            {isCurrent && (
                              <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Sekarang
                              </span>
                            )}
                          </h3>

                          {/* Waktu dibuat */}
                          {index === 0 && order.created_at && (
                            <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                          )}

                          {/* Info kurir di header step dikirim */}
                          {isDikirimStep && pengiriman && isCompleted && (
                            <span className="text-xs text-indigo-500 font-medium">
                              {pengiriman.nama_kurir}
                              {pengiriman.no_resi_lokal ? ` · ${pengiriman.no_resi_lokal}` : ''}
                            </span>
                          )}
                        </div>

                        <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.description}
                        </p>

                        {/* Detail pengiriman dari tabel pengiriman */}
                        {isDikirimStep && pengiriman && isCompleted && (
                          <div className="mt-3 p-3 bg-indigo-50 rounded-xl text-xs text-indigo-700 space-y-1.5">
                            <p>🚚 Kurir: <strong>{pengiriman.nama_kurir ?? '-'}</strong></p>
                            {pengiriman.no_resi_lokal && (
                              <p>📦 No. Resi: <strong>{pengiriman.no_resi_lokal}</strong></p>
                            )}
                            {pengiriman.jarak_km && (
                              <p>📍 Jarak: <strong>{pengiriman.jarak_km} km</strong></p>
                            )}
                            {pengiriman.jadwal_kirim && (
                              <p>🕐 Jadwal Kirim: <strong>{formatDate(pengiriman.jadwal_kirim)}</strong></p>
                            )}
                            {pengiriman.status_pengiriman && (
                              <p>📌 Status: <strong className="capitalize">{pengiriman.status_pengiriman}</strong></p>
                            )}
                            {pengiriman.updated_at && (
                              <p>🔄 Update: <strong>{formatDate(pengiriman.updated_at)}</strong></p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Pengambilan / Pengiriman */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isPickup ? 'Informasi Pengambilan' : 'Informasi Pengiriman'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPickup ? (
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Ambil di Toko</p>
                  <p className="text-sm text-gray-600">{cabang?.nama_cabang ?? '-'}</p>
                  <p className="text-sm text-gray-600">{cabang?.alamat ?? '-'}</p>
                  <p className="text-sm text-gray-600">{cabang?.no_telepon ?? cabang?.telp ?? '-'}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Alamat Pengiriman</p>
                    <p className="text-sm text-gray-600">{order.nama_penerima ?? '-'}</p>
                    <p className="text-sm text-gray-600">{order.no_whatsapp ?? '-'}</p>
                    <p className="text-sm text-gray-600">{order.alamat_pengiriman ?? '-'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Dikirim dari Cabang</p>
                    <p className="text-sm text-gray-600">{cabang?.nama_cabang ?? '-'}</p>
                    <p className="text-sm text-gray-600">{cabang?.alamat ?? '-'}</p>
                    <p className="text-sm text-gray-600">{cabang?.no_telepon ?? cabang?.telp ?? '-'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ringkasan Pembayaran */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ringkasan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span>{formatPrice(order.ongkos_kirim)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="font-bold text-xl text-green-700">{formatPrice(order.total_bayar)}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Metode Pembayaran</span>
                <span className="font-semibold capitalize">
                  {order.metode_pembayaran?.replace('_', ' ') ?? '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Metode Pengiriman</span>
                <Badge variant="outline" className={isPickup ? 'text-blue-600 border-blue-600' : 'text-green-600 border-green-600'}>
                  {isPickup ? 'Ambil di Toko' : 'Diantar ke Rumah'}
                </Badge>
              </div>
              {order.catatan && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Catatan</span>
                  <span className="text-right max-w-[60%]">{order.catatan}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aksi */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/orders">Lihat Semua Pesanan</Link>
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
            <Link to="/produk">Belanja Lagi</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}