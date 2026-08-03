import { useState, useEffect, useRef } from 'react';
import { Edit, Save, X, Loader2, Plus, AlertCircle, Upload, ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '../../../../utils/supabase/info';

const SKU_PREFIX_MAP: Record<string, string> = {
  'Sayuran':       'SAY',
  'Bumbu Dapur':   'BDR',
  'Bumbu Instan':  'BIN',
  'Rempah Instan': 'RMP',
  'Buah':          'BUH',
  'Frozen Food':   'FRZ',
  'Lauk':          'LAU',
  'Aneka Daging':  'DAG',
  'Sembako':       'SMB',
  'Kerupuk':       'KRP',
  'Snack/Camilan': 'SNK',
};

interface TambahForm {
  kategori_id: string;
  sku: string;
  nama_produk: string;
  deskripsi: string;
  foto_url: string;
  satuan: string;
  harga_jual: string;
  is_perishable: boolean;
  is_active: boolean;
}

const INIT_FORM: TambahForm = {
  kategori_id: '',
  sku: '',
  nama_produk: '',
  deskripsi: '',
  foto_url: '',
  satuan: '',
  harga_jual: '',
  is_perishable: true,
  is_active: true,
};

export function AdminPusatProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama_produk: '', harga_jual: 0, satuan: '' });

  const [showModal, setShowModal] = useState(false);
  const [tambahForm, setTambahForm] = useState<TambahForm>(INIT_FORM);
  const [tambahErrors, setTambahErrors] = useState<Partial<TambahForm>>({});
  const [saving, setSaving] = useState(false);

  // Upload foto state
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('nama_produk', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Gagal mengambil data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKategori = async () => {
    const { data } = await supabase
      .from('kategori_produk')
      .select('id, nama_kategori')
      .order('nama_kategori', { ascending: true });
    setKategoriList(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchKategori();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      nama_produk: product.nama_produk,
      harga_jual: product.harga_jual,
      satuan: product.satuan,
    });
  };

  const handleCancel = () => setEditingId(null);

  const handleSave = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('produk')
        .update({
          nama_produk: editForm.nama_produk,
          harga_jual: editForm.harga_jual,
          satuan: editForm.satuan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, nama_produk: editForm.nama_produk, harga_jual: editForm.harga_jual, satuan: editForm.satuan }
            : p
        )
      );
      setEditingId(null);
      toast.success('Produk berhasil diperbarui!');
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }
  };

  const handleKategoriChange = (kategoriId: string) => {
    const kategori = kategoriList.find((k) => String(k.id) === kategoriId);
    const prefix = kategori ? (SKU_PREFIX_MAP[kategori.nama_kategori] ?? 'PRD') : '';
    const existing = products.filter((p) => p.sku?.startsWith(prefix + '-'));
    const nextNum = existing.length + 1;
    const suggestedSku = prefix ? `${prefix}-${String(nextNum).padStart(3, '0')}` : '';
    setTambahForm((prev) => ({ ...prev, kategori_id: kategoriId, sku: suggestedSku }));
    setTambahErrors((prev) => ({ ...prev, kategori_id: undefined, sku: undefined }));
  };

  // ── Handler upload foto ──
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe & ukuran (max 2MB)
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar!');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB!');
      return;
    }

    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setTambahForm((prev) => ({ ...prev, foto_url: '' }));
  };

  const handleRemoveFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    setTambahForm((prev) => ({ ...prev, foto_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFotoToStorage = async (file: File, sku: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `produk/${sku}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('foto-produk') // sesuaikan nama bucket Supabase Storage Anda
      .upload(fileName, file, { upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('foto-produk')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const validate = (): boolean => {
    const errors: Partial<TambahForm> = {};
    if (!tambahForm.kategori_id) errors.kategori_id = 'Wajib dipilih';
    if (!tambahForm.sku.trim()) errors.sku = 'Wajib diisi';
    if (!tambahForm.nama_produk.trim()) errors.nama_produk = 'Wajib diisi';
    if (!tambahForm.satuan) errors.satuan = 'Wajib dipilih';
    if (!tambahForm.harga_jual || Number(tambahForm.harga_jual) <= 0)
      errors.harga_jual = 'Harus lebih dari 0';
    setTambahErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTambah = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let fotoUrl = tambahForm.foto_url.trim() || null;

      // Upload foto jika ada file dipilih
      if (fotoFile) {
        setUploadingFoto(true);
        fotoUrl = await uploadFotoToStorage(fotoFile, tambahForm.sku.trim().toUpperCase());
        setUploadingFoto(false);
      }

      const { data, error } = await supabase
        .from('produk')
        .insert({
          kategori_id: Number(tambahForm.kategori_id),
          sku: tambahForm.sku.trim().toUpperCase(),
          nama_produk: tambahForm.nama_produk.trim(),
          deskripsi: tambahForm.deskripsi.trim() || null,
          foto_url: fotoUrl,
          satuan: tambahForm.satuan,
          harga_jual: Number(tambahForm.harga_jual),
          is_perishable: tambahForm.is_perishable,
          is_active: tambahForm.is_active,
          stok: 0,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('SKU sudah digunakan!');
          setTambahErrors({ sku: 'SKU sudah digunakan' });
        } else {
          throw error;
        }
        return;
      }

      setProducts((prev) =>
        [...prev, data].sort((a, b) => a.nama_produk.localeCompare(b.nama_produk))
      );
      toast.success(`"${data.nama_produk}" berhasil ditambahkan dan tersedia di semua cabang!`);
      setShowModal(false);
      setTambahForm(INIT_FORM);
      setTambahErrors({});
      handleRemoveFoto();
    } catch (error: any) {
      toast.error('Gagal menambah produk: ' + error.message);
    } finally {
      setSaving(false);
      setUploadingFoto(false);
    }
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setTambahForm(INIT_FORM);
    setTambahErrors({});
    handleRemoveFoto();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kelola Produk & Harga (Pusat)</h2>
        <p className="text-gray-600">Atur harga jual dan informasi produk secara terpusat</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-700">
          <strong>Catatan:</strong> Perubahan <strong>Harga Jual</strong> akan langsung sinkron ke seluruh katalog pelanggan dan admin cabang.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Katalog Produk Database</CardTitle>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-4 px-3">SKU</th>
                    <th className="text-left py-4 px-3">Nama Produk</th>
                    <th className="text-right py-4 px-3">Harga Jual</th>
                    <th className="text-center py-4 px-3">Satuan</th>
                    <th className="text-center py-4 px-3">Status</th>
                    <th className="text-center py-4 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isEditing = editingId === product.id;
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {product.sku || 'N/A'}
                          </code>
                        </td>
                        <td className="py-4 px-3">
                          {isEditing ? (
                            <Input
                              value={editForm.nama_produk}
                              onChange={(e) => setEditForm({ ...editForm, nama_produk: e.target.value })}
                              className="h-9"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              {product.foto_url ? (
                                <img
                                  src={product.foto_url}
                                  alt={product.nama_produk}
                                  className="h-10 w-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{product.nama_produk}</p>
                                {product.is_perishable && (
                                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                    Perishable
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editForm.harga_jual}
                              onChange={(e) => setEditForm({ ...editForm, harga_jual: Number(e.target.value) })}
                              className="h-9 text-right"
                            />
                          ) : (
                            <span className="font-semibold text-green-700">{formatPrice(product.harga_jual)}</span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {isEditing ? (
                            <Input
                              value={editForm.satuan}
                              onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value })}
                              className="h-9 text-center w-24 mx-auto"
                            />
                          ) : (
                            <span className="text-gray-600">{product.satuan}</span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {product.is_active ? (
                            <Badge className="bg-green-600">Aktif</Badge>
                          ) : (
                            <Badge variant="secondary">Non-Aktif</Badge>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex gap-2 justify-center">
                            {isEditing ? (
                              <>
                                <Button size="sm" onClick={() => handleSave(product.id)} className="bg-green-600 hover:bg-green-700">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════
          MODAL TAMBAH PRODUK — FULL SCREEN
      ═══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tambah Produk Baru</h2>
                <p className="text-xs text-green-100">Produk akan langsung tersedia di semua cabang</p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              disabled={saving}
              className="text-white hover:text-green-200 disabled:opacity-50 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

              {/* Info Banner */}
              <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Produk yang ditambahkan akan otomatis masuk ke katalog <strong>semua cabang</strong>.</span>
              </div>

              {/* ── Section 1: Identifikasi Produk ── */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Identifikasi Produk
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tambahForm.kategori_id}
                      onChange={(e) => handleKategoriChange(e.target.value)}
                      className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                        tambahErrors.kategori_id ? 'border-red-400' : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {kategoriList.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                      ))}
                    </select>
                    {tambahErrors.kategori_id && (
                      <p className="text-xs text-red-500 mt-1">{tambahErrors.kategori_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Otomatis terisi saat pilih kategori"
                      value={tambahForm.sku}
                      onChange={(e) => {
                        setTambahForm({ ...tambahForm, sku: e.target.value.toUpperCase() });
                        setTambahErrors({ ...tambahErrors, sku: undefined });
                      }}
                      className={`uppercase font-mono ${tambahErrors.sku ? 'border-red-400' : ''}`}
                    />
                    {tambahErrors.sku ? (
                      <p className="text-xs text-red-500 mt-1">{tambahErrors.sku}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Otomatis terisi saat pilih kategori. Bisa diedit manual.</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="contoh: Ayam Broiler Segar"
                      value={tambahForm.nama_produk}
                      onChange={(e) => {
                        setTambahForm({ ...tambahForm, nama_produk: e.target.value });
                        setTambahErrors({ ...tambahErrors, nama_produk: undefined });
                      }}
                      className={tambahErrors.nama_produk ? 'border-red-400' : ''}
                    />
                    {tambahErrors.nama_produk && (
                      <p className="text-xs text-red-500 mt-1">{tambahErrors.nama_produk}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Section 2: Harga & Satuan ── */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Harga & Satuan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Harga Jual (Rp) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="contoh: 35000"
                      min={0}
                      value={tambahForm.harga_jual}
                      onChange={(e) => {
                        setTambahForm({ ...tambahForm, harga_jual: e.target.value });
                        setTambahErrors({ ...tambahErrors, harga_jual: undefined });
                      }}
                      className={tambahErrors.harga_jual ? 'border-red-400' : ''}
                    />
                    {tambahErrors.harga_jual ? (
                      <p className="text-xs text-red-500 mt-1">{tambahErrors.harga_jual}</p>
                    ) : tambahForm.harga_jual && Number(tambahForm.harga_jual) > 0 ? (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        = {formatPrice(Number(tambahForm.harga_jual))}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tambahForm.satuan}
                      onChange={(e) => {
                        setTambahForm({ ...tambahForm, satuan: e.target.value });
                        setTambahErrors({ ...tambahErrors, satuan: undefined });
                      }}
                      className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                        tambahErrors.satuan ? 'border-red-400' : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Pilih Satuan --</option>
                      <option value="ekor">ekor</option>
                      <option value="pack">pack</option>
                      <option value="kg">kg</option>
                      <option value="gram">gram</option>
                      <option value="liter">liter</option>
                      <option value="pcs">pcs</option>
                      <option value="ikat">ikat</option>
                      <option value="biji">biji</option>
                      <option value="lusin">lusin</option>
                    </select>
                    {tambahErrors.satuan && (
                      <p className="text-xs text-red-500 mt-1">{tambahErrors.satuan}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Section 3: Media & Deskripsi ── */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Media & Deskripsi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Foto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Foto Produk <span className="text-gray-400 font-normal">(opsional, maks 2MB)</span>
                    </label>

                    {fotoPreview ? (
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square max-h-52">
                        <img
                          src={fotoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleRemoveFoto}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-3 py-1.5 truncate">
                          {fotoFile?.name}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer aspect-square max-h-52 text-center p-4"
                      >
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Klik untuk upload foto</p>
                          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP hingga 2MB</p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />

                    {/* URL manual jika tidak upload file */}
                    {!fotoFile && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">atau masukkan URL foto:</p>
                        <Input
                          placeholder="https://example.com/foto-produk.jpg"
                          value={tambahForm.foto_url}
                          onChange={(e) => setTambahForm({ ...tambahForm, foto_url: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Deskripsi */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <textarea
                      placeholder="Deskripsi singkat tentang produk, kualitas, asal, atau informasi penting lainnya..."
                      value={tambahForm.deskripsi}
                      onChange={(e) => setTambahForm({ ...tambahForm, deskripsi: e.target.value })}
                      rows={6}
                      className="flex-1 w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition"
                    />
                    <p className="text-xs text-gray-400 mt-1">{tambahForm.deskripsi.length} karakter</p>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Pengaturan ── */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Pengaturan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-5 border rounded-xl bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Produk Perishable</p>
                      <p className="text-xs text-gray-500 mt-0.5">Produk mudah basi atau kadaluarsa</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTambahForm({ ...tambahForm, is_perishable: !tambahForm.is_perishable })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        tambahForm.is_perishable ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        tambahForm.is_perishable ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-5 border rounded-xl bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Status Aktif</p>
                      <p className="text-xs text-gray-500 mt-0.5">Produk tersedia untuk dipesan pelanggan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTambahForm({ ...tambahForm, is_active: !tambahForm.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        tambahForm.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        tambahForm.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Sticky Footer ── */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">
              Kolom bertanda <span className="text-red-500 font-bold">*</span> wajib diisi
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCloseModal} disabled={saving} className="px-6">
                Batal
              </Button>
              <Button
                onClick={handleTambah}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 min-w-[160px] px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadingFoto ? 'Mengupload foto...' : 'Menyimpan...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Tambah Produk
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}