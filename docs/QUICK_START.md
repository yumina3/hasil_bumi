# ⚡ QUICK START GUIDE

## 🚀 Jalankan Aplikasi (3 Langkah!)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan dev server
npm run dev

# 3. Buka browser
http://localhost:5173
```

---

## 🔑 LOGIN CREDENTIALS

### 1️⃣ Admin Pusat
```
Email: admin@hasilbumi.com
Password: admin123
→ Redirect ke: /admin-pusat
```

### 2️⃣ Admin Cabang (Jakarta Pusat)
```
Email: jakarta.pusat@hasilbumi.com
Password: admin123
→ Redirect ke: /admin-cabang
```

### 3️⃣ Admin Cabang (Jakarta Selatan)
```
Email: jakarta.selatan@hasilbumi.com
Password: admin123
→ Redirect ke: /admin-cabang
```

### 4️⃣ Admin Cabang (Tangerang)
```
Email: tangerang@hasilbumi.com
Password: admin123
→ Redirect ke: /admin-cabang
```

### 5️⃣ Pelanggan
```
Email: customer@example.com
Password: customer123
→ Redirect ke: / (beranda)
```

**ATAU klik "Daftar" untuk buat akun baru!**

---

## 📍 URL MAP

### 🏢 Admin Pusat
| Page | URL | Fitur |
|------|-----|-------|
| Dashboard | `/admin-pusat` | Overview stats semua cabang |
| Kelola Produk | `/admin-pusat/products` | Edit nama, kategori, harga |
| Monitor Cabang | `/admin-pusat/branches` | Lihat stok per cabang |
| Analytics | `/admin-pusat/analytics` | Laporan sales & tren |

### 🏬 Admin Cabang
| Page | URL | Fitur |
|------|-----|-------|
| Dashboard | `/admin-cabang` | Overview cabang + quick actions |
| Order Management | `/admin-cabang/orders` | Terima & proses pesanan |
| History Pesanan | `/admin-cabang/history` | Riwayat completed orders |
| Inventory Control | `/admin-cabang/inventory` | Edit stok cabang |

### 🛍️ Pelanggan
| Page | URL | Login? | Fitur |
|------|-----|--------|-------|
| Home | `/` | ❌ | Browse, pilih cabang |
| Produk | `/products` | ❌ | List produk, filter |
| Detail | `/product/:id` | ❌ | Detail + add to cart |
| Keranjang | `/cart` | ✅ | Edit cart, checkout |
| Checkout | `/checkout` | ✅ | Alamat, delivery method |
| Payment | `/payment` | ✅ | Pilih payment method |
| Success | `/order-success` | ✅ | Konfirmasi order |
| Pesanan Saya | `/orders` | ✅ | List pesanan |
| Tracking | `/order-tracking/:id` | ✅ | Detail tracking |

---

## 🎯 TESTING FLOW CEPAT

### Flow 1: Admin Pusat (2 menit)
```
1. Login: admin@hasilbumi.com
2. Dashboard → Lihat stats
3. Products → Edit harga Bayam → Save
4. Branches → Lihat stok Jakarta Pusat
5. Analytics → Lihat top products
6. Logout
```

### Flow 2: Admin Cabang (3 menit)
```
1. Login: jakarta.pusat@hasilbumi.com
2. Dashboard → Klik "Kelola Pesanan"
3. Orders → Konfirmasi pesanan baru
4. Orders → Update status → Packing → Kirim → Selesai
5. History → Lihat pesanan completed (auto move)
6. Inventory → Edit stok Bayam +10
7. Logout
```

### Flow 3: Pelanggan (5 menit)
```
1. Home → Klik "Lihat Produk"
2. Products → Pilih cabang "Jakarta Pusat"
3. Klik produk "Bayam Organik"
4. Detail → Add to cart (redirect ke login)
5. Login: customer@example.com
6. Cart → Lanjut checkout
7. Checkout → Pilih "Delivery" → Alamat
8. Payment → QRIS → Bayar
9. Order Success → Lacak Pesanan
10. Tracking → Lihat timeline
11. Orders → Lihat semua pesanan
12. Logout
```

---

## ✏️ EDIT CEPAT

### Ubah Nama Toko
**File:** `/src/app/components/Layout.tsx` (+ AdminPusatLayout, AdminCabangLayout)
```tsx
<h2 className="font-bold text-lg">Hasil Bumi</h2>
```
→ Ganti "Hasil Bumi" dengan nama Anda

### Ubah Warna Primary
**File:** `/src/styles/theme.css`
```css
--color-green-600: #16a34a; /* Ubah kode warna */
```

### Tambah Produk
**File:** `/src/app/data/products.ts`
```typescript
{
  id: 25,
  sku: 'VG-NEWPROD-001',
  name: 'Produk Baru',
  category: 'Sayuran',
  price: 20000,
  // ... dst
}
```

### Tambah Cabang
**File:** `/src/app/data/branches.ts`
```typescript
{
  id: 'bandung',
  name: 'Bandung',
  address: 'Jl. Dago No. 123',
  // ... dst
}
```

### Ubah Kuota Delivery
**File:** `/src/app/pages/AdminCabang/Dashboard.tsx`
```tsx
<p className="text-4xl font-bold">{deliveryOrdersToday}/100</p>
```
→ Ganti 100 ke angka yang Anda mau

---

## 📁 STRUKTUR FOLDER

```
/src/app/
├── components/
│   ├── Layout.tsx                  ← Pelanggan layout
│   ├── AdminPusatLayout.tsx        ← Admin Pusat layout
│   └── AdminCabangLayout.tsx       ← Admin Cabang layout
│
├── pages/
│   ├── AdminPusat/
│   │   ├── Dashboard.tsx           ← /admin-pusat
│   │   ├── Products.tsx            ← /admin-pusat/products
│   │   ├── Branches.tsx            ← /admin-pusat/branches
│   │   └── Analytics.tsx           ← /admin-pusat/analytics
│   │
│   ├── AdminCabang/
│   │   ├── Dashboard.tsx           ← /admin-cabang
│   │   ├── Orders.tsx              ← /admin-cabang/orders
│   │   ├── History.tsx             ← /admin-cabang/history
│   │   └── Inventory.tsx           ← /admin-cabang/inventory
│   │
│   ├── Home.tsx                    ← /
│   ├── Products.tsx                ← /products
│   ├── Cart.tsx                    ← /cart
│   ├── Checkout.tsx                ← /checkout
│   ├── Payment.tsx                 ← /payment
│   └── ... (dll)
│
├── context/
│   ├── AuthContext.tsx             ← Authentication
│   └── AdminCabangContext.tsx      ← Admin Cabang shared state
│
├── data/
│   ├── products.ts                 ← 24 produk mock
│   └── branches.ts                 ← 3 cabang data
│
└── routes.tsx                      ← Routing config
```

---

## 🔥 FITUR UNGGULAN

### ✅ Multi-Role System
- Admin Pusat: Edit harga global, monitor semua cabang
- Admin Cabang: Kelola stok & pesanan cabang sendiri
- Pelanggan: Browse, cart, checkout, tracking

### ✅ Real-Time Features
- Kuota delivery harian (2/100) auto-update
- Low stock alert (<25 unit)
- Order status timeline
- Auto-move completed orders to history

### ✅ Complete E-Commerce Flow
- Browse produk tanpa login
- Pilih cabang sebelum add to cart
- 5 payment methods (QRIS, VA, E-Wallet, COD)
- 2 delivery methods (Delivery, Pick Up)
- Order tracking dengan timeline

### ✅ Professional Design
- Responsive (mobile, tablet, desktop)
- Color palette hijau & putih
- Modern UI dengan Tailwind CSS
- Toast notifications

### ✅ Production-Ready Structure
- Protected routes per role
- Context API for state management
- Separated pages (easy to maintain)
- Mock data (ready for backend integration)

---

## 📚 DOKUMENTASI LENGKAP

Lihat **PROTOTYPE_GUIDE.md** untuk:
- Tutorial detail setiap page
- Screenshot flow
- Customize guide lengkap
- Troubleshooting

---

## 🎉 SELAMAT MENCOBA!

**Aplikasi siap digunakan untuk:**
- ✅ Demo/Presentasi
- ✅ User Testing
- ✅ Stakeholder Review
- ✅ Development lanjutan

**Semua fitur 100% fungsional dengan mock data!** 🚀

---

📅 **Last Updated:** April 16, 2026  
🏷️ **Version:** 2.0 (Multi-Page Architecture)
