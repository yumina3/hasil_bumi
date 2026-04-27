import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Interface untuk menyamakan struktur data dari Supabase
export interface Product {
  id: number;
  nama_produk: string;
  harga_jual: number;
  foto_url: string;
  satuan: string;
  deskripsi?: string;
  stock: number;
  is_active: boolean;
  [key: string]: any; 
}

// Interface untuk item di dalam keranjang
export interface CartItem extends Product {
  quantity: number;
  selectedBranchId: number;
  selectedWeight?: string; // Menyimpan info berat (misal: '500 gram (1/2kg)' atau '1.5 kg')
}

export type DeliveryMethod = 'pickup' | 'delivery';

interface CartContextType {
  cart: CartItem[];
  deliveryMethod: DeliveryMethod;
  selectedBranchId: number | null;
  addToCart: (product: any, branchId: number, weight?: string) => void;
  removeFromCart: (productId: number, weight?: string) => void;
  updateQuantity: (productId: number, quantity: number, weight?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setSelectedBranch: (branchId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod>('pickup');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  // 1. Logika Tambah ke Keranjang
  const addToCart = useCallback((product: any, branchId: number, weight?: string) => {
    setCart((prevCart) => {
      // PENTING: Cari apakah item dengan ID dan BERAT yang sama sudah ada
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.selectedWeight === weight
      );

      if (existingItem) {
        // Jika sama, cukup tambah jumlahnya (quantity)
        return prevCart.map((item) =>
          item.id === product.id && item.selectedWeight === weight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Jika item baru atau beratnya berbeda, tambah baris baru
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          selectedBranchId: branchId,
          selectedWeight: weight,
        },
      ];
    });
  }, []);

  // 2. Logika Hapus Item (Berdasarkan ID & Berat)
  const removeFromCart = useCallback((productId: number, weight?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === productId && item.selectedWeight === weight)
      )
    );
  }, []);

  // 3. Logika Update Jumlah (Berdasarkan ID & Berat)
  const updateQuantity = useCallback((productId: number, quantity: number, weight?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.selectedWeight === weight
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // 4. Hitung Total Harga Belanja
  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => {
      // Menggunakan harga_jual dari tabel produk
      return total + (item.harga_jual * item.quantity);
    }, 0);
  }, [cart]);

  // 5. Hitung Total Barang (untuk angka di Icon Keranjang)
  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const setDeliveryMethod = useCallback((method: DeliveryMethod) => {
    setDeliveryMethodState(method);
  }, []);

  const setSelectedBranch = useCallback((branchId: number) => {
    setSelectedBranchId(branchId);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        deliveryMethod,
        selectedBranchId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        setDeliveryMethod,
        setSelectedBranch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}