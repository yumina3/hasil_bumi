import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Package, CheckCircle, Truck, MapPin, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { supabase } from "../../../utils/supabase/info"; 

type DeliveryMethod = 'delivery' | 'pickup';

const getTrackingSteps = (deliveryMethod: DeliveryMethod) => {
  if (deliveryMethod === 'pickup') {
    return [
      {
        status: 'Pesanan Dibuat',
        description: 'Pesanan Anda telah dibuat dan menunggu konfirmasi',
        time: '15 Des 2024, 10:30',
        icon: Package,
        completed: true,
      },
      {
        status: 'Pesanan Dikonfirmasi',
        description: 'Pesanan telah dikonfirmasi oleh toko',
        time: '15 Des 2024, 10:35',
        icon: CheckCircle,
        completed: true,
      },
      {
        status: 'Pesanan Siap Diambil',
        description: 'Silakan ambil pesanan Anda di toko',
        time: '',
        icon: Store,
        completed: false,
      },
    ];
  }

  return [
    {
      status: 'Pesanan Dibuat',
      description: 'Pesanan Anda telah dibuat dan menunggu konfirmasi',
      time: '15 Des 2024, 10:30',
      icon: Package,
      completed: true,
    },
    {
      status: 'Pesanan Dikonfirmasi',
      description: 'Pesanan telah dikonfirmasi oleh toko',
      time: '15 Des 2024, 10:35',
      icon: CheckCircle,
      completed: true,
    },
    {
      status: 'Pesanan Sudah Dikemas',
      description: 'Pesanan sudah selesai dikemas oleh toko',
      time: '',
      icon: Package,
      completed: false,
    },
    {
      status: 'Pesanan Dalam Pengiriman',
      description: 'Pesanan sedang dalam perjalanan menuju lokasi Anda',
      time: '',
      icon: Truck,
      completed: false,
    },
    {
      status: 'Pesanan Selesai',
      description: 'Pesanan telah diterima',
      time: '',
      icon: CheckCircle,
      completed: false,
    },
  ];
};

export function OrderTracking() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (data) setOrderDetails(data);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!orderDetails) return <div className="min-h-screen flex items-center justify-center">Pesanan tidak ditemukan</div>;

  // ✅ Otomatis dari database, bukan hardcode
  const deliveryMethod = (orderDetails.delivery_method ?? 'delivery') as DeliveryMethod;
  const isPickup = deliveryMethod === 'pickup';
  const trackingSteps = getTrackingSteps(deliveryMethod);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Detail Pesanan</h1>
              <p className="text-gray-600">ID: {orderId}</p>
            </div>
            <Badge className="bg-green-600 text-white px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Selesai
            </Badge>
          </div>
        </div>

        {/* Tracking Progress */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isPickup ? 'Status Ambil Pesanan' : 'Status Pengiriman'}
              </CardTitle>
              <Badge variant="outline" className="font-normal">
                {isPickup ? '3 Tahap' : '5 Tahap'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={`${deliveryMethod}-${index}`} className="flex gap-4 pb-8 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${step.completed ? 'bg-green-600' : 'bg-gray-200'}`}
                          style={{ minHeight: '40px' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.status}
                        </h3>
                        {step.time && <span className="text-sm text-gray-600">{step.time}</span>}
                      </div>
                      <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isPickup ? 'Informasi Pengambilan' : 'Informasi Pengiriman'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPickup ? (
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Ambil di Toko</p>
                  <p className="text-sm text-gray-600">{orderDetails.branch_name}</p>
                  <p className="text-sm text-gray-600">{orderDetails.branch_address}</p>
                  <p className="text-sm text-gray-600">{orderDetails.branch_phone}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Alamat Pengiriman</p>
                    <p className="text-sm text-gray-600">{orderDetails.customer_name}</p>
                    <p className="text-sm text-gray-600">{orderDetails.customer_phone}</p>
                    <p className="text-sm text-gray-600">{orderDetails.customer_address}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Dikirim dari Cabang</p>
                    <p className="text-sm text-gray-600">{orderDetails.branch_name}</p>
                    <p className="text-sm text-gray-600">{orderDetails.branch_address}</p>
                    <p className="text-sm text-gray-600">{orderDetails.branch_phone}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Produk Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(orderDetails.subtotal ?? 0)}</span>
              </div>
              {!isPickup && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biaya Pengiriman</span>
                  <span>{formatPrice(orderDetails.delivery_fee ?? 0)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Total Pembayaran</span>
                <span className="font-bold text-xl text-green-700">
                  {formatPrice(orderDetails.total ?? 0)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Metode Pembayaran</span>
              <span className="font-semibold">{orderDetails.payment_method}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Metode Pengiriman</span>
              <Badge variant="outline" className={isPickup ? 'text-blue-600 border-blue-600' : 'text-green-600 border-green-600'}>
                {isPickup ? 'Ambil di Toko' : 'Diantar ke Rumah'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/orders">Lihat Semua Pesanan</Link>
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
            <Link to="/products">Belanja Lagi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}