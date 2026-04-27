import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

type Step = 'email' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Mohon masukkan email Anda');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Gagal mengirim email reset password', {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success(`Link reset password telah dikirim ke ${email}`);
    setCurrentStep('success');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {currentStep !== 'success' && (
          <div className="mb-4">
            <Button
              variant="ghost"
              className="gap-2 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Button>
          </div>
        )}

        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            {currentStep === 'email'
              ? 'Masukkan email untuk menerima link reset password'
              : 'Cek email Anda!'}
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {currentStep === 'email' ? 'Verifikasi Email' : 'Email Terkirim!'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 'email'
                ? 'Kami akan mengirim link reset password ke email Anda'
                : `Link reset password telah dikirim ke ${email}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step: Email Input */}
            {currentStep === 'email' && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Terdaftar</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@hasilbumi.com"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Masukkan email yang terdaftar di akun Anda
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Kirim Link Reset Password
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Step: Success */}
            {currentStep === 'success' && (
              <div className="text-center space-y-6 py-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Cek Inbox Email Anda!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Kami telah mengirim link reset password ke:
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">{email}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left space-y-2">
                  <p className="text-sm text-blue-800 font-semibold">Langkah selanjutnya:</p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Buka email dari <strong>Hasil Bumi App</strong></li>
                    <li>Klik link <strong>"Reset Password"</strong> di email</li>
                    <li>Buat password baru Anda</li>
                  </ol>
                </div>

                <p className="text-xs text-gray-500">
                  Tidak menerima email? Cek folder spam atau{' '}
                  <button
                    className="text-green-600 hover:underline font-medium"
                    onClick={() => setCurrentStep('email')}
                  >
                    coba lagi
                  </button>
                </p>

                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full h-11">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {currentStep === 'email' && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Ingat password Anda?{' '}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 font-semibold hover:underline"
            >
              Login di sini
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
