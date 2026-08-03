import { useEffect, useState } from 'react';
import { seedDatabase } from '../utils/api';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check localStorage untuk flag initialized
        const isSeeded = localStorage.getItem('hasil_bumi_seeded');
        
        if (!isSeeded) {
          console.log('Seeding database for first time...');
          const result = await seedDatabase();
          
          if (result.success || result.skip) {
            console.log('Database seeded successfully!', result);
            localStorage.setItem('hasil_bumi_seeded', 'true');
          }
        } else {
          console.log('Database already seeded');
        }
        
        setInitialized(true);
      } catch (err: any) {
        console.error('Failed to initialize app:', err);
        // Don't block app if seed fails - data might already exist
        setError(err.message);
        setInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <h2 className="text-2xl font-bold text-green-800">Memuat Hasil Bumi...</h2>
          <p className="text-green-600">Menginisialisasi database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Initialization warning:', error);
    // Still render app even with error - seed might have already happened
  }

  return <>{children}</>;
}
