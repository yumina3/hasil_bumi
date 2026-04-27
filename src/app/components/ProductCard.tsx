import { Link, useNavigate } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { Product, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, selectedBranchId } = useCart();
  const { isAuthenticated } = useAuth();
  const handleAddToCart = (e: React.MouseEvent) => {
  e.preventDefault(); // Menghindari bentrok dengan Link pembungkus

  if (!isAuthenticated) {
    toast.error('Silakan login terlebih dahulu');
    navigate('/login');
    return;
  }

  if (!selectedBranchId) {
    toast.error('Silakan pilih cabang terlebih dahulu');
    return;
  }

  // ✅ JIKA ANDA INGIN PINDAH KE HALAMAN DETAIL (GAMBAR 2)
  // Gunakan navigate ke route detail produk Anda
  navigate(`/produk/${product.id}`); 
};

  const formatPrice = (price: any) => {
    const numericPrice = Number(price) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  return (
    // ✅ FIX: link ke /produk/:id
    <Link to={`/produk/${product.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.foto_url || '/placeholder-produk.png'}
            alt={product.nama_produk}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          {product.sku && (
            <Badge className="absolute top-2 right-2 bg-green-600 text-xs">
              {product.sku}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex-1">
          <h3 className="font-semibold text-lg mb-1">{product.nama_produk}</h3>
          <p className="text-xs text-gray-500 mb-1">SKU: {product.sku}</p>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.deskripsi}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-green-700">
              {formatPrice(product.harga_jual)}
            </span>
            <span className="text-sm text-gray-500">/ {product.satuan}</span>
          </div>
        </CardContent>

        {/* ✅ FIX: CardFooter dengan tombol tambah ke keranjang */}
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-green-600 hover:bg-green-700 gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Tambah ke Keranjang
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}