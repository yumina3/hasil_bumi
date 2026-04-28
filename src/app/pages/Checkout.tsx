import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Store, Truck, Loader2, ShoppingBag } from 'lucide-react';
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
    setSelectedBranch 
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [branchList, setBranchList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    catatan: '',
    paymentMethod: 'cod',
  });

  // Fetch daftar cabang
  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('cabang').select('*');
      if (data) setBranchList(data);
    };
    fetchBranches();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Input
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

    setIsProcessing(true);

    try {
      // 2. Generate ID yang aman untuk tipe INTEGER (maks 9 digit)
      const orderId = Number(Date.now().toString().slice(-9)); 
      const noInvoice = `INV/${new Date().getFullYear()}/${orderId}`;

      // 3. Simpan ke Tabel Pesanan
      const { error: orderError } = await supabase
        .from('pesanan')
        .insert([{
          id: orderId,
          no_invoice: noInvoice,
          // REVISI: Gunakan null jika user_id di DB adalah INTEGER. 
          // Jika sudah diubah ke UUID di DB, baru ganti ke user?.id
          user_id: null, 
          cabang_id: selectedBranchId,
          subtotal: totalPrice,
          ongkos_kirim: deliveryFee,
          total_bayar: finalPrice,
          delivery_method: deliveryMethod,
          status_pesanan: 'menunggu_pembayaran',
          catatan: formData.catatan || null,
          metode_pembayaran: formData.paymentMethod,
          nama_penerima: formData.name,
          no_whatsapp: formData.phone,
          alamat_pengiriman: formData.address || null,
          created_at: new Date().toISOString(),
        }]);

      if (orderError) throw orderError;

      // 4. Simpan ke Tabel Detail Pesanan
      const detailItems = cart.map(item => ({
  pesanan_id: orderId,
  produk_id: Number(item.id),
  nama_produk: item.nama_produk || item.name,
  harga_saat_beli: item.harga_jual || item.price,
  qty: item.quantity,
  total_harga: (item.harga_jual || item.price) * item.quantity
}));
      

      const { error: detailError } = await supabase
        .from('detail_pesanan')
        .insert(detailItems);

      if (detailError) throw detailError;

      // 5. Persiapan Data untuk Halaman Payment
      const summaryData = {
        pesanan_id: orderId,
        noInvoice: noInvoice,
        metode_bayar: formData.paymentMethod,
        total: finalPrice,
        deliveryMethod,
        customerName: formData.name,
        items: cart.map(i => ({ 
          name: i.nama_produk || i.name, 
          qty: i.quantity, 
          price: i.harga_jual || i.price 
        }))
      };

      // 6. Sukses & Navigasi
      toast.success('Pesanan berhasil dibuat!');
      navigate('/payment', { state: summaryData });
      
      // Hapus keranjang SETELAH perintah navigasi jalan
      setTimeout(() => clearCart(), 500);

    } catch (error: any) {
      console.error("Detail Error:", error);
      let userFriendlyMsg = error.message || "Terjadi kesalahan saat memproses pesanan.";
      
      if (error.code === '22P02' || error.message?.includes('type integer')) {
        userFriendlyMsg = "Format data tidak valid (ID/UUID mismatch).";
      }
      toast.error(userFriendlyMsg);
    } finally {
      setIsProcessing(false);
    }
  };

      // Gunakan useEffect untuk proteksi agar tidak tabrakan dengan proses render
    useEffect(() => {
      if (cart.length === 0 && !isProcessing) {
        navigate('/cart');
      }
    }, [cart.length, navigate, isProcessing]);

    // Jangan biarkan return null menghalangi render saat sedang memproses (isProcessing)
    if (cart.length === 0 && !isProcessing) {
      return null;
}
  

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
              
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Metode & Cabang</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange} className="grid grid-cols-2 gap-4">
                    <div className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer ${deliveryMethod === 'pick_up' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="pick_up" id="pick_up" />
                      <Label htmlFor="pick_up" className="flex-1 cursor-pointer font-bold text-sm">Ambil di Toko</Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer ${deliveryMethod === 'delivery' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer font-bold text-sm">Kirim ke Alamat</Label>
                    </div>
                  </RadioGroup>

                  <Select value={selectedBranchId?.toString()} onValueChange={handleBranchChange}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih cabang" /></SelectTrigger>
                    <SelectContent>
                      {branchList.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>{branch.nama_cabang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

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

              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Pembayaran</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })} className="grid grid-cols-2 gap-4">
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

            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-green-200 shadow-md">
                <CardHeader className="bg-green-50"><CardTitle className="text-lg">Ringkasan</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-gray-600">{item.nama_produk || item.name} (x{item.quantity})</span>
                        <span className="font-medium">{formatPrice((item.harga_jual || item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-green-700">{formatPrice(finalPrice)}</span>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold rounded-xl" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Konfirmasi Pesanan'}
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