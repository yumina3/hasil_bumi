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

    // 1. Validasi Awal
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
      // 2. Registrasi Supabase Auth
      // Biarkan Supabase Auth memvalidasi email unik secara native
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            username: formData.username,
            role: selectedRole,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Gagal membuat akun autentikasi');

      const authUserId = authData.user.id;

      // 3. Insert/Upsert ke tabel public.users
      // Menggunakan upsert dengan onConflict email untuk menghindari error 23505
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .upsert({
          auth_id: authUserId,
          nama_lengkap: formData.name,
          nama_user: formData.username,
          email: formData.email,
          no_telepon: formData.phone,
          peran: selectedRole,
          cabang_id: selectedRole === 'admin_cabang' ? Number(selectedCabangId) : null,
          is_active: true,
        }, { onConflict: 'email' }) 
        .select()
        .single();

      if (userError) throw userError;

      // 4. Logika tambahan berdasarkan role
      if (selectedRole === 'admin_cabang') {
        const { error: adminCabangError } = await supabase
          .from('admin_cabang')
          .upsert([{
            user_id: userRecord.id,
            cabang_id: Number(selectedCabangId),
            is_active: true,
          }], { onConflict: 'user_id' });
        if (adminCabangError) throw adminCabangError;
      }

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
        // Tidak menggunakan upsert di sini agar user bisa punya banyak alamat jika gagal di percobaan pertama
        if (addressError && addressError.code !== '23505') throw addressError;
      }

      // 5. Selesai
      await supabase.auth.signOut();
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login', { state: { registeredEmail: formData.email } });

    } catch (error: any) {
      console.error('Register error:', error);
      
      // Pesan error yang lebih user-friendly
      if (error.message?.includes('already registered')) {
        toast.error('Email ini sudah terdaftar di sistem.');
      } else if (error.code === '23505') {
        toast.error('Username atau data sudah digunakan.');
      } else {
        toast.error(error.message || 'Terjadi kesalahan sistem.');
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
            {/* Menggunakan onSubmit standar */}
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
                    <Building className="h-4 w-4" /> Pilih Cabang *
                  </Label>
                  {cabangLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                    </div>
                  ) : (
                    <Select value={selectedCabangId} onValueChange={setSelectedCabangId}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Pilih cabang..." />
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
                    <Textarea
                      id="address"
                      name="address"
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
                type="submit" // Kembali ke type="submit"
                className="w-full h-11 bg-green-600 hover:bg-green-700 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  selectedRole === 'admin_cabang' ? 'Daftar Admin Cabang' : 'Daftar & Simpan'
                )}
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