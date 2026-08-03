import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { MapPin, ArrowLeft, Loader2, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from "../../../utils/supabase/info";
import { registerAccount, activateAccount } from "../utils/api";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, onLocationSelect }: { position: {lat: number, lng: number} | null, onLocationSelect: (lat: number, lng: number, address: string) => void }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);

  useMapEvents({
    async click(e) {
      toast.info("Mengambil alamat dari titik...", { id: "geo-fetch" });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          onLocationSelect(e.latlng.lat, e.latlng.lng, data.display_name);
          toast.success("Alamat berhasil diambil!", { id: "geo-fetch" });
        } else {
          toast.dismiss("geo-fetch");
        }
      } catch (err) {
        console.error("Gagal mengambil alamat", err);
        toast.error("Gagal mendapatkan alamat dari titik ini.", { id: "geo-fetch" });
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

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
    password: '',
    confirmPassword: '',
  });

  // Alamat dipecah per-field agar geocoding lebih akurat
  const [alamatFields, setAlamatFields] = useState({
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    detail: '', // Nama jalan, RT/RW, No. Rumah, Patokan
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [mapPosition, setMapPosition] = useState<{lat: number, lng: number} | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gabungkan semua field alamat jadi satu string untuk disimpan ke backend
  const buildFullAddress = useCallback(() => {
    const parts = [
      alamatFields.detail,
      alamatFields.kelurahan ? `Kel. ${alamatFields.kelurahan}` : '',
      alamatFields.kecamatan ? `Kec. ${alamatFields.kecamatan}` : '',
      alamatFields.kota,
      alamatFields.provinsi,
    ].filter(Boolean);
    return parts.join(', ');
  }, [alamatFields]);

  // Bangun query geocoding dari field yang paling spesifik
  const buildGeoQuery = useCallback(() => {
    const parts = [
      alamatFields.kelurahan,
      alamatFields.kecamatan,
      alamatFields.kota,
      alamatFields.provinsi,
    ].filter(Boolean);
    return parts.join(', ');
  }, [alamatFields]);

  // Auto-search peta setiap kali field alamat yang relevan berubah (debounced)
  useEffect(() => {
    // Minimal harus ada kota untuk mulai geocoding
    if (!alamatFields.kota) return;

    if (geocodeTimerRef.current) {
      clearTimeout(geocodeTimerRef.current);
    }

    geocodeTimerRef.current = setTimeout(async () => {
      const query = buildGeoQuery();
      if (!query) return;

      setIsSearchingMap(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id`);
        const data = await res.json();
        if (data && data.length > 0) {
          setMapPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (err) {
        console.error("Gagal geocoding otomatis:", err);
      } finally {
        setIsSearchingMap(false);
      }
    }, 800); // Debounce 800ms agar tidak spam API

    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, [alamatFields.kota, alamatFields.kecamatan, alamatFields.kelurahan, buildGeoQuery]);

  // Manual search button
  const handleCariPeta = async () => {
    const query = buildGeoQuery();
    if (!query) {
      toast.error("Silakan isi minimal Kota/Kabupaten terlebih dahulu");
      return;
    }
    setIsSearchingMap(true);
    toast.info("Mencari lokasi di peta...", { id: "geo-search" });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        toast.success("Lokasi ditemukan di peta!", { id: "geo-search" });
      } else {
        toast.error("Lokasi tidak ditemukan. Periksa kembali isian alamat Anda.", { id: "geo-search" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mencari lokasi", { id: "geo-search" });
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleAlamatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlamatFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // PROSES KLIK SUBMIT DAFTAR AWAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullAddress = buildFullAddress();

    if (isLoading) return;
    if (!alamatFields.kota) {
      return toast.error('Minimal isi Kota/Kabupaten pada alamat');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Password tidak cocok');
    }
    if (formData.password.length < 6) {
      return toast.error('Password minimal 6 karakter');
    }

    setIsLoading(true);

    try {
      const result = await registerAccount({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        username: formData.username,
        phone: formData.phone,
        address: fullAddress,
        role: "pelanggan",
        cabangId: null
      });

      // Simpan data OTP dan User ID rahasia ke state komponen
      setServerOTP(result.displayOTP);
      setRegisteredUserId(result.userId);
      
      toast.success('Registrasi berhasil!', {
        description: result.displayOTP 
          ? `[Mode Demo Portofolio] Kode OTP Anda: ${result.displayOTP}` 
          : 'Kode verifikasi telah dikirim ke email Anda.'
      });
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
      // Tembak endpoint aktivasi permanen di backend via API layer
      await activateAccount(registeredUserId);

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

        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-28 w-28 shrink-0 overflow-hidden flex items-center justify-center">
              <img src="/logo_hasil_bumi.png" alt="Logo Hasil Bumi" className="h-full w-full object-contain transform scale-[2.5] drop-shadow-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Hasil Bumi</h1>
          <p className="text-sm text-gray-600">Platform Digital Pertanian & Peternakan</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">
              {step === "form" ? "Daftar Akun" : "Verifikasi OTP Akun"}
            </CardTitle>
            <CardDescription>
              {step === "form" 
                ? "Daftarkan akun pelanggan untuk kemudahan berbelanja dan pengiriman"
                : `Masukkan 6-digit kode verifikasi angka yang dikirim ke email: ${formData.email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* VIEW STEP 1: FORMULIR ISIAN DATA */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input id="name" name="name" placeholder="Masukkan nama lengkap" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">No. WhatsApp</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="08..." />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" placeholder="username anda..." value={formData.username} onChange={handleChange} required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="nama@hasilbumi.com" value={formData.email} onChange={handleChange} required />
                </div>

                {/* === ALAMAT TERSTRUKTUR === */}
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50/50 p-3">
                  <Label className="text-green-700 font-bold flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> Alamat Utama
                  </Label>
                  <p className="text-xs text-gray-500 -mt-1">Isi dari yang paling besar ke paling kecil. Peta otomatis menyesuaikan.</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="provinsi" className="text-xs">Provinsi *</Label>
                      <Input id="provinsi" name="provinsi" placeholder="Contoh: Jawa Tengah" value={alamatFields.provinsi} onChange={handleAlamatChange} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="kota" className="text-xs">Kota / Kabupaten *</Label>
                      <Input id="kota" name="kota" placeholder="Contoh: Kota Semarang" value={alamatFields.kota} onChange={handleAlamatChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="kecamatan" className="text-xs">Kecamatan</Label>
                      <Input id="kecamatan" name="kecamatan" placeholder="Contoh: Tembalang" value={alamatFields.kecamatan} onChange={handleAlamatChange} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="kelurahan" className="text-xs">Kelurahan / Desa</Label>
                      <Input id="kelurahan" name="kelurahan" placeholder="Contoh: Bulusan" value={alamatFields.kelurahan} onChange={handleAlamatChange} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="detail" className="text-xs">Detail Alamat (Jalan, RT/RW, No. Rumah, Patokan)</Label>
                    <Textarea id="detail" name="detail" placeholder="Contoh: Jl. Taman Siswa No. 12, RT 03/RW 05, depan mushola..." className="min-h-[60px] text-sm" value={alamatFields.detail} onChange={handleAlamatChange} />
                  </div>

                  <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" onClick={handleCariPeta} disabled={isSearchingMap}>
                    {isSearchingMap ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                    Cari di Peta
                  </Button>
                </div>

                {/* === PETA (OPSIONAL) === */}
                <div className="space-y-1">
                  <Label className="text-green-700 font-bold">Konfirmasi Titik Lokasi Peta (Opsional)</Label>
                  <div className="h-48 w-full rounded-xl overflow-hidden border z-0 relative">
                    {isSearchingMap && (
                      <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                      </div>
                    )}
                    <MapContainer center={[-6.200000, 106.816666]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker 
                        position={mapPosition} 
                        onLocationSelect={(lat, lng, _addr) => {
                          setMapPosition({lat, lng});
                          // Klik di peta hanya memperbarui titik, tidak mengubah isian alamat
                        }} 
                      />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-gray-500">Peta akan otomatis menunjuk lokasi dari alamat di atas. Klik peta untuk koreksi titik jika perlu.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Konfirmasi *</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Ketik ulang password" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Daftar Sekarang'}
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
                {serverOTP && (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-center text-sm mb-4">
                    <p className="font-bold text-amber-800">Info Mode Demo / Portofolio:</p>
                    <p className="text-amber-700 text-xs mt-1">
                      Karena proyek ini menggunakan Supabase Free Tier (tanpa SMTP berbayar), kode verifikasi Anda langsung dimunculkan oleh server:
                    </p>
                    <div className="my-2 py-1 bg-amber-100 rounded text-xl font-extrabold tracking-widest text-amber-900 border border-amber-400">
                      {serverOTP}
                    </div>
                    <p className="text-[11px] text-amber-600 italic">Silakan masukkan kode di atas untuk melanjutkan pendaftaran.</p>
                  </div>
                )}
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