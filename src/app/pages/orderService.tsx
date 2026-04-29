import { supabase } from "../../../utils/supabase/info";

export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'diproses'
  | 'dikemas'
  | 'dikirim'
  | 'siap_diambil'
  | 'selesai'
  | 'dibatalkan';

export const orderService = {
  async getActiveOrders(cabangId: number) {
    const { data, error } = await supabase
      .from('pesanan')
      .select(`
        *,
        users (nama_lengkap, no_telepon),
        pembayaran (metode_bayar, status_pembayaran)
      `)
      .eq('cabang_id', cabangId)
      .neq('status_pesanan', 'selesai')
      .neq('status_pesanan', 'dibatalkan')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getInventory(cabangId: number) {
    const { data, error } = await supabase
      .from('stok')
      .select(`
        id,
        jumlah_stok,
        threshold_stok,
        produk (nama_produk, sku, satuan, harga_jual)
      `)
      .eq('cabang_id', cabangId);

    if (error) throw error;
    return data;
  },

  async updateStatus(pesananId: number, status: OrderStatus) {
    const { error } = await supabase
      .from('pesanan')
      .update({ status_pesanan: status })
      .eq('id', pesananId);

    if (error) throw error;
  }
};