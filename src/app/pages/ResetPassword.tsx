import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

type Step = 'loading' | 'form' | 'success' | 'invalid';

export function ResetPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // 1. Listen ke auth state change untuk mendeteksi event recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setCurrentStep('form');
      }
    });

    // 2. Fallback check untuk menangani hash di URL
    const checkInitialSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      if (hashParams.get('error')) {
        setCurrentStep('invalid');
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setCurrentStep('form');
      } else {
        // Beri waktu delay jika Supabase sedang memproses fragment URL
        const timer = setTimeout(() => {
          if (currentStep === 'loading') setCurrentStep('invalid');
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentStep]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Password dan konfirmasi tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error('Gagal memperbarui password', { description: error.message });
      setIsLoading(false);
    } else {
      toast.success('Password berhasil diperbarui');
      // Keluar agar session recovery bersih
      await supabase.auth.signOut();
      setCurrentStep('success');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600 text-sm">
            {currentStep === 'form' ? 'Silakan tentukan password baru Anda' : 'Keamanan akun adalah prioritas kami'}
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {currentStep === 'loading' && 'Memverifikasi Link...'}
              {currentStep === 'form' && 'Password Baru'}
              {currentStep === 'success' && 'Berhasil!'}
              {currentStep === 'invalid' && 'Link Tidak Valid'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* STEP: LOADING */}
            {currentStep === 'loading' && (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4" />
                <p className="text-sm text-gray-500">Menyiapkan enkripsi...</p>
              </div>
            )}

            {/* STEP: FORM INPUT */}
            {currentStep === 'form' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 h-11 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 h-11 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {newPassword === confirmPassword ? '✓ Password cocok' : 'Password tidak cocok'}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Update Password'}
                </Button>
              </form>
            )}

            {/* STEP: SUCCESS */}
            {currentStep === 'success' && (
              <div className="text-center space-y-6 py-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <p className="text-gray-600">Password Anda telah diperbarui. Silakan masuk kembali.</p>
                <Button onClick={() => navigate('/login')} className="w-full bg-green-600">
                  Login Sekarang
                </Button>
              </div>
            )}

            {/* STEP: INVALID/EXPIRED */}
            {currentStep === 'invalid' && (
              <div className="text-center space-y-4 py-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Link reset password sudah kadaluarsa.</AlertDescription>
                </Alert>
                <Button onClick={() => navigate('/forgot-password')} className="w-full bg-green-600">
                  Minta Link Baru
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}