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

export function Register() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (selectedRole === 'pelanggan' && !formData.address) {
      toast.error('Alamat utama wajib diisi untuk pelanggan');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'admin_cabang' && !selectedCabangId) {
      toast.error('Pilih cabang terlebih dahulu');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    let authUserId: string | null = null;

    try {
      // 1. Cek email sudah ada di tabel users
      const { data: existingUser } = await supabase
      .from('users')
      .select('id, nama_user')
      .or(`email.eq.${formData.email},nama_user.eq.${formData.username}`)
      .maybeSingle();

    if (existingUser) {
      const errorMsg = existingUser.nama_user === formData.username 
        ? 'Username sudah digunakan' 
        : 'Email sudah terdaftar';
      toast.error(errorMsg);
      setIsLoading(false);
      return;
      }

      // 2. Registrasi Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            username: formData.username, // Opsional: simpan di auth metadata
            role: selectedRole,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Gagal membuat akun');

      authUserId = authData.user.id;

      // 3. Insert ke tabel users
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert([{
          auth_id: authUserId,
          nama_lengkap: formData.name,
          nama_user: formData.username, // Map ke kolom nama_user di database
          email: formData.email,
          no_telepon: formData.phone,
          peran: selectedRole,
          cabang_id: selectedRole === 'admin_cabang' ? Number(selectedCabangId) : null,
          is_active: true,
        }])
        .select()
        .single();

      if (userError) throw userError;

      // 4. Jika admin_cabang: insert ke tabel admin_cabang
      if (selectedRole === 'admin_cabang') {
        const { error: adminCabangError } = await supabase
          .from('admin_cabang')
          .insert([{
            user_id: userRecord.id,
            cabang_id: Number(selectedCabangId),
            is_active: true,
          }]);

        if (adminCabangError) throw adminCabangError;
      }

      // 5. Jika pelanggan: insert alamat utama
      if (selectedRole === 'pelanggan' && formData.address) {
        const { error: addressError } = await supabase
          .from('alamat_pelanggan')
          .insert([{
            user_id: userRecord.id,
            nama_penerima: formData.name,
            no_telepon: formData.phone,
            alamat_lengkap: formData.address,
            is_utama: true,
          }]);

        if (addressError) throw addressError;
      }

      // 6. Logout agar tidak auto-login setelah register
      await supabase.auth.signOut();

      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login', { state: { registeredEmail: formData.email } });

    } catch (error: any) {
      console.error('Register error:', error);

      if (authUserId) {
        await supabase.auth.signOut();
      }

      if (error.code === '23505') {
        toast.error('Email sudah terdaftar, gunakan email lain');
      } else if (error.message?.includes('already registered')) {
        toast.error('Email sudah terdaftar, gunakan email lain');
      } else {
        toast.error(error.message || 'Terjadi kesalahan saat registrasi');
      }
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
          <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">Daftar Akun</CardTitle>
            <CardDescription>
              {selectedRole === 'admin_cabang'
                ? 'Daftarkan akun admin untuk mengelola cabang'
                : 'Daftarkan alamat utama Anda untuk kemudahan pengiriman'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">

              <div className="space-y-1">
                <Label>Daftar Sebagai</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: any) => {
                    setSelectedRole(value);
                    setSelectedCabangId('');
                  }}
                >
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
                  <Label className="text-green-700 font-bold flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    Pilih Cabang *
                  </Label>
                  {cabangLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat daftar cabang...
                    </div>
                  ) : cabangList.length === 0 ? (
                    <div className="text-sm text-red-500 py-2">
                      Tidak ada cabang tersedia
                    </div>
                  ) : (
                    <Select value={selectedCabangId} onValueChange={setSelectedCabangId}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Pilih cabang yang dikelola..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cabangList.map((cabang) => (
                          <SelectItem key={cabang.id} value={String(cabang.id)}>
                            {cabang.nama_cabang}
                          </SelectItem>
                        ))}
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

              {/* Letakkan di dalam form, mungkin di bawah Nama Lengkap */}
              <div className="space-y-1">
                <Label htmlFor="username">Username *</Label>
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="Contoh: yunami"
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>

              {selectedRole === 'pelanggan' && (
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-green-700 font-bold">
                    Alamat Utama (Wajib) *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Masukkan alamat pengiriman utama Anda..."
                      className="pl-10 min-h-[80px]"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
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

              <Button
                type="submit"
                className="w-full h-11 bg-green-600 hover:bg-green-700 mt-4"
                disabled={isLoading}
              >
                {isLoading
                  ? <Loader2 className="animate-spin h-4 w-4" />
                  : selectedRole === 'admin_cabang'
                    ? 'Daftar sebagai Admin Cabang'
                    : 'Daftar & Simpan Alamat'
                }
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-gray-600">Sudah punya akun? </span>
                <Link to="/login" className="text-green-600 font-bold">Masuk</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}