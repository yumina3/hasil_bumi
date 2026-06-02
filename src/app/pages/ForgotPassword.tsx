 import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

type Step = "email" | "otp" | "password" | "success";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [serverOTP, setServerOTP] = useState(""); 
  const [userId, setUserId] = useState(""); // Menyimpan ID user kiriman dari backend
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Mohon masukkan email Anda");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/server/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error("Gagal mengirim kode OTP", {
          description: result.error || "Pastikan email Anda sudah terdaftar.",
        });
        return;
      }

      setServerOTP(result.displayOTP);
      setUserId(result.userId); // Ambil ID user dari server
      
      toast.success(`Kode OTP berhasil dikirim ke email ${email}`);
      setCurrentStep("otp");
    } catch (err) {
      toast.error("Gagal terhubung ke server backend port 8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (otpInput.trim() !== serverOTP.trim()) {
      toast.error("Kode OTP yang Anda masukkan salah atau kedaluwarsa!");
      setIsLoading(false);
      return;
    }

    toast.success("Verifikasi OTP Sukses! Silakan tentukan password baru.");
    setCurrentStep("password");
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Password dan konfirmasi tidak cocok");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("Password harus mengandung huruf besar dan angka");
      return;
    }

    setIsLoading(true);

    try {
      // Kirim userId langsung ke backend (Aman tanpa database user filtering)
      const response = await fetch("https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/server/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error("Gagal menyimpan password baru", {
          description: result.error || "Terjadi kendala hak akses sistem.",
        });
        return;
      }

      toast.success("Password Anda berhasil diperbarui!");
      setCurrentStep("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error("Gagal terhubung ke server pembaruan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        {currentStep === "email" && (
          <div className="mb-4">
            <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900" onClick={() => navigate("/login")}>
              <ArrowLeft className="h-4 w-4" /> Kembali ke Login
            </Button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
              <KeyRound className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600 text-sm">Sistem Otentikasi Digital Toko Hasil Bumi</p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {currentStep === "email" && "Verifikasi Email"}
              {currentStep === "otp" && "Masukkan Kode OTP"}
              {currentStep === "password" && "Buat Password Baru"}
              {currentStep === "success" && "Berhasil!"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* TAHAP 1: EMAIL */}
            {currentStep === "email" && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Terdaftar</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="nama@students.unnes.ac.id" className="pl-10 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Mengirim Kode..." : "Kirim Kode OTP"}
                </Button>
              </form>
            )}

            {/* TAHAP 2: OTP */}
            {currentStep === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-Digit Kode Keamanan (Angka)</Label>
                  <Input id="otp" type="text" placeholder="CONTOH: 123456" className="h-11 text-center font-bold text-xl tracking-widest" maxLength={6} value={otpInput} onChange={(e) => setOtpInput(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  Verifikasi OTP & Lanjutkan
                </Button>
              </form>
            )}

            {/* TAHAP 3: PASSWORD BARU */}
            {currentStep === "password" && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 h-11 pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 h-11" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan & Update Password"}
                </Button>
              </form>
            )}

            {/* TAHAP 4: SUCCESS */}
            {currentStep === "success" && (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <p className="text-gray-700 text-sm">Kata sandi berhasil diperbarui! Mengarahkan kembali ke login...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}