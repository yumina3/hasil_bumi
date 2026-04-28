import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Clock, Truck, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../../../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Interface untuk tipe data pesanan
interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  delivery_method: string;
  items_count: number;
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  try {
    setIsLoading(true);
    
    // Ambil data dari tabel 'pesanan' dan join ke 'detail_pesanan'
    const { data, error } = await supabase
      .from('pesanan')
      .select(`
        *,
        detail_pesanan (
          qty
        )
      `) // <--- Ini bagian yang diubah untuk mengambil data qty
      .order('created_at', { ascending: false });

    if (error) throw error;
    setOrders(data || []);
  } catch (error: any) {
    console.error('Error fetching orders:', error.message);
  } finally {
    setIsLoading(false);
  }
};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { icon: any; color: string; label: string } } = {
      delivered: { icon: CheckCircle, color: 'bg-green-600', label: 'Selesai' },
      shipped: { icon: Truck, color: 'bg-blue-600', label: 'Dikirim' },
      packed: { icon: Package, color: 'bg-orange-600', label: 'Dikemas' },
      ordered: { icon: Clock, color: 'bg-gray-600', label: 'Diproses' },
    };
    
    const config = variants[status] || variants.ordered;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const ongoingOrders = orders.filter(o => o.status !== 'delivered');
  const completedOrders = orders.filter(o => o.status === 'delivered');

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
              <EmptyState title="Belum ada pesanan selesai" sub="Pesanan selesai akan muncul di sini" isCompleted />
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

// Komponen Pembantu agar kode lebih rapi
function OrderCard({ order, formatDate, formatPrice, getStatusBadge, isCompleted }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1 font-mono">{order.id}</CardTitle>
            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
          </div>
          {getStatusBadge(order.status)}
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
            <p className="font-semibold">{order.metode_pembayaran}</p>
          </div>
          <div>
          <p className="text-gray-600 text-sm">Jumlah Item</p>
          <p className="font-semibold text-green-700">
            {order.detail_pesanan?.reduce((total: number, item: any) => total + (item.qty || 0), 0) || 0} produk
          </p>
        </div>
          <div>
            <p className="text-gray-600">Metode Pengiriman</p>
            <p className="font-semibold capitalize">{order.delivery_method}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/order-tracking/${order.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              {isCompleted ? 'Lihat Detail' : <><MapPin className="h-4 w-4 mr-2" /> Lacak Pesanan</>}
            </Button>
          </Link>
          {isCompleted && (
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Beli Lagi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, sub, isCompleted }: { title: string, sub: string, isCompleted?: boolean }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {isCompleted ? <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" /> : <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{sub}</p>
        {!isCompleted && (
          <Link to="/products">
            <Button className="bg-green-600 hover:bg-green-700">Mulai Belanja</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}