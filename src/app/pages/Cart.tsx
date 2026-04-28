import { Link, useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = getTotalPrice();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">
            Belum ada produk dalam keranjang Anda
          </p>
          <Link to="/produk">
            <Button className="bg-green-600 hover:bg-green-700 gap-2">
              Mulai Belanja
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-green-800">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              // Menghitung total per item (harga_jual * quantity)
              const itemTotal = item.harga_jual * item.quantity;
              
              return (
                <Card key={`${item.id}-${item.selectedWeight || 'default'}`} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                        <img
                          src={item.foto_url}
                          alt={item.nama_produk}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.nama_produk}</h3>
                            
                            {/* TAMPILAN VARIAN BERAT */}
                            {item.selectedWeight && (
                              <div className="mt-1 flex items-center gap-1">
                                <Scale className="h-3 w-3 text-green-600" />
                                <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded border border-green-100">
                                  Varian: {item.selectedWeight}
                                </span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(item.harga_jual)} / {item.satuan}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id, item.selectedWeight)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Counter */}
                          <div className="flex items-center border rounded-lg bg-white shadow-sm">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none border-r"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedWeight)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center font-bold text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none border-l"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedWeight)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-lg text-green-700">
                              {formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-md">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Ringkasan Pesanan</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Produk ({cart.length})</span>
                    <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Pengiriman</span>
                    <span className="font-bold text-green-600 uppercase text-xs bg-green-50 px-2 py-1 rounded">Gratis</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">Total Tagihan</span>
                    <span className="text-2xl font-black text-green-700">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-bold shadow-lg shadow-green-100 rounded-xl"
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Link to="/products" className="block text-center">
                    <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50 w-full">
                      Tambah Produk Lain
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}