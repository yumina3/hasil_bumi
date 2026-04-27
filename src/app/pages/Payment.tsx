import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { QrCode, CheckCircle, Clock, Copy, Loader2, CreditCard, Banknote as CashIcon, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

interface PaymentState {
  pesanan_id: string;
  noInvoice: string;
  metode_bayar: 'dompet_digital' | 'transfer_bank' | 'cod'; // ← sesuai DB
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

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [countdown, setCountdown] = useState(300);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!state?.pesanan_id) navigate('/checkout');
  }, [state, navigate]);

  useEffect(() => {
    if (finalMethod === 'cod') return;
    if (paymentStatus !== 'pending' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentStatus, finalMethod, countdown]);

  // COD langsung konfirmasi otomatis
  useEffect(() => {
    if (finalMethod === 'cod') {
      handleConfirmPayment();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleConfirmPayment = async () => {
    if (isPaying) return;
    setIsPaying(true);
    setPaymentStatus('processing');

    try {
      // ✅ Logika status berdasarkan 3 metode bayar di DB kamu
      // dompet_digital → langsung dianggap lunas (simulasi)
      // transfer_bank  → menunggu konfirmasi manual
      // cod            → bayar saat barang tiba
      const isInstant = finalMethod === 'dompet_digital';
      const isCOD = finalMethod === 'cod';

      const orderStatus = isInstant
        ? 'dibayar'
        : isCOD
        ? 'diproses'
        : 'menunggu_pembayaran';

      const paymentStatusDb = isInstant
        ? 'berhasil'
        : isCOD
        ? 'pending'        // bayar nanti saat COD
        : 'pending';       // transfer_bank menunggu konfirmasi

      // Update status pesanan
      const { error: orderError } = await supabase
        .from('pesanan')
        .update({
          status_pesanan: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.pesanan_id);

      if (orderError) throw orderError;

      // Insert ke tabel pembayaran
      const { error: payError } = await supabase
        .from('pembayaran')
        .insert([{
          pesanan_id: state.pesanan_id,
          metode_bayar: finalMethod,            // 'dompet_digital' | 'transfer_bank' | 'cod'
          status_pembayaran: paymentStatusDb,   // 'berhasil' | 'pending'
          jumlah_bayar: state.total,
          tgl_bayar: isInstant ? new Date().toISOString() : null,
          gateway_ref_id: isInstant ? `REF-${Date.now()}` : null,
        }]);

      if (payError) throw payError;

      setTimeout(() => {
        setPaymentStatus('success');
        toast.success(
          isInstant
            ? 'Pembayaran Berhasil!'
            : isCOD
            ? 'Pesanan Dikonfirmasi! Bayar saat barang tiba.'
            : 'Pesanan Dibuat! Selesaikan transfer bank Anda.'
        );
        setTimeout(() => {
          navigate('/order-success', { state: { orderId: state.pesanan_id } });
        }, 1500);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      toast.error('Gagal: ' + error.message);
      setPaymentStatus('pending');
      setIsPaying(false);
    }
  };

  if (!state) return null;

  if (paymentStatus === 'processing' || paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {paymentStatus === 'processing' ? (
            <>
              <Loader2 className="animate-spin h-14 w-14 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">Memproses...</h3>
            </>
          ) : (
            <>
              <CheckCircle className="h-14 w-14 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-green-700">Berhasil!</h3>
            </>
          )}
        </div>
      </div>
    );
  }

  // ✅ Deteksi tampilan berdasarkan metode DB
  const isDompetDigital = finalMethod === 'dompet_digital';
  const isTransferBank = finalMethod === 'transfer_bank';
  const isCOD = finalMethod === 'cod';

  return (
    <div className="min-h-screen py-8 bg-gray-50 text-sm">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-lg border-none rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-white">
            {!isCOD && (
              <div className="flex items-center justify-center gap-1.5 mb-4 bg-orange-50 py-2 rounded-full w-fit mx-auto px-4">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-bold text-orange-500 text-xs">
                  Selesaikan dalam {formatTime(countdown)}
                </span>
              </div>
            )}

            <div className="flex justify-center mb-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isDompetDigital ? 'bg-purple-50' :
                isTransferBank  ? 'bg-blue-50' :
                'bg-green-50'
              }`}>
                {isDompetDigital && <Wallet className="h-8 w-8 text-purple-600" />}
                {isTransferBank  && <CreditCard className="h-8 w-8 text-blue-600" />}
                {isCOD           && <CashIcon className="h-8 w-8 text-green-600" />}
              </div>
            </div>

            <CardTitle>Total Pembayaran</CardTitle>
            <p className="text-2xl font-black text-green-700 mt-1">{formatPrice(state.total)}</p>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Invoice */}
            <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500">Invoice</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{state.noInvoice}</span>
                <Copy className="h-3 w-3 text-gray-400 cursor-pointer" onClick={() => handleCopy(state.noInvoice)} />
              </div>
            </div>

            {/* ✅ UI Dompet Digital → tampilkan QRIS */}
            {isDompetDigital && (
              <div className="text-center bg-white p-4 border-2 border-dashed rounded-3xl">
                <div className="w-40 h-40 bg-gray-100 mx-auto flex items-center justify-center rounded-xl mb-2">
                  <QrCode className="h-24 w-24 text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400">Scan QRIS HASIL BUMI</p>
                <p className="text-[10px] text-purple-500 mt-1">GoPay · OVO · DANA · ShopeePay</p>
              </div>
            )}

            {/* ✅ UI Transfer Bank → tampilkan nomor rekening */}
            {isTransferBank && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-[10px] text-blue-600 font-bold mb-1">NOMOR REKENING TUJUAN</p>
                <p className="text-[10px] text-blue-400 mb-2">Bank BCA · a/n Hasil Bumi</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-blue-800">1234567890</span>
                  <Copy className="h-4 w-4 text-blue-300 cursor-pointer" onClick={() => handleCopy('1234567890')} />
                </div>
                <p className="text-[10px] text-orange-500 mt-3">
                  ⚠ Kirim bukti transfer ke admin setelah bayar
                </p>
              </div>
            )}

            {/* ✅ UI COD */}
            {isCOD && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <p className="text-sm font-bold text-green-700">Bayar saat barang tiba 🏠</p>
                <p className="text-xs text-gray-500 mt-1">
                  Siapkan uang tunai sejumlah {formatPrice(state.total)}
                </p>
              </div>
            )}

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
              onClick={handleConfirmPayment}
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-base font-bold rounded-2xl"
              disabled={isPaying}
            >
              {isPaying
                ? 'Memproses...'
                : isCOD
                ? 'Konfirmasi Pesanan'
                : isTransferBank
                ? 'Saya Sudah Transfer'
                : 'Konfirmasi Pembayaran'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}