import { useState, useEffect } from 'react';
import { fetchBranches } from '../utils/api';

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  openHours: string;
  latitude: number;
  longitude: number;
  deliveryRadius: number;
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBranches();
        setBranches(data);
      } catch (err: any) {
        console.error('Error loading branches:', err);
        setError(err.message || 'Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  return { branches, loading, error };
}
