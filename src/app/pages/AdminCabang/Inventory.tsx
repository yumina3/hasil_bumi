import { useState } from "react";
import {
  Package,
  AlertTriangle,
  Edit,
  Save,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useAdminCabangData } from "../../context/AdminCabangContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { supabase } from "../../../../utils/supabase/info";
import { toast } from "sonner";

export function AdminCabangInventory() {
  const { inventory, setInventory, lowStockItems } = useAdminCabangData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price ?? 0);
  };

  const handleEditStart = (item: any) => {
    setEditingId(item.id);
    setEditStock(item.jumlah_stok);
  };

  const handleSaveStock = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from("stok")
        .update({ jumlah_stok: editStock })
        .eq("id", itemId);

      if (error) throw error;

      setInventory((prev) =>
        prev.map((p) =>
          p.id === itemId ? { ...p, jumlah_stok: editStock } : p,
        ),
      );
      setEditingId(null);
      toast.success("Stok berhasil diupdate");
    } catch (err: any) {
      toast.error("Gagal update stok: " + err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditStock(0);
  };

  const handleQuickAdjust = async (
    itemId: number,
    currentStock: number,
    amount: number,
  ) => {
    const newStock = Math.max(0, currentStock + amount);
    try {
      const { error } = await supabase
        .from("stok")
        .update({ jumlah_stok: newStock })
        .eq("id", itemId);

      if (error) throw error;

      setInventory((prev) =>
        prev.map((p) =>
          p.id === itemId ? { ...p, jumlah_stok: newStock } : p,
        ),
      );
      toast.success(
        amount > 0 ? `+${amount} unit ditambahkan` : `${amount} unit dikurangi`,
      );
    } catch (err: any) {
      toast.error("Gagal update stok: " + err.message);
    }
  };

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const stok = item.jumlah_stok ?? 0;
    const threshold = item.threshold_stok ?? 0;
    if (filterStatus === "low" && !(stok > 0 && stok <= threshold))
      return false;
    if (filterStatus === "out" && stok !== 0) return false;
    if (filterStatus === "ok" && stok <= threshold) return false;
    return true;
  });

  // Stats
  const totalStock = inventory.reduce(
    (sum, p) => sum + (p.jumlah_stok ?? 0),
    0,
  );
  const outOfStock = inventory.filter((p) => (p.jumlah_stok ?? 0) === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Control</h2>
        <p className="text-gray-600">Kelola stok produk di cabang Anda</p>
      </div>

      {/* Alerts */}
      {lowStockItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">
            LOW STOCK ALERT!
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <strong>{lowStockItems} produk</strong> memiliki stok di bawah
            threshold. Segera lakukan restock!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">
                  Total Stok
                </p>
                <p className="text-3xl font-bold text-blue-900">{totalStock}</p>
                <p className="text-xs text-blue-600 mt-1">Unit tersedia</p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-semibold">
                  Stok Rendah
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {lowStockItems}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Di bawah threshold
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-semibold">Habis Stok</p>
                <p className="text-3xl font-bold text-red-900">{outOfStock}</p>
                <p className="text-xs text-red-600 mt-1">Perlu restock</p>
              </div>
              <X className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status Stok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="ok">Stok Cukup</SelectItem>
            <SelectItem value="low">Stok Rendah</SelectItem>
            <SelectItem value="out">Habis Stok</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Alert className="bg-blue-50 border-blue-200 py-2 px-4">
            <AlertDescription className="text-blue-700 text-sm">
              <strong>Info:</strong> Untuk edit harga, hubungi Admin Pusat.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-3">SKU</th>
                  <th className="text-left py-4 px-3">Nama Produk</th>
                  <th className="text-right py-4 px-3">Harga (Read-Only)</th>
                  <th className="text-center py-4 px-3">Stok Saat Ini</th>
                  <th className="text-center py-4 px-3">Min Stok</th>
                  <th className="text-center py-4 px-3">Status</th>
                  <th className="text-center py-4 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isEditing = editingId === item.id;
                  const stok = item.jumlah_stok ?? 0;
                  const threshold = item.threshold_stok ?? 0;
                  const stockStatus =
                    stok === 0 ? "out" : stok <= threshold ? "low" : "ok";

                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {item.produk?.sku || "-"}
                        </code>
                      </td>
                      <td className="py-4 px-3">
                        <p className="font-medium">
                          {item.produk?.nama_produk || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="font-semibold text-gray-500">
                          {formatPrice(item.produk?.harga_jual ?? 0)}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditStock(Math.max(0, editStock - 10))
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={editStock}
                              onChange={(e) =>
                                setEditStock(Number(e.target.value))
                              }
                              className="w-20 h-9 text-center"
                              min="0"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditStock(editStock + 10)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-lg">{stok}</span>
                            <span className="text-gray-500 text-sm ml-1">
                              {item.produk?.satuan}
                            </span>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleQuickAdjust(item.id, stok, -5)
                                }
                                className="h-7 px-2"
                              >
                                -5
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleQuickAdjust(item.id, stok, 5)
                                }
                                className="h-7 px-2"
                              >
                                +5
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleQuickAdjust(item.id, stok, 10)
                                }
                                className="h-7 px-2"
                              >
                                +10
                              </Button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3 text-center text-gray-600">
                        {threshold}
                      </td>
                      <td className="py-4 px-3 text-center">
                        {stockStatus === "out" && (
                          <Badge className="bg-red-600">Habis</Badge>
                        )}
                        {stockStatus === "low" && (
                          <Badge className="bg-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                        {stockStatus === "ok" && (
                          <Badge className="bg-green-600">Baik</Badge>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex gap-2 justify-center">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveStock(item.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStart(item)}
                            >
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
            {filteredInventory.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Tidak ada data inventory.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}