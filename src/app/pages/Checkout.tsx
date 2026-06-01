import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Store, Truck, Loader2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    getTotalPrice,
    clearCart,
    deliveryMethod,
    setDeliveryMethod,
    selectedBranchId,
    setSelectedBranch,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [branchList, setBranchList] = useState<any[]>([]);

  const [deliveryCountToday, setDeliveryCountToday] = useState<number>(0);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);
  const DELIVERY_QUOTA = 100;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    catatan: '',
    paymentMethod: 'cod',
  });

  // Fetch cabang 
  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('cabang').select('*');
      if (data) setBranchList(data);
    };
    fetchBranches();
  }, []);

  //  Cek kuota delivery 
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !selectedBranchId) {
      setDeliveryCountToday(0);
      return;
    }
    const checkQuota = async () => {
      setIsCheckingQuota(true);
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('pesanan')
        .select('id', { count: 'exact', head: true })
        .eq('cabang_id', selectedBranchId)
        .eq('delivery_method', 'delivery')
        .neq('status_pesanan', 'dibatalkan')
        .gte('created_at', `${today}T00:00:00+00:00`)
        .lte('created_at', `${today}T23:59:59+00:00`);
      if (!error) setDeliveryCountToday(count ?? 0);
      setIsCheckingQuota(false);
    };
    checkQuota();
  }, [deliveryMethod, selectedBranchId]);

  const isDeliveryFull = deliveryMethod === 'delivery' && deliveryCountToday >= DELIVERY_QUOTA;

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const totalPrice = getTotalPrice();
  const finalPrice = totalPrice + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeliveryMethodChange = (value: 'pick_up' | 'delivery') => {
    setDeliveryMethod(value);
    setDeliveryFee(value === 'pick_up' ? 0 : 15000);
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranch(Number(value));
  };

  // ─── Helper: nama produk + berat ─────────────────────────────────────────
  const getDisplayName = (item: any): string => {
    const base = item.nama_produk || item.name || 'Produk';
    return item.selectedWeight ? `${base} (${item.selectedWeight})` : base;
  };

  // ─── Ambil user_id dari tabel users berdasarkan auth ─────────────────────
  const getUserId = async (): Promise<number | null> => {
    try {
      // Coba dari sesi Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (error || !userData) return null;
      return userData.id;
    } catch {
      return null;
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Mohon lengkapi nama dan nomor WhatsApp');
      return;
    }
    if (deliveryMethod === 'delivery' && !formData.address) {
      toast.error('Alamat wajib diisi untuk metode pengiriman');
      return;
    }
    if (!selectedBranchId) {
      toast.error('Silakan pilih cabang terlebih dahulu');
      return;
    }

    // Double-check kuota delivery
    if (deliveryMethod === 'delivery') {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('pesanan')
        .select('id', { count: 'exact', head: true })
        .eq('cabang_id', selectedBranchId)
        .eq('delivery_method', 'delivery')
        .neq('status_pesanan', 'dibatalkan')
        .gte('created_at', `${today}T00:00:00+00:00`)
        .lte('created_at', `${today}T23:59:59+00:00`);

      if ((count ?? 0) >= DELIVERY_QUOTA) {
        toast.error('Kuota delivery hari ini sudah penuh (100/100). Silakan pilih Pick Up.');
        setDeliveryCountToday(count ?? 0);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderId = Number(Date.now().toString().slice(-9));
      const noInvoice = `INV/${new Date().getFullYear()}/${orderId}`;

      // ── Ambil user_id dari tabel users (null jika guest/tidak login) ──
      const userId = await getUserId();

      const { error: orderError } = await supabase
        .from('pesanan')
        .insert([{
          id: orderId,
          no_invoice: noInvoice,
          user_id: userId,          // ← sudah diperbaiki, bukan hardcode null
          cabang_id: selectedBranchId,
          subtotal: totalPrice,
          ongkos_kirim: deliveryFee,
          total_bayar: finalPrice,
          delivery_method: deliveryMethod,
          status_pesanan: 'menunggu_konfirmasi',
          catatan: formData.catatan || null,
          metode_pembayaran: formData.paymentMethod,
          nama_penerima: formData.name,
          no_whatsapp: formData.phone,
          alamat_pengiriman: formData.address || null,
          created_at: new Date().toISOString(),
        }]);

      if (orderError) throw orderError;

      // ── Simpan detail_pesanan ──
      const detailItems = cart.map((item) => ({
        pesanan_id: orderId,
        produk_id: Number(item.id),
        nama_produk: getDisplayName(item),
        harga_saat_beli: item.harga_jual,
        qty: item.quantity,
        total_harga: item.harga_jual * item.quantity,
      }));

      const { error: detailError } = await supabase
        .from('detail_pesanan')
        .insert(detailItems);

      if (detailError) throw detailError;

      const summaryData = {
        pesanan_id: orderId,
        noInvoice,
        metode_bayar: formData.paymentMethod,
        total: finalPrice,
        deliveryMethod,
        customerName: formData.name,
        items: cart.map((i) => ({
          name: getDisplayName(i),
          qty: i.quantity,
          price: i.harga_jual,
        })),
      };

      toast.success('Pesanan berhasil dibuat!');
      navigate('/payment', { state: summaryData });
      setTimeout(() => clearCart(), 500);
    } catch (error: any) {
      console.error('Detail Error:', error);
      let msg = error.message || 'Terjadi kesalahan saat memproses pesanan.';
      if (error.code === '22P02' || error.message?.includes('type integer')) {
        msg = 'Format data tidak valid (ID/UUID mismatch).';
      }
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !isProcessing) navigate('/cart');
  }, [cart.length, navigate, isProcessing]);

  if (cart.length === 0 && !isProcessing) return null;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-green-700" />
          <h1 className="text-3xl font-bold text-green-800">Checkout Pesanan</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Metode & Cabang */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Metode & Cabang</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={handleDeliveryMethodChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer ${deliveryMethod === 'pick_up' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="pick_up" id="pick_up" />
                      <Label htmlFor="pick_up" className="flex-1 cursor-pointer font-bold text-sm">
                        <Store className="inline h-4 w-4 mr-1" />
                        Ambil di Toko
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-2 p-3 border rounded-xl transition-colors ${
                      isDeliveryFull
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                        : deliveryMethod === 'delivery'
                        ? 'border-green-600 bg-green-50 cursor-pointer'
                        : 'cursor-pointer'
                    }`}>
                      <RadioGroupItem value="delivery" id="delivery" disabled={isDeliveryFull} />
                      <Label
                        htmlFor="delivery"
                        className={`flex-1 font-bold text-sm ${isDeliveryFull ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'}`}
                      >
                        <Truck className="inline h-4 w-4 mr-1" />
                        Kirim ke Alamat
                        {isDeliveryFull && (
                          <span className="block text-xs font-normal text-red-500 mt-0.5">
                            Kuota penuh (100/100)
                          </span>
                        )}
                      </Label>
                    </div>
                  </RadioGroup>

                  {isDeliveryFull && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Kuota delivery hari ini sudah penuh (<strong>100/100</strong>). Silakan pilih <strong>Ambil di Toko</strong> atau coba lagi besok.
                      </span>
                    </div>
                  )}

                  {!isDeliveryFull && deliveryMethod === 'delivery' && deliveryCountToday >= 90 && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Sisa kuota delivery hari ini: <strong>{DELIVERY_QUOTA - deliveryCountToday} slot</strong>. Segera checkout!
                      </span>
                    </div>
                  )}

                  <Select value={selectedBranchId?.toString()} onValueChange={handleBranchChange}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchList.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.nama_cabang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Data Penerima */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Data Penerima</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama</Label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} className="rounded-xl" placeholder="08..." required />
                    </div>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <div className="space-y-2">
                      <Label>Alamat Lengkap</Label>
                      <Textarea name="address" value={formData.address} onChange={handleInputChange} className="rounded-xl" rows={3} required />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Textarea name="catatan" value={formData.catatan} onChange={handleInputChange} className="rounded-xl" placeholder="Opsional..." />
                  </div>
                </CardContent>
              </Card>

              {/* Pembayaran */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Pembayaran</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="cod" id="m-cod" className="mr-2" />
                      <Label htmlFor="m-cod" className="font-bold cursor-pointer">COD (Bayar Tunai)</Label>
                    </div>
                    <div className={`p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'qris' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="qris" id="m-qris" className="mr-2" />
                      <Label htmlFor="m-qris" className="font-bold cursor-pointer">QRIS</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Ringkasan */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-green-200 shadow-md">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-lg">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedWeight ?? idx}`} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-600 flex-1">
                          {getDisplayName(item)}
                          <span className="text-gray-400 ml-1">x{item.quantity}</span>
                        </span>
                        <span className="font-medium shrink-0">
                          {formatPrice(item.harga_jual * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-700">{formatPrice(finalPrice)}</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold rounded-xl"
                    disabled={isProcessing || isDeliveryFull || isCheckingQuota}
                  >
                    {isProcessing
                      ? <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      : isCheckingQuota
                      ? 'Mengecek kuota...'
                      : isDeliveryFull
                      ? 'Kuota Delivery Penuh'
                      : 'Konfirmasi Pesanan'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}