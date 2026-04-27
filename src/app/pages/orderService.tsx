import { supabase } from "../../../utils/supabase/info";

export const orderService = {
  // Ambil pesanan berdasarkan cabang_id
  async getActiveOrders(cabangId: number) {
    const { data, error } = await supabase
      .from('pesanan')
      .select(`
        *,
        users (nama_lengkap, no_telepon),
        pembayaran (metode_bayar, status_pembayaran)
      `)
      .eq('cabang_id', cabangId)
      .neq('status_pesanan', 'selesai') // Di DB kamu: 'selesai'
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Ambil stok dan info produk
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

  // Update status sesuai CHECK constraint di DB kamu
  async updateStatus(pesananId: number, status: string) {
    const { error } = await supabase
      .from('pesanan')
      .update({ status_pesanan: status })
      .eq('id', pesananId);

    if (error) throw error;
  }
};