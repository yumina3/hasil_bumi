import { supabase } from "../../../utils/supabase/info";

export type OrderStatus =
  | 'menunggu_konfirmasi'   
  | 'menunggu_pembayaran'
  | 'pembayaran_lunas'
  | 'diproses'
  | 'dikemas'
  | 'dikirim'
  | 'siap_diambil'
  | 'selesai'
  | 'dibatalkan'
  | 'ditolak';         

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
  },

  // ← method baru: tolak pesanan + simpan alasan & kembalikan stok
  async rejectOrder(pesananId: number, alasanPenolakan: string) {
    // 1. Ambil data pesanan untuk tahu cabang_id
    const { data: pesanan } = await supabase
      .from('pesanan')
      .select('cabang_id')
      .eq('id', pesananId)
      .maybeSingle();

    // 2. Ambil detail pesanan untuk mengembalikan stok
    if (pesanan && pesanan.cabang_id) {
      const { data: details } = await supabase
        .from('detail_pesanan')
        .select('produk_id, qty')
        .eq('pesanan_id', pesananId);

      if (details) {
        for (const item of details) {
          try {
            await supabase.rpc('kembalikan_stok_atomic', {
              p_cabang_id: pesanan.cabang_id,
              p_produk_id: item.produk_id,
              p_qty: item.qty,
            });
          } catch (e) {
            const { data: st } = await supabase
              .from('stok')
              .select('id, jumlah_stok')
              .eq('cabang_id', pesanan.cabang_id)
              .eq('produk_id', item.produk_id)
              .maybeSingle();
            if (st && st.id) {
              await supabase
                .from('stok')
                .update({ jumlah_stok: (st.jumlah_stok ?? 0) + item.qty })
                .eq('id', st.id);
            }
          }
        }
      }
    }

    const { error } = await supabase
      .from('pesanan')
      .update({
        status_pesanan:   'ditolak',
        alasan_penolakan: alasanPenolakan,
      })
      .eq('id', pesananId);

    if (error) throw error;
  },
};