import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

interface PaymentState {
  pesanan_id: string;
  noInvoice: string;
  metode_bayar: 'cod' | 'qris';
  total: number;
  deliveryMethod: string;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
}

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentState;

  const finalMethod = state?.metode_bayar || '';
  const isCOD = finalMethod === 'cod';
  const isQRIS = finalMethod === 'qris';

  useEffect(() => {
    if (!state?.pesanan_id) {
      navigate('/checkout');
      return;
    }

    const recordInitialOrder = async () => {
      try {
        await supabase
          .from('pesanan')
          .update({
            status_pesanan: 'menunggu_konfirmasi',
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.pesanan_id);

        await supabase
          .from('pembayaran')
          .upsert([{
            pesanan_id: state.pesanan_id,
            metode_bayar: finalMethod,
            status_pembayaran: 'pending',
            jumlah_bayar: state.total,
            tgl_bayar: null,
            gateway_ref_id: null,
          }], { onConflict: 'pesanan_id' });
      } catch (e) {
        console.error('Gagal mencatat pembayaran awal:', e);
      }
    };

    recordInitialOrder();
  }, [state, navigate, finalMethod]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Berhasil disalin!');
  };

  if (!state) return null;

  return (
    <div className="min-h-screen py-8 bg-gray-50 text-sm">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-white">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-50 text-green-600">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <CardTitle className="text-xl font-black text-gray-900">Pesanan Berhasil Dibuat!</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-xs text-gray-500">Invoice: <span className="font-mono font-bold text-gray-800">{state.noInvoice}</span></p>
              <Copy className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => handleCopy(state.noInvoice)} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Status Card */}
            {isQRIS ? (
              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 text-center space-y-2">
                <p className="text-sm font-bold text-purple-900">Menunggu Konfirmasi Toko</p>
                <p className="text-xs text-purple-700 leading-relaxed">
                  Pesanan Anda sedang ditinjau ketersediaannya oleh Admin Toko. <b>Barcode QRIS pembayaran akan otomatis muncul di menu Pesanan Saya</b> setelah pesanan Anda disetujui oleh toko.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 p-5 rounded-2xl border border-green-200 text-center space-y-2">
                <p className="text-sm font-bold text-green-800">Bayar Saat Barang Tiba (COD)</p>
                <p className="text-xs text-green-700 leading-relaxed">
                  Pesanan Anda sedang diverifikasi oleh toko. Siapkan uang tunai sebesar <b>{formatPrice(state.total)}</b> saat kurir tiba di alamat tujuan.
                </p>
              </div>
            )}

            {/* Total Pembayaran */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <span className="font-bold text-gray-600 text-sm">Total Tagihan</span>
              <span className="text-xl font-black text-green-700">{formatPrice(state.total)}</span>
            </div>

            <Separator />

            {/* Rincian Item */}
            <div className="space-y-2">
              <p className="font-bold text-gray-700">Rincian Item</p>
              {state.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-600">
                  <span>{item.name} x{item.qty}</span>
                  <span className="font-bold">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate(`/order-tracking/${state.pesanan_id}`)}
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-base font-bold rounded-2xl shadow-md"
            >
              Lihat Status Pesanan Saya
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}