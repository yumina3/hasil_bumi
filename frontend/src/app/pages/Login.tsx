import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';


export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get message from registration
  const registrationMessage = location.state?.message;
  const registeredEmail = location.state?.registeredEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Mohon lengkapi email dan password');
      return;
    }

    setIsLoading(true);
    
    try {
      const loggedInUser = await login(email, password);
      toast.success('Login berhasil!');
      
      // Smart Redirect based on user role from database
      const userRole = loggedInUser?.role || 'pelanggan';
      if (userRole === 'admin_pusat') {
        navigate('/admin-pusat');
      } else if (userRole === 'admin_cabang') {
        navigate('/admin-cabang');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            className="gap-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>

        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-36 w-36 shrink-0 overflow-hidden flex items-center justify-center">
              <img src="/logo_hasil_bumi.png" alt="Logo Hasil Bumi" className="h-full w-full object-contain transform scale-[2.5] drop-shadow-xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Bumi</h1>
          <p className="text-gray-600">Platform Digital Pertanian & Peternakan</p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-2">
            <div>
              <CardTitle className="text-2xl">Masuk ke Akun</CardTitle>
              <CardDescription>Masukkan email dan password Anda untuk melanjutkan</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Registration Success Message */}
            {registrationMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {registrationMessage}
                  {registeredEmail && (
                    <p className="mt-1 font-medium">Email: {registeredEmail}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email / Username</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@hasilbumi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Memproses...'
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Masuk
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-green-600 hover:text-green-700 font-semibold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}