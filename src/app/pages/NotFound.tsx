import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <Link to="/">
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
