import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Store, Truck, Loader2, ShoppingBag, AlertTriangle, MapPin, Map as MapIcon, Search } from 'lucide-react';
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
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '../../../utils/supabase/info';

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position} />;
}

function UpdateMapSize() {
  const map = useMapEvents({});
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Komponen marker untuk inline map di form checkout
function InlineMapMarker({ position, onClickMap }: { position: L.LatLng | null, onClickMap: (latlng: L.LatLng) => void }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      onClickMap(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    getTotalPrice,
    clearCart,
    deliveryMethod,
    setDeliveryMethod,
    selectedBranchId,
    setSelectedBranch,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [branchList, setBranchList] = useState<any[]>([]);

  const [dynamicBranchCoords, setDynamicBranchCoords] = useState<Record<number, {lat: number; lng: number}>>({});

  const getBranchCoord = async (branchId: number): Promise<{lat: number; lng: number} | null> => {
    // 1. Cek cache terlebih dahulu
    if (dynamicBranchCoords[branchId]) return dynamicBranchCoords[branchId];
    
    const branch = branchList.find(b => b.id === branchId);
    if (!branch) return null;

    // 2. Cek koordinat di field alamat (format: "alamat | [lat, lng]")
    const alamat = branch.alamat || '';
    if (alamat.includes('| [')) {
      const coordsStr = alamat.split('| [')[1]?.replace(']', '').split(',');
      if (coordsStr && coordsStr.length === 2) {
        const lat = parseFloat(coordsStr[0].trim());
        const lng = parseFloat(coordsStr[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          const coord = { lat, lng };
          setDynamicBranchCoords(prev => ({ ...prev, [branchId]: coord }));
          return coord;
        }
      }
    }

    // 3. Geocoding alamat cabang via Nominatim (tanpa fallback hardcoded)
    const queryText = alamat.split('| [')[0].trim();
    if (queryText) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryText)}&countrycodes=id`);
        const data = await res.json();
        if (data && data.length > 0) {
          const coord = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setDynamicBranchCoords(prev => ({ ...prev, [branchId]: coord }));
          return coord;
        }
      } catch (err) {
        console.warn('Failed to geocode branch address:', err);
      }
    }

    // 4. Tidak ada fallback hardcoded — lebih baik null daripada koordinat yang salah
    console.warn(`Tidak bisa menentukan koordinat cabang ID ${branchId}. Pastikan alamat cabang memiliki format "alamat | [lat, lng]".`);
    toast.warning('Koordinat cabang belum tersedia. Silakan gunakan tombol "Lacak Lokasi Saya (GPS)" untuk menghitung jarak.');
    return null;
  };

  // Pre-resolve koordinat cabang saat branch dipilih agar siap dipakai
  useEffect(() => {
    if (selectedBranchId && branchList.length > 0 && !dynamicBranchCoords[selectedBranchId]) {
      getBranchCoord(selectedBranchId);
    }
  }, [selectedBranchId, branchList]);

  const [deliveryCountToday, setDeliveryCountToday] = useState<number>(0);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);
  const DELIVERY_QUOTA = 100;

  const [showClosedWarning, setShowClosedWarning] = useState(false);
  
  // Map Modal States
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);
  const [isConfirmingMap, setIsConfirmingMap] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    catatan: '',
    paymentMethod: 'cod',
  });

  // Alamat pengiriman dipecah per-field agar geocoding lebih akurat
  const [alamatFields, setAlamatFields] = useState({
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    detail: '',
  });
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);
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

  const handleAlamatFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlamatFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Auto-search peta setiap kali field alamat yang relevan berubah (debounced)
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !alamatFields.kota) return;

    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    geocodeTimerRef.current = setTimeout(async () => {
      const query = buildGeoQuery();
      if (!query) return;
      setIsSearchingMap(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id`);
        const data = await res.json();
        if (data && data.length > 0) {
          setMapPosition(new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon)));
        }
      } catch (err) {
        console.error('Gagal geocoding otomatis:', err);
      } finally {
        setIsSearchingMap(false);
      }
    }, 800);

    return () => { if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current); };
  }, [alamatFields.kota, alamatFields.kecamatan, alamatFields.kelurahan, deliveryMethod, buildGeoQuery]);

  // Fetch cabang 
  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('cabang').select('*');
      if (data) setBranchList(data);
    };
    fetchBranches();
  }, []);

  //  Cek kuota delivery 
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !selectedBranchId) {
      setDeliveryCountToday(0);
      return;
    }
    const checkQuota = async () => {
      setIsCheckingQuota(true);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const { count, error } = await supabase
        .from('pesanan')
        .select('id', { count: 'exact', head: true })
        .eq('cabang_id', selectedBranchId)
        .eq('delivery_method', 'delivery')
        .neq('status_pesanan', 'dibatalkan')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
      if (!error) setDeliveryCountToday(count ?? 0);
      setIsCheckingQuota(false);
    };
    checkQuota();
  }, [deliveryMethod, selectedBranchId]);

  const isDeliveryFull = deliveryMethod === 'delivery' && deliveryCountToday >= DELIVERY_QUOTA;

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const totalPrice = getTotalPrice();
  const finalPrice = totalPrice + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeliveryMethodChange = (value: 'pick_up' | 'delivery') => {
    setDeliveryMethod(value);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isDetectingGps) {
      intervalId = setInterval(() => {
        setLoadingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
    }
    return () => clearInterval(intervalId);
  }, [isDetectingGps]);

  // ─── Fetch User Data for Auto-fill ───────────────────────────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, nama_lengkap, no_telepon')
            .eq('auth_id', user.id)
            .single();

          if (userData && !userError) {
            let fetchedAddress = '';
            
            const { data: addressData } = await supabase
              .from('alamat_pelanggan')
              .select('alamat_lengkap')
              .eq('user_id', userData.id)
              .eq('is_utama', true)
              .maybeSingle();

            if (addressData) {
              fetchedAddress = addressData.alamat_lengkap || '';
              if (fetchedAddress.includes('| [')) {
                const parts = fetchedAddress.split('| [');
                fetchedAddress = parts[0].trim();
                const coordsStr = parts[1].replace(']', '').split(',');
                if (coordsStr.length === 2) {
                  setMapPosition(new L.LatLng(parseFloat(coordsStr[0]), parseFloat(coordsStr[1])));
                }
              }
            }

            setFormData(prev => ({
              ...prev,
              name: userData.nama_lengkap || prev.name,
              phone: userData.no_telepon || prev.phone,
              address: fetchedAddress || prev.address,
            }));

            // Coba parse alamat ke field terstruktur
            if (fetchedAddress) {
              const parts = fetchedAddress.split(',').map((p: string) => p.trim());
              // Coba deteksi pola: detail, Kel. X, Kec. Y, Kota, Provinsi
              const newFields: any = { provinsi: '', kota: '', kecamatan: '', kelurahan: '', detail: '' };
              const detailParts: string[] = [];
              for (const part of parts) {
                if (part.startsWith('Kel. ') || part.startsWith('Kel.')) {
                  newFields.kelurahan = part.replace(/^Kel\.\s*/, '');
                } else if (part.startsWith('Kec. ') || part.startsWith('Kec.')) {
                  newFields.kecamatan = part.replace(/^Kec\.\s*/, '');
                } else {
                  detailParts.push(part);
                }
              }
              // Dari sisa, ambil 2 terakhir sebagai kota dan provinsi
              if (detailParts.length >= 2) {
                newFields.provinsi = detailParts.pop() || '';
                newFields.kota = detailParts.pop() || '';
                newFields.detail = detailParts.join(', ');
              } else if (detailParts.length === 1) {
                newFields.kota = detailParts[0];
              }
              setAlamatFields(newFields);
              setAddressAutoFilled(true);
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (deliveryMethod === 'pick_up' || distanceKm < 1) {
      setDeliveryFee(0);
    } else {
      // Tarif Rp 3.000 per KM (untuk jarak 1 km ke atas)
      const km = Math.ceil(distanceKm);
      setDeliveryFee(km * 3000);
    }
  }, [deliveryMethod, distanceKm]);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung deteksi GPS');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: userLat, longitude: userLng } = pos.coords;
        // Selalu set posisi peta dari GPS
        setMapPosition(new L.LatLng(userLat, userLng));
        
        const branchCoord = selectedBranchId ? await getBranchCoord(selectedBranchId) : null;
        if (!branchCoord) {
          toast.warning('Lokasi GPS terdeteksi, tetapi koordinat cabang belum tersedia. Jarak diatur ke estimasi 1 km. Anda bisa klik peta untuk koreksi.');
          setDistanceKm(1);
          setIsDetectingGps(false);
          return;
        }

        // Rumus Haversine (menghitung jarak titik bumi)
        const toRad = (val: number) => (val * Math.PI) / 180;
        const R = 6371; // Jari-jari bumi dalam KM
        const dLat = toRad(userLat - branchCoord.lat);
        const dLng = toRad(userLng - branchCoord.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(branchCoord.lat)) * Math.cos(toRad(userLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        // Bulatkan ke 1 desimal (minimal 0.1 km)
        const calculatedKm = Math.max(0.1, Math.round(dist * 10) / 10);
        setDistanceKm(calculatedKm);
        toast.success(`Jarak ke cabang berhasil dihitung: ${calculatedKm} km!`);
        setIsDetectingGps(false);

        // Reverse Geocoding (GPS ke Alamat Teks) untuk mengisi spesifikasi lokasi penerima
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setFormData((prev) => ({
                ...prev,
                address: data.display_name,
              }));
              // Parse ke field terstruktur dari addressdetails
              if (data.address) {
                const addr = data.address;
                setAlamatFields({
                  provinsi: addr.state || '',
                  kota: addr.city || addr.county || addr.town || '',
                  kecamatan: addr.suburb || addr.city_district || '',
                  kelurahan: addr.village || addr.neighbourhood || '',
                  detail: [addr.road, addr.house_number].filter(Boolean).join(' '),
                });
              }
              toast.success('Alamat penerima otomatis terisi dari lokasi GPS!');
            }
          })
          .catch((err) => console.warn('Reverse geocoding error:', err));
      },
      (err) => {
        console.warn('GPS Error:', err);
        toast.error('Gagal membaca GPS. Memakai estimasi jarak standar 1 km. Pastikan izin lokasi browser aktif.');
        setDistanceKm(1);
        setIsDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleGeocodeAddress = async () => {
    const query = buildGeoQuery();
    if (!query) {
      toast.error('Mohon isi minimal Kota/Kabupaten terlebih dahulu');
      return;
    }
    
    setIsGeocoding(true);
    
    const branchCoord = selectedBranchId ? await getBranchCoord(selectedBranchId) : null;
    if (!branchCoord) {
      toast.error('Silakan pilih kantor cabang terlebih dahulu');
      setIsGeocoding(false);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}&countrycodes=id`);
      const data = await res.json();
      if (data && data.length > 0) {
        const userLat = parseFloat(data[0].lat);
        const userLng = parseFloat(data[0].lon);

        setMapPosition(new L.LatLng(userLat, userLng));

        // Rumus Haversine
        const toRad = (val: number) => (val * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(userLat - branchCoord.lat);
        const dLng = toRad(userLng - branchCoord.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(branchCoord.lat)) * Math.cos(toRad(userLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        const calculatedKm = Math.max(0.1, Math.round(dist * 10) / 10);
        setDistanceKm(calculatedKm);
        toast.success(`Jarak berhasil dihitung dari alamat: ${calculatedKm} km!`);
      } else {
        toast.error('Lokasi tidak ditemukan. Periksa kembali isian Kota/Kecamatan Anda.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      toast.error('Gagal menghitung jarak dari alamat. Silakan gunakan tombol Deteksi GPS.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleOpenMap = async () => {
    if (!selectedBranchId) {
      toast.error('Silakan pilih kantor cabang terlebih dahulu sebelum membuka peta');
      return;
    }
    
    let initialPos = mapPosition;

    const geoQuery = buildGeoQuery();
    if (geoQuery && !mapPosition) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}&countrycodes=id`);
        const data = await res.json();
        if (data && data.length > 0) {
          initialPos = new L.LatLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
          toast.success('Peta diarahkan ke alamat yang Anda isi.');
        }
      } catch (err) {
        console.warn('Forward geocoding error:', err);
      }
    }

    const branchCoord = selectedBranchId ? await getBranchCoord(selectedBranchId) : null;
    if (!initialPos && branchCoord) {
      initialPos = new L.LatLng(branchCoord.lat, branchCoord.lng);
    }
    
    if (initialPos) setMapPosition(initialPos);
    setShowMapModal(true);
  };

  const handleConfirmMapLocation = async () => {
    if (!mapPosition) return;
    setIsConfirmingMap(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition.lat}&lon=${mapPosition.lng}&addressdetails=1`);
      const data = await res.json();
      if (data?.address) {
        // Update alamatFields agar alamat yang tersimpan sesuai lokasi di peta
        const addr = data.address;
        setAlamatFields({
          provinsi: addr.state || '',
          kota: addr.city || addr.county || addr.town || '',
          kecamatan: addr.suburb || addr.city_district || '',
          kelurahan: addr.village || addr.neighbourhood || '',
          detail: [addr.road, addr.house_number].filter(Boolean).join(' '),
        });
        setAddressAutoFilled(false);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    
    const branchCoord = selectedBranchId ? await getBranchCoord(selectedBranchId) : null;
    if (branchCoord) {
      const toRad = (val: number) => (val * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(mapPosition.lat - branchCoord.lat);
      const dLng = toRad(mapPosition.lng - branchCoord.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(branchCoord.lat)) * Math.cos(toRad(mapPosition.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      const calculatedKm = Math.max(0.1, Math.round(dist * 10) / 10);
      setDistanceKm(calculatedKm);
      toast.success(`Lokasi dan jarak berhasil diatur dari Peta (${calculatedKm} km)!`);
    }
    
    setIsConfirmingMap(false);
    setShowMapModal(false);
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranch(Number(value));
  };

  // ─── Helper: nama produk + berat ─────────────────────────────────────────
  const getDisplayName = (item: any): string => {
    const base = item.nama_produk || item.name || 'Produk';
    return item.selectedWeight ? `${base} (${item.selectedWeight})` : base;
  };

  // ─── Cek Status Buka/Tutup Toko ──────────────────────────────────────────
  const isBranchClosed = () => {
    const selectedBranchData = branchList.find(b => b.id === selectedBranchId);
    if (!selectedBranchData) return false;
    
    // Cek toggle manual (default true jika belum ada kolom di db)
    if (selectedBranchData.is_open === false) return true;
    
    // Cek jam operasional (default 08:00 - 21:00 jika belum ada)
    const jamBuka = selectedBranchData.jam_buka || '08:00:00';
    const jamTutup = selectedBranchData.jam_tutup || '21:00:00';
    
    // Format waktu lokal user ke "HH:MM:SS"
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}:${seconds}`;
    
    if (currentTimeStr < jamBuka || currentTimeStr > jamTutup) {
      return true;
    }
    
    return false;
  };

  // ─── Ambil user_id dari tabel users berdasarkan auth ─────────────────────
  const getUserId = async (): Promise<number | null> => {
    try {
      // Coba dari sesi Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (error || !userData) return null;
      return userData.id;
    } catch {
      return null;
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Mohon lengkapi nama dan nomor WhatsApp');
      return;
    }
    if (deliveryMethod === 'delivery' && !alamatFields.kota) {
      toast.error('Minimal isi Kota/Kabupaten pada alamat pengiriman');
      return;
    }
    if (!selectedBranchId) {
      toast.error('Silakan pilih cabang terlebih dahulu');
      return;
    }

    if (isBranchClosed()) {
      setShowClosedWarning(true);
      return;
    }

    processCheckout();
  };

  const processCheckout = async () => {
    setShowClosedWarning(false);

    // Double-check kuota delivery
    if (deliveryMethod === 'delivery') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const { count } = await supabase
        .from('pesanan')
        .select('id', { count: 'exact', head: true })
        .eq('cabang_id', selectedBranchId)
        .eq('delivery_method', 'delivery')
        .neq('status_pesanan', 'dibatalkan')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if ((count ?? 0) >= DELIVERY_QUOTA) {
        toast.error('Kuota delivery hari ini sudah penuh (100/100). Silakan pilih Pick Up.');
        setDeliveryCountToday(count ?? 0);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderId = Number(Date.now().toString().slice(-9));
      const noInvoice = `INV/${new Date().getFullYear()}/${orderId}`;

      // ── Ambil user_id dari tabel users (null jika guest/tidak login) ──
      const userId = await getUserId();

      const { error: orderError } = await supabase
        .from('pesanan')
        .insert([{
          id: orderId,
          no_invoice: noInvoice,
          user_id: userId,          // ← sudah diperbaiki, bukan hardcode null
          cabang_id: selectedBranchId,
          subtotal: totalPrice,
          ongkos_kirim: deliveryFee,
          total_bayar: finalPrice,
          delivery_method: deliveryMethod,
          status_pesanan: 'menunggu_konfirmasi',
          catatan: formData.catatan || null,
          metode_pembayaran: formData.paymentMethod,
          nama_penerima: formData.name,
          no_whatsapp: formData.phone,
          alamat_pengiriman: deliveryMethod === 'delivery' ? buildFullAddress() : null,
          created_at: new Date().toISOString(),
        }]);

      if (orderError) throw orderError;

      // ── Simpan detail_pesanan ──
      const detailItems = cart.map((item) => ({
        pesanan_id: orderId,
        produk_id: Number(item.id),
        nama_produk: getDisplayName(item),
        harga_saat_beli: item.harga_jual,
        qty: item.quantity,
        total_harga: item.harga_jual * item.quantity,
      }));

      const { error: detailError } = await supabase
        .from('detail_pesanan')
        .insert(detailItems);

      if (detailError) throw detailError;

      // ── Kurangi Stok di Cabang Terpilih secara Atomic ──
      if (selectedBranchId) {
        for (const item of cart) {
          try {
            const { error: rpcError } = await supabase.rpc('kurangi_stok_atomic', {
              p_cabang_id: selectedBranchId,
              p_produk_id: Number(item.id),
              p_qty: item.quantity,
            });
            if (rpcError) throw rpcError;
          } catch (e) {
            // Fallback manual jika fungsi SQL belum dijalankan di Supabase
            const { data: st } = await supabase
              .from('stok')
              .select('id, jumlah_stok')
              .eq('cabang_id', selectedBranchId)
              .eq('produk_id', Number(item.id))
              .maybeSingle();
            if (st && st.id) {
              await supabase
                .from('stok')
                .update({ jumlah_stok: Math.max(0, (st.jumlah_stok ?? 0) - item.quantity) })
                .eq('id', st.id);
            }
          }
        }
      }

      const summaryData = {
        pesanan_id: orderId,
        noInvoice,
        metode_bayar: formData.paymentMethod,
        total: finalPrice,
        deliveryMethod,
        customerName: formData.name,
        distanceKm: deliveryMethod === 'delivery' ? distanceKm : 0,
        deliveryFee,
        items: cart.map((i) => ({
          name: getDisplayName(i),
          qty: i.quantity,
          price: i.harga_jual,
        })),
      };

      toast.success('Pesanan berhasil dibuat!');
      navigate('/payment', { state: summaryData });
      setTimeout(() => clearCart(), 500);
    } catch (error: any) {
      console.error('Detail Error:', error);
      let msg = error.message || 'Terjadi kesalahan saat memproses pesanan.';
      if (error.code === '22P02' || error.message?.includes('type integer')) {
        msg = 'Format data tidak valid (ID/UUID mismatch).';
      }
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !isProcessing) navigate('/cart');
  }, [cart.length, navigate, isProcessing]);

  if (cart.length === 0 && !isProcessing) return null;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-green-700" />
          <h1 className="text-3xl font-bold text-green-800">Checkout Pesanan</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Metode & Cabang */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Metode & Cabang</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={handleDeliveryMethodChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center space-x-2 p-3 border rounded-xl cursor-pointer ${deliveryMethod === 'pick_up' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="pick_up" id="pick_up" />
                      <Label htmlFor="pick_up" className="flex-1 cursor-pointer font-bold text-sm">
                        <Store className="inline h-4 w-4 mr-1" />
                        Ambil di Toko
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-2 p-3 border rounded-xl transition-colors ${
                      isDeliveryFull
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                        : deliveryMethod === 'delivery'
                        ? 'border-green-600 bg-green-50 cursor-pointer'
                        : 'cursor-pointer'
                    }`}>
                      <RadioGroupItem value="delivery" id="delivery" disabled={isDeliveryFull} />
                      <Label
                        htmlFor="delivery"
                        className={`flex-1 font-bold text-sm ${isDeliveryFull ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer'}`}
                      >
                        <Truck className="inline h-4 w-4 mr-1" />
                        Kirim ke Alamat
                        {isDeliveryFull && (
                          <span className="block text-xs font-normal text-red-500 mt-0.5">
                            Kuota penuh (100/100)
                          </span>
                        )}
                      </Label>
                    </div>
                  </RadioGroup>

                  {isDeliveryFull && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Kuota delivery hari ini sudah penuh (<strong>100/100</strong>). Silakan pilih <strong>Ambil di Toko</strong> atau coba lagi besok.
                      </span>
                    </div>
                  )}

                  {!isDeliveryFull && deliveryMethod === 'delivery' && deliveryCountToday >= 90 && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Sisa kuota delivery hari ini: <strong>{DELIVERY_QUOTA - deliveryCountToday} slot</strong>. Segera checkout!
                      </span>
                    </div>
                  )}

                  <Select value={selectedBranchId?.toString()} onValueChange={handleBranchChange}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchList.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.nama_cabang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Data Penerima */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Data Penerima</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama</Label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} className="rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} className="rounded-xl" placeholder="08..." required />
                    </div>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <>
                      {/* === ALAMAT PENGIRIMAN TERSTRUKTUR === */}
                      <div className="space-y-2 rounded-xl border border-green-200 bg-green-50/50 p-3">
                        <Label className="text-green-700 font-bold flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> Alamat Pengiriman
                        </Label>
                        {addressAutoFilled && (
                          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-blue-700">Alamat otomatis diisi dari profil Anda. Anda dapat mengubahnya jika ingin mengirim ke lokasi lain.</p>
                            <Button type="button" variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 shrink-0 h-6 px-2" onClick={() => setAddressAutoFilled(false)}>OK</Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 -mt-1">Isi dari yang paling besar ke paling kecil. Peta dan jarak otomatis menyesuaikan.</p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="checkout-provinsi" className="text-xs">Provinsi *</Label>
                            <Input id="checkout-provinsi" name="provinsi" placeholder="Contoh: Jawa Tengah" value={alamatFields.provinsi} onChange={handleAlamatFieldChange} className="rounded-xl" required />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="checkout-kota" className="text-xs">Kota / Kabupaten *</Label>
                            <Input id="checkout-kota" name="kota" placeholder="Contoh: Kota Semarang" value={alamatFields.kota} onChange={handleAlamatFieldChange} className="rounded-xl" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="checkout-kecamatan" className="text-xs">Kecamatan</Label>
                            <Input id="checkout-kecamatan" name="kecamatan" placeholder="Contoh: Tembalang" value={alamatFields.kecamatan} onChange={handleAlamatFieldChange} className="rounded-xl" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="checkout-kelurahan" className="text-xs">Kelurahan / Desa</Label>
                            <Input id="checkout-kelurahan" name="kelurahan" placeholder="Contoh: Bulusan" value={alamatFields.kelurahan} onChange={handleAlamatFieldChange} className="rounded-xl" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="checkout-detail" className="text-xs">Detail Alamat (Jalan, RT/RW, No. Rumah, Patokan)</Label>
                          <Textarea id="checkout-detail" name="detail" placeholder="Contoh: Jl. Taman Siswa No. 12, RT 03/RW 05, depan mushola..." className="min-h-[60px] text-sm rounded-xl" value={alamatFields.detail} onChange={handleAlamatFieldChange} />
                        </div>

                        <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 rounded-lg" onClick={handleGeocodeAddress} disabled={isGeocoding}>
                          {isGeocoding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                          Hitung Jarak dari Alamat Ini
                        </Button>
                      </div>

                      {/* === INLINE MAP PREVIEW === */}
                      <div className="space-y-1">
                        <Label className="text-green-700 font-bold flex items-center gap-1.5">
                          <MapIcon className="h-4 w-4" /> Konfirmasi Titik Lokasi Peta
                        </Label>
                        <div className="h-56 w-full rounded-xl overflow-hidden border border-green-200 z-0 relative">
                          {isSearchingMap && (
                            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                            </div>
                          )}
                          <MapContainer 
                            center={mapPosition ? [mapPosition.lat, mapPosition.lng] : [-6.200000, 106.816666]} 
                            zoom={mapPosition ? 15 : 11} 
                            style={{ height: '100%', width: '100%', zIndex: 0 }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <InlineMapMarker 
                              position={mapPosition} 
                              onClickMap={async (latlng) => {
                                setMapPosition(latlng);
                                // Hitung jarak Haversine langsung saat klik peta
                                const branchCoord = selectedBranchId ? await getBranchCoord(selectedBranchId) : null;
                                if (branchCoord) {
                                  const toRad = (val: number) => (val * Math.PI) / 180;
                                  const R = 6371;
                                  const dLat = toRad(latlng.lat - branchCoord.lat);
                                  const dLng = toRad(latlng.lng - branchCoord.lng);
                                  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(branchCoord.lat)) * Math.cos(toRad(latlng.lat)) * Math.sin(dLng / 2) ** 2;
                                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                  const calculatedKm = Math.max(0.1, Math.round(R * c * 10) / 10);
                                  setDistanceKm(calculatedKm);
                                  toast.success(`Titik lokasi diperbarui. Jarak: ${calculatedKm} km`);
                                }
                                // Reverse geocoding: update alamatFields agar alamat yang tersimpan sesuai lokasi peta
                                try {
                                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`);
                                  const data = await res.json();
                                  if (data?.address) {
                                    const addr = data.address;
                                    setAlamatFields({
                                      provinsi: addr.state || '',
                                      kota: addr.city || addr.county || addr.town || '',
                                      kecamatan: addr.suburb || addr.city_district || '',
                                      kelurahan: addr.village || addr.neighbourhood || '',
                                      detail: [addr.road, addr.house_number].filter(Boolean).join(' '),
                                    });
                                    setAddressAutoFilled(false);
                                    toast.info('Alamat pengiriman diperbarui sesuai titik peta.');
                                  }
                                } catch (err) {
                                  console.warn('Reverse geocoding error saat klik peta:', err);
                                }
                              }} 
                            />
                          </MapContainer>
                        </div>
                        <p className="text-xs text-gray-500">Peta otomatis menunjuk lokasi dari alamat di atas. Klik langsung pada peta untuk koreksi titik yang lebih tepat.</p>
                      </div>

                      {/* Perhitungan Jarak & Ongkir */}
                      <div className="p-4 rounded-xl bg-green-50/80 border border-green-200/80 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <Label className="text-xs font-bold text-green-900 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-green-600" /> Jarak & Ongkos Kirim
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDetectGps}
                            disabled={isDetectingGps}
                            className="h-7 text-[11px] bg-white border-green-300 text-green-700 hover:bg-green-100/50 font-bold px-2.5 rounded-lg shadow-2xs self-start sm:self-auto"
                          >
                            {isDetectingGps ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" /> Melacak...
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 mr-1" /> Lacak Lokasi Saya (GPS)
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100 shadow-2xs text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs font-medium">Jarak Terhitung:</span>
                            <span className="font-bold text-gray-900 text-base">{distanceKm} <span className="text-xs font-normal text-gray-500">km</span></span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-gray-400 block">Tarif (Rp 3.000/km)</span>
                            <span className="font-bold text-green-700 text-base">
                              {distanceKm < 1 ? 'GRATIS (< 1 km)' : formatPrice(deliveryFee)}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-500 italic leading-snug">
                          Isi alamat di atas atau klik langsung pada peta untuk menentukan lokasi pengiriman. Klik <b>Lacak Lokasi Saya</b> jika memesan dari rumah agar alamat dan jarak otomatis terisi.
                        </div>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Textarea name="catatan" value={formData.catatan} onChange={handleInputChange} className="rounded-xl" placeholder="Opsional..." />
                  </div>
                </CardContent>
              </Card>

              {/* Pembayaran */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Pembayaran</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className={`p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="cod" id="m-cod" className="mr-2" />
                      <Label htmlFor="m-cod" className="font-bold cursor-pointer">COD (Bayar Tunai)</Label>
                    </div>
                    <div className={`p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'qris' ? 'border-green-600 bg-green-50' : ''}`}>
                      <RadioGroupItem value="qris" id="m-qris" className="mr-2" />
                      <Label htmlFor="m-qris" className="font-bold cursor-pointer">QRIS</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Ringkasan */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-green-200 shadow-md">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-lg">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.selectedWeight ?? idx}`} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-600 flex-1">
                          {getDisplayName(item)}
                          <span className="text-gray-400 ml-1">x{item.quantity}</span>
                        </span>
                        <span className="font-medium shrink-0">
                          {formatPrice(item.harga_jual * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    {deliveryMethod === 'delivery' && (
                      <div className="flex justify-between text-gray-600">
                        <span>Ongkos Kirim ({distanceKm < 1 ? '< 1 km' : `${Math.ceil(distanceKm)} km`})</span>
                        <span className="font-medium text-green-700">
                          {deliveryFee === 0 ? 'GRATIS' : `+${formatPrice(deliveryFee)}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold">Total Bayar</span>
                    <span className="text-2xl font-bold text-green-700">{formatPrice(finalPrice)}</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold rounded-xl"
                    disabled={isProcessing || isDeliveryFull || isCheckingQuota}
                  >
                    {isProcessing
                      ? <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      : isCheckingQuota
                      ? 'Mengecek kuota...'
                      : isDeliveryFull
                      ? 'Kuota Delivery Penuh'
                      : 'Konfirmasi Pesanan'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <AlertDialog open={showClosedWarning} onOpenChange={setShowClosedWarning}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              Toko Sedang Tutup
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-[15px] pt-2">
              Cabang yang Anda pilih saat ini sedang di luar jam operasional atau sedang ditutup oleh admin. 
              <br/><br/>
              Jika Anda melanjutkan, pesanan Anda akan kami terima sebagai <strong>Pre-Order</strong> dan baru akan diproses besok pada jam buka. 
              <br/><br/>
              Apakah Anda ingin tetap memesan untuk besok?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="mt-0 rounded-xl font-semibold border-gray-300 h-11">
              Batal & Kembali
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => processCheckout()} 
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold h-11"
            >
              Ya, Proses Pesanan Besok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Tandai Lokasi Pengiriman</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-gray-100 relative">
            {mapPosition && (
              <MapContainer 
                center={[mapPosition.lat, mapPosition.lng]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <UpdateMapSize />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
            )}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-semibold pointer-events-none border border-green-200">
              Geser peta atau klik untuk mengubah lokasi
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setShowMapModal(false)}>Batal</Button>
            <Button 
              onClick={handleConfirmMapLocation} 
              disabled={isConfirmingMap}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConfirmingMap ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
              Konfirmasi Lokasi Ini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}