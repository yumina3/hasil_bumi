import { Link } from 'react-router';
import { Store, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { supabase } from '../../../utils/supabase/info';
import { toast } from 'sonner';

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const { selectedBranchId, setSelectedBranch } = useCart();

  const [productList, setProductList] = useState<any[]>([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const { data: products } = await supabase
          .from('produk')
          .select('*')
          .eq('is_active', true)
          .limit(4);
        setProductList(products || []);

        const { data: branches } = await supabase
          .from('cabang')
          .select('*')
          .eq('is_active', true)
          .order('nama_cabang', { ascending: true });
        setBranchList(branches || []);
      } catch (error: any) {
        console.error('Error loading home data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleBranchChange = (value: string) => {
    const branchId = Number(value);
    setSelectedBranch(branchId);
    const branch = branchList.find(b => b.id === branchId);
    if (branch) toast.success(`Cabang dipilih: ${branch.nama_cabang}`);
  };

  const selectedBranch = branchList.find(b => b.id === selectedBranchId);

  return (
    <div className="min-h-screen">
      {/* Smart Branch Selection Bar */}
      {isAuthenticated && user?.role === 'pelanggan' && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 sticky top-16 z-40 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Smart Branch Selection</span>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Select
                  value={selectedBranchId?.toString()}
                  onValueChange={handleBranchChange}
                >
                  <SelectTrigger className="w-full md:w-80 bg-white text-gray-900 border-none shadow-sm">
                    <SelectValue placeholder="Pilih cabang terdekat" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchList.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-green-600" />
                          {branch.nama_cabang}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBranch && (
                  <div className="hidden lg:block text-sm">
                    <p className="text-green-100 font-medium">
                      Buka: {selectedBranch.jam_operasional || '08:00 - 20:00'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Alert */}
      {isAuthenticated && user?.role === 'pelanggan' && !selectedBranchId && (
        <div className="container mx-auto px-4 mt-2 mb-2">
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
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hasil Bumi - Segar Dari Petani
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Belanja kebutuhan dapur organik kini lebih mudah.
            </p>
            {/* ✅ FIX: link ke /produk */}
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
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Produk Unggulan</h2>
              <p className="text-gray-600">Sayuran segar kualitas terbaik minggu ini</p>
            </div>
            {/* ✅ FIX: link ke /produk */}
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

      {/* Footer CTA */}
      <section className="py-16 bg-green-600 text-white rounded-t-[3rem] mt-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Mulai Hidup Sehat Hari Ini</h2>
          {/* ✅ FIX: link ke /produk */}
          <Link to="/produk">
            <Button size="lg" variant="secondary" className="bg-white text-green-700 hover:bg-gray-100 mt-4">
              Belanja Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}