import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Store, AlertTriangle, Loader2, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { fetchStokPerCabangView, fetchCabangList } from "../../utils/api";
import { toast } from "sonner";

export function AdminPusatBranches() {
  const [stokData, setStokData] = useState<any[]>([]);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stok, cabang] = await Promise.all([
        fetchStokPerCabangView(),
        fetchCabangList(),
      ]);
      setStokData(stok || []);
      setCabangList(cabang || []);
    } catch (err: any) {
      console.error("Gagal memuat data cabang:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  if (isLoading)
    return (
      <div className="py-12 text-center text-gray-500 flex justify-center items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        Memuat data cabang dan stok dari Supabase...
      </div>
    );
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  // Group data stok by nama_cabang
  const cabangMap: Record<string, any[]> = {};
  stokData.forEach((row) => {
    const key = row.nama_cabang || "Unknown";
    if (!cabangMap[key]) cabangMap[key] = [];
    cabangMap[key].push(row);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitor Cabang Distribusi</h2>
          <p className="text-gray-600">
            Pantau ketersediaan stok produk secara real-time di setiap kantor cabang
          </p>
        </div>
      </div>

      {/* Grid Monitor Cabang */}
      {cabangList.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Belum ada data cabang terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cabangList.map((cabang) => {
            const namaCabang = cabang.nama_cabang;
            const produkList = cabangMap[namaCabang] || [];

            const lowStock = produkList.filter(
              (p) => p.status_stok === "Rendah"
            ).length;
            const habis = produkList.filter(
              (p) => p.status_stok === "Habis"
            ).length;
            const aman = produkList.filter(
              (p) => p.status_stok === "Aman"
            ).length;

            return (
              <Card key={cabang.id} className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{namaCabang}</CardTitle>
                        <p className="text-xs text-green-700 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {cabang.lokasi || "Lokasi Umum"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Aktif</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Info Cabang Singkat */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4 bg-gray-50 p-2 rounded border">
                    {cabang.jam_operasional && (
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-green-600" /> {cabang.jam_operasional}
                      </span>
                    )}
                    {cabang.no_telepon && (
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="h-3.5 w-3.5 text-green-600" /> {cabang.no_telepon}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                      <p className="text-2xl font-bold text-green-900">{aman}</p>
                      <p className="text-xs text-green-600 mt-1">Aman</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                      <p className="text-2xl font-bold text-orange-900">{lowStock}</p>
                      <p className="text-xs text-orange-600 mt-1">Rendah</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                      <p className="text-2xl font-bold text-red-900">{habis}</p>
                      <p className="text-xs text-red-600 mt-1">Habis</p>
                    </div>
                  </div>

                  {/* Alerts */}
                  {lowStock > 0 && (
                    <Alert className="bg-orange-50 border-orange-200 mb-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-700 text-sm">
                        <strong>{lowStock} produk</strong> stok rendah
                      </AlertDescription>
                    </Alert>
                  )}
                  {habis > 0 && (
                    <Alert className="bg-red-50 border-red-200 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 text-sm">
                        <strong>{habis} produk</strong> habis stok
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Product List */}
                  <div className="mt-4">
                    <p className="font-semibold text-sm text-gray-700 mb-3">
                      Detail Stok Produk:
                    </p>
                    {produkList.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded border border-dashed text-center text-xs text-gray-500 italic">
                        Cabang baru ini belum memiliki inventori produk yang terdaftar.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {produkList.map((p, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-2 rounded border text-sm ${
                              p.status_stok === "Habis"
                                ? "bg-red-50 border-red-200"
                                : p.status_stok === "Rendah"
                                ? "bg-orange-50 border-orange-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <p className="font-medium text-gray-900">
                              {p.nama_produk}
                            </p>
                            <p
                              className={`font-bold ${
                                p.status_stok === "Habis"
                                  ? "text-red-700"
                                  : p.status_stok === "Rendah"
                                  ? "text-orange-700"
                                  : "text-green-700"
                              }`}
                            >
                              {p.jumlah_stok ?? 0} unit
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}