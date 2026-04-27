import { projectId, publicAnonKey } from '../../../utils/supabase/info';
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
