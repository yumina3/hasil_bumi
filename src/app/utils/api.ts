import { projectId, publicAnonKey, supabase } from '../../../utils/supabase/info';
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-376a5b07`;

// Helper untuk get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('hasil_bumi_token') || publicAnonKey;
};

// ============================================
// PRODUCTS API
// ============================================

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch product');
    }

    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, updates: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update product');
    }

    return data.product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// ============================================
// INVENTORY API
// ============================================

export const fetchInventoryByBranch = async (branchId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch inventory');
    }

    return data.inventory;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const updateInventory = async (branchId: number, productId: number, stock: number, threshold?: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${branchId}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ stock, threshold }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update inventory');
    }

    return data.inventory;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// ============================================
// ORDERS API
// ============================================

export const fetchOrdersByBranch = async (branchId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/branch/${branchId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch orders');
    }

    return data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const fetchOrdersByUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch orders');
    }

    return data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create order');
    }

    return data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string, estimatedTime?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ status, estimatedTime }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update order status');
    }

    return data.order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// ============================================
// BRANCHES API
// ============================================

export const fetchBranches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/branches`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch branches');
    }

    return data.branches;
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
};

// ============================================
// SEED DATA (One-time setup)
// ============================================

export const seedDatabase = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/seed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to seed database');
    }

    return data;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// ============================================
// AUTH & REGISTRATION API (Clean Architecture)
// ============================================

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phone?: string;
  address?: string;
  role: 'pelanggan' | 'admin_cabang' | 'admin_pusat';
  cabangId?: number | null;
}

export const registerAccount = async (payload: RegisterPayload) => {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Gagal mendaftarkan akun');
    }
    return data;
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
};

export const activateAccount = async (userId: string) => {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/activate-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengaktifkan akun');
    }
    return data;
  } catch (error) {
    console.error('Error activating account:', error);
    throw error;
  }
};

// ============================================
// CLEAN DATA SERVICE LAYER (Database Queries)
// ============================================

export const fetchUsersList = async () => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const fetchCabangList = async () => {
  const { data, error } = await supabase.from('cabang').select('*').order('id');
  if (error) throw error;
  return data || [];
};

export interface CabangPayload {
  nama_cabang: string;
  lokasi: string;
  alamat_lengkap?: string;
  jam_operasional?: string;
  no_telepon?: string;
  is_active?: boolean;
}

export const createCabang = async (payload: CabangPayload) => {
  const { data, error } = await supabase
    .from('cabang')
    .insert([{ ...payload, is_active: payload.is_active ?? true }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const fetchStokPerCabangView = async () => {
  const { data, error } = await supabase.from('view_stok_per_cabang').select('*');
  if (error) throw error;
  return data || [];
};

export const fetchProdukList = async () => {
  const { data, error } = await supabase.from('produk').select('*');
  if (error) throw error;
  return data || [];
};

export const fetchPesananList = async () => {
  const { data, error } = await supabase.from('pesanan').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ============================================
// ORDER SERVICE (Admin Cabang Operations)
// ============================================

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

  async rejectOrder(pesananId: number, alasanPenolakan: string) {
    const { error } = await supabase
      .from('pesanan')
      .update({
        status_pesanan: 'ditolak',
        alasan_penolakan: alasanPenolakan,
      })
    if (error) throw error;
  },
};

export const fetchProdukWithStokCabang = async (cabangId?: number | null, limit?: number) => {
  let query = supabase.from('produk').select('*').eq('is_active', true);
  if (limit) {
    query = query.limit(limit);
  }
  const { data: products, error: prodError } = await query;
  if (prodError) throw prodError;
  let result = products || [];

  if (cabangId) {
    const { data: stokList } = await supabase
      .from('stok')
      .select('produk_id, jumlah_stok')
      .eq('cabang_id', cabangId);

    if (stokList) {
      const stokMap = new Map();
      stokList.forEach((s: any) => stokMap.set(s.produk_id, s.jumlah_stok));
      result = result.map((p: any) => {
        const branchStok = stokMap.has(p.id) ? stokMap.get(p.id) : 0;
        return {
          ...p,
          stok: branchStok,
          stock: branchStok,
          jumlah_stok: branchStok,
        };
      });
    }
  }
  return result;
};
