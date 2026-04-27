import { Outlet } from 'react-router';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from './ui/sonner';

export function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Outlet />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
