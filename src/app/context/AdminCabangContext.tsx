import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../../../utils/supabase/info';
import { toast } from 'sonner';

interface Order {
  id: number;
  no_invoice: string;
  user_id: number;
  cabang_id: number;
  total_bayar: number;
  metode_ambil: 'delivery' | 'pick_up';
  status_pesanan: string;
  catatan: string;
  created_at: string;
  users?: { nama_lengkap: string; no_telepon: string };
  pembayaran?: { metode_bayar: string; status_pembayaran: string };
}

interface AdminCabangContextType {
  inventory: any[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  orderHistory: Order[];
  setOrderHistory: React.Dispatch<React.SetStateAction<Order[]>>;
  lowStockItems: number;
  newOrders: number;
  deliveryOrdersToday: number;
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
}

const AdminCabangContext = createContext<AdminCabangContextType | undefined>(undefined);

export function AdminCabangProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAllData = async () => {
    const cid = user?.cabang_id;

    if (!cid) {
      console.warn("Context: Cabang ID belum terdeteksi. User:", user);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Ambil Stok
      const { data: invData, error: invError } = await supabase
        .from('stok')
        .select(`id, jumlah_stok, threshold_stok, produk (nama_produk, sku, satuan, harga_jual)`)
        .eq('cabang_id', cid);
      if (invError) throw invError;

      // 2. Ambil Pesanan Aktif
      const { data: activeData, error: activeError } = await supabase
        .from('pesanan')
        .select(`*, users(nama_lengkap, no_telepon), pembayaran(metode_bayar, status_pembayaran)`)
        .eq('cabang_id', cid)
        .neq('status_pesanan', 'selesai')
        .order('created_at', { ascending: false });
      if (activeError) throw activeError;

      // 3. Ambil Riwayat Pesanan
      const { data: historyData, error: historyError } = await supabase
        .from('pesanan')
        .select(`*, users(nama_lengkap, no_telepon), pembayaran(metode_bayar, status_pembayaran)`)
        .eq('cabang_id', cid)
        .eq('status_pesanan', 'selesai')
        .order('created_at', { ascending: false });
      if (historyError) throw historyError;

      setInventory(invData || []);
      setOrders(activeData || []);
      setOrderHistory(historyData || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      toast.error("Gagal memuat data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.cabang_id) {
      // User sudah login dan punya cabang_id → fetch data
      refreshAllData();
    } else if (user && !user.cabang_id) {
      // User login tapi tidak punya cabang_id (bukan admin cabang)
      console.warn("User tidak memiliki cabang_id:", user);
      setIsLoading(false);
    } else {
      // User belum login
      setIsLoading(false);
    }
  }, [user?.id, user?.cabang_id]);

  // Statistik
  const lowStockItems = inventory.filter(
    item => item.jumlah_stok <= (item.threshold_stok ?? 0)
  ).length;

  const newOrders = orders.filter(
    o => o.status_pesanan === 'baru' || o.status_pesanan === 'new'
  ).length;

  const today = new Date().toISOString().split('T')[0];
  const deliveryOrdersToday = [...orders, ...orderHistory].filter(
    o => o.metode_ambil === 'delivery' && o.created_at?.startsWith(today)
  ).length;

  return (
    <AdminCabangContext.Provider
      value={{
        inventory,
        setInventory,
        orders,
        setOrders,
        orderHistory,
        setOrderHistory,
        lowStockItems,
        newOrders,
        deliveryOrdersToday,
        isLoading,
        refreshAllData,
      }}
    >
      {children}
    </AdminCabangContext.Provider>
  );
}

export const useAdminCabangData = () => {
  const context = useContext(AdminCabangContext);
  if (!context) throw new Error('useAdminCabangData must be used within AdminCabangProvider');
  return context;
};