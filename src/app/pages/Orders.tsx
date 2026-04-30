import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Package, Clock, Truck, CheckCircle, MapPin, Loader2, Store,
  ChevronDown, ChevronUp, XCircle, AlertCircle, ThumbsUp,
} from 'lucide-react';
import { supabase } from '../../../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';

interface DetailPesanan {
  id: number;
  qty: number;
  nama_produk: string;
  harga_saat_beli: number;
  total_harga: number;
}

interface Order {
  id: number;
  no_invoice: string;
  created_at: string;
  status_pesanan: string;
  total_bayar: number;
  metode_pembayaran: string;
  delivery_method: string;
  alasan_penolakan?: string;
  detail_pesanan: DetailPesanan[];
}

export function Orders() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pesanan')
        .select(`
          id,
          no_invoice,
          created_at,
          status_pesanan,
          total_bayar,
          metode_pembayaran,
          delivery_method,
          alasan_penolakan,
          detail_pesanan(id, qty, nama_produk, harga_saat_beli, total_harga)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price ?? 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { icon: any; color: string; label: string }> = {
      menunggu_pembayaran: { icon: Clock,       color: 'bg-yellow-500', label: 'Menunggu Pembayaran' },
      pembayaran_lunas:    { icon: Clock,       color: 'bg-blue-400',   label: 'Menunggu Konfirmasi' },
      dibayar:             { icon: CheckCircle, color: 'bg-blue-500',   label: 'Dibayar'             },
      diproses:            { icon: CheckCircle, color: 'bg-green-500',  label: 'Diterima & Diproses' },
      dikemas:             { icon: Package,     color: 'bg-purple-500', label: 'Dikemas'             },
      dikirim:             { icon: Truck,       color: 'bg-indigo-500', label: 'Dalam Pengiriman'    },
      siap_diambil:        { icon: Store,       color: 'bg-teal-500',   label: 'Siap Diambil'        },
      selesai:             { icon: CheckCircle, color: 'bg-green-600',  label: 'Selesai'             },
      dibatalkan:          { icon: XCircle,     color: 'bg-gray-500',   label: 'Dibatalkan'          },
      ditolak:             { icon: XCircle,     color: 'bg-red-500',    label: 'Ditolak'             },
    };
    const config = variants[status] || { icon: Clock, color: 'bg-gray-500', label: status };
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />{config.label}
      </Badge>
    );
  };

  // Pesanan masih menunggu konfirmasi admin (belum diterima/ditolak)
  const isWaitingConfirmation = (status: string) =>
    status === 'menunggu_pembayaran' || status === 'pembayaran_lunas';

  // Pesanan sudah ditolak
  const isRejected = (status: string) => status === 'ditolak';

  const ongoingOrders   = orders.filter(o => o.status_pesanan !== 'selesai' && o.status_pesanan !== 'dibatalkan' && o.status_pesanan !== 'ditolak');
  const rejectedOrders  = orders.filter(o => o.status_pesanan === 'ditolak' || o.status_pesanan === 'dibatalkan');
  const completedOrders = orders.filter(o => o.status_pesanan === 'selesai');

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-gray-600">Memuat pesanan...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
          <p className="text-gray-600">Lacak dan kelola pesanan Anda</p>
        </div>

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="ongoing">Berlangsung ({ongoingOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Selesai ({completedOrders.length})</TabsTrigger>
            <TabsTrigger value="rejected">Ditolak ({rejectedOrders.length})</TabsTrigger>
          </TabsList>

          {/* Tab: Sedang Berlangsung */}
          <TabsContent value="ongoing" className="mt-6 space-y-4">
            {ongoingOrders.length === 0
              ? <EmptyState title="Tidak ada pesanan aktif" sub="Yuk belanja sekarang!" />
              : ongoingOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                    isWaitingConfirmation={isWaitingConfirmation(order.status_pesanan)}
                  />
                ))}
          </TabsContent>

          {/* Tab: Selesai */}
          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedOrders.length === 0
              ? <EmptyState title="Belum ada pesanan selesai" sub="Pesanan selesai akan muncul di sini" isCompleted />
              : completedOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                    isCompleted
                  />
                ))}
          </TabsContent>

          {/* Tab: Ditolak/Dibatalkan */}
          <TabsContent value="rejected" className="mt-6 space-y-4">
            {rejectedOrders.length === 0
              ? <EmptyState title="Tidak ada pesanan ditolak" sub="Pesanan yang ditolak akan tampil di sini" isRejected />
              : rejectedOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                    isRejected
                  />
                ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  formatDate,
  formatPrice,
  getStatusBadge,
  isCompleted,
  isRejected,
  isWaitingConfirmation,
}: {
  order: Order;
  formatDate: (d: string) => string;
  formatPrice: (p: number) => string;
  getStatusBadge: (s: string) => React.ReactNode;
  isCompleted?: boolean;
  isRejected?: boolean;
  isWaitingConfirmation?: boolean;
}) {
  const [showItems, setShowItems] = useState(false);
  const items    = order.detail_pesanan || [];
  const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      isRejected
        ? 'border-red-200 bg-red-50/30'
        : isWaitingConfirmation
        ? 'border-yellow-300 bg-yellow-50/30'
        : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1 font-mono">{order.no_invoice || order.id}</CardTitle>
            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
          </div>
          {getStatusBadge(order.status_pesanan)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ── Banner: Menunggu Konfirmasi Admin ── */}
        {isWaitingConfirmation && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Menunggu Konfirmasi Toko</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Pesanan Anda sedang ditinjau oleh admin. Anda akan mendapat notifikasi setelah pesanan diterima atau ditolak.
              </p>
            </div>
          </div>
        )}

        {/* ── Banner: Pesanan Diterima (status diproses) ── */}
        {order.status_pesanan === 'diproses' && (
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <ThumbsUp className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Pesanan Diterima! 🎉</p>
              <p className="text-xs text-green-600 mt-0.5">
                Admin telah menerima pesanan Anda dan sedang menyiapkannya.
              </p>
            </div>
          </div>
        )}

        {/* ── Banner: Pesanan Ditolak ── */}
        {isRejected && order.status_pesanan === 'ditolak' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Pesanan Ditolak</p>
              <p className="text-xs text-red-600 mt-0.5 mb-2">
                Mohon maaf, pesanan Anda tidak dapat diproses oleh toko.
              </p>
              {order.alasan_penolakan && (
                <div className="bg-white border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Alasan</p>
                  <p className="text-sm text-red-700">{order.alasan_penolakan}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info ringkas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Pembayaran</p>
            <p className="font-semibold text-green-700">{formatPrice(order.total_bayar)}</p>
          </div>
          <div>
            <p className="text-gray-600">Metode Pembayaran</p>
            <p className="font-semibold capitalize">{order.metode_pembayaran ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Item</p>
            <p className="font-semibold text-green-700">{totalQty} produk</p>
          </div>
          <div>
            <p className="text-gray-600">Metode Pengiriman</p>
            <p className="font-semibold capitalize">
              {order.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Pick Up'}
            </p>
          </div>
        </div>

        {/* Toggle detail item */}
        {items.length > 0 && (
          <div>
            <button
              onClick={() => setShowItems(v => !v)}
              className="flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              {showItems ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showItems ? 'Sembunyikan' : 'Lihat'} {items.length} produk
            </button>

            {showItems && (
              <div className="mt-3 rounded-xl border bg-gray-50 overflow-hidden">
                {items.map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="h-6 w-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                        {item.qty}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.nama_produk}</p>
                        <p className="text-xs text-gray-400">{formatPrice(item.harga_saat_beli)} / satuan</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-green-700 shrink-0 ml-3">
                      {formatPrice(item.total_harga)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 bg-green-50">
                  <span className="text-xs font-bold text-gray-500">Total</span>
                  <span className="text-sm font-bold text-green-700">{formatPrice(order.total_bayar)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Tombol aksi */}
        <div className="flex gap-2">
          {/* Tombol Lacak hanya muncul jika pesanan sudah diterima (bukan menunggu atau ditolak) */}
          {!isWaitingConfirmation && !isRejected && (
            <Link to={`/order-tracking/${order.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                {isCompleted
                  ? 'Lihat Detail'
                  : <><MapPin className="h-4 w-4 mr-2" />Lacak Pesanan</>}
              </Button>
            </Link>
          )}

          {/* Jika ditolak: tombol belanja lagi saja */}
          {isRejected && (
            <Link to="/produk" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Belanja Lagi
              </Button>
            </Link>
          )}

          {/* Jika selesai: tambahkan tombol belanja lagi */}
          {isCompleted && (
            <Link to="/produk" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">Beli Lagi</Button>
            </Link>
          )}

          {/* Jika masih menunggu: tampilkan info saja */}
          {isWaitingConfirmation && (
            <div className="flex-1 flex items-center justify-center h-10 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
              ⏳ Menunggu konfirmasi toko
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title, sub, isCompleted, isRejected,
}: {
  title: string; sub: string; isCompleted?: boolean; isRejected?: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {isRejected
          ? <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          : isCompleted
          ? <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          : <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{sub}</p>
        {!isCompleted && !isRejected && (
          <Link to="/produk">
            <Button className="bg-green-600 hover:bg-green-700">Mulai Belanja</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}