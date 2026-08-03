import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Minus, Plus, Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, selectedBranchId, setSelectedBranch } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // State Varian Berat
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [customWeight, setCustomWeight] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: prodData, error: prodError } = await supabase
          .from('produk')
          .select('*')
          .eq('id', id)
          .single();

        if (prodError) throw prodError;

        let branchStock = prodData.stok ?? prodData.stock ?? 0;
        if (selectedBranchId) {
          const { data: stokData } = await supabase
            .from('stok')
            .select('jumlah_stok')
            .eq('cabang_id', selectedBranchId)
            .eq('produk_id', id)
            .maybeSingle();
          if (stokData && stokData.jumlah_stok !== undefined) {
            branchStock = stokData.jumlah_stok;
          } else {
            branchStock = 0;
          }
        }

        setProduct({
          ...prodData,
          stok: branchStock,
          stock: branchStock,
          jumlah_stok: branchStock,
        });

        const { data: branData } = await supabase.from('cabang').select('*');
        if (branData) setBranches(branData);
      } catch (error: any) {
        console.error("Gagal memuat produk:", error.message);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, selectedBranchId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isWeightProduct = () => {
    const unit = (product?.satuan || "").toLowerCase().trim();
    return unit.includes('kg') || unit.includes('gram');
  };

  const hasWeightSelected = () => {
    return !!selectedWeight || !!customWeight;
  };

  const getSelectedWeightLabel = () => {
    if (customWeight) return `${customWeight} kg`;
    return selectedWeight;
  };

  const getMaxStock = () => {
    const stock =
      product?.stock ??
      product?.stok ??
      product?.jumlah_stok ??
      product?.qty ??
      null;
    const num = Number(stock);
    return !isNaN(num) && stock !== null && stock !== undefined ? num : 999;
  };

  const onAddToCart = () => {
    if (!selectedBranchId) {
      toast.error('Silakan pilih cabang terlebih dahulu');
      return;
    }
    if (isWeightProduct() && !hasWeightSelected()) {
      toast.error('Pilih berat terlebih dahulu');
      return;
    }

    const weightLabel = getSelectedWeightLabel();
    const cartProduct = {
      ...product,
      name: weightLabel
        ? `${product.nama_produk} (${weightLabel})`
        : product.nama_produk,
      price: product.harga_jual,
      image: product.foto_url,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct, selectedBranchId, weightLabel || undefined);
    }

    toast.success(`${cartProduct.name} x${quantity} berhasil ditambahkan!`);
    setSelectedWeight(null);
    setCustomWeight("");
    setQuantity(1);
  };

  const onBuyNow = () => {
    if (!selectedBranchId) {
      toast.error('Silakan pilih cabang terlebih dahulu');
      return;
    }
    if (isWeightProduct() && !hasWeightSelected()) {
      toast.error('Pilih berat terlebih dahulu');
      return;
    }

    const weightLabel = getSelectedWeightLabel();
    const cartProduct = {
      ...product,
      name: weightLabel
        ? `${product.nama_produk} (${weightLabel})`
        : product.nama_produk,
      price: product.harga_jual,
      image: product.foto_url,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct, selectedBranchId, weightLabel || undefined);
    }

    navigate('/cart');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Package className="h-12 w-12 text-gray-200 mb-4" />
      <h2 className="text-xl font-bold">Produk Tidak Ditemukan</h2>
      <Link to="/produk" className="mt-4">
        <Button variant="outline">Kembali ke Katalog</Button>
      </Link>
    </div>
  );

  const maxStock = getMaxStock();
  const weightRequired = isWeightProduct();
  const weightSelected = hasWeightSelected();
  const quantityLocked = weightRequired && !weightSelected;

  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          to="/produk"
          className="inline-flex items-center text-xs text-gray-500 hover:text-green-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-3 w-3 mr-1" /> Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          {/* Image Section */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border">
            <img
              src={product.foto_url}
              alt={product.nama_produk}
              className="w-full h-full object-contain p-6"
            />
            <Badge className="absolute top-4 right-4 bg-green-600 text-[10px] px-2 py-0.5">
              {product.satuan}
            </Badge>
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {product.nama_produk}
            </h1>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xl font-bold text-green-700">
                {formatPrice(product.harga_jual)}
              </span>
              <span className="text-xs text-gray-400">/ {product.satuan}</span>
            </div>

            <Card className="mb-4 border-none bg-gray-50 shadow-none">
              <CardContent className="p-4">
                <h3 className="text-xs font-bold text-gray-800 mb-1 uppercase tracking-wider">
                  Deskripsi Produk
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {product.deskripsi}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl border bg-white">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Stok</p>
                <p className="text-xs font-bold text-gray-800">
                  {maxStock !== 999 ? (maxStock === 0 ? `0 ${product.satuan} (Habis)` : `${maxStock} ${product.satuan}`) : `- ${product.satuan}`}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-green-100 bg-green-50/30 flex flex-col justify-between">
                <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Cabang Distribusi</p>
                <Select
                  value={selectedBranchId ? String(selectedBranchId) : undefined}
                  onValueChange={(val) => {
                    const bid = Number(val);
                    setSelectedBranch(bid);
                    const b = branches.find((item) => item.id === bid);
                    if (b) {
                      toast.success(`Cabang diubah ke: ${b.nama_cabang}`);
                    }
                  }}
                >
                  <SelectTrigger className="h-7 py-0 px-2 text-xs font-bold text-green-800 bg-white border-green-200 hover:bg-green-50/50 shadow-2xs">
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)} className="text-xs font-medium">
                        {b.nama_cabang} {b.lokasi ? `(${b.lokasi})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* === STEP 1: PILIH BERAT === */}
            {weightRequired && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${weightSelected ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </span>
                  <p className="text-xs font-bold text-gray-700">
                    Pilih Berat
                    {!weightSelected && (
                      <span className="ml-1 text-red-400 font-normal">(wajib dipilih)</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {['250 gram', '500 gram', '1 kg', '2 kg'].map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        setSelectedWeight(w);
                        setCustomWeight("");
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedWeight === w && !customWeight
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-600 hover:border-green-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Manual (kg)"
                    value={customWeight}
                    onChange={(e) => {
                      setCustomWeight(e.target.value);
                      setSelectedWeight(null);
                    }}
                    className="h-8 text-xs w-32 rounded-xl"
                  />
                  <span className="text-xs text-gray-400">kg</span>
                </div>

                {weightSelected && (
                  <p className="text-[10px] text-green-600 font-bold mt-2">
                    Dipilih: {getSelectedWeightLabel()}
                  </p>
                )}
              </div>
            )}

            {/* === STEP 2: JUMLAH — terkunci jika belum pilih berat === */}
            <div className={`mb-5 transition-opacity ${quantityLocked ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                {weightRequired && (
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${weightSelected ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </span>
                )}
                <p className="text-xs font-bold text-gray-700">
                  Jumlah
                  {quantityLocked && (
                    <span className="ml-1 text-gray-400 font-normal">(pilih berat dulu)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-xl bg-white overflow-hidden h-9">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-full px-3"
                    disabled={quantity <= 1 || quantityLocked}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    className="h-full px-3"
                    disabled={quantity >= maxStock || quantityLocked}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {maxStock !== 999 && (
                  <span className="text-xs text-gray-400">
                    Stok tersedia: {maxStock}
                  </span>
                )}
              </div>
            </div>

            {/* === TOTAL HARGA === */}
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Harga</span>
                <span className="text-base font-bold text-green-700">
                  {formatPrice(product.harga_jual * quantity)}
                </span>
              </div>
            </div>

            {/* === TOMBOL AKSI === */}
            {maxStock === 0 ? (
              <div className="mt-auto p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-xs font-bold text-red-600 mb-0.5">Stok Habis di Cabang Ini</p>
                <p className="text-[10px] text-red-500">Silakan pilih cabang lain pada panel di atas.</p>
              </div>
            ) : (
              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={onAddToCart}
                  variant="outline"
                  className="flex-1 py-5 text-xs font-bold border-green-600 text-green-600 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={weightRequired && !weightSelected}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  + Keranjang
                </Button>
                <Button
                  onClick={onBuyNow}
                  className="flex-1 py-5 text-xs font-bold bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={weightRequired && !weightSelected}
                >
                  Beli Sekarang
                </Button>
              </div>
            )}

            {/* Hint jika belum pilih berat */}
            {weightRequired && !weightSelected && (
              <p className="text-center text-[10px] text-red-400 mt-2">
                Pilih berat terlebih dahulu untuk melanjutkan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
