# 🎨 HASIL BUMI E-COMMERCE - PROTOTYPE GUIDE

## 📋 DAFTAR ISI
1. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
2. [Akun Login untuk Testing](#akun-login-untuk-testing)
3. [Navigasi Admin Pusat](#navigasi-admin-pusat)
4. [Navigasi Admin Cabang](#navigasi-admin-cabang)
5. [Navigasi Pelanggan](#navigasi-pelanggan)
6. [Struktur URL Lengkap](#struktur-url-lengkap)
7. [Cara Edit & Customize](#cara-edit--customize)

---

## 🚀 CARA MENJALANKAN APLIKASI

### Prerequisites
- Node.js (v18 atau lebih baru)
- Browser modern (Chrome, Firefox, Safari, Edge)

### Langkah-langkah:

1. **Buka terminal** di folder project Anda

2. **Install dependencies** (jika belum):
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```

4. **Buka browser** dan akses:
   ```
   http://localhost:5173
   ```

5. **Aplikasi siap digunakan!** 🎉

---

## 🔐 AKUN LOGIN UNTUK TESTING

### 1. Admin Pusat (Super Admin)
```
Email: admin@hasilbumi.com
Password: admin123
Role: admin_pusat
```
**Akses ke:**
- ✅ Dashboard overview seluruh cabang
- ✅ Kelola produk & harga (edit harga berlaku semua cabang)
- ✅ Monitor stok semua cabang
- ✅ Laporan analytics & sales

---

### 2. Admin Cabang Jakarta Pusat
```
Email: jakarta.pusat@hasilbumi.com
Password: admin123
Role: admin_cabang
Branch: Jakarta Pusat
```
**Akses ke:**
- ✅ Dashboard cabang Jakarta Pusat
- ✅ Order management (terima & proses pesanan)
- ✅ History pesanan (riwayat completed)
- ✅ Inventory control (kelola stok cabang sendiri)
- ❌ TIDAK bisa edit harga (hanya Admin Pusat)

---

### 3. Admin Cabang Jakarta Selatan
```
Email: jakarta.selatan@hasilbumi.com
Password: admin123
Role: admin_cabang
Branch: Jakarta Selatan
```
**Akses ke:** (sama seperti Jakarta Pusat, tapi data cabang berbeda)

---

### 4. Admin Cabang Tangerang
```
Email: tangerang@hasilbumi.com
Password: admin123
Role: admin_cabang
Branch: Tangerang
```
**Akses ke:** (sama seperti Jakarta Pusat, tapi data cabang berbeda)

---

### 5. Pelanggan
```
Email: customer@example.com
Password: customer123
Role: pelanggan
```
**Akses ke:**
- ✅ Browse produk (bisa tanpa login)
- ✅ Keranjang belanja (perlu login)
- ✅ Checkout & payment (perlu login)
- ✅ Tracking pesanan
- ✅ Riwayat pesanan

**ATAU daftar akun baru:**
- Klik "Daftar" di halaman login
- Isi form registrasi
- Login dengan akun baru

---

## 🏢 NAVIGASI ADMIN PUSAT

### Login
1. Buka `http://localhost:5173/login`
2. Login dengan: `admin@hasilbumi.com` / `admin123`
3. Auto redirect ke: `/admin-pusat`

### Menu & Pages

#### 📊 Dashboard (`/admin-pusat`)
**URL:** `http://localhost:5173/admin-pusat`

**Fitur:**
- Overview stats: Total Cabang, Total Produk, Total Stok, Revenue
- Alert produk low stock di semua cabang
- Status semua cabang (list cards)
- List produk dengan stok rendah

**Screenshot Flow:**
```
┌─────────────────────────────────────────────────┐
│ [Sidebar] │ Selamat Datang, Admin Pusat!       │
│           │                                     │
│ • Dashboard│ ⚠️ 5 produk memiliki stok rendah   │
│ • Kelola  │                                     │
│   Produk  │ [3 Cabang] [24 Produk] [Rp 125M]  │
│ • Monitor │                                     │
│   Cabang  │ Status Cabang    Low Stock         │
│ • Analytics│ Jakarta Pusat   Bayam (2 cabang)  │
│           │ Jakarta Selatan Wortel (1 cabang) │
│ [Logout]  │ Tangerang                          │
└─────────────────────────────────────────────────┘
```

---

#### 🛍️ Kelola Produk (`/admin-pusat/products`)
**URL:** `http://localhost:5173/admin-pusat/products`

**Fitur:**
- Table produk lengkap (24 produk)
- Edit inline: Nama, Kategori, Harga
- Total stok semua cabang
- Badge status (Low Stock / Baik)
- Save/Cancel saat edit

**Cara Edit:**
1. Klik tombol ✏️ Edit di kolom Aksi
2. Form inline muncul
3. Edit Nama/Kategori/Harga
4. Klik ✓ Save atau ✗ Cancel

**PENTING:**
- ⚠️ Perubahan harga berlaku untuk **SEMUA CABANG**
- Admin Cabang tidak bisa edit harga

---

#### 🏪 Monitor Cabang (`/admin-pusat/branches`)
**URL:** `http://localhost:5173/admin-pusat/branches`

**Fitur:**
- Grid cards 3 cabang
- Info cabang: Alamat, Telepon, Jam Buka
- Stats per cabang: Total Stok, Low Stock, Habis
- Alert per cabang jika ada produk low stock
- Detail stok produk per cabang (scrollable)

**Cabang yang ditampilkan:**
1. Jakarta Pusat - Jl. Sudirman No. 123
2. Jakarta Selatan - Jl. Fatmawati No. 88
3. Tangerang - Jl. BSD Raya No. 45

---

#### 📈 Analytics (`/admin-pusat/analytics`)
**URL:** `http://localhost:5173/admin-pusat/analytics`

**Fitur:**
- Summary cards: Total Sales, Total Orders, Avg Order Value
- Tren penjualan 4 bulan terakhir (bar chart visual)
- Top 5 produk terlaris dengan revenue
- Growth indicators (+15.3%, +8.2%, dll)

**Data Mock:**
- Jan 2026: Rp 45M
- Feb 2026: Rp 52M
- Mar 2026: Rp 48M
- Apr 2026: Rp 65M (+15.3%)

---

## 🏬 NAVIGASI ADMIN CABANG

### Login
1. Buka `http://localhost:5173/login`
2. Login dengan salah satu:
   - `jakarta.pusat@hasilbumi.com` / `admin123`
   - `jakarta.selatan@hasilbumi.com` / `admin123`
   - `tangerang@hasilbumi.com` / `admin123`
3. Auto redirect ke: `/admin-cabang`

### Menu & Pages

#### 📊 Dashboard (`/admin-cabang`)
**URL:** `http://localhost:5173/admin-cabang`

**Fitur:**
- 4 Stats Cards: Stok Rendah, Pesanan Baru, Delivery Hari Ini, Total Produk
- Alert low stock (jika ada produk < 25 unit)
- Alert kuota delivery hampir penuh (≥90 pesanan)
- Quick Action cards (clickable):
  - 🛒 Kelola Pesanan → `/admin-cabang/orders`
  - 📦 Kelola Stok → `/admin-cabang/inventory`
  - 🕐 Lihat History → `/admin-cabang/history`

**Info Sidebar:**
- Info cabang lengkap
- Stats real-time:
  - ⚠️ Stok Rendah: 5 produk
  - 🆕 Pesanan Baru: 3
  - 🚚 Delivery Hari Ini: 2/100

---

#### 🛒 Order Management (`/admin-cabang/orders`)
**URL:** `http://localhost:5173/admin-cabang/orders`

**Fitur:**
- List semua pesanan aktif (belum completed)
- Filter berdasarkan:
  - Status: Semua, Baru, Dikonfirmasi, Dikemas, Dikirim, Siap Diambil
  - Metode: Semua, Delivery, Pick Up
- Detail setiap pesanan:
  - Info pelanggan (Nama, Telepon, Alamat)
  - Item pesanan + total
  - Payment method
  - Timeline status
- Tombol aksi untuk update status:
  - Pesanan Baru → **Konfirmasi Pesanan**
  - Dikonfirmasi → **Mulai Packing**
  - Dikemas → **Kirim Pesanan** (delivery) / **Siap Diambil** (pickup)
  - Dikirim → **Selesaikan Pesanan**

**Flow Delivery:**
```
Baru → Konfirmasi → Packing → Kirim → Selesai
                                ↓
                     (estimasi 30 menit)
```

**Flow Pickup:**
```
Baru → Konfirmasi → Packing → Siap Diambil → Selesai
```

**Auto-Move ke History:**
- Saat status → "Selesai", order otomatis pindah ke History

---

#### 🕐 History Pesanan (`/admin-cabang/history`)
**URL:** `http://localhost:5173/admin-cabang/history`

**Fitur:**
- Summary stats:
  - Total Pesanan (completed)
  - Total Revenue
  - Delivery Count
  - Pickup Count
- Filter berdasarkan:
  - Metode: Semua, Delivery, Pick Up
  - Payment: Semua, QRIS, GoPay, COD, VA, dll
- List pesanan completed dengan detail lengkap
- Persisten (tidak hilang saat refresh)

---

#### 📦 Inventory Control (`/admin-cabang/inventory`)
**URL:** `http://localhost:5173/admin-cabang/inventory`

**Fitur:**
- Summary stats: Total Stok, Stok Rendah, Habis Stok
- Alert low stock (jika ada produk < 25 unit)
- Filter berdasarkan:
  - Kategori: Semua, Sayuran, Buah-buahan, Bumbu, dll
  - Status: Semua, Stok Cukup, Stok Rendah, Habis Stok
- Table inventory dengan kolom:
  - SKU, Nama, Kategori, Harga (Read-Only), Stok, Status, Aksi
- Edit stok:
  - Quick adjust: -5, +5, +10 (langsung update)
  - Edit manual: klik ✏️ Edit → input angka → Save
  - +/- 10 saat edit dengan tombol

**PENTING:**
- ⚠️ Admin Cabang **TIDAK BISA** edit harga
- Hanya bisa edit stok cabang sendiri
- Harga read-only (warna abu-abu)

---

## 🛍️ NAVIGASI PELANGGAN

### Akses Tanpa Login (Public)
- ✅ Home/Beranda (`/`)
- ✅ Daftar Produk (`/products`)
- ✅ Detail Produk (`/product/:id`)

### Akses Perlu Login
- 🔒 Keranjang (`/cart`)
- 🔒 Checkout (`/checkout`)
- 🔒 Payment (`/payment`)
- 🔒 Order Success (`/order-success`)
- 🔒 Daftar Pesanan (`/orders`)
- 🔒 Tracking Pesanan (`/order-tracking/:orderId`)

### Flow Belanja Lengkap

#### 1️⃣ Beranda (`/`)
**URL:** `http://localhost:5173/`

**Fitur:**
- Hero banner toko sayur
- Pilihan 3 cabang (cards)
- Kategori produk (grid)
- Info toko

**Aksi:** Klik "Lihat Semua Produk" → `/products`

---

#### 2️⃣ Daftar Produk (`/products`)
**URL:** `http://localhost:5173/products`

**Fitur:**
- Grid produk (24 produk)
- Filter kategori
- Search by nama
- Badge "Low Stock" jika < 25 unit
- Pilih cabang (wajib sebelum add to cart)

**Aksi:**
1. Pilih cabang dari dropdown (Jakarta Pusat/Selatan/Tangerang)
2. Klik produk → Detail Produk

---

#### 3️⃣ Detail Produk (`/product/:id`)
**URL:** `http://localhost:5173/product/1` (contoh)

**Fitur:**
- Foto produk
- Nama, SKU, Harga
- Stok di cabang yang dipilih
- Deskripsi lengkap
- Info perishable (jika ada)
- Pilih quantity
- Add to Cart

**Aksi:**
1. Pilih quantity
2. Klik "Tambah ke Keranjang"
3. Jika belum login → redirect ke Login
4. Jika sudah login → masuk keranjang

---

#### 4️⃣ Keranjang (`/cart`) 🔒
**URL:** `http://localhost:5173/cart`

**Fitur:**
- List item di keranjang
- Edit quantity (+/-)
- Hapus item
- Subtotal per item
- Total keseluruhan
- Info cabang yang dipilih

**Aksi:** Klik "Lanjut ke Checkout" → `/checkout`

---

#### 5️⃣ Checkout (`/checkout`) 🔒
**URL:** `http://localhost:5173/checkout`

**Fitur:**
- Ringkasan pesanan
- Form alamat pengiriman (jika delivery)
- Pilih metode pengiriman:
  - 🚚 Delivery (cek kuota < 100/hari)
  - 🏪 Pick Up In Store
- Info biaya:
  - Subtotal
  - Ongkir (Rp 15K untuk delivery, gratis pickup)
  - Total

**Aksi:** Klik "Lanjut ke Pembayaran" → `/payment`

---

#### 6️⃣ Payment (`/payment`) 🔒
**URL:** `http://localhost:5173/payment`

**Fitur:**
- Pilih metode pembayaran:
  - 💳 QRIS
  - 🏦 Virtual Account (BCA, Mandiri, BNI)
  - 💰 E-Wallet (GoPay, OVO, Dana, ShopeePay)
  - 💵 COD (hanya untuk pickup)
- Ringkasan total pembayaran
- Mock payment gateway

**Aksi:**
1. Pilih payment method
2. Klik "Bayar Sekarang"
3. Mock payment processing (2 detik)
4. Redirect → `/order-success`

---

#### 7️⃣ Order Success (`/order-success`) 🔒
**URL:** `http://localhost:5173/order-success`

**Fitur:**
- ✅ Konfirmasi pesanan berhasil
- Order ID
- Total pembayaran
- Payment method
- Delivery method
- Estimasi waktu (delivery: 30-60 menit, pickup: 15-30 menit)
- Tombol:
  - "Lacak Pesanan" → `/order-tracking/:orderId`
  - "Lihat Pesanan Saya" → `/orders`
  - "Kembali ke Beranda" → `/`

---

#### 8️⃣ Daftar Pesanan (`/orders`) 🔒
**URL:** `http://localhost:5173/orders`

**Fitur:**
- List semua pesanan pelanggan
- Status badge (Baru, Dikonfirmasi, Dikemas, Dikirim, Selesai)
- Info singkat (tanggal, total, metode)
- Tombol "Lacak" untuk setiap pesanan

**Aksi:** Klik "Lacak" → `/order-tracking/:orderId`

---

#### 9️⃣ Tracking Pesanan (`/order-tracking/:orderId`) 🔒
**URL:** `http://localhost:5173/order-tracking/HB1734258960123` (contoh)

**Fitur:**
- Timeline detail status pesanan
- Info driver (jika delivery)
- Estimasi waktu tiba
- Map placeholder
- Contact info toko
- Detail pesanan lengkap
- Auto refresh status (simulasi real-time)

---

## 📍 STRUKTUR URL LENGKAP

### Public (No Login)
```
/                          → Home
/products                  → Daftar Produk
/product/:id               → Detail Produk
/login                     → Login
/register                  → Register
/forgot-password           → Lupa Password (4-step flow)
```

### Admin Pusat 🔒
```
/admin-pusat               → Dashboard Overview
/admin-pusat/products      → Kelola Produk & Harga
/admin-pusat/branches      → Monitor Semua Cabang
/admin-pusat/analytics     → Laporan & Analytics
```

### Admin Cabang 🔒
```
/admin-cabang              → Dashboard Cabang
/admin-cabang/orders       → Order Management
/admin-cabang/history      → History Pesanan
/admin-cabang/inventory    → Inventory Control
```

### Pelanggan 🔒
```
/cart                      → Keranjang Belanja
/checkout                  → Checkout & Alamat
/payment                   → Pilih Payment Method
/order-success             → Konfirmasi Pesanan Berhasil
/orders                    → Daftar Pesanan Saya
/order-tracking/:orderId   → Tracking Detail Pesanan
```

---

## ✏️ CARA EDIT & CUSTOMIZE

### 1. Edit Warna (Color Palette)

**File:** `/src/styles/theme.css`

```css
/* Ubah warna hijau primary */
--color-green-600: #16a34a;  /* Hijau utama */
--color-green-700: #15803d;  /* Hijau gelap */
--color-green-50: #f0fdf4;   /* Hijau muda */

/* Ubah warna lain */
--color-blue-600: #2563eb;   /* Biru */
--color-red-600: #dc2626;    /* Merah */
--color-orange-600: #ea580c; /* Orange */
```

---

### 2. Edit Logo & Nama Toko

**File:** `/src/app/components/Layout.tsx` (Pelanggan)
**File:** `/src/app/components/AdminPusatLayout.tsx` (Admin Pusat)
**File:** `/src/app/components/AdminCabangLayout.tsx` (Admin Cabang)

Cari bagian:
```tsx
<h2 className="font-bold text-lg">Hasil Bumi</h2>
```

Ganti "Hasil Bumi" dengan nama toko Anda.

---

### 3. Edit Data Cabang

**File:** `/src/app/data/branches.ts`

```typescript
export const branches = [
  {
    id: 'jakarta-pusat',
    name: 'Jakarta Pusat',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta Pusat',
    postalCode: '10220',
    phone: '(021) 1234-5678',
    openHours: '08:00 - 20:00',
  },
  // Tambahkan cabang baru di sini
];
```

---

### 4. Edit Data Produk

**File:** `/src/app/data/products.ts`

```typescript
export const products = [
  {
    id: 1,
    sku: 'VG-BAYAM-001',
    name: 'Bayam Organik',
    category: 'Sayuran',
    price: 15000,
    unit: 'kg',
    image: '/products/bayam.jpg',
    description: 'Bayam organik...',
    isPerishable: true,
    stockByBranch: [
      { branchId: 'jakarta-pusat', stock: 45 },
      { branchId: 'jakarta-selatan', stock: 60 },
      { branchId: 'tangerang', stock: 30 },
    ],
  },
  // Tambahkan produk baru di sini
];
```

---

### 5. Edit Akun Admin

**File:** `/src/app/context/AuthContext.tsx`

Cari `mockUsers`:
```typescript
const mockUsers = [
  {
    email: 'admin@hasilbumi.com',
    password: 'admin123',
    role: 'admin_pusat',
    name: 'Admin Pusat',
    branchId: null,
  },
  // Tambah/edit akun di sini
];
```

---

### 6. Edit Kuota Delivery Harian

**Default:** 100 pesanan/hari

**File:** `/src/app/pages/AdminCabang/Dashboard.tsx`

Cari:
```tsx
<p className="text-xs text-green-600 mt-1">Kuota harian</p>
```

Atau cari nilai `100` di:
- `/src/app/context/AdminCabangContext.tsx`
- `/src/app/pages/AdminCabang/Orders.tsx`

---

### 7. Edit Threshold Low Stock

**Default:** < 25 unit

**File:** `/src/app/context/AdminCabangContext.tsx`

Cari:
```typescript
threshold: 25,
```

Ubah angka `25` ke nilai yang Anda inginkan.

---

### 8. Tambah Payment Method Baru

**File:** `/src/app/pages/Payment.tsx`

Tambahkan di array `paymentMethods`:
```typescript
{
  id: 'linkaja',
  name: 'LinkAja',
  type: 'ewallet',
  logo: '/payment/linkaja.png',
},
```

---

### 9. Edit Ongkir

**File:** `/src/app/pages/Checkout.tsx`

Cari:
```typescript
const deliveryCost = deliveryMethod === 'delivery' ? 15000 : 0;
```

Ubah `15000` ke nilai ongkir yang Anda inginkan.

---

### 10. Customize Responsive Breakpoints

**File:** `/src/styles/theme.css`

Tailwind default:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Gunakan class:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🎯 TESTING CHECKLIST

### Admin Pusat
- [ ] Login sebagai admin@hasilbumi.com
- [ ] Dashboard muncul dengan stats
- [ ] Edit harga produk → Save → Toast success
- [ ] Monitor cabang → Lihat stok per cabang
- [ ] Analytics → Lihat tren penjualan
- [ ] Logout → Redirect ke login

### Admin Cabang
- [ ] Login sebagai jakarta.pusat@hasilbumi.com
- [ ] Dashboard muncul dengan quick actions
- [ ] Order Management → Konfirmasi pesanan baru
- [ ] Update status → Packing → Kirim → Selesai
- [ ] Order auto move ke History saat completed
- [ ] Inventory → Edit stok → Quick adjust (+5, +10)
- [ ] Logout → Redirect ke login

### Pelanggan
- [ ] Browse produk tanpa login
- [ ] Pilih cabang
- [ ] Add to cart (redirect ke login jika belum)
- [ ] Register akun baru
- [ ] Login → Cart → Checkout
- [ ] Pilih delivery method
- [ ] Payment → Pilih QRIS → Bayar
- [ ] Order Success → Lacak pesanan
- [ ] Tracking pesanan → Timeline update
- [ ] Logout → Redirect ke home

---

## 🐛 TROUBLESHOOTING

### Error: "Module not found"
```bash
npm install
npm run dev
```

### Port 5173 sudah digunakan
Edit `vite.config.ts`:
```typescript
server: {
  port: 3000, // Ubah ke port lain
}
```

### Tampilan tidak responsif
- Cek browser zoom (set 100%)
- Clear cache browser (Ctrl+Shift+R)

### Login tidak berhasil
- Cek email/password (case-sensitive)
- Lihat console browser (F12) untuk error

---

## 📞 SUPPORT

Jika ada pertanyaan atau ingin customize lebih lanjut:

1. **Buka browser inspector** (F12) untuk lihat console errors
2. **Edit file langsung** di code editor Anda
3. **Auto reload** saat save file (HMR aktif)
4. **Eksperimen** dengan data mock terlebih dahulu

---

## 🎉 HAPPY PROTOTYPING!

Aplikasi ini 100% fungsional dengan mock data dan siap untuk:
- ✅ Demo ke stakeholder
- ✅ User testing
- ✅ Presentasi fitur
- ✅ Development lanjutan dengan Supabase backend

**Semua fitur sudah terpisah dalam pages dan mudah di-customize!** 🚀

---

**Last Updated:** April 16, 2026
**Version:** 2.0 (Multi-Page Architecture)
