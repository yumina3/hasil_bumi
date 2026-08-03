import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../../../utils/supabase/info';
import { toast } from 'sonner';

const DELIVERY_QUOTA_PER_DAY = 100;

// ─── Types ────────────────────────────────────────────────────────────────────
interface DetailPesanan {
  id: number;
  pesanan_id: number;
  produk_id: number;
  nama_produk: string;
  qty: number;
  harga_saat_beli: number;
  total_harga: number;
}

interface Order {
  id: number;
  no_invoice: string;
  user_id: number;
  cabang_id: number;
  total_bayar: number;
  delivery_method: 'delivery' | 'pick_up';
  status_pesanan: string;
  catatan: string;
  no_whatsapp: string;
  nama_penerima: string;
  alamat_pengiriman: string;
  created_at: string;
  users?: { nama_lengkap: string; no_telepon: string };
  pembayaran?: { metode_bayar: string; status_pembayaran: string };
  detail_pesanan?: DetailPesanan[];
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
  isDeliveryQuotaFull: boolean;
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminCabangContext = createContext<AdminCabangContextType | undefined>(undefined);

export function AdminCabangProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cabangIdRef = useRef<number | null>(null);

  // ─── Fetch semua data ──────────────────────────────────────────────────────
  const refreshAllData = async () => {
    const cid = user?.cabang_id;
    if (!cid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [invRes, activeRes, historyRes] = await Promise.all([
        // 1. Stok
        supabase
          .from('stok')
          .select('id, jumlah_stok, threshold_stok, produk(nama_produk, sku, satuan, harga_jual)')
          .eq('cabang_id', cid),

        // 2. Pesanan aktif — include detail_pesanan & semua kolom penerima
        supabase
          .from('pesanan')
          .select(`
            *,
            users(nama_lengkap, no_telepon),
            pembayaran(metode_bayar, status_pembayaran),
            detail_pesanan(id, produk_id, nama_produk, qty, harga_saat_beli, total_harga)
          `)
          .eq('cabang_id', cid)
          .not('status_pesanan', 'in', '("selesai","dibatalkan", "ditolak")')
          .order('created_at', { ascending: false }),

        // 3. Riwayat
        supabase
          .from('pesanan')
          .select(`
            *,
            users(nama_lengkap, no_telepon),
            pembayaran(metode_bayar, status_pembayaran),
            detail_pesanan(id, produk_id, nama_produk, qty, harga_saat_beli, total_harga)
          `)
          .eq('cabang_id', cid)
          .in('status_pesanan', ['selesai', 'dibatalkan', 'ditolak'])
          .order('created_at', { ascending: false }),
      ]);

      if (invRes.error) throw invRes.error;
      if (activeRes.error) throw activeRes.error;
      if (historyRes.error) throw historyRes.error;

      setInventory(invRes.data || []);
      setOrders(activeRes.data || []);
      setOrderHistory(historyRes.data || []);
    } catch (err: any) {
      console.error('Fetch Error:', err.message);
      toast.error('Gagal memuat data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Auto-cancel delivery jika kuota penuh ─────────────────────────────────
  const checkAndCancelDeliveryIfFull = async (newOrder: Order) => {
    if (newOrder.delivery_method !== 'delivery') return;
    const cid = cabangIdRef.current;
    if (!cid) return;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const { count, error } = await supabase
      .from('pesanan')
      .select('id', { count: 'exact', head: true })
      .eq('cabang_id', cid)
      .eq('delivery_method', 'delivery')
      .neq('status_pesanan', 'dibatalkan')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) return;

    if ((count ?? 0) > DELIVERY_QUOTA_PER_DAY) {
      const { error: cancelError } = await supabase
        .from('pesanan')
        .update({
          status_pesanan: 'dibatalkan',
          catatan: `[AUTO] Dibatalkan sistem: kuota delivery harian (${DELIVERY_QUOTA_PER_DAY} pesanan) telah terpenuhi.`,
        })
        .eq('id', newOrder.id);

      if (!cancelError) {
        toast.warning(`Pesanan delivery ${newOrder.no_invoice} dibatalkan — kuota harian penuh.`);
      }
    }
  };

  // ─── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const cid = user?.cabang_id;
    if (!cid) return;

    cabangIdRef.current = cid;

    const ordersChannel = supabase
      .channel(`pesanan-cabang-${cid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pesanan', filter: `cabang_id=eq.${cid}` },
        async (payload) => {
          const newOrder = payload.new as Order;
          await checkAndCancelDeliveryIfFull(newOrder);
          await refreshAllData();
          toast.info(`Pesanan baru: ${newOrder.no_invoice}`);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pesanan', filter: `cabang_id=eq.${cid}` },
        async () => { await refreshAllData(); }
      )
      .subscribe();

    const stokChannel = supabase
      .channel(`stok-cabang-${cid}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stok', filter: `cabang_id=eq.${cid}` },
        (payload) => {
          const updated = payload.new as any;
          setInventory((prev) =>
            prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(stokChannel);
    };
  }, [user?.cabang_id]);

  // ─── Initial fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.cabang_id) refreshAllData();
    else setIsLoading(false);
  }, [user?.id, user?.cabang_id]);

  // ─── Derived stats ─────────────────────────────────────────────────────────
  const lowStockItems = inventory.filter(
    (item) => item.jumlah_stok <= (item.threshold_stok ?? 0)
  ).length;

  const newOrders = orders.filter(
  (o) => o.status_pesanan === 'menunggu_konfirmasi' ||
         o.status_pesanan === 'menunggu_pembayaran' ||
         o.status_pesanan === 'pembayaran_lunas'
).length;

  const now = new Date();
  const deliveryOrdersToday = [...orders, ...orderHistory].filter((o) => {
    if (o.delivery_method !== 'delivery' || o.status_pesanan === 'dibatalkan' || !o.created_at) return false;
    const orderDate = new Date(o.created_at);
    return (
      orderDate.getDate() === now.getDate() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const isDeliveryQuotaFull = deliveryOrdersToday >= DELIVERY_QUOTA_PER_DAY;

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
        isDeliveryQuotaFull,
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