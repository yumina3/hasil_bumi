import { useState } from 'react';
import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  let title = "Terjadi Gangguan Sistem";
  let message = "Mohon maaf, sistem mengalami sedikit kendala teknis saat memuat halaman ini. Tim teknis kami telah mencatat kejadian ini untuk perbaikan.";
  let errorDetails = "";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Halaman Tidak Ditemukan (404)";
      message = "Maaf, halaman yang Anda cari tidak tersedia atau alamat URL telah dipindahkan.";
    } else if (error.status === 401 || error.status === 403) {
      title = "Akses Ditolak";
      message = "Anda tidak memiliki izin akses untuk membuka halaman ini. Silakan masuk dengan akun yang sesuai.";
    } else {
      title = `Error ${error.status}: ${error.statusText || 'Terjadi Kesalahan'}`;
      message = error.data?.message || message;
    }
    errorDetails = JSON.stringify(error.data || error, null, 2);
  } else if (error instanceof Error) {
    errorDetails = `${error.name}: ${error.message}\n\n${error.stack || ''}`;
  } else if (typeof error === 'string') {
    errorDetails = error;
  } else if (error && typeof error === 'object') {
    errorDetails = JSON.stringify(error, null, 2);
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-black text-green-700 tracking-tight">
              HASIL BUMI
            </span>
          </Link>
        </div>

        {/* Card Error */}
        <Card className="border-green-100 shadow-xl shadow-green-900/5 bg-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-green-600" />
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              {message}
            </p>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <Button
                onClick={handleReload}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2 w-full"
              >
                <RefreshCw className="h-4 w-4" />
                Muat Ulang
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold gap-2 w-full"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Link to="/" className="w-full">
                <Button
                  variant="outline"
                  className="border-green-200 hover:bg-green-50 text-green-700 font-semibold gap-2 w-full"
                >
                  <Home className="h-4 w-4" />
                  Beranda
                </Button>
              </Link>
            </div>

            {/* Technical Detail Toggle */}
            {errorDetails && (
              <div className="border-t border-gray-100 pt-4 mt-6 text-left">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    Detail Teknis (Untuk Developer)
                  </span>
                  {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showDetails && (
                  <div className="mt-3 bg-gray-900 text-gray-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-gray-800 shadow-inner">
                    <pre className="whitespace-pre-wrap break-words">{errorDetails}</pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Jika masalah tetap berlanjut, silakan hubungi tim layanan pelanggan kami.
        </p>
      </div>
    </div>
  );
}
