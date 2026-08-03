import { useState, useEffect } from 'react';
import { fetchProducts } from '../utils/api';
import { Product } from '../context/CartContext';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Error refreshing products:', err);
      setError(err.message || 'Failed to refresh products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refreshProducts };
}
