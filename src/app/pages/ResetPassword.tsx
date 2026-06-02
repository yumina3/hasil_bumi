import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { toast } from "sonner";
import { supabase } from "../../../utils/supabase/info";

type Step = "loading" | "form" | "success" | "invalid";

export function ResetPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        // 1. Ekstrak parameter dari hash (#) ataupun query string (?) URL browser
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);

        // Jika Supabase melemparkan error di URL, langsung set ke invalid
        if (hashParams.get("error") || urlParams.get("error")) {
          setCurrentStep("invalid");
          return;
        }

        // 2. Cek apakah ada token pemulihan manual yang masuk dari link email kustom Resend
        const accessToken = hashParams.get("access_token") || urlParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || urlParams.get("refresh_token");

        if (accessToken) {
          // Paksa SDK Supabase untuk mengonfirmasi sesi menggunakan token dari link Resend
          const { data: setAuthData, error: setAuthError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (!setAuthError && setAuthData.session) {
            setCurrentStep("form");
            return;
          }
        }

        // 3. Fallback: Periksa apakah session global sudah otomatis terbentuk oleh SDK
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setCurrentStep("form");
        } else {
          // Beri kelonggaran waktu 4 detik sebelum menyatakan link kadaluarsa
          const timer = setTimeout(() => {
            setCurrentStep((prev) => (prev === "loading" ? "invalid" : prev));
          }, 4000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Error memverifikasi sesi recovery:", err);
        setCurrentStep("invalid");
      }
    };

    checkInitialSession();

    // Listen ke event perubahan state auth secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setCurrentStep("form");
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Password dan konfirmasi tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    // Validasi kompleksitas password (wajib huruf besar dan angka)
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("Password harus mengandung huruf besar dan angka");
      return;
    }

    setIsLoading(true);

    try {
      // Eksekusi pembaruan password ke server Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password berhasil diperbarui");
      
      // Bersihkan session recovery lama agar tidak bisa dipakai ulang
      await supabase.auth.signOut();
      setCurrentStep("success");

      // Redirect otomatis ke halaman login setelah 2.5 detik
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error("Gagal memperbarui password", {
        description:
          err instanceof Error ? err.message : "Silakan coba beberapa saat lagi",
      });
    } finally {
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
            {currentStep === "form"
              ? "Silakan tentukan password baru Anda"
              : "Keamanan akun adalah prioritas kami"}
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {currentStep === "loading" && "Memverifikasi Link..."}
              {currentStep === "form" && "Password Baru"}
              {currentStep === "success" && "Berhasil!"}
              {currentStep === "invalid" && "Link Tidak Valid"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* STEP: LOADING */}
            {currentStep === "loading" && (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4" />
                <p className="text-sm text-gray-500">Menyiapkan enkripsi...</p>
              </div>
            )}

            {/* STEP: FORM INPUT */}
            {currentStep === "form" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
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
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 h-11 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {confirmPassword && (
                    <p
                      className={`text-xs ${
                        newPassword === confirmPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {newPassword === confirmPassword
                        ? "✓ Password cocok"
                        : "Password tidak cocok"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Menyimpan..." : "Update Password"}
                </Button>
              </form>
            )}

            {/* STEP: SUCCESS */}
            {currentStep === "success" && (
              <div className="text-center space-y-6 py-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <p className="text-gray-600">
                  Password Anda telah diperbarui. Silakan masuk kembali.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-green-600"
                >
                  Login Sekarang
                </Button>
              </div>
            )}

            {/* STEP: INVALID/EXPIRED */}
            {currentStep === "invalid" && (
              <div className="text-center space-y-4 py-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Link reset password sudah kadaluarsa atau tidak valid.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full bg-green-600"
                >
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