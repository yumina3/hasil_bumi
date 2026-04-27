import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useCart } from '../context/CartContext';

export function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderId = location.state?.orderId || 'HB' + Date.now();
  const paymentMethod = location.state?.paymentMethod || 'QRIS';
  const deliveryMethod = location.state?.deliveryMethod || 'delivery';
  const total = location.state?.total || 0;

  useEffect(() => {
    // Clear cart setelah order berhasil
    clearCart();
    console.log('OrderSuccess mounted - orderId:', orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleTrackOrder = () => {
    console.log('Navigating to tracking:', `/order-tracking/${orderId}`);
    navigate(`/order-tracking/${orderId}`);
  };

  const handleShopAgain = () => {
    console.log('Navigating to products');
    navigate('/products');
  };

  const handleGoHome = () => {
    console.log('Navigating to home');
    navigate('/');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getEstimatedTime = () => {
    if (deliveryMethod === 'delivery') {
      return '30-60 menit';
    }
    return '15-30 menit';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h1>
            <p className="text-gray-600">Terima kasih telah berbelanja di Hasil Bumi</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mb-6">
            <p className="text-sm text-gray-600 mb-2">Nomor Pesanan Anda</p>
            <p className="text-2xl font-bold text-green-700">{orderId}</p>
          </div>

          {total > 0 && (
            <div className="bg-white p-4 rounded-lg border mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-gray-600">Total Pembayaran</p>
                  <p className="font-bold text-lg text-green-700">{formatPrice(total)}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Metode Pembayaran</p>
                  <p className="font-semibold">{paymentMethod}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Metode Pengiriman</p>
                  <p className="font-semibold">
                    {deliveryMethod === 'delivery' ? '🚚 Delivery' : '🏪 Pick Up'}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Estimasi</p>
                  <p className="font-semibold">{getEstimatedTime()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Package className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Pesanan Dikonfirmasi</p>
                <p className="text-sm text-gray-600">
                  Pesanan Anda telah kami terima dan sedang diproses oleh toko.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Lacak Pesanan</p>
                <p className="text-sm text-gray-600">
                  Anda dapat melacak status pesanan di halaman "Pesanan Saya".
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTrackOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Package className="h-5 w-5" />
              Lacak Pesanan
            </button>
            
            <button
              onClick={handleShopAgain}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Belanja Lagi
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-transparent hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Kembali ke Beranda
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}