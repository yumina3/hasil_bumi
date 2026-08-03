import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, User, Loader2, MapPin, Phone, Mail, Shield, Search, Navigation, Map as MapIcon, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet icon
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Komponen marker untuk inline map
function InlineMapMarker({ position, onClickMap }: { position: L.LatLng | null, onClickMap: (latlng: L.LatLng) => void }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15);
  }, [position, map]);
  useMapEvents({
    click(e) { onClickMap(e.latlng); },
  });
  return position === null ? null : <Marker position={position} />;
}

export function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  
  const [profile, setProfile] = useState({
    nama_lengkap: '',
    no_telepon: '',
    foto_url: '',
  });

  const [alamatFields, setAlamatFields] = useState({
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    detail: '',
  });
  
  const [exactLocation, setExactLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const buildGeoQuery = useCallback(() => {
    const parts = [
      alamatFields.kelurahan,
      alamatFields.kecamatan,
      alamatFields.kota,
      alamatFields.provinsi,
    ].filter(Boolean);
    return parts.join(', ');
  }, [alamatFields]);

  const parseAddressToFields = (address: string) => {
    const parts = address.split(',').map(p => p.trim());
    const fields = { provinsi: '', kota: '', kecamatan: '', kelurahan: '', detail: '' };
    const detailParts: string[] = [];
    for (const part of parts) {
      if (part.startsWith('Kel. ') || part.startsWith('Kel.')) {
        fields.kelurahan = part.replace(/^Kel\.\s*/, '');
      } else if (part.startsWith('Kec. ') || part.startsWith('Kec.')) {
        fields.kecamatan = part.replace(/^Kec\.\s*/, '');
      } else {
        detailParts.push(part);
      }
    }
    if (detailParts.length >= 2) {
      fields.provinsi = detailParts.pop() || '';
      fields.kota = detailParts.pop() || '';
      fields.detail = detailParts.join(', ');
    } else if (detailParts.length === 1) {
      fields.kota = detailParts[0];
    }
    return fields;
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (userError) throw userError;
        
        if (userData) {
          setDbUserId(userData.id);
          
          let fetchedAlamat = '';
          
          if (user.role === 'admin_cabang' && user.cabang_id) {
            const { data: branchData } = await supabase
              .from('cabang')
              .select('alamat')
              .eq('id', user.cabang_id)
              .maybeSingle();
            
            if (branchData) {
              fetchedAlamat = branchData.alamat || '';
            }
          } else if (user.role === 'pelanggan') {
            const { data: addressData } = await supabase
              .from('alamat_pelanggan')
              .select('id, alamat_lengkap')
              .eq('user_id', userData.id)
              .eq('is_utama', true)
              .maybeSingle();
              
            if (addressData) {
              fetchedAlamat = addressData.alamat_lengkap || '';
              setAddressId(addressData.id);
            }
          }
          
          if (fetchedAlamat.includes('| [')) {
            const parts = fetchedAlamat.split('| [');
            fetchedAlamat = parts[0].trim();
            const coordsStr = parts[1].replace(']', '').split(',');
            if (coordsStr.length === 2) {
              setExactLocation({ lat: parseFloat(coordsStr[0]), lng: parseFloat(coordsStr[1]) });
            }
          }

          setProfile({
            nama_lengkap: userData.nama_lengkap || '',
            no_telepon: userData.no_telepon || '',
            foto_url: userData.foto_profil || userData.foto_url || userData.avatar_url || '',
          });
          
          if (fetchedAlamat) {
            setAlamatFields(parseAddressToFields(fetchedAlamat));
          }
        }
      } catch (err: any) {
        toast.error('Gagal mengambil data profil: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAlamatFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlamatFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (!isEditing || !alamatFields.kota) return;

    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    geocodeTimerRef.current = setTimeout(async () => {
      const query = buildGeoQuery();
      if (!query) return;
      setIsSearchingMap(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id`);
        const data = await res.json();
        if (data && data.length > 0) {
          setExactLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (err) {
        console.error('Gagal geocoding otomatis:', err);
      } finally {
        setIsSearchingMap(false);
      }
    }, 800);

    return () => { if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current); };
  }, [alamatFields.kota, alamatFields.kecamatan, alamatFields.kelurahan, isEditing, buildGeoQuery]);

  const handleGeocodeAddress = async () => {
    const query = buildGeoQuery();
    if (!query) {
      toast.error('Mohon isi minimal Kota/Kabupaten terlebih dahulu');
      return;
    }
    
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}&countrycodes=id`);
      const data = await res.json();
      if (data && data.length > 0) {
        setExactLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        toast.success('Peta diarahkan ke alamat Anda.');
      } else {
        toast.error('Lokasi tidak ditemukan. Periksa kembali isian Kota/Kecamatan Anda.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      toast.error('Gagal menghitung jarak dari alamat. Silakan gunakan tombol Deteksi GPS.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung deteksi GPS.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setExactLocation({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            setAlamatFields({
              provinsi: addr.state || '',
              kota: addr.city || addr.county || addr.town || '',
              kecamatan: addr.suburb || addr.city_district || '',
              kelurahan: addr.village || addr.neighbourhood || '',
              detail: [addr.road, addr.house_number].filter(Boolean).join(' '),
            });
            toast.success('Alamat otomatis terisi dari lokasi GPS!');
          } else {
            toast.error('Alamat tidak ditemukan untuk lokasi ini.');
          }
        } catch (err) {
          console.error(err);
          toast.error('Gagal melacak alamat dari GPS Anda.');
        } finally {
          setIsDetectingGps(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error('Gagal mendapatkan lokasi. Pastikan izin GPS (Lokasi) diberikan.');
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }
    
    setIsUploadingFoto(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `profil/${user?.id}-${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('foto-produk')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('foto-produk')
        .getPublicUrl(fileName);
        
      setProfile(prev => ({ ...prev, foto_url: urlData.publicUrl }));
      toast.success('Foto berhasil diunggah. Jangan lupa klik Simpan Perubahan!');
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mengunggah foto: ' + err.message);
    } finally {
      setIsUploadingFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dbUserId) return;
    
    setSaving(true);
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({
          nama_lengkap: profile.nama_lengkap,
          no_telepon: profile.no_telepon,
          ...(profile.foto_url ? { foto_profil: profile.foto_url } : {}) // Coba simpan ke kolom foto_profil
        })
        .eq('id', dbUserId);

      if (userError) {
        // Jika kolom foto_profil belum ada di database, kita coba update tanpa foto_url
        if (userError.code === 'PGRST204' || userError.message.includes('foto_profil')) {
          await supabase
            .from('users')
            .update({
              nama_lengkap: profile.nama_lengkap,
              no_telepon: profile.no_telepon,
            })
            .eq('id', dbUserId);
          toast.warning('Profil diperbarui, tetapi foto profil tidak dapat disimpan (kolom foto_profil belum ada di database).');
        } else {
          throw userError;
        }
      }
      
      let finalAlamat = buildFullAddress();
      if (exactLocation && finalAlamat) {
        finalAlamat = `${finalAlamat} | [${exactLocation.lat}, ${exactLocation.lng}]`;
      }
      
      if (user.role === 'admin_cabang' && user.cabang_id) {
        await supabase.from('cabang').update({
          alamat: finalAlamat
        }).eq('id', user.cabang_id);
      } else if (user.role === 'pelanggan') {
        if (addressId) {
          await supabase.from('alamat_pelanggan').update({
            alamat_lengkap: finalAlamat,
            nama_penerima: profile.nama_lengkap,
            no_telepon: profile.no_telepon,
          }).eq('id', addressId);
        } else if (finalAlamat !== '') {
          await supabase.from('alamat_pelanggan').insert([{
            user_id: dbUserId,
            alamat_lengkap: finalAlamat,
            nama_penerima: profile.nama_lengkap,
            no_telepon: profile.no_telepon,
            is_utama: true,
          }]);
        }
      }
      
      toast.success('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error('Gagal memperbarui profil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string | undefined) => {
    if (role === 'pelanggan') return 'bg-green-100 text-green-700 border-green-200';
    if (role === 'admin_cabang') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role === 'admin_pusat') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-green-600" />
      </div>
    );
  }

  const roleName = user?.role?.replace('_', ' ') || 'User';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 h-48 w-full relative">
        <div className="container mx-auto px-4 max-w-4xl pt-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/20 hover:text-white gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-20 relative z-10">
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Profile Info Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center p-6 md:p-8 bg-white border-b">
              <div className="relative group shrink-0 -mt-12 md:mt-0 mb-4 md:mb-0">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  {profile.foto_url ? (
                    <img src={profile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-green-700" />
                  )}
                </div>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingFoto}
                    className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-200 text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors z-10"
                    title="Ubah Foto Profil"
                  >
                    {isUploadingFoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFotoChange} 
                />
              </div>
              
              <div className="md:ml-6 flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.nama_lengkap || 'Pengguna'}</h1>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border shadow-sm flex items-center gap-1.5 ${getRoleColor(user?.role)}`}>
                  <Shield className="h-3 w-3" />
                  {roleName}
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700 rounded-xl shadow-sm">
                    Edit Profil
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50">
              {!isEditing ? (
                /* VIEW MODE */
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" /> Informasi Pribadi
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nama Lengkap</span>
                        <p className="text-gray-900 font-medium bg-white p-3 rounded-xl border border-gray-100 shadow-sm">{profile.nama_lengkap || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nomor WhatsApp</span>
                        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 font-medium">{profile.no_telepon || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Info */}
                  {user?.role !== 'admin_pusat' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" /> 
                        {user?.role === 'admin_cabang' ? 'Alamat Cabang' : 'Alamat Pengiriman'}
                      </h3>
                      
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Alamat Lengkap</span>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                          <p className="text-gray-900 leading-relaxed text-sm">
                            {buildFullAddress() || <span className="text-gray-400 italic">Belum ada alamat</span>}
                          </p>
                          
                          {exactLocation && (
                            <div className="h-32 rounded-lg overflow-hidden border border-gray-200">
                              <MapContainer 
                                center={[exactLocation.lat, exactLocation.lng]} 
                                zoom={15} 
                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                                dragging={false}
                                scrollWheelZoom={false}
                                zoomControl={false}
                              >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[exactLocation.lat, exactLocation.lng]} />
                              </MapContainer>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSave} className="animate-in fade-in duration-300">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Personal Info Edit */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" /> Edit Data Diri
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="nama_lengkap" className="text-sm font-bold text-gray-700">Nama Lengkap</Label>
                          <Input
                            id="nama_lengkap"
                            name="nama_lengkap"
                            value={profile.nama_lengkap}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            className="rounded-xl h-11"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="no_telepon" className="text-sm font-bold text-gray-700">Nomor WhatsApp / Telepon</Label>
                          <Input
                            id="no_telepon"
                            name="no_telepon"
                            value={profile.no_telepon}
                            onChange={handleChange}
                            placeholder="Contoh: 081234567890"
                            className="rounded-xl h-11"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Edit */}
                    {user?.role !== 'admin_pusat' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-600" />
                            {user?.role === 'admin_cabang' ? 'Alamat Cabang' : 'Alamat Pengiriman'}
                          </h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="provinsi" className="text-xs">Provinsi *</Label>
                              <Input id="provinsi" name="provinsi" placeholder="Contoh: Jawa Tengah" value={alamatFields.provinsi} onChange={handleAlamatFieldChange} className="rounded-xl" required />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="kota" className="text-xs">Kota / Kabupaten *</Label>
                              <Input id="kota" name="kota" placeholder="Contoh: Kota Semarang" value={alamatFields.kota} onChange={handleAlamatFieldChange} className="rounded-xl" required />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="kecamatan" className="text-xs">Kecamatan</Label>
                              <Input id="kecamatan" name="kecamatan" placeholder="Contoh: Tembalang" value={alamatFields.kecamatan} onChange={handleAlamatFieldChange} className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="kelurahan" className="text-xs">Kelurahan / Desa</Label>
                              <Input id="kelurahan" name="kelurahan" placeholder="Contoh: Bulusan" value={alamatFields.kelurahan} onChange={handleAlamatFieldChange} className="rounded-xl" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="detail" className="text-xs">Detail Alamat</Label>
                            <Textarea id="detail" name="detail" placeholder="Jalan, RT/RW, No. Rumah, Patokan..." className="min-h-[80px] text-sm rounded-xl" value={alamatFields.detail} onChange={handleAlamatFieldChange} />
                          </div>

                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" className="flex-1 rounded-lg" onClick={handleGeocodeAddress} disabled={isSearchingMap}>
                              {isSearchingMap ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Search className="h-3 w-3 mr-1" />}
                              Cari di Peta
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="flex-1 rounded-lg text-green-700 border-green-200 bg-green-50 hover:bg-green-100" onClick={handleDetectGps} disabled={isDetectingGps}>
                              {isDetectingGps ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Navigation className="h-3 w-3 mr-1" />}
                              Lacak GPS
                            </Button>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <MapIcon className="h-3.5 w-3.5" /> Konfirmasi Titik Lokasi
                            </Label>
                            <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative shadow-sm">
                              {isSearchingMap && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                                </div>
                              )}
                              <MapContainer 
                                center={exactLocation ? [exactLocation.lat, exactLocation.lng] : [-6.200000, 106.816666]} 
                                zoom={exactLocation ? 15 : 11} 
                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <InlineMapMarker 
                                  position={exactLocation ? new L.LatLng(exactLocation.lat, exactLocation.lng) : null} 
                                  onClickMap={(latlng) => setExactLocation({ lat: latlng.lat, lng: latlng.lng })} 
                                />
                              </MapContainer>
                            </div>
                            <p className="text-[11px] text-gray-500">Geser atau klik peta untuk mengoreksi lokasi pengiriman Anda.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 h-12 px-8 rounded-xl font-bold"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
