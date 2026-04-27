import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "../../../utils/supabase/info";

export type UserRole = 'pelanggan' | 'admin_cabang' | 'admin_pusat';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cabang_id?: number;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = async (supabaseUser: any): Promise<User> => {
    try {
      // Query dengan timeout 5 detik
      const queryPromise = supabase
        .from('users')
        .select('id, cabang_id, peran, nama_lengkap')
        .eq('auth_id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );

      const { data: profileData, error: profileError } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]) as any;

      if (profileError) {
        console.error('Gagal ambil profil:', profileError.message);
      }

      // Jika admin_cabang, ambil cabang_id dari tabel admin_cabang
      let cabangId = profileData?.cabang_id ?? undefined;

      if (profileData?.peran === 'admin_cabang' && profileData?.id) {
        const adminQueryPromise = supabase
          .from('admin_cabang')
          .select('cabang_id')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .single();

        const adminTimeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Admin query timeout')), 5000)
        );

        const { data: adminCabangData, error: adminError } = await Promise.race([
          adminQueryPromise,
          adminTimeoutPromise,
        ]) as any;

        if (adminError) {
          console.error('Gagal ambil admin_cabang:', adminError.message);
        }

        if (adminCabangData?.cabang_id) {
          cabangId = adminCabangData.cabang_id;
        }
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profileData?.nama_lengkap || supabaseUser.user_metadata?.full_name || 'User',
        role: (profileData?.peran as UserRole) ?? 'pelanggan',
        cabang_id: cabangId,
      };

    } catch (err: any) {
      console.error("mapUser error:", err.message);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || 'User',
        role: 'pelanggan',
        cabang_id: undefined,
      };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code && window.location.pathname === '/reset-password') {
          setLoading(false);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const mapped = await mapUser(session.user);
          setUser(mapped);
        }
      } catch (err: any) {
        console.error("initializeAuth error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') return;

      try {
        if (session?.user) {
          const mapped = await mapUser(session.user);
          setUser(mapped);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error("onAuthStateChange error:", err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      const mappedUser = await mapUser(data.user);

      if (role && mappedUser.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Akun ini bukan akun ${role.replace('_', ' ')}`);
      }

      setUser(mappedUser);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}