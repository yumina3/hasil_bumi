import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, Home, Package, Printer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

export function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    orderId: string;
    noInvoice: string;
    paymentMethod: string;
    total: number;
    deliveryMethod: string;
    customerName: string;
    customerPhone: string;
    items: { name: string; qty: number; price: number }[];
  };

  if (!state?.orderId) {
    navigate('/');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-md">

        {/* Header Sukses */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-14 w-14 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Berhasil!</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.paymentMethod === 'cod'
              ? 'Pesanan kamu sedang diproses'
              : 'Pembayaran berhasil dikonfirmasi'}
          </p>
        </div>

        {/* STRUK */}
        <Card className="mb-6 border-2 border-dashed border-gray-200 print:shadow-none">
          <CardContent className="p-6">
            {/* Header Struk */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">HB</div>
                <span className="font-bold text-lg text-green-800">Hasil Bumi</span>
              </div>
              <p className="text-xs text-gray-400">Fresh & Organic</p>
              <Separator className="mt-3" />
            </div>

            {/* Info Invoice */}
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">No. Invoice</span>
                <span className="font-bold text-xs">{state.noInvoice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="text-xs text-right max-w-[55%]">{formatDate()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nama</span>
                <span className="font-medium">{state.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">No. WA</span>
                <span>{state.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Metode</span>
                <span className="font-medium">
                  {state.deliveryMethod === 'pickup' ? 'Ambil di Toko' : 'Pengiriman Lokal'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pembayaran</span>
                <span className="font-medium uppercase">{state.paymentMethod}</span>
              </div>
            </div>

            <Separator className="border-dashed" />

            {/* Item Pesanan */}
            <div className="my-4 space-y-2">
              {state.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.qty} x {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <Separator className="border-dashed" />

            {/* Total */}
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(state.items.reduce((acc, i) => acc + i.price * i.qty, 0))}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkir</span>
                <span>
                  {state.deliveryMethod === 'pickup' ? 'Gratis' : formatPrice(15000)}
                </span>
              </div>
            </div>

            <Separator className="mt-3" />

            <div className="flex justify-between items-center mt-3">
              <span className="font-bold text-base">Total Bayar</span>
              <span className="text-xl font-bold text-green-700">{formatPrice(state.total)}</span>
            </div>

            {/* Status */}
            <div className={`mt-4 rounded-xl p-3 text-center text-xs font-bold ${
              state.paymentMethod === 'qris'
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              {state.paymentMethod === 'qris'
                ? '✓ LUNAS - Pembayaran Diterima'
                : '⏳ MENUNGGU PEMBAYARAN COD'}
            </div>

            {/* Footer Struk */}
            <div className="text-center mt-6">
              <p className="text-[10px] text-gray-400">Terima kasih telah berbelanja!</p>
              <p className="text-[10px] text-gray-400">Simpan struk ini sebagai bukti pesanan</p>
            </div>
          </CardContent>
        </Card>

        {/* Tombol Aksi */}
        <div className="space-y-3 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full py-5 rounded-xl border-green-600 text-green-600 font-bold"
          >
            <Printer className="h-4 w-4 mr-2" />
            Cetak / Simpan Struk
          </Button>
          <Button
            onClick={() => navigate('/orders')}
            variant="outline"
            className="w-full py-5 rounded-xl font-bold"
          >
            <Package className="h-4 w-4 mr-2" />
            Lihat Pesanan Saya
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700 py-5 rounded-xl font-bold"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
