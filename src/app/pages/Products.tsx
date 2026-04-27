import { useState, useEffect } from 'react';
import { Package, Search, AlertCircle, Loader2, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { supabase } from '../../../utils/supabase/info';

export function Products() {
  const [productList, setProductList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]); // State untuk daftar kategori
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string>('Semua');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Ambil Data Kategori dari tabel kategori_produk
        const { data: categories, error: catError } = await supabase
          .from('kategori_produk')
          .select('*')
          .order('nama_kategori', { ascending: true });

        if (catError) throw catError;
        setCategoryList(categories || []);

        // 2. Ambil Data Produk
        const { data: products, error: prodError } = await supabase
          .from('produk')
          .select('*')
          .eq('is_active', true);

        if (prodError) throw prodError;
        setProductList(products || []);
      } catch (err: any) {
        console.error("Gagal mengambil data:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. Logika Filter Produk
  const filteredProducts = productList.filter((product) => {
    const matchesSearch = product.nama_produk?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter berdasarkan kategori_id
    const matchesCategory = 
      selectedCategoryId === 'Semua' || 
      product.kategori_id === Number(selectedCategoryId);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Katalog Hasil Bumi</h1>
          <p className="text-gray-600">Pilih kategori untuk menemukan kebutuhan dapur Anda.</p>
        </div>

        {/* --- SECTION KATEGORI DINAMIS --- */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            <Filter className="h-4 w-4" />
            <span>Kategori</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategoryId === 'Semua' ? "default" : "outline"}
              className={selectedCategoryId === 'Semua' ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setSelectedCategoryId('Semua')}
              size="sm"
            >
              Semua
            </Button>
            {categoryList.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                className={selectedCategoryId === cat.id ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => setSelectedCategoryId(cat.id)}
                size="sm"
              >
                {cat.nama_kategori}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari produk..."
            className="pl-10 shadow-sm border-gray-200 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-green-600">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-gray-500">Menghubungkan ke Supabase...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  name: product.nama_produk,
                  price: product.harga_jual,
                  image: product.foto_url,
                  unit: product.satuan
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Produk Tidak Ditemukan</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Maaf, tidak ada produk di kategori ini yang cocok dengan pencarianmu.
            </p>
            <Button 
              variant="link" 
              className="mt-2 text-green-600"
              onClick={() => {setSelectedCategoryId('Semua'); setSearchQuery('');}}
            >
              Tampilkan Semua Produk
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}