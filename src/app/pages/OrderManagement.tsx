import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase/info';
import { useAuth } from '../context/AuthContext';

interface Pesanan {
  id: number;
  no_invoice: string;
  status_pesanan: string;
  total_harga: number;
  created_at: string;
  alasan_penolakan: string | null;
  users: { nama_lengkap: string; email: string } | null;
  detail_pesanan: {
    qty: number;
    produk: { nama_produk: string; harga: number } | null;
  }[];
}

type ModalType = 'terima' | 'tolak' | 'konfirmasi' | null;

export default function OrderManagement() {
  const { user } = useAuth();
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPesanan = async () => {
    if (!user?.cabang_id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('pesanan')
      .select(`
        id, no_invoice, status_pesanan, total_harga, created_at, alasan_penolakan,
        users:user_id ( nama_lengkap, email ),
        detail_pesanan (
          qty,
          produk:produk_id ( nama_produk, harga )
        )
      `)
      .eq('cabang_id', user.cabang_id)
      .in('status_pesanan', ['menunggu', 'diterima', 'dikonfirmasi', 'ditolak'])
      .order('created_at', { ascending: false });

    if (error) {
      setError('Gagal memuat pesanan: ' + error.message);
    } else {
      setPesananList((data as unknown as Pesanan[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPesanan();
  }, [user?.cabang_id]);

  const openModal = (pesanan: Pesanan, type: ModalType) => {
    setSelectedPesanan(pesanan);
    setModalType(type);
    setAlasanTolak('');
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setSelectedPesanan(null);
    setModalType(null);
    setAlasanTolak('');
    setError('');
  };

  const handleTerima = async () => {
    if (!selectedPesanan) return;
    setActionLoading(true);
    setError('');

    const { error } = await supabase
      .from('pesanan')
      .update({ status_pesanan: 'diterima' })
      .eq('id', selectedPesanan.id);

    if (error) {
      setError('Gagal menerima pesanan: ' + error.message);
    } else {
      setSuccess('Pesanan berhasil diterima!');
      await fetchPesanan();
      setTimeout(closeModal, 1500);
    }
    setActionLoading(false);
  };

  const handleTolak = async () => {
    if (!selectedPesanan) return;
    if (!alasanTolak.trim()) {
      setError('Alasan penolakan wajib diisi.');
      return;
    }
    setActionLoading(true);
    setError('');

    const { error } = await supabase
      .from('pesanan')
      .update({
        status_pesanan: 'ditolak',
        alasan_penolakan: alasanTolak.trim(),
      })
      .eq('id', selectedPesanan.id);

    if (error) {
      setError('Gagal menolak pesanan: ' + error.message);
    } else {
      setSuccess('Pesanan berhasil ditolak.');
      await fetchPesanan();
      setTimeout(closeModal, 1500);
    }
    setActionLoading(false);
  };

  const handleKonfirmasi = async () => {
    if (!selectedPesanan) return;
    setActionLoading(true);
    setError('');

    const { error } = await supabase
      .from('pesanan')
      .update({ status_pesanan: 'dikonfirmasi' })
      .eq('id', selectedPesanan.id);

    if (error) {
      // Pesan dari trigger jika stok tidak cukup
      setError(error.message.includes('Stok tidak mencukupi')
        ? 'Stok tidak mencukupi untuk mengkonfirmasi pesanan ini.'
        : 'Gagal konfirmasi: ' + error.message);
    } else {
      setSuccess('Pesanan dikonfirmasi! Stok cabang otomatis berkurang.');
      await fetchPesanan();
      setTimeout(closeModal, 1500);
    }
    setActionLoading(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      menunggu: 'bg-yellow-100 text-yellow-800',
      diterima: 'bg-blue-100 text-blue-800',
      dikonfirmasi: 'bg-green-100 text-green-800',
      ditolak: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Memuat pesanan...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Pesanan</h1>

      {pesananList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Belum ada pesanan masuk.</div>
      ) : (
        <div className="space-y-4">
          {pesananList.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">{p.no_invoice}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(p.status_pesanan)}`}>
                      {p.status_pesanan}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {p.users?.nama_lengkap || '-'} · {p.users?.email || '-'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(p.created_at).toLocaleString('id-ID')}
                  </div>

                  {/* Detail produk */}
                  <div className="mt-3 space-y-1">
                    {p.detail_pesanan.map((dp, i) => (
                      <div key={i} className="text-sm text-gray-600">
                        • {dp.produk?.nama_produk || '-'} × {dp.qty}
                        {dp.produk?.harga && (
                          <span className="text-gray-400 ml-1">
                            ({formatRupiah(dp.produk.harga * dp.qty)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Alasan penolakan */}
                  {p.status_pesanan === 'ditolak' && p.alasan_penolakan && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <span className="font-medium">Alasan penolakan:</span> {p.alasan_penolakan}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-lg">{formatRupiah(p.total_harga)}</div>

                  {/* Tombol aksi */}
                  <div className="flex gap-2 mt-3 justify-end flex-wrap">
                    {p.status_pesanan === 'menunggu' && (
                      <>
                        <button
                          onClick={() => openModal(p, 'terima')}
                          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => openModal(p, 'tolak')}
                          className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {p.status_pesanan === 'diterima' && (
                      <button
                        onClick={() => openModal(p, 'konfirmasi')}
                        className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Konfirmasi & Kurangi Stok
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalType && selectedPesanan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {/* Terima */}
            {modalType === 'terima' && (
              <>
                <h2 className="text-lg font-semibold mb-2">Terima Pesanan</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Terima pesanan <strong>{selectedPesanan.no_invoice}</strong>?
                  Pesanan akan masuk ke tahap konfirmasi selanjutnya.
                </p>
              </>
            )}

            {/* Tolak */}
            {modalType === 'tolak' && (
              <>
                <h2 className="text-lg font-semibold mb-2 text-red-600">Tolak Pesanan</h2>
                <p className="text-gray-600 text-sm mb-3">
                  Tolak pesanan <strong>{selectedPesanan.no_invoice}</strong>? Masukkan alasan penolakan:
                </p>
                <textarea
                  value={alasanTolak}
                  onChange={(e) => setAlasanTolak(e.target.value)}
                  placeholder="Contoh: Stok habis, produk tidak tersedia di cabang ini..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </>
            )}

            {/* Konfirmasi */}
            {modalType === 'konfirmasi' && (
              <>
                <h2 className="text-lg font-semibold mb-2 text-green-700">Konfirmasi Pesanan</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Konfirmasi pesanan <strong>{selectedPesanan.no_invoice}</strong>?
                  Stok produk di cabang ini akan <strong>otomatis berkurang</strong> sesuai jumlah pesanan.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 mb-4">
                  Pastikan stok mencukupi sebelum mengkonfirmasi.
                </div>
              </>
            )}

            {/* Error / Success */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Tombol modal */}
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              {modalType === 'terima' && (
                <button
                  onClick={handleTerima}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Ya, Terima'}
                </button>
              )}
              {modalType === 'tolak' && (
                <button
                  onClick={handleTolak}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Ya, Tolak'}
                </button>
              )}
              {modalType === 'konfirmasi' && (
                <button
                  onClick={handleKonfirmasi}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Mengkonfirmasi...' : 'Ya, Konfirmasi'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}