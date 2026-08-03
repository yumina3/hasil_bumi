import { Link } from 'react-router';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export function FloatingCart() {
  const { cart, getTotalItems, getTotalPrice, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const totalItems = getTotalItems();

  // Only show for authenticated pelanggan
  if (!isAuthenticated || user?.role !== 'pelanggan' || totalItems === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg relative"
          size="lg"
        >
          <ShoppingCart className="h-6 w-6 text-white" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-600">
            {totalItems}
          </Badge>
        </Button>
      </motion.div>

      {/* Floating Cart Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b bg-green-600 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Keranjang Belanja</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-green-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-green-100 mt-1">{totalItems} item</p>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <Link to="/cart" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    Lihat Keranjang
                  </Button>
                </Link>
                <Link to="/checkout" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" size="lg">
                    Checkout Sekarang
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}