import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Clock, Truck, CheckCircle, MapPin, Loader2, Store } from 'lucide-react';
import { supabase } from '../../../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface DetailPesanan {
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
  detail_pesanan: DetailPesanan[];
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

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
          detail_pesanan (
            qty,
            nama_produk,
            harga_saat_beli,
            total_harga
          )
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
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price ?? 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { icon: any; color: string; label: string }> = {
      menunggu_pembayaran: { icon: Clock,         color: 'bg-yellow-500', label: 'Menunggu Pembayaran' },
      dibayar:            { icon: CheckCircle,    color: 'bg-blue-500',   label: 'Dibayar' },
      diproses:           { icon: Clock,          color: 'bg-orange-500', label: 'Diproses' },
      dikemas:            { icon: Package,        color: 'bg-purple-500', label: 'Dikemas' },
      dikirim:            { icon: Truck,          color: 'bg-indigo-500', label: 'Dalam Pengiriman' },
      siap_diambil:       { icon: Store,          color: 'bg-teal-500',   label: 'Siap Diambil' },
      selesai:            { icon: CheckCircle,    color: 'bg-green-600',  label: 'Selesai' },
      dibatalkan:         { icon: Clock,          color: 'bg-red-500',    label: 'Dibatalkan' },
    };

    const config = variants[status] || { icon: Clock, color: 'bg-gray-500', label: status };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Pesanan aktif = semua kecuali selesai & dibatalkan
  const ongoingOrders = orders.filter(
    (o) => o.status_pesanan !== 'selesai' && o.status_pesanan !== 'dibatalkan'
  );
  const completedOrders = orders.filter(
    (o) => o.status_pesanan === 'selesai' || o.status_pesanan === 'dibatalkan'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
          <p className="text-gray-600">Lacak dan kelola pesanan Anda</p>
        </div>

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ongoing">
              Sedang Berlangsung ({ongoingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Selesai ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="mt-6 space-y-4">
            {ongoingOrders.length === 0 ? (
              <EmptyState title="Tidak ada pesanan aktif" sub="Yuk belanja sekarang!" />
            ) : (
              ongoingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedOrders.length === 0 ? (
              <EmptyState
                title="Belum ada pesanan selesai"
                sub="Pesanan selesai akan muncul di sini"
                isCompleted
              />
            ) : (
              completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                  getStatusBadge={getStatusBadge}
                  isCompleted
                />
              ))
            )}
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
}: {
  order: Order;
  formatDate: (d: string) => string;
  formatPrice: (p: number) => string;
  getStatusBadge: (s: string) => React.ReactNode;
  isCompleted?: boolean;
}) {
  // Hitung total item dari qty di detail_pesanan
  const totalItems = order.detail_pesanan?.reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  ) ?? 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1 font-mono">
              {order.no_invoice || order.id}
            </CardTitle>
            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
          </div>
          {getStatusBadge(order.status_pesanan)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <p className="text-gray-600">Jumlah Item</p>
            <p className="font-semibold text-green-700">{totalItems} produk</p>
          </div>
          <div>
            <p className="text-gray-600">Metode Pengiriman</p>
            <p className="font-semibold capitalize">{order.delivery_method ?? '-'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/order-tracking/${order.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              {isCompleted ? (
                'Lihat Detail'
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Lacak Pesanan
                </>
              )}
            </Button>
          </Link>
          {isCompleted && (
            <Link to="/produk" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">Beli Lagi</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  sub,
  isCompleted,
}: {
  title: string;
  sub: string;
  isCompleted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {isCompleted ? (
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        ) : (
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        )}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{sub}</p>
        {!isCompleted && (
          <Link to="/produk">
            <Button className="bg-green-600 hover:bg-green-700">Mulai Belanja</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}