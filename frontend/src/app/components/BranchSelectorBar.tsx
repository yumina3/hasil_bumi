import { useState, useEffect } from 'react';
import { Store, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { fetchCabangList } from '../utils/api';
import { toast } from 'sonner';

export function BranchSelectorBar() {
  const { selectedBranchId, setSelectedBranch } = useCart();
  const [branchList, setBranchList] = useState<any[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await fetchCabangList();
        setBranchList(data || []);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    fetchBranches();
  }, []);

  const handleBranchChange = (value: string) => {
    const branchId = Number(value);
    setSelectedBranch(branchId);
    const branch = branchList.find(b => b.id === branchId);
    if (branch) {
      toast.success(`Cabang aktif diubah ke: ${branch.nama_cabang}`);
    }
  };

  const selectedBranch = branchList.find(b => b.id === selectedBranchId);

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs py-3 sticky top-20 z-40 transition-all">
      <div className="w-full px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Kiri: Label & Info Cabang */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-full shrink-0 border border-green-100">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-900">Cabang Distribusi Terdekat:</span>
                {selectedBranch ? (
                  <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs gap-1 font-semibold px-2 py-0.5">
                    <Store className="h-3 w-3" /> {selectedBranch.nama_cabang}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 text-xs font-medium">
                    Belum Dipilih
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {selectedBranch 
                  ? `Lokasi: ${selectedBranch.lokasi} • Jam Buka: ${selectedBranch.jam_operasional || '08:00 - 20:00 WIB'}`
                  : 'Pilih cabang untuk melihat ketersediaan stok produk yang akurat di daerah Anda'}
              </p>
            </div>
          </div>

          {/* Kanan: Dropdown Pilihan Cabang */}
          <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
            <Select
              value={selectedBranchId?.toString()}
              onValueChange={handleBranchChange}
            >
              <SelectTrigger className="w-full sm:w-[260px] md:w-[280px] bg-gray-50 hover:bg-white text-gray-900 border border-gray-300 focus:ring-green-500 rounded-lg text-sm font-medium shadow-2xs">
                <SelectValue placeholder="-- Pilih Cabang Terdekat --" />
              </SelectTrigger>
              <SelectContent>
                {branchList.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-green-600" />
                        {branch.nama_cabang}
                      </span>
                      <span className="text-xs text-gray-400">({branch.lokasi})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
    </div>
  );
}
