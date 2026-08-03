# 🧪 TESTING FLOWS - STEP BY STEP GUIDE

Panduan detail untuk mengikuti setiap flow dan melihat semua desain yang sudah dibuat.

---

## 🚀 PERSIAPAN

1. **Jalankan aplikasi:**
   ```bash
   npm install
   npm run dev
   ```

2. **Buka browser:**
   ```
   http://localhost:5173
   ```

3. **Siapkan:**
   - Screenshot tool (jika perlu)
   - Notepad untuk catat hasil
   - Browser dalam mode normal (100% zoom)

---

# 📋 FLOW 1: ADMIN PUSAT (2 Menit)

## ✅ Step 1: Login

### URL:
```
http://localhost:5173/login
```

### Aksi:
1. **Isi Email:**
   - Klik input field "Email"
   - Ketik: `admin@hasilbumi.com`

2. **Isi Password:**
   - Klik input field "Password"
   - Ketik: `admin123`

3. **Klik tombol:**
   - Tombol hijau "Masuk"

### Expected Result:
```
✓ Redirect otomatis ke: http://localhost:5173/admin-pusat
✓ Muncul sidebar kiri dengan logo "Hasil Bumi"
✓ Header: "Admin Pusat"
✓ User info di sidebar: "Admin Pusat" + email + badge "Super Admin"
```

### Screenshot Guide:
```
┌────────────────────────────────────────────────────┐
│ LOGIN PAGE                                         │
├────────────────────────────────────────────────────┤
│                                                    │
│           [Logo Hasil Bumi]                        │
│                                                    │
│           Selamat Datang                           │
│           Login ke akun Anda                       │
│                                                    │
│     Email: [admin@hasilbumi.com     ]             │
│     Password: [admin123             ]             │
│                                                    │
│           [  Masuk  ] ← KLIK INI                  │
│                                                    │
│     Belum punya akun? [Daftar]                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## ✅ Step 2: Dashboard - Lihat Stats

### URL (Auto):
```
http://localhost:5173/admin-pusat
```

### Yang Harus Dilihat:

#### A. Header Section
```
Selamat Datang, Admin Pusat!
Ringkasan seluruh operasional Hasil Bumi
```

#### B. Alert Banner (Jika ada low stock)
```
┌────────────────────────────────────────────────────┐
│ ⚠️ Peringatan Stok Rendah!                         │
│ 5 produk memiliki stok di bawah 25 unit di         │
│ beberapa cabang. Segera koordinasikan restock.     │
└────────────────────────────────────────────────────┘
```

#### C. 4 Stats Cards (Row 1)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Cabang │ Total Produk │ Total Stok   │ Revenue      │
│              │              │              │              │
│     3        │     24       │   1,247      │  Rp 125M     │
│              │              │              │              │
│ Aktif        │ SKU terdaftar│ Unit di      │ +15.3%       │
│ beroperasi   │              │ semua cabang │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### D. Status Cabang (Card kiri bawah)
```
┌─────────────────────────────────────┐
│ 🏪 Status Cabang                    │
├─────────────────────────────────────┤
│ Jakarta Pusat        [Aktif]        │
│ Jakarta Pusat                       │
│                                     │
│ Jakarta Selatan      [Aktif]        │
│ Jakarta Selatan                     │
│                                     │
│ Tangerang           [Aktif]         │
│ Tangerang                           │
└─────────────────────────────────────┘
```

#### E. Produk Stok Rendah (Card kanan bawah)
```
┌─────────────────────────────────────┐
│ ⚠️ Produk Stok Rendah               │
├─────────────────────────────────────┤
│ Bayam Organik        [2 cabang]     │
│ SKU: VG-BAYAM-001                   │
│                                     │
│ Wortel Premium       [1 cabang]     │
│ SKU: VG-WORTEL-001                  │
└─────────────────────────────────────┘
```

### Aksi:
**TIDAK ADA - Hanya lihat dan catat**

---

## ✅ Step 3: Products - Edit Harga Bayam

### Aksi:
1. **Klik menu "Kelola Produk" di sidebar kiri**

### URL (Auto):
```
http://localhost:5173/admin-pusat/products
```

### Yang Harus Dilihat:

#### A. Header
```
Kelola Produk & Harga
Atur harga dan informasi produk untuk semua cabang
```

#### B. Info Banner
```
┌────────────────────────────────────────────────────┐
│ ℹ️ Catatan: Perubahan harga akan berlaku untuk    │
│ SEMUA CABANG. Admin Cabang hanya dapat mengelola  │
│ stok di cabang masing-masing.                     │
└────────────────────────────────────────────────────┘
```

#### C. Table Produk
```
┌─────────────┬───────────────┬──────────┬──────────┬───────────┬────────┬──────┐
│ SKU         │ Nama Produk   │ Kategori │ Harga    │ Total Stok│ Status │ Aksi │
├─────────────┼───────────────┼──────────┼──────────┼───────────┼────────┼──────┤
│ VG-BAYAM-001│ Bayam Organik │ Sayuran  │ Rp 15.000│ 150 kg    │ ✓ Baik │ [✏️] │ ← INI!
│             │ [Perishable]  │          │          │           │        │      │
├─────────────┼───────────────┼──────────┼──────────┼───────────┼────────┼──────┤
│ VG-WORTEL...│ Wortel Premium│ Sayuran  │ Rp 30.000│ 280 kg    │⚠️ Low  │ [✏️] │
└─────────────┴───────────────┴──────────┴──────────┴───────────┴────────┴──────┘
```

### Aksi Edit Harga:

1. **Cari row "Bayam Organik"** (row pertama)

2. **Klik tombol ✏️ (Edit)** di kolom "Aksi"

3. **Form inline muncul:**
   ```
   ┌─────────────┬──────────────────┬──────────┬──────────┬───────────┬────────┬──────┐
   │ VG-BAYAM-001│ [Bayam Organik] │[Sayuran] │ [15000]  │ 150 kg    │ ✓ Baik │ [✓][✗]│
   │             │                  │          │    ↑     │           │        │      │
   │             │                  │          │   EDIT   │           │        │      │
   └─────────────┴──────────────────┴──────────┴──────────┴───────────┴────────┴──────┘
   ```

4. **Ubah harga:**
   - Klik input "Harga" (value: 15000)
   - Hapus angka lama
   - Ketik: `16000` (naikkan Rp 1.000)

5. **Klik tombol ✓ (Save)** warna hijau

### Expected Result:
```
✓ Toast notification muncul: "✓ Produk berhasil diupdate!"
✓ Row Bayam kembali ke mode view
✓ Harga berubah dari Rp 15.000 → Rp 16.000
✓ Tombol ✏️ muncul kembali
```

---

## ✅ Step 4: Branches - Lihat Stok Jakarta Pusat

### Aksi:
1. **Klik menu "Monitor Cabang" di sidebar kiri**

### URL (Auto):
```
http://localhost:5173/admin-pusat/branches
```

### Yang Harus Dilihat:

#### A. Header
```
Monitor Cabang
Pantau stok dan operasional setiap cabang
```

#### B. Grid Cabang (2 kolom)

**Card Jakarta Pusat:**
```
┌─────────────────────────────────────────────────────┐
│ 🏪 Jakarta Pusat                      [Aktif]       │
│ Jl. Sudirman No. 123, Jakarta Pusat                 │
├─────────────────────────────────────────────────────┤
│ 📍 Jl. Sudirman No. 123                             │
│    Jakarta Pusat, 10220                             │
│ ☎️  (021) 1234-5678                                 │
│ 🕐 08:00 - 20:00                                    │
├─────────────────────────────────────────────────────┤
│ [Total Stok: 485] [Low Stock: 3] [Habis: 0]       │
├─────────────────────────────────────────────────────┤
│ ⚠️ 3 produk di bawah 25 unit                        │
├─────────────────────────────────────────────────────┤
│ Detail Stok Produk:                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ • Bayam Organik: 45 kg            ✓             │ │
│ │ • Wortel Premium: 20 kg           ⚠️ LOW        │ │
│ │ • Tomat Segar: 35 kg              ✓             │ │
│ │ • Kangkung Fresh: 50 kg           ✓             │ │
│ │ • Brokoli Segar: 18 kg            ⚠️ LOW        │ │
│ │ ... (scroll untuk lihat semua)                  │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Card Jakarta Selatan:**
```
┌─────────────────────────────────────────────────────┐
│ 🏪 Jakarta Selatan                    [Aktif]       │
│ Jl. Fatmawati No. 88, Jakarta Selatan               │
│ ... (info similar)                                  │
└─────────────────────────────────────────────────────┘
```

**Card Tangerang:**
```
┌─────────────────────────────────────────────────────┐
│ 🏪 Tangerang                          [Aktif]       │
│ Jl. BSD Raya No. 45, Tangerang                      │
│ ... (info similar)                                  │
└─────────────────────────────────────────────────────┘
```

### Aksi:
1. **Scroll ke bawah untuk lihat detail stok produk di Jakarta Pusat**
2. **Catat produk mana yang low stock (warna orange)**
3. **Catat produk mana yang habis (warna merah, jika ada)**

---

## ✅ Step 5: Analytics - Lihat Top Products

### Aksi:
1. **Klik menu "Analytics" di sidebar kiri**

### URL (Auto):
```
http://localhost:5173/admin-pusat/analytics
```

### Yang Harus Dilihat:

#### A. Header
```
Analytics & Reports
Analisis performa penjualan dan tren produk
```

#### B. 3 Summary Cards
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Total Sales      │ Total Orders     │ Avg Order Value  │
│ (Bulan Ini)      │                  │                  │
│                  │                  │                  │
│ Rp 65M           │ 3,456            │ Rp 188K          │
│ +15.3% ↗         │ +8.2% ↗          │ +6.5% ↗          │
└──────────────────┴──────────────────┴──────────────────┘
```

#### C. Tren Penjualan (Card kiri)
```
┌─────────────────────────────────────────────┐
│ 📊 Tren Penjualan (4 Bulan Terakhir)       │
├─────────────────────────────────────────────┤
│ Jan 2026  Rp 45M  [████████████     ]      │
│ Feb 2026  Rp 52M  [██████████████   ]      │
│ Mar 2026  Rp 48M  [█████████████    ]      │
│ Apr 2026  Rp 65M  [████████████████ ] ← MAX│
└─────────────────────────────────────────────┘
```

#### D. Top 5 Produk (Card kanan) ← **FOKUS DI SINI**
```
┌─────────────────────────────────────────────┐
│ 📦 Top 5 Produk Terlaris                    │
├─────────────────────────────────────────────┤
│ [1] Bayam Organik                           │
│     1,250 unit terjual      Rp 18.750.000   │
│                                             │
│ [2] Wortel Premium                          │
│     980 unit terjual        Rp 29.400.000   │
│                                             │
│ [3] Tomat Segar                             │
│     875 unit terjual        Rp 21.875.000   │
│                                             │
│ [4] Kangkung Fresh                          │
│     1,450 unit terjual      Rp 14.500.000   │
│                                             │
│ [5] Brokoli Segar                           │
│     650 unit terjual        Rp 19.500.000   │
└─────────────────────────────────────────────┘
```

### Aksi:
**TIDAK ADA - Hanya lihat dan catat top 5 produk**

---

## ✅ Step 6: Logout

### Aksi:
1. **Scroll ke bawah sidebar**
2. **Klik tombol "Logout"** (warna merah dengan icon 🚪)

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/login
✓ Session cleared
✓ Tidak bisa akses /admin-pusat tanpa login lagi
```

---

# 📋 FLOW 2: ADMIN CABANG (3 Menit)

## ✅ Step 1: Login

### URL:
```
http://localhost:5173/login
```

### Aksi:
1. **Isi Email:** `jakarta.pusat@hasilbumi.com`
2. **Isi Password:** `admin123`
3. **Klik "Masuk"**

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/admin-cabang
✓ Sidebar muncul dengan info:
  - User: "Admin Jakarta Pusat"
  - Branch: "Jakarta Pusat"
  - Badge: "Store Operator" (warna biru)
  - Info cabang: Alamat, Telp, Jam buka
  - Stats: Stok Rendah, Pesanan Baru, Delivery Hari Ini
```

---

## ✅ Step 2: Dashboard - Klik "Kelola Pesanan"

### URL (Auto):
```
http://localhost:5173/admin-cabang
```

### Yang Harus Dilihat:

#### A. Alert Banners (Jika ada)
```
┌────────────────────────────────────────────────────┐
│ ⚠️ LOW STOCK ALERT!                                │
│ 5 produk memiliki stok di bawah 25 unit.          │
│ Segera lakukan restock untuk menghindari habis!   │
└────────────────────────────────────────────────────┘
```

#### B. 4 Stats Cards
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ ⚠️ Stok Rendah│ 🆕 Pesanan  │ 🚚 Delivery  │ 📦 Total    │
│              │    Baru      │   Hari Ini   │   Produk    │
│              │              │              │             │
│      5       │      3       │    2/100     │     24      │
│              │              │              │             │
│ Produk < 25  │ Perlu        │ Kuota harian │ SKU tersedia│
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### C. Quick Actions ← **FOKUS DI SINI**
```
┌───────────────────────────────────────────────┐
│ [🛒 Kelola Pesanan]  ← KLIK INI               │
│  Proses pesanan masuk                         │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│ [📦 Kelola Stok]                              │
│  Update inventory                             │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│ [🕐 Lihat History]                            │
│  Riwayat pesanan                              │
└───────────────────────────────────────────────┘
```

### Aksi:
1. **Klik card "🛒 Kelola Pesanan"**

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/admin-cabang/orders
```

---

## ✅ Step 3: Orders - Konfirmasi Pesanan Baru

### URL (Auto):
```
http://localhost:5173/admin-cabang/orders
```

### Yang Harus Dilihat:

#### A. Header
```
Order Management
Kelola pesanan masuk dan update status
```

#### B. Filters
```
[Filter Status ▼]  [Filter Method ▼]
```

#### C. Order Cards

**Pesanan dengan Status "new":**
```
┌─────────────────────────────────────────────────────────┐
│ Order #HB1734258960123                                  │
│ 2026-04-16 10:30 • [⏰ Pesanan Baru] [🚚 Delivery]     │
├─────────────────────────────────────────────────────────┤
│ INFORMASI PELANGGAN                                     │
│ John Doe                                                │
│ 📞 081234567890                                         │
│ 📍 Jl. Merdeka No. 45, Jakarta Pusat                    │
│ 💳 QRIS                                                 │
│                                                         │
│ DETAIL PESANAN                                          │
│ • Bayam Organik (VG-BAYAM-001)                         │
│   2x Rp 15.000                                          │
│ • Tomat Segar (VG-TOMAT-001)                           │
│   1x Rp 25.000                                          │
│ ───────────────────────────                            │
│ TOTAL: Rp 70.000                                        │
│                                                         │
│ AKSI                                                    │
│ [  Konfirmasi Pesanan  ] ← KLIK INI                    │
│                                                         │
│ Timeline Status:                                        │
│ • Pesanan Baru                                          │
│ ○ Dikonfirmasi                                          │
│ ○ Dikemas                                               │
│ ○ Dikirim                                               │
│ ○ Selesai                                               │
└─────────────────────────────────────────────────────────┘
```

### Aksi:
1. **Cari order dengan status badge kuning "⏰ Pesanan Baru"**
2. **Klik tombol hijau "Konfirmasi Pesanan"**

### Expected Result:
```
✓ Toast: "✓ Pesanan dikonfirmasi"
✓ Status badge berubah: [⏰ Pesanan Baru] → [✓ Dikonfirmasi] (biru)
✓ Tombol berubah: "Konfirmasi Pesanan" → "Mulai Packing"
✓ Timeline: ● Pesanan Baru, ● Dikonfirmasi, ○ Dikemas, ...
```

---

## ✅ Step 4: Orders - Update Status → Packing → Kirim → Selesai

### Aksi Sequence:

#### A. Mulai Packing
1. **Klik tombol "Mulai Packing"** pada order yang sudah dikonfirmasi

**Expected Result:**
```
✓ Toast: "📦 Pesanan sedang dikemas"
✓ Status badge → [📦 Dikemas] (ungu)
✓ Tombol → "Kirim Pesanan" (untuk delivery) atau "Siap Diambil" (untuk pickup)
✓ Timeline: ● ● ● ○ ○
```

#### B. Kirim Pesanan (Untuk Delivery)
1. **Klik tombol "Kirim Pesanan"**

**Expected Result:**
```
✓ Toast: "🚚 Pesanan sedang dikirim"
✓ Status badge → [🚚 Dikirim] (orange)
✓ Alert box muncul:
  ┌───────────────────────────────────┐
  │ 🚚 Sedang Dikirim                 │
  │ Estimasi tiba: 14:30              │
  └───────────────────────────────────┘
✓ Tombol → "Selesaikan Pesanan"
✓ Timeline: ● ● ● ● ○
```

#### C. Selesaikan Pesanan
1. **Klik tombol "Selesaikan Pesanan"**

**Expected Result:**
```
✓ Toast: "🎉 Pesanan selesai"
✓ Order HILANG dari halaman Orders
✓ Order PINDAH ke halaman History (auto)
```

---

## ✅ Step 5: History - Lihat Pesanan Completed

### Aksi:
1. **Klik menu "History Pesanan" di sidebar**

### URL (Auto):
```
http://localhost:5173/admin-cabang/history
```

### Yang Harus Dilihat:

#### A. Summary Stats
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Pesanan│ Total Revenue│ Delivery     │ Pick Up      │
│              │              │              │              │
│      4       │  Rp 465.000  │      3       │      1       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### B. Filters
```
[Filter Method ▼]  [Filter Payment ▼]

Menampilkan 4 dari 4 pesanan
```

#### C. Order History Cards

**Order yang baru saja di-completed:**
```
┌─────────────────────────────────────────────────────────┐
│ Order #HB1734258960123                    Rp 70.000     │
│ 📅 2026-04-16 10:30 • [✓ Selesai] [🚚 Delivery]        │
├─────────────────────────────────────────────────────────┤
│ INFORMASI PELANGGAN                                     │
│ John Doe                                                │
│ 📞 081234567890                                         │
│ 📍 Jl. Merdeka No. 45, Jakarta Pusat                    │
│ 💳 QRIS                                                 │
│                                                         │
│ DETAIL PESANAN                                          │
│ • Bayam Organik    2x Rp 15.000    Rp 30.000          │
│ • Tomat Segar      1x Rp 25.000    Rp 25.000          │
└─────────────────────────────────────────────────────────┘
```

### Aksi:
1. **Cari order dengan ID yang baru saja di-complete**
2. **Verifikasi ada di History (bukan di Orders lagi)**

---

## ✅ Step 6: Inventory - Edit Stok Bayam +10

### Aksi:
1. **Klik menu "Inventory Control" di sidebar**

### URL (Auto):
```
http://localhost:5173/admin-cabang/inventory
```

### Yang Harus Dilihat:

#### A. Alert (Jika ada low stock)
```
┌────────────────────────────────────────────────────┐
│ ⚠️ LOW STOCK ALERT!                                │
│ 5 produk memiliki stok di bawah 25 unit.          │
│ Segera lakukan restock!                           │
└────────────────────────────────────────────────────┘
```

#### B. Summary Stats
```
┌──────────────┬──────────────┬──────────────┐
│ Total Stok   │ Stok Rendah  │ Habis Stok   │
│              │              │              │
│     485      │      5       │      0       │
└──────────────┴──────────────┴──────────────┘
```

#### C. Table Inventory

**Cari row "Bayam Organik":**
```
┌──────────┬─────────────┬─────────┬───────────┬──────────┬────────┬──────┐
│ SKU      │ Nama Produk │ Kategori│ Harga     │ Stok     │ Status │ Aksi │
├──────────┼─────────────┼─────────┼───────────┼──────────┼────────┼──────┤
│VG-BAYAM  │ Bayam       │ Sayuran │ Rp 15.000 │   45 kg  │ ✓ Baik │ [✏️] │
│-001      │ Organik     │         │ (R/O)     │          │        │      │
│          │[Perishable] │         │           │ [-5][+5] │        │      │
│          │             │         │           │ [+10]    │        │      │
└──────────┴─────────────┴─────────┴───────────┴──────────┴────────┴──────┘
                                                    ↑
                                             QUICK ADJUST
```

### Aksi Edit Stok:

**OPSI 1: Quick Adjust**
1. **Klik tombol "+10"** di bawah stok
2. **Otomatis langsung update**

**Expected Result:**
```
✓ Toast: "+10 unit ditambahkan"
✓ Stok berubah: 45 kg → 55 kg
✓ TIDAK perlu klik Save
```

**OPSI 2: Edit Manual**
1. **Klik tombol ✏️ (Edit)**
2. **Form inline muncul:**
   ```
   ┌──────┬────────┬─────┬────────┬─────────────────┬────────┬──────┐
   │VG... │ Bayam  │ ... │Rp 15.000│ [-][45][+]     │ ✓ Baik │[✓][✗]│
   │      │        │     │         │                 │        │      │
   │      │        │     │         │ ← Input manual │        │      │
   └──────┴────────┴─────┴────────┴─────────────────┴────────┴──────┘
   ```

3. **Ubah angka:**
   - Klik input (value: 45)
   - Ketik: `55` (tambah 10)
   - **ATAU** klik tombol [+] 10 kali

4. **Klik tombol ✓ (Save)**

**Expected Result:**
```
✓ Toast: "Stock berhasil diupdate"
✓ Row kembali ke mode view
✓ Stok: 55 kg
✓ Tombol ✏️ muncul lagi
```

---

## ✅ Step 7: Logout

### Aksi:
1. **Scroll sidebar ke bawah**
2. **Klik tombol "Logout"** (merah)

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/login
✓ Session cleared
```

---

# 📋 FLOW 3: PELANGGAN (5 Menit)

## ✅ Step 1: Home - Klik "Lihat Produk"

### URL (Auto saat buka browser):
```
http://localhost:5173/
```

### Yang Harus Dilihat:

#### A. Hero Banner
```
┌────────────────────────────────────────────────────┐
│                                                    │
│          🌿 HASIL BUMI 🌿                          │
│                                                    │
│     Sayuran & Buah Segar Langsung dari Kebun       │
│                                                    │
│     [  Lihat Semua Produk  ]  ← KLIK INI          │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### B. Pilihan Cabang (3 Cards)
```
┌───────────────┬───────────────┬───────────────┐
│ 🏪 Jakarta    │ 🏪 Jakarta    │ 🏪 Tangerang  │
│    Pusat      │    Selatan    │               │
│               │               │               │
│ Jl. Sudirman  │ Jl. Fatmawati │ Jl. BSD Raya  │
│ ...           │ ...           │ ...           │
└───────────────┴───────────────┴───────────────┘
```

#### C. Kategori Produk (Grid)
```
┌───────────┬───────────┬───────────┬───────────┐
│ 🥬 Sayuran│ 🍎 Buah   │ 🧄 Bumbu  │ 🥩 Protein│
└───────────┴───────────┴───────────┴───────────┘
```

### Aksi:
1. **Klik tombol "Lihat Semua Produk"** (hijau besar di hero)

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/products
```

---

## ✅ Step 2: Products - Pilih Cabang "Jakarta Pusat"

### URL (Auto):
```
http://localhost:5173/products
```

### Yang Harus Dilihat:

#### A. Header dengan Filter
```
Produk Kami
Pilih cabang untuk melihat ketersediaan stok

[Pilih Cabang ▼]  [Kategori ▼]  [🔍 Cari...]
```

#### B. Dropdown Cabang (BELUM dipilih)
```
┌─────────────────────────────┐
│ Pilih Cabang ▼              │
└─────────────────────────────┘
```

### Aksi:
1. **Klik dropdown "Pilih Cabang"**
2. **Pilih "Jakarta Pusat"**

### Expected Result:
```
✓ Dropdown berubah: "Jakarta Pusat ▼"
✓ Grid produk muncul (24 produk)
✓ Setiap card produk punya badge stok
```

#### C. Grid Produk (Setelah pilih cabang)
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ [Foto Bayam]  │ [Foto Wortel] │ [Foto Tomat]  │ [Foto Kangkung│
│ Bayam Organik │ Wortel Premium│ Tomat Segar   │ Kangkung Fresh│
│ Rp 15.000/kg  │ Rp 30.000/kg  │ Rp 25.000/kg  │ Rp 10.000/ikat│
│ Stok: 45 kg   │ Stok: 20 kg   │ Stok: 35 kg   │ Stok: 50 ikat │
│ ✓ Tersedia    │ ⚠️ Low Stock  │ ✓ Tersedia    │ ✓ Tersedia    │
│               │               │               │               │
│ [ Lihat ]     │ [ Lihat ]     │ [ Lihat ]     │ [ Lihat ]     │
└───────────────┴───────────────┴───────────────┴───────────────┘
      ↑
  KLIK INI (Bayam)
```

---

## ✅ Step 3: Klik Produk "Bayam Organik"

### Aksi:
1. **Klik card "Bayam Organik"** (atau tombol "Lihat")

### URL (Auto):
```
http://localhost:5173/product/1
```

### Yang Harus Dilihat:

#### A. Detail Produk Layout
```
┌─────────────────────────────────────────────────────┐
│ ← Kembali                                           │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────┐  │                              │
│ │                 │  │  Bayam Organik               │
│ │  [Foto Bayam]   │  │  SKU: VG-BAYAM-001          │
│ │                 │  │  Kategori: Sayuran           │
│ │  (Placeholder)  │  │  🌿 Perishable Product      │
│ │                 │  │                              │
│ │                 │  │  Rp 15.000 / kg              │
│ └─────────────────┘  │                              │
│                      │  Stok di Jakarta Pusat:      │
│                      │  45 kg tersedia ✓            │
│                      │                              │
│                      │  Deskripsi:                  │
│                      │  Bayam organik segar tanpa   │
│                      │  pestisida. Kaya akan zat    │
│                      │  besi dan vitamin...         │
│                      │                              │
│                      │  Quantity: [-] [1] [+]       │
│                      │                              │
│                      │  [ Tambah ke Keranjang ]     │
│                      │         ↑                    │
│                      │     KLIK INI                 │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Step 4: Add to Cart (Redirect ke Login)

### Aksi:
1. **Ubah quantity jika mau** (klik + untuk tambah)
2. **Klik tombol "Tambah ke Keranjang"** (hijau besar)

### Expected Result (Jika BELUM LOGIN):
```
✓ Redirect otomatis ke: http://localhost:5173/login
✓ Muncul halaman login
```

---

## ✅ Step 5: Login Customer

### URL (Auto):
```
http://localhost:5173/login
```

### Aksi:
1. **Isi Email:** `customer@example.com`
2. **Isi Password:** `customer123`
3. **Klik "Masuk"**

### Expected Result:
```
✓ Redirect ke halaman sebelumnya (product detail)
✓ Item langsung masuk keranjang
✓ Toast: "✓ Produk ditambahkan ke keranjang"
✓ Badge keranjang di navbar: (1)
```

---

## ✅ Step 6: Cart - Lanjut Checkout

### Aksi:
1. **Klik icon keranjang 🛒 di navbar** (top right)
   **ATAU** langsung ke URL:

### URL:
```
http://localhost:5173/cart
```

### Yang Harus Dilihat:

```
┌─────────────────────────────────────────────────────┐
│ Keranjang Belanja                                   │
├─────────────────────────────────────────────────────┤
│ Cabang: Jakarta Pusat                               │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Foto] Bayam Organik                            │ │
│ │        Rp 15.000 / kg                           │ │
│ │        Stok: 45 kg                              │ │
│ │        Qty: [-] [1] [+]  Subtotal: Rp 15.000   │ │
│ │        [🗑️ Hapus]                               │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Subtotal: Rp 15.000                                 │
│ Total: Rp 15.000                                    │
│                                                     │
│ [  Lanjut ke Checkout  ] ← KLIK INI                │
└─────────────────────────────────────────────────────┘
```

### Aksi:
1. **Klik tombol "Lanjut ke Checkout"** (hijau)

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/checkout
```

---

## ✅ Step 7: Checkout - Pilih Delivery & Alamat

### URL (Auto):
```
http://localhost:5173/checkout
```

### Yang Harus Dilihat:

```
┌─────────────────────────────────────────────────────┐
│ Checkout                                            │
├─────────────────────────────────────────────────────┤
│ RINGKASAN PESANAN                                   │
│ • Bayam Organik (1 kg)           Rp 15.000         │
│                                                     │
│ METODE PENGIRIMAN                                   │
│ ○ 🚚 Delivery (Ongkir: Rp 15.000) ← PILIH INI     │
│ ● 🏪 Pick Up In Store (Gratis)                     │
│                                                     │
│ ─────────────────────────────────────────────────── │
│ (Jika Delivery dipilih, form muncul:)              │
│                                                     │
│ ALAMAT PENGIRIMAN                                   │
│ Nama Lengkap: [John Doe                ]           │
│ No. Telepon:  [081234567890            ]           │
│ Alamat:       [Jl. Merdeka No. 45      ]           │
│ Kota:         [Jakarta Pusat           ]           │
│ Kode Pos:     [10110                   ]           │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ RINGKASAN BIAYA                                     │
│ Subtotal:        Rp 15.000                         │
│ Ongkir:          Rp 15.000                         │
│ ───────────────────────────                        │
│ Total:           Rp 30.000                         │
│                                                     │
│ [  Lanjut ke Pembayaran  ]                         │
└─────────────────────────────────────────────────────┘
```

### Aksi:
1. **Pilih "🚚 Delivery"** (radio button)
2. **Isi form alamat:**
   - Nama: `John Doe`
   - Telepon: `081234567890`
   - Alamat: `Jl. Merdeka No. 45`
   - Kota: `Jakarta Pusat`
   - Kode Pos: `10110`

3. **Klik "Lanjut ke Pembayaran"**

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/payment
✓ Data alamat tersimpan
```

---

## ✅ Step 8: Payment - QRIS - Bayar

### URL (Auto):
```
http://localhost:5173/payment
```

### Yang Harus Dilihat:

```
┌─────────────────────────────────────────────────────┐
│ Metode Pembayaran                                   │
├─────────────────────────────────────────────────────┤
│ PILIH METODE PEMBAYARAN                             │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💳 QRIS                              ○          │ │ ← KLIK
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🏦 Virtual Account                               │ │
│ │ [BCA] [Mandiri] [BNI]                ○          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💰 E-Wallet                                     │ │
│ │ [GoPay] [OVO] [Dana] [ShopeePay]    ○          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💵 COD (Cash on Delivery)           ○          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ RINGKASAN                                           │
│ Total Pembayaran: Rp 30.000                        │
│                                                     │
│ [      Bayar Sekarang      ] ← KLIK INI            │
└─────────────────────────────────────────────────────┘
```

### Aksi:
1. **Klik card "💳 QRIS"** (radio button tercentang)
2. **Klik tombol "Bayar Sekarang"** (hijau besar)

### Expected Result:
```
✓ Loading spinner muncul (2 detik)
✓ Mock payment processing
✓ Redirect ke: http://localhost:5173/order-success
```

---

## ✅ Step 9: Order Success - Lacak Pesanan

### URL (Auto):
```
http://localhost:5173/order-success
```

### Yang Harus Dilihat:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ✅ Pesanan Berhasil!                   │
│                                                     │
│     Terima kasih atas pesanan Anda!                │
│                                                     │
│ ───────────────────────────────────────────────── │
│                                                     │
│ Order ID: #HB1734258960123                         │
│ Total: Rp 30.000                                   │
│ Metode Pembayaran: QRIS                            │
│ Metode Pengiriman: Delivery                        │
│                                                     │
│ Estimasi Pengiriman: 30-60 menit                   │
│                                                     │
│ ───────────────────────────────────────────────── │
│                                                     │
│ [  Lacak Pesanan  ] ← KLIK INI                     │
│ [  Lihat Pesanan Saya  ]                           │
│ [  Kembali ke Beranda  ]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Aksi:
1. **Catat Order ID** (contoh: HB1734258960123)
2. **Klik tombol "Lacak Pesanan"**

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/order-tracking/HB1734258960123
```

---

## ✅ Step 10: Tracking - Lihat Timeline

### URL (Auto):
```
http://localhost:5173/order-tracking/HB1734258960123
```

### Yang Harus Dilihat:

```
┌─────────────────────────────────────────────────────┐
│ ← Kembali ke Pesanan Saya                          │
├─────────────────────────────────────────────────────┤
│ Tracking Pesanan                                    │
│ Order #HB1734258960123                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ STATUS PENGIRIMAN                                   │
│                                                     │
│ ● Pesanan Diterima                                 │
│   2026-04-16 10:30                                 │
│                                                     │
│ ○ Pesanan Dikonfirmasi                             │
│   Menunggu konfirmasi toko...                      │
│                                                     │
│ ○ Pesanan Dikemas                                  │
│   Belum dikemas                                    │
│                                                     │
│ ○ Pesanan Dikirim                                  │
│   Estimasi: 30-60 menit                            │
│                                                     │
│ ○ Pesanan Selesai                                  │
│   Belum selesai                                    │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ DETAIL PESANAN                                      │
│ • Bayam Organik (1 kg)           Rp 15.000         │
│ • Ongkir                          Rp 15.000         │
│ Total: Rp 30.000                                   │
│                                                     │
│ ALAMAT PENGIRIMAN                                   │
│ John Doe                                            │
│ 081234567890                                        │
│ Jl. Merdeka No. 45, Jakarta Pusat 10110            │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ [🏪 Hubungi Toko]                                  │
│ Jakarta Pusat - (021) 1234-5678                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Aksi:
**TIDAK ADA - Hanya lihat timeline**

**Note:** Timeline ini akan update otomatis jika Admin Cabang mengubah status pesanan!

---

## ✅ Step 11: Orders - Lihat Semua Pesanan

### Aksi:
1. **Klik "← Kembali ke Pesanan Saya"** (top left)
   **ATAU** klik menu "Pesanan Saya" di navbar

### URL (Auto):
```
http://localhost:5173/orders
```

### Yang Harus Dilihat:

```
┌─────────────────────────────────────────────────────┐
│ Pesanan Saya                                        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Order #HB1734258960123                          │ │
│ │ 2026-04-16 10:30                                │ │
│ │ [⏰ Pesanan Baru]  [🚚 Delivery]                │ │
│ │                                                 │ │
│ │ Total: Rp 30.000                                │ │
│ │ QRIS • Jakarta Pusat                            │ │
│ │                                                 │ │
│ │ [  Lacak  ]                                     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ (Pesanan lama jika ada...)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Aksi:
**TIDAK ADA - Hanya verifikasi pesanan ada di list**

---

## ✅ Step 12: Logout

### Aksi:
1. **Klik menu user di navbar** (top right)
2. **Klik "Logout"**

### Expected Result:
```
✓ Redirect ke: http://localhost:5173/
✓ Session cleared
✓ Badge keranjang hilang
✓ Menu berubah: "Login" & "Daftar" muncul
```

---

# 🎯 CHECKLIST TESTING

## Admin Pusat ✅
- [ ] Login berhasil
- [ ] Dashboard stats muncul
- [ ] Edit harga produk → Save → Toast success
- [ ] Monitor cabang → Card Jakarta Pusat muncul
- [ ] Analytics → Top 5 products visible
- [ ] Logout → Redirect ke login

## Admin Cabang ✅
- [ ] Login berhasil
- [ ] Dashboard quick actions clickable
- [ ] Orders → Konfirmasi pesanan baru
- [ ] Orders → Packing → Kirim → Selesai (sequence)
- [ ] History → Order auto move dari Orders
- [ ] Inventory → Edit stok Bayam → +10
- [ ] Logout → Redirect ke login

## Pelanggan ✅
- [ ] Home → Lihat Produk
- [ ] Products → Pilih cabang Jakarta Pusat
- [ ] Detail → Add to cart (redirect login)
- [ ] Login berhasil → Item masuk cart
- [ ] Checkout → Pilih Delivery → Isi alamat
- [ ] Payment → QRIS → Bayar
- [ ] Order Success → Order ID muncul
- [ ] Tracking → Timeline visible
- [ ] Orders → Pesanan di list
- [ ] Logout

---

# 📸 CARA SCREENSHOT SEMUA PAGES

## Tools:
- **Chrome DevTools:** F12 → Ctrl+Shift+P → "Capture full size screenshot"
- **Firefox:** F12 → "Take a screenshot of the entire page"
- **Manual:** Scroll + Screenshot satu per satu

## List Pages untuk Screenshot:

### Admin Pusat (4 pages)
1. `/admin-pusat` - Dashboard
2. `/admin-pusat/products` - Table produk
3. `/admin-pusat/branches` - Grid 3 cabang
4. `/admin-pusat/analytics` - Charts

### Admin Cabang (4 pages)
1. `/admin-cabang` - Dashboard + quick actions
2. `/admin-cabang/orders` - Order cards + filters
3. `/admin-cabang/history` - History list
4. `/admin-cabang/inventory` - Table inventory

### Pelanggan (9 pages)
1. `/` - Home + hero
2. `/products` - Grid produk
3. `/product/1` - Detail Bayam
4. `/cart` - Keranjang
5. `/checkout` - Form alamat
6. `/payment` - Payment methods
7. `/order-success` - Success page
8. `/orders` - List pesanan
9. `/order-tracking/:id` - Timeline

### Auth Pages (3 pages)
1. `/login` - Login form
2. `/register` - Register form
3. `/forgot-password` - 4-step reset password

**TOTAL: 20 unique pages untuk di-screenshot!**

---

# 🎉 SELESAI!

**Anda sekarang bisa:**
✅ Mengikuti setiap flow step-by-step
✅ Screenshot setiap halaman
✅ Copy desain untuk presentasi
✅ Demo ke stakeholder
✅ Testing fitur lengkap

**Happy Testing!** 🚀

---

**Last Updated:** April 16, 2026
**Testing Version:** 2.0
