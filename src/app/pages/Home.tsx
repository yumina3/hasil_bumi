import { Link } from 'react-router';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { supabase } from '../../../utils/supabase/info';
import { fetchProdukWithStokCabang } from '../utils/api';
import { BranchSelectorBar } from '../components/BranchSelectorBar';

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const { selectedBranchId } = useCart();

  const [productList, setProductList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const products = await fetchProdukWithStokCabang(selectedBranchId, 4);
        setProductList(products || []);
      } catch (error: any) {
        console.error('Error loading home data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [selectedBranchId]);

  return (
    <div className="min-h-screen">
      {/* Smart Branch Selection Bar */}
      {(!user || user?.role === 'pelanggan') && (
        <BranchSelectorBar />
      )}

      {/* Welcome Alert */}
      {isAuthenticated && user?.role === 'pelanggan' && !selectedBranchId && (
        <div className="w-full px-4 lg:px-6 mt-2 mb-2">
          <Alert className="border-green-200 bg-green-50">
            <MapPin className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 font-bold">Halo, {user?.name}!</AlertTitle>
            <AlertDescription className="text-green-700">
              Silakan <strong>Pilih Cabang</strong> terlebih dahulu agar stok yang ditampilkan akurat.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center pt-24 pb-12 md:py-32"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1690934164598-99267828e900?ixlib=rb-4.1.0&auto=format&fit=crop&w=1080&q=80)',
        }}
      >
        <div className="w-full px-4 lg:px-6">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hasil Bumi - Segar Dari Petani
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Belanja kebutuhan dapur organik kini lebih mudah.
            </p>
            {/* FIX: link ke /produk */}
            <Link to="/produk">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2 px-8">
                Mulai Belanja <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="w-full px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Produk Kami</h2>
              <p className="text-gray-600">Sayuran segar kualitas terbaik minggu ini</p>
            </div>
            {/* FIX: link ke /produk */}
            <Link to="/produk">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}