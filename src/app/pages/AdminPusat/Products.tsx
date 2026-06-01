import { useState, useEffect } from 'react';
import { Edit, Save, X, Loader2, Plus, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '../../../../utils/supabase/info';

// Prefix SKU per kategori
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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nama_produk: '', harga_jual: 0, satuan: '' });

  // Tambah modal state
  const [showModal, setShowModal] = useState(false);
  const [tambahForm, setTambahForm] = useState<TambahForm>(INIT_FORM);
  const [tambahErrors, setTambahErrors] = useState<Partial<TambahForm>>({});
  const [saving, setSaving] = useState(false);

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

  // ── Edit handlers ──
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

  // ── Tambah handlers ──
  const handleKategoriChange = (kategoriId: string) => {
    const kategori = kategoriList.find((k) => String(k.id) === kategoriId);
    const prefix = kategori ? (SKU_PREFIX_MAP[kategori.nama_kategori] ?? 'PRD') : '';
    const existing = products.filter((p) => p.sku?.startsWith(prefix + '-'));
    const nextNum = existing.length + 1;
    const suggestedSku = prefix ? `${prefix}-${String(nextNum).padStart(3, '0')}` : '';
    setTambahForm((prev) => ({ ...prev, kategori_id: kategoriId, sku: suggestedSku }));
    setTambahErrors((prev) => ({ ...prev, kategori_id: undefined, sku: undefined }));
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
      const { data, error } = await supabase
        .from('produk')
        .insert({
          kategori_id: Number(tambahForm.kategori_id),
          sku: tambahForm.sku.trim().toUpperCase(),
          nama_produk: tambahForm.nama_produk.trim(),
          deskripsi: tambahForm.deskripsi.trim() || null,
          foto_url: tambahForm.foto_url.trim() || null,
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
    } catch (error: any) {
      toast.error('Gagal menambah produk: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setTambahForm(INIT_FORM);
    setTambahErrors({});
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
            {/* ── BUTTON TAMBAH PRODUK ── */}
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
                            <div>
                              <p className="font-medium">{product.nama_produk}</p>
                              {product.is_perishable && (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  Perishable
                                </Badge>
                              )}
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
          MODAL TAMBAH PRODUK
      ═══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseModal} />

          {/* Panel */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tambah Produk Baru</h2>
                  <p className="text-xs text-green-100">Produk akan langsung tersedia di semua cabang</p>
                </div>
              </div>
              <button onClick={handleCloseModal} disabled={saving} className="text-white hover:text-green-200 disabled:opacity-50">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Produk yang ditambahkan akan otomatis masuk ke katalog <strong>semua cabang</strong>.</span>
              </div>

              {/* Kategori + SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tambahForm.kategori_id}
                    onChange={(e) => handleKategoriChange(e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      tambahErrors.kategori_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                    ))}
                  </select>
                  {tambahErrors.kategori_id && <p className="text-xs text-red-500 mt-1">{tambahErrors.kategori_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Otomatis terisi saat pilih kategori"
                    value={tambahForm.sku}
                    onChange={(e) => {
                      setTambahForm({ ...tambahForm, sku: e.target.value.toUpperCase() });
                      setTambahErrors({ ...tambahErrors, sku: undefined });
                    }}
                    className={`uppercase ${tambahErrors.sku ? 'border-red-400' : ''}`}
                  />
                  {tambahErrors.sku && <p className="text-xs text-red-500 mt-1">{tambahErrors.sku}</p>}
                  <p className="text-xs text-gray-400 mt-1">Otomatis terisi saat pilih kategori. Bisa diedit manual.</p>
                </div>
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                {tambahErrors.nama_produk && <p className="text-xs text-red-500 mt-1">{tambahErrors.nama_produk}</p>}
              </div>

              {/* Harga + Satuan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  {tambahErrors.harga_jual && <p className="text-xs text-red-500 mt-1">{tambahErrors.harga_jual}</p>}
                  {tambahForm.harga_jual && Number(tambahForm.harga_jual) > 0 && (
                    <p className="text-xs text-green-600 mt-1">= {formatPrice(Number(tambahForm.harga_jual))}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tambahForm.satuan}
                    onChange={(e) => {
                      setTambahForm({ ...tambahForm, satuan: e.target.value });
                      setTambahErrors({ ...tambahErrors, satuan: undefined });
                    }}
                    className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                  {tambahErrors.satuan && <p className="text-xs text-red-500 mt-1">{tambahErrors.satuan}</p>}
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  placeholder="Deskripsi singkat tentang produk..."
                  value={tambahForm.deskripsi}
                  onChange={(e) => setTambahForm({ ...tambahForm, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Foto URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Foto <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <Input
                  placeholder="https://example.com/foto-produk.jpg"
                  value={tambahForm.foto_url}
                  onChange={(e) => setTambahForm({ ...tambahForm, foto_url: e.target.value })}
                />
              </div>

              {/* Toggle Perishable + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Produk Perishable</p>
                    <p className="text-xs text-gray-500">Mudah basi/kadaluarsa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTambahForm({ ...tambahForm, is_perishable: !tambahForm.is_perishable })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tambahForm.is_perishable ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tambahForm.is_perishable ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status Aktif</p>
                    <p className="text-xs text-gray-500">Tersedia untuk dipesan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTambahForm({ ...tambahForm, is_active: !tambahForm.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tambahForm.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tambahForm.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <Button variant="outline" onClick={handleCloseModal} disabled={saving}>
                Batal
              </Button>
              <Button
                onClick={handleTambah}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 min-w-[140px]"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                ) : (
                  <><Plus className="h-4 w-4" />Tambah Produk</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}