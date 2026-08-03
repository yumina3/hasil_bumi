import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  login: (email: string, password: string, role?: UserRole) => Promise<User | undefined>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = async (supabaseUser: any): Promise<User> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id, cabang_id, peran, nama_lengkap')
        .eq('auth_id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Gagal ambil profil:', profileError.message);
      }

      let cabangId = profileData?.cabang_id ?? undefined;

      if (profileData?.peran === 'admin_cabang' && profileData?.id) {
        const { data: adminCabangData, error: adminError } = await supabase
          .from('admin_cabang')
          .select('cabang_id')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .maybeSingle();

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
    let isMounted = true;
    let listenerRef: any = null;

    const initializeAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code && window.location.pathname === '/reset-password') {
          if (isMounted) setLoading(false);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const mapped = await mapUser(session.user);
          if (isMounted) setUser(mapped);
        }
      } catch (err: any) {
        console.error("initializeAuth error:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Jalankan initializeAuth dulu, baru pasang listener
    // agar tidak berebut lock dengan onAuthStateChange
    initializeAuth().then(() => {
      if (!isMounted) return;

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') return;

        // Skip INITIAL_SESSION karena sudah ditangani initializeAuth
        if (event === 'INITIAL_SESSION') return;

        try {
          if (session?.user && isMounted) {
            const mapped = await mapUser(session.user);
            if (isMounted) setUser(mapped);
          } else if (isMounted) {
            setUser(null);
          }
        } catch (err: any) {
          console.error("onAuthStateChange error:", err.message);
          if (isMounted) setUser(null);
        } finally {
          if (isMounted) setLoading(false);
        }
      });

      listenerRef = authListener;
    });

    return () => {
      isMounted = false;
      listenerRef?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<User | undefined> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email atau password yang Anda masukkan salah.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Akun ini belum diaktifkan (konfirmasi email/OTP belum selesai). Jika ini akun Admin Cabang, Super Admin dapat mengaktifkannya langsung dari menu Manajemen Staf.');
      }
      throw error;
    }

    if (data.user) {
      const mappedUser = await mapUser(data.user);

      if (role && mappedUser.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Akun ini bukan akun ${role.replace('_', ' ')}`);
      }

      setUser(mappedUser);
      return mappedUser;
    }
    return undefined;
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