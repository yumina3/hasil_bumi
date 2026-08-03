import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Users, UserPlus, Building, Shield, Loader2, CheckCircle2, XCircle, Store, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { registerAccount, activateAccount, fetchCabangList, fetchUsersList, createCabang } from "../../utils/api";

export function AdminPusatStaff() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'pelanggan'>('admin');

  // Form Tambah Cabang Baru State
  const [showAddCabangForm, setShowAddCabangForm] = useState(false);
  const [isCabangSubmitting, setIsCabangSubmitting] = useState(false);
  const [cabangFormData, setCabangFormData] = useState({
    nama_cabang: "",
    lokasi: "",
    alamat_lengkap: "",
    jam_operasional: "08:00 - 20:00 WIB",
    no_telepon: "",
  });

  // Form state untuk Akun Admin Cabang
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    cabangId: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cData, uData] = await Promise.all([fetchCabangList(), fetchUsersList()]);
      setCabangList(cData);
      setUsersList(uData);
    } catch (err: any) {
      console.error("Gagal memuat data staf/user:", err.message);
      toast.error("Gagal memuat daftar pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PEMBUATAN AKUN ADMIN CABANG OLEH SUPER ADMIN
  const handleCreateAdminCabang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cabangId) {
      return toast.error("Pilih cabang penugasan terlebih dahulu");
    }
    if (formData.password.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }

    setIsSubmitting(true);
    try {
      const res = await registerAccount({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        username: formData.username,
        phone: formData.phone,
        address: "Kantor Cabang", // Default alamat untuk admin cabang
        role: "admin_cabang",
        cabangId: Number(formData.cabangId),
      });

      // Langsung aktifkan akun admin cabang agar tidak tertahan status konfirmasi email (OTP)
      if (res && (res.userId || res.data?.user?.id)) {
        try {
          await activateAccount(res.userId || res.data?.user?.id);
        } catch (e) {
          console.warn("Aktivasi otomatis tertahan:", e);
        }
      }

      toast.success("Akun Admin Cabang berhasil dibuat & diaktifkan!");
      setShowAddForm(false);
      setFormData({ name: "", email: "", username: "", phone: "", password: "", cabangId: "" });
      fetchData(); // Refresh list
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCabangChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCabangFormData({ ...cabangFormData, [e.target.name]: e.target.value });
  };

  const handleCreateCabang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cabangFormData.nama_cabang || !cabangFormData.lokasi) {
      return toast.error("Nama cabang dan lokasi kota wajib diisi");
    }

    setIsCabangSubmitting(true);
    try {
      const newCabang = await createCabang({
        nama_cabang: cabangFormData.nama_cabang,
        lokasi: cabangFormData.lokasi,
        alamat_lengkap: cabangFormData.alamat_lengkap,
        jam_operasional: cabangFormData.jam_operasional,
        no_telepon: cabangFormData.no_telepon,
        is_active: true,
      });

      toast.success("Cabang baru berhasil ditambahkan! Silakan buat akun adminnya sekarang.");
      setShowAddCabangForm(false);
      setCabangFormData({
        nama_cabang: "",
        lokasi: "",
        alamat_lengkap: "",
        jam_operasional: "08:00 - 20:00 WIB",
        no_telepon: "",
      });
      await fetchData(); // Refresh list cabang
      if (newCabang && newCabang.id) {
        setFormData((prev) => ({ ...prev, cabangId: String(newCabang.id) }));
      }
      setShowAddForm(true); // Langsung buka form buat akun admin dan pilih cabang barunya
    } catch (err: any) {
      toast.error("Gagal menambah cabang: " + err.message);
    } finally {
      setIsCabangSubmitting(false);
    }
  };

  const getCabangName = (cabangId?: number) => {
    if (!cabangId) return "-";
    const c = cabangList.find((item) => item.id === cabangId);
    return c ? c.nama_cabang : `Cabang #${cabangId}`;
  };

  const adminUsers = usersList.filter(u => u.peran === "admin_pusat" || u.peran === "admin_cabang");
  const pelangganUsers = usersList.filter(u => u.peran === "pelanggan" || !u.peran);
  const displayedUsers = activeTab === "admin" ? adminUsers : pelangganUsers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Admin & Staf</h2>
          <p className="text-gray-600">Kelola cabang baru, otorisasi akun Admin Cabang, dan pantau seluruh pengguna</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setShowAddCabangForm(!showAddCabangForm);
              if (!showAddCabangForm) setShowAddForm(false);
            }}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50 gap-2 font-semibold"
          >
            <Store className="h-4 w-4" />
            {showAddCabangForm ? "Tutup Form Cabang" : "+ Tambah Cabang Baru"}
          </Button>
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) setShowAddCabangForm(false);
            }}
            className="bg-green-600 hover:bg-green-700 gap-2 font-semibold"
          >
            <UserPlus className="h-4 w-4" />
            {showAddForm ? "Tutup Form Admin" : "+ Buat Akun Admin Cabang"}
          </Button>
        </div>
      </div>

      {/* Form Tambah Cabang Baru */}
      {showAddCabangForm && (
        <Card className="border-2 border-green-600 shadow-lg bg-green-50/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <Store className="h-5 w-5 text-green-600" />
              Buka Cabang Distribusi Baru
            </CardTitle>
            <CardDescription>
              Setelah cabang disimpan, form pembuatan akun Admin Cabang akan otomatis terbuka.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCabang} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nama_cabang">Nama Cabang *</Label>
                  <Input
                    id="nama_cabang"
                    name="nama_cabang"
                    value={cabangFormData.nama_cabang}
                    onChange={handleCabangChange}
                    placeholder="Contoh: Cabang Surabaya"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lokasi">Kota / Daerah *</Label>
                  <Input
                    id="lokasi"
                    name="lokasi"
                    value={cabangFormData.lokasi}
                    onChange={handleCabangChange}
                    placeholder="Contoh: Surabaya, Jawa Timur"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="alamat_lengkap">Alamat Lengkap</Label>
                  <Input
                    id="alamat_lengkap"
                    name="alamat_lengkap"
                    value={cabangFormData.alamat_lengkap}
                    onChange={handleCabangChange}
                    placeholder="Jl. Raya Darmo No. 10..."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jam_operasional">Jam Operasional</Label>
                  <Input
                    id="jam_operasional"
                    name="jam_operasional"
                    value={cabangFormData.jam_operasional}
                    onChange={handleCabangChange}
                    placeholder="08:00 - 20:00 WIB"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="no_telepon">No. Telepon / WA Cabang</Label>
                  <Input
                    id="no_telepon"
                    name="no_telepon"
                    value={cabangFormData.no_telepon}
                    onChange={handleCabangChange}
                    placeholder="08112233..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddCabangForm(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isCabangSubmitting}
                >
                  {isCabangSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : null}
                  Simpan & Buat Akun Admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Form Tambah Admin Cabang (Hanya bisa diakses oleh Super Admin) */}
      {showAddForm && (
        <Card className="border-2 border-green-600 shadow-lg bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5 text-green-600" />
              Buat Akun Admin Cabang Baru
            </CardTitle>
            <CardDescription>
              Akun yang dibuat di sini langsung mendapatkan otorisasi kelola stok pada cabang yang dipilih.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdminCabang} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Contoh: Budi Santoso" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleChange} required placeholder="budi_jakpus" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email Kerja *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="budi@hasilbumi.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">No. WhatsApp</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="08..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-green-700 font-bold flex items-center gap-1">
                    <Building className="h-4 w-4" /> Penugasan Cabang *
                  </Label>
                  <Select value={formData.cabangId} onValueChange={(val) => setFormData({ ...formData, cabangId: val })}>
                    <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Pilih cabang tugas..." /></SelectTrigger>
                    <SelectContent>
                      {cabangList.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nama_cabang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password Akun *</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Minimal 6 karakter" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Batal</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Simpan & Aktifkan Admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs Filter Role Pengguna */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "admin"
              ? "bg-green-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Shield className="h-4 w-4" />
          Staf & Admin ({adminUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("pelanggan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "pelanggan"
              ? "bg-green-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Daftar Pelanggan ({pelangganUsers.length})
        </button>
      </div>

      {/* Tabel Daftar Pengguna */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {activeTab === "admin" ? <Shield className="h-5 w-5 text-green-700" /> : <Users className="h-5 w-5 text-gray-700" />}
            {activeTab === "admin" ? "Daftar Staf & Administrator Sistem" : "Daftar Akun Pelanggan (Customers)"}
          </CardTitle>
          <CardDescription>
            {activeTab === "admin" 
              ? "Akun-akun dengan hak akses khusus untuk mengelola sistem atau operasional cabang" 
              : "Pelanggan umum yang mendaftar melalui website untuk melakukan pemesanan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500 flex justify-center items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              Memuat data pengguna dari Supabase...
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Belum ada akun pada kategori ini.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nama / Username</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Role / Jabatan</th>
                    {activeTab === "admin" && <th className="py-3 px-4 font-semibold text-gray-700">Cabang Tugas</th>}
                    <th className="py-3 px-4 font-semibold text-gray-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((u) => {
                    const role = u.peran || "pelanggan";
                    return (
                      <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{u.nama_lengkap || "Tanpa Nama"}</p>
                          <p className="text-xs text-gray-500">@{u.username || "-"}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.email || "-"}</td>
                        <td className="py-3 px-4">
                          {role === "admin_pusat" ? (
                            <Badge className="bg-purple-600">Super Admin</Badge>
                          ) : role === "admin_cabang" ? (
                            <Badge className="bg-green-600">Admin Cabang</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">Pelanggan</Badge>
                          )}
                        </td>
                        {activeTab === "admin" && (
                          <td className="py-3 px-4 text-gray-700">
                            {role === "admin_cabang" ? (
                              <span className="font-medium text-green-700 flex items-center gap-1">
                                <Building className="h-3.5 w-3.5" /> {getCabangName(u.cabang_id)}
                              </span>
                            ) : (
                              <span className="text-gray-400">Pusat / Semua Cabang</span>
                            )}
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1 inline-flex items-center">
                              <CheckCircle2 className="h-3 w-3" /> Aktif
                            </Badge>
                            {u.auth_id && (
                              <button
                                onClick={async () => {
                                  try {
                                    await activateAccount(u.auth_id);
                                    toast.success(`Akun "${u.nama_lengkap || u.email}" berhasil diverifikasi/diaktifkan! Sekarang bisa login.`);
                                  } catch (e: any) {
                                    toast.error("Gagal aktivasi: " + e.message);
                                  }
                                }}
                                title="Klik jika akun ini gagal login karena masalah belum konfirmasi email/OTP"
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 font-medium transition-colors"
                              >
                                Verifikasi Akun
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
