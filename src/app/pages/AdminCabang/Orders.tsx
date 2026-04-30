import { useState } from 'react';
import {
  Clock, CheckCircle, Box, Truck, Store,
  Phone, MapPin, CreditCard, Calendar, Package,
  XCircle, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAdminCabangData } from '../../context/AdminCabangContext';
import { orderService } from '../orderService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';

export function AdminCabangOrders() {
  const { orders, refreshAllData } = useAdminCabangData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Track order mana yang sedang menampilkan form tolak
  const [rejectOpenId, setRejectOpenId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(price || 0);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setSubmittingId(orderId);
    try {
      await orderService.updateStatus(orderId, newStatus as any);
      const statusMessages: Record<string, string> = {
        diproses:     '✓ Pesanan dikonfirmasi',
        dikemas:      '📦 Pesanan sedang dikemas',
        dikirim:      '🚚 Pesanan sedang dikirim',
        siap_diambil: '✓ Pesanan siap diambil',
        selesai:      '🎉 Pesanan selesai',
      };
      toast.success(statusMessages[newStatus] || 'Status pesanan diupdate');
      await refreshAllData();
    } catch (error: any) {
      toast.error('Gagal update status: ' + error.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    setSubmittingId(orderId);
    try {
      await orderService.updateStatus(orderId, 'diproses');
      toast.success('✓ Pesanan diterima dan dikonfirmasi');
      await refreshAllData();
    } catch (error: any) {
      toast.error('Gagal menerima pesanan: ' + error.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    if (!rejectReason.trim()) {
      toast.error('Harap isi alasan penolakan');
      return;
    }
    setSubmittingId(orderId);
    try {
      await orderService.rejectOrder(orderId, rejectReason.trim());
      toast.success('Pesanan ditolak, pelanggan akan diberitahu');
      setRejectOpenId(null);
      setRejectReason('');
      await refreshAllData();
    } catch (error: any) {
      toast.error('Gagal menolak pesanan: ' + error.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      menunggu_pembayaran: { color: 'bg-yellow-500', icon: Clock,       label: 'Menunggu Bayar' },
      pembayaran_lunas:    { color: 'bg-blue-400',   icon: Clock,       label: 'Lunas'          },
      diproses:            { color: 'bg-blue-600',   icon: CheckCircle, label: 'Dikonfirmasi'   },
      dikemas:             { color: 'bg-purple-600', icon: Box,         label: 'Dikemas'        },
      dikirim:             { color: 'bg-orange-600', icon: Truck,       label: 'Dikirim'        },
      siap_diambil:        { color: 'bg-teal-600',   icon: Store,       label: 'Siap Diambil'   },
      selesai:             { color: 'bg-green-600',  icon: CheckCircle, label: 'Selesai'        },
      ditolak:             { color: 'bg-red-600',    icon: XCircle,     label: 'Ditolak'        },
    };
    const config = configs[status] ?? { color: 'bg-gray-500', icon: Clock, label: status };
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const isNewOrder = (status: string) =>
    status === 'menunggu_pembayaran' || status === 'pembayaran_lunas';

  const getNextAction = (order: any): { label: string; status: string } | null => {
    if (isNewOrder(order.status_pesanan)) return null;

    if (order.delivery_method === 'delivery') {
      const actions: Record<string, { label: string; status: string }> = {
        diproses: { label: 'Mulai Packing', status: 'dikemas' },
        dikemas:  { label: 'Kirim Pesanan', status: 'dikirim' },
        dikirim:  { label: 'Selesaikan',    status: 'selesai' },
      };
      return actions[order.status_pesanan] ?? null;
    } else {
      const actions: Record<string, { label: string; status: string }> = {
        diproses:     { label: 'Mulai Packing', status: 'dikemas'      },
        dikemas:      { label: 'Siap Diambil',  status: 'siap_diambil' },
        siap_diambil: { label: 'Selesaikan',    status: 'selesai'      },
      };
      return actions[order.status_pesanan] ?? null;
    }
  };

  const getProgressSteps = (order: any): string[] => {
    if (order.delivery_method === 'delivery')
      return ['menunggu_pembayaran', 'diproses', 'dikemas', 'dikirim', 'selesai'];
    return ['menunggu_pembayaran', 'diproses', 'dikemas', 'siap_diambil', 'selesai'];
  };

  const filteredOrders = orders.filter((order: any) => {
    if (filterStatus !== 'all' && order.status_pesanan !== filterStatus) return false;
    if (filterMethod !== 'all' && order.delivery_method !== filterMethod) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Kelola pesanan cabang dan update status pengiriman</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="menunggu_pembayaran">Menunggu Bayar</SelectItem>
              <SelectItem value="pembayaran_lunas">Lunas</SelectItem>
              <SelectItem value="diproses">Dikonfirmasi</SelectItem>
              <SelectItem value="dikemas">Dikemas</SelectItem>
              <SelectItem value="dikirim">Dikirim</SelectItem>
              <SelectItem value="siap_diambil">Siap Diambil</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="Metode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="pick_up">Pick Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>Tidak ada pesanan aktif yang ditemukan.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order: any) => {
          const nextAction   = getNextAction(order);
          const steps        = getProgressSteps(order);
          const currentIdx   = steps.indexOf(order.status_pesanan);
          const items: any[] = order.detail_pesanan || [];
          const isNew        = isNewOrder(order.status_pesanan);
          const isLoading    = submittingId === order.id;
          const showReject   = rejectOpenId === order.id;

          const phoneNumber   = order.no_whatsapp || order.users?.no_telepon || '-';
          const recipientName = order.nama_penerima || order.users?.nama_lengkap || 'Pelanggan';

          return (
            <Card
              key={order.id}
              className={`border-2 shadow-sm transition-all ${
                isNew ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-200'
              }`}
            >
              <CardHeader className={`border-b ${isNew ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="text-lg">#{order.no_invoice}</CardTitle>
                    {getStatusBadge(order.status_pesanan)}
                    {isNew && (
                      <Badge className="bg-yellow-400 text-yellow-900 animate-pulse text-xs">
                        🔔 Pesanan Baru
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* ── Kolom 1: Penerima + Item ── */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Penerima</p>
                      <p className="font-bold text-gray-900">{recipientName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 shrink-0" />
                        <a
                          href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-600 hover:underline transition-colors"
                        >
                          {phoneNumber}
                        </a>
                      </div>
                      {order.delivery_method === 'delivery' && order.alamat_pengiriman && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{order.alamat_pengiriman}</span>
                        </div>
                      )}
                      {order.catatan && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 border border-dashed">
                          📝 {order.catatan}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Package className="h-3 w-3" /> Item Pesanan
                      </p>
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Tidak ada data item</p>
                      ) : (
                        <div className="space-y-1.5">
                          {items.map((item: any, idx: number) => (
                            <div
                              key={item.id ?? idx}
                              className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="h-5 w-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {item.qty}
                                </span>
                                <span className="font-medium text-gray-800 truncate">{item.nama_produk}</span>
                              </div>
                              <span className="text-gray-600 text-xs shrink-0 ml-2">
                                {formatPrice(item.total_harga)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Kolom 2: Pembayaran ── */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pembayaran</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700 capitalize">
                          {order.pembayaran?.metode_bayar || order.metode_pembayaran || 'cod'}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={order.delivery_method === 'delivery'
                          ? 'text-orange-600 border-orange-200 bg-orange-50'
                          : 'text-green-600 border-green-200 bg-green-50'}
                      >
                        {order.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Pick Up'}
                      </Badge>
                      <div className="pt-2">
                        <p className="text-xs text-gray-400">Total Tagihan</p>
                        <p className="text-xl font-black text-green-700">{formatPrice(order.total_bayar)}</p>
                      </div>
                    </div>

                    {order.status_pesanan === 'ditolak' && order.alasan_penolakan && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Alasan Penolakan</p>
                        <p className="text-sm text-red-700">{order.alasan_penolakan}</p>
                      </div>
                    )}
                  </div>

                  {/* ── Kolom 3: Kendali ── */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kendali Pesanan</p>

                    {/* PESANAN BARU */}
                    {isNew && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700 font-bold py-5 text-sm shadow-md disabled:opacity-60"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isLoading && !showReject ? 'Memproses...' : 'Terima Pesanan'}
                        </Button>

                        <Button
                          onClick={() => {
                            setRejectOpenId(showReject ? null : order.id);
                            setRejectReason('');
                          }}
                          disabled={isLoading}
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-bold py-5 text-sm flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak Pesanan
                          {showReject
                            ? <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                            : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
                        </Button>

                        {/* Form inline alasan penolakan */}
                        {showReject && (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <p className="text-xs font-semibold">Tulis alasan penolakan untuk pelanggan</p>
                            </div>
                            <textarea
                              rows={3}
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Contoh: Stok habis, area di luar jangkauan pengiriman, dll."
                              className="w-full text-sm rounded-lg border border-red-200 bg-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-gray-400"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setRejectOpenId(null); setRejectReason(''); }}
                                disabled={isLoading}
                                className="flex-1 text-xs"
                              >
                                Batal
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectOrder(order.id)}
                                disabled={isLoading || !rejectReason.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-60"
                              >
                                {isLoading ? 'Memproses...' : 'Konfirmasi Tolak'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PESANAN SUDAH DITERIMA */}
                    {!isNew && nextAction && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, nextAction.status)}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 font-bold py-6 text-md shadow-md disabled:opacity-60"
                      >
                        {isLoading ? 'Memproses...' : nextAction.label}
                      </Button>
                    )}

                    {/* SELESAI / DITOLAK */}
                    {!isNew && !nextAction && (
                      <div className={`flex items-center justify-center h-12 rounded-lg text-sm font-medium ${
                        order.status_pesanan === 'selesai'
                          ? 'bg-green-50 text-green-600 border border-green-200'
                          : order.status_pesanan === 'ditolak'
                          ? 'bg-red-50 text-red-500 border border-red-200'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {order.status_pesanan === 'selesai' && '✓ Pesanan selesai'}
                        {order.status_pesanan === 'ditolak' && '✕ Pesanan ditolak'}
                        {order.status_pesanan !== 'selesai' && order.status_pesanan !== 'ditolak' && 'Menunggu tindakan'}
                      </div>
                    )}

                    {/* Progress bar */}
                    {order.status_pesanan !== 'ditolak' && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                        <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase">Progress</p>
                        <div className="flex items-center w-full">
                          {steps.map((step, i) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                                i <= currentIdx ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              {i !== steps.length - 1 && (
                                <div className={`h-[2px] flex-1 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-300'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                          {steps[currentIdx]?.replace(/_/g, ' ') ?? '-'}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}