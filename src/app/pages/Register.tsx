import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { MapPin, ArrowLeft, Loader2, Building } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { supabase } from "../../../utils/supabase/info";

type RegisterStep = "form" | "otp";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegisterStep>("form");
  const [otpInput, setOtpInput] = useState("");
  const [serverOTP, setServerOTP] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'pelanggan' | 'admin_cabang' | 'admin_pusat'>('pelanggan');
  const [selectedCabangId, setSelectedCabangId] = useState<string>('');
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [cabangLoading, setCabangLoading] = useState(false);

  useEffect(() => {
    const fetchCabang = async () => {
      setCabangLoading(true);
      try {
        const { data, error } = await supabase
          .from('cabang')
          .select('id, nama_cabang')
          .order('id');
        if (error) throw error;
        if (data) setCabangList(data);
      } catch (err: any) {
        console.error("fetchCabang error:", err.message);
        toast.error("Gagal memuat daftar cabang");
      } finally {
        setCabangLoading(false);
      }
    };
    fetchCabang();
  }, []);

  // PROSES KLIK SUBMIT DAFTAR AWAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    if (selectedRole === 'pelanggan' && !formData.address) {
      return toast.error('Alamat utama wajib diisi untuk pelanggan');
    }
    if (selectedRole === 'admin_cabang' && !selectedCabangId) {
      return toast.error('Pilih cabang terlebih dahulu');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Password tidak cocok');
    }
    if (formData.password.length < 6) {
      return toast.error('Password minimal 6 karakter');
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/server/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          username: formData.username,
          phone: formData.phone,
          address: formData.address,
          role: selectedRole,
          cabangId: selectedCabangId ? Number(selectedCabangId) : null
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error("Gagal mendaftar", { description: result.error || "Terjadi kendala sistem." });
        return;
      }

      // Simpan data OTP dan User ID rahasia ke state komponen
      setServerOTP(result.displayOTP);
      setRegisteredUserId(result.userId);
      
      toast.success('Kode verifikasi OTP akun baru telah dikirim ke email Anda!');
      setStep("otp"); // Alihkan view tampilan ke input OTP instan

    } catch (error: any) {
      toast.error('Gagal terhubung ke server registrasi backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // PROSES VERIFIKASI OTP REGISTRASI
  const handleVerifyRegisterOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (otpInput.trim() !== serverOTP.trim()) {
      toast.error("Kode OTP pendaftaran salah atau kedaluwarsa!");
      setIsLoading(false);
      return;
    }

    try {
      // Tembak endpoint aktivasi permanen di backend
      const response = await fetch("https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/server/activate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: registeredUserId })
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);

      toast.success('Akun Anda Berhasil Diaktifkan! Silakan lakukan login.');
      navigate('/login', { state: { registeredEmail: formData.email } });

    } catch (err: any) {
      toast.error('Gagal mengaktifkan konfirmasi akun: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button variant="ghost" className="gap-2" onClick={() => step === "otp" ? setStep("form") : navigate('/')}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">
              {step === "form" ? "Daftar Akun" : "Verifikasi OTP Akun"}
            </CardTitle>
            <CardDescription>
              {step === "form" 
                ? (selectedRole === 'admin_cabang' ? 'Daftarkan akun admin untuk mengelola cabang' : 'Daftarkan alamat utama Anda untuk kemudahan pengiriman')
                : `Masukkan 6-digit kode verifikasi angka yang dikirim ke email: ${formData.email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* VIEW STEP 1: FORMULIR ISIAN DATA */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label>Daftar Sebagai</Label>
                  <Select value={selectedRole} onValueChange={(value: any) => { setSelectedRole(value); setSelectedCabangId(''); }}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pelanggan">Pelanggan / Pembeli</SelectItem>
                      <SelectItem value="admin_cabang">Admin Cabang</SelectItem>
                      <SelectItem value="admin_pusat">Admin Pusat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole === 'admin_cabang' && (
                  <div className="space-y-1">
                    <Label className="text-green-700 font-bold flex items-center gap-1"><Building className="h-4 w-4" /> Pilih Cabang *</Label>
                    {cabangLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
                    ) : (
                      <Select value={selectedCabangId} onValueChange={setSelectedCabangId}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Pilih cabang..." /></SelectTrigger>
                        <SelectContent>
                          {cabangList.map((cabang) => (<SelectItem key={cabang.id} value={String(cabang.id)}>{cabang.nama_cabang}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">No. WhatsApp</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="08..." />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" placeholder="yunami" value={formData.username} onChange={handleChange} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                {selectedRole === 'pelanggan' && (
                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-green-700 font-bold">Alamat Utama *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea id="address" name="address" className="pl-10 min-h-[80px]" value={formData.address} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Konfirmasi *</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (selectedRole === 'admin_cabang' ? 'Daftar Admin Cabang' : 'Daftar & Simpan')}
                </Button>

                <div className="text-center text-sm pt-2">
                  <span className="text-gray-600">Sudah punya akun? </span>
                  <Link to="/login" className="text-green-600 font-bold">Masuk</Link>
                </div>
              </form>
            )}

            {/* VIEW STEP 2: INPUT KODE OTP PENDAFTARAN */}
            {step === "otp" && (
              <form onSubmit={handleVerifyRegisterOTP} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="registerOtp">6-Digit Angka Kode OTP</Label>
                  <Input 
                    id="registerOtp" 
                    type="text" 
                    placeholder="CONTOH: 582914" 
                    className="h-12 text-center font-bold text-2xl tracking-widest" 
                    maxLength={6} 
                    value={otpInput} 
                    onChange={(e) => setOtpInput(e.target.value)} 
                    required 
                  />
                  <p className="text-xs text-center text-gray-500">Silakan cek inbox email UNNES atau folder spam Anda.</p>
                </div>
                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Verifikasi & Aktifkan Akun"}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}