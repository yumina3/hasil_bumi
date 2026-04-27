# 🔐 Hasil Bumi - Login Required Flow Guide

## 📋 Overview

Aplikasi Hasil Bumi sekarang **mengharuskan semua user untuk login terlebih dahulu** sebelum dapat mengakses fitur apapun. Setelah login, user akan diarahkan ke halaman yang sesuai dengan role mereka.

---

## 🚀 Alur Login dan Akses

### 1️⃣ Tampilan Awal (Landing)

**Aksi:**
- User mengakses aplikasi pertama kali
- **Otomatis redirect ke `/login`**

**Yang Ditampilkan:**
- Login page dengan pilihan 3 role:
  - 🛒 **Pelanggan** - Customer shopping
  - 🏪 **Admin Cabang** - Store operator
  - 👑 **Admin Pusat** - Central admin

---

### 2️⃣ Proses Login

**Langkah-langkah:**

1. **Pilih Role** menggunakan toggle group
2. **Masukkan Email** (contoh: customer@hasilbumi.com)
3. **Masukkan Password** (demo123)
4. **Klik tombol "Masuk"**

**Validasi:**
- Email dan password harus diisi
- Role yang dipilih harus sesuai dengan akun
- Jika tidak cocok, muncul error: *"Akun ini bukan akun [role]"*

**Demo Credentials:**
```
Pelanggan:
Email: customer@hasilbumi.com
Password: demo123

Admin Cabang (Jakarta Pusat):
Email: admin.jktpusat@hasilbumi.com
Password: demo123

Admin Cabang (Jakarta Selatan):
Email: admin.jktselatan@hasilbumi.com
Password: demo123

Admin Cabang (Tangerang):
Email: admin.tangerang@hasilbumi.com
Password: demo123

Admin Pusat:
Email: admin.pusat@hasilbumi.com
Password: demo123
```

---

### 3️⃣ Redirect Setelah Login

**Berdasarkan Role:**

| Role | Redirect ke | Akses |
|------|------------|-------|
| **Pelanggan** | `/` (Home) | Customer interface dengan shopping features |
| **Admin Cabang** | `/admin-cabang` | Branch-specific dashboard |
| **Admin Pusat** | `/admin-pusat` | Central admin dashboard |

---

## 🛒 Alur Belanja Pelanggan (Customer Journey)

### Step 1: Login
```
1. Buka aplikasi
2. Otomatis ke halaman Login
3. Pilih role "Pelanggan"
4. Masukkan email & password
5. Klik "Masuk"
6. ✅ Redirect ke Home page
```

### Step 2: Pilih Cabang
```
1. Di Home page, lihat "Smart Branch Selection" (sticky bar)
2. Klik dropdown
3. Pilih cabang terdekat:
   - Jakarta Pusat
   - Jakarta Selatan
   - Tangerang
4. ✅ Branch selected - bisa mulai belanja
```

**⚠️ PENTING:**
- **TIDAK BISA menambahkan produk ke keranjang jika belum memilih cabang**
- Akan muncul toast error: *"Silakan pilih cabang terlebih dahulu di Smart Branch Selection"*

### Step 3: Browse Produk
```
1. Klik menu "Produk" di header
2. Filter by kategori:
   - Sayuran Hijau
   - Sayuran Buah
   - Sayuran Akar
   - Bumbu Dapur
   - Daging
   - Peternakan
3. Lihat product cards dengan info:
   - Gambar produk
   - Nama & SKU
   - Harga per unit
   - Badge kategori
   - Badge "Perishable" (jika applicable)
```

### Step 4: Add to Cart
```
1. Klik "Tambah ke Keranjang" pada product card
   ATAU
2. Klik product card → Product detail page
3. Pilih quantity
4. Klik "Tambah ke Keranjang" atau "Beli Sekarang"
5. ✅ Item masuk ke cart
```

**Validasi:**
- ✅ Cabang sudah dipilih → Berhasil add to cart
- ❌ Cabang belum dipilih → Error toast muncul

### Step 5: View Cart (Floating Cart)
```
1. Floating cart button muncul di bottom-right (jika ada item)
2. Badge merah menunjukkan jumlah item
3. Klik floating cart button
4. Panel slide-in dari kanan menampilkan:
   - List items dengan gambar, nama, SKU
   - Quantity & harga per item
   - Total harga
   - Tombol hapus item
   - "Lihat Keranjang" button
   - "Checkout Sekarang" button
```

### Step 6: Checkout
```
1. Dari floating cart atau menu, klik "Checkout"
2. Review items
3. Pilih metode pengiriman:
   - 🏪 Pick up In Store (Gratis)
   - 🚚 Local Delivery (Rp 15.000)
4. Pilih payment method:
   - COD (Cash on Delivery)
   - QRIS
   - Virtual Account (BCA, Mandiri, BNI, BRI)
   - E-Wallet (GoPay, OVO, Dana, ShopeePay)
5. Klik "Proses Pembayaran"
6. ✅ Order success!
```

---

## 🏪 Alur Admin Cabang

### Step 1: Login
```
1. Pilih role "Admin Cabang"
2. Masukkan email cabang (contoh: admin.jktpusat@hasilbumi.com)
3. Password: demo123
4. ✅ Redirect ke `/admin-cabang`
```

### Step 2: Dashboard Overview
```
Dashboard menampilkan:
- Sidebar dengan info cabang assigned
- Quick stats:
  - 🔴 Stok Rendah (Low Stock Alert)
  - 🔵 Pesanan Baru (New Orders)
- Tab navigation:
  - Inventory Control
  - Order Management
```

### Step 3: Update Inventory
```
1. Tab "Inventory Control"
2. Lihat tabel produk dengan:
   - SKU
   - Nama produk
   - Stok saat ini
   - Threshold
   - Harga (read-only, tidak bisa edit)
3. Quick Update Stock:
   - Klik tombol [-] untuk kurangi stok
   - Klik tombol [+] untuk tambah stok
4. ✅ Stok updated
5. ⚠️ Low stock alert muncul otomatis jika stok <= threshold
```

**Restrictions:**
- ❌ **TIDAK BISA** edit harga produk
- ✅ Hanya bisa update stok cabang sendiri
- ❌ Tidak bisa lihat inventory cabang lain

### Step 4: Process Orders
```
1. Tab "Order Management"
2. Lihat task list dengan status:
   - 🟠 New Order - Pesanan baru masuk
   - 🔵 Packing - Sedang dikemas
   - 🟢 Ready for Pickup - Siap diambil
3. Klik "Process" untuk update status
4. ✅ Order updated
```

---

## 👑 Alur Admin Pusat

### Step 1: Login
```
1. Pilih role "Admin Pusat"
2. Email: admin.pusat@hasilbumi.com
3. Password: demo123
4. ✅ Redirect ke `/admin-pusat`
```

### Step 2: Dashboard Overview
```
Dashboard menampilkan:
- Global stats dari SEMUA cabang:
  - 💰 Total Revenue
  - 📦 Total Products
  - 🏪 Total Branches
  - 👥 Total Users
- Sidebar navigation:
  - Master Catalog
  - Multi-Branch Analytics
  - User Management
```

### Step 3: Edit Master Catalog
```
1. Tab "Master Catalog"
2. Lihat tabel ALL products dengan:
   - SKU
   - Nama Produk
   - Kategori
   - Harga
   - Status (Perishable/Normal)
3. Edit Product:
   - Klik tombol "Edit"
   - ✏️ Edit Nama Produk
   - ✏️ Edit Kategori
   - ✏️ Edit Harga (FULL CONTROL)
   - Klik "Save" atau "Cancel"
4. ✅ Product updated globally
```

**Full Authority:**
- ✅ Edit semua field produk
- ✅ Perubahan apply ke semua cabang
- ✅ Control penuh atas pricing

### Step 4: View Analytics
```
1. Tab "Multi-Branch Analytics"
2. Lihat revenue per cabang:
   - Jakarta Pusat: Rp 45.000.000
   - Jakarta Selatan: Rp 42.000.000
   - Tangerang: Rp 38.750.000
3. Total Revenue: Rp 125.750.000
```

### Step 5: User Management
```
1. Tab "User Management"
2. View summary:
   - Total Pelanggan: 1,247
   - Admin Cabang: 3
   - Admin Pusat: 1
3. (Future: Create, Edit, Delete users)
```

---

## 🔒 Protected Routes

### Authentication Check

**Semua routes WAJIB login kecuali `/login`**

```
/ → ProtectedRoute (pelanggan only)
/products → ProtectedRoute (pelanggan only)
/product/:id → ProtectedRoute (pelanggan only)
/cart → ProtectedRoute (pelanggan only)
/checkout → ProtectedRoute (pelanggan only)
/admin-cabang → ProtectedRoute (admin_cabang only)
/admin-pusat → ProtectedRoute (admin_pusat only)
```

**Auto-redirect Logic:**
```typescript
if (not authenticated) {
  → redirect to /login
}

if (wrong role) {
  → redirect to appropriate dashboard:
    - admin_pusat → /admin-pusat
    - admin_cabang → /admin-cabang
    - pelanggan → /
}
```

---

## 🎯 Key Features dengan Login Required

### 1. Smart Branch Selection
- ✅ **Hanya muncul** untuk pelanggan yang sudah login
- ✅ **Sticky bar** di atas homepage
- ✅ **Wajib dipilih** sebelum bisa add to cart

### 2. Floating Cart
- ✅ **Hanya muncul** untuk pelanggan yang sudah login
- ✅ **Auto-hide** jika cart kosong
- ✅ **Real-time update** saat add/remove item

### 3. Header Navigation
- **Before Login:**
  - Logo
  - "Login" button

- **After Login (Pelanggan):**
  - Logo
  - Beranda | Produk
  - User name badge (green)
  - Cart button dengan badge count

- **After Login (Admin):**
  - Logo
  - Dashboard link
  - User name badge
  - No cart button

### 4. Logout
- **Admin Pusat & Admin Cabang:**
  - Logout button di sidebar dashboard
  
- **Pelanggan:**
  - (Future feature: Add logout to user menu)

---

## ⚠️ Error Handling

### Common Errors & Solutions

**1. "Email atau password salah"**
- ✅ Check email spelling
- ✅ Password adalah "demo123" untuk semua demo accounts

**2. "Akun ini bukan akun [role]"**
- ✅ Pastikan role yang dipilih sesuai dengan email
- ✅ Contoh: admin.pusat@hasilbumi.com → pilih "Admin Pusat"

**3. "Silakan pilih cabang terlebih dahulu"**
- ✅ Klik Smart Branch Selection di atas
- ✅ Pilih salah satu cabang
- ✅ Baru bisa add to cart

**4. Unauthorized access (403)**
- ✅ Login dengan role yang benar
- ✅ Admin cabang tidak bisa akses admin pusat dashboard
- ✅ Pelanggan tidak bisa akses admin dashboard

---

## 🔄 Session Management

### LocalStorage
```javascript
// User data stored in localStorage
key: "hasil_bumi_user"
value: {
  id: string,
  email: string,
  name: string,
  role: "pelanggan" | "admin_cabang" | "admin_pusat",
  branchId?: number, // for admin_cabang only
  accessToken: string
}
```

### Auto-login
- ✅ Session persist setelah refresh
- ✅ Auto-redirect ke dashboard sesuai role
- ✅ Logout menghapus session dari localStorage

---

## 📱 Mobile Experience

### Login Page
- ✅ Fully responsive
- ✅ Touch-friendly toggle buttons
- ✅ Easy to read demo credentials

### Smart Branch Selection
- ✅ Full-width pada mobile
- ✅ Sticky position maintained
- ✅ Easy dropdown interaction

### Floating Cart
- ✅ Accessible di mobile
- ✅ Full-screen panel pada mobile
- ✅ Smooth slide-in animation

### Dashboard (Admin)
- ✅ Hamburger menu untuk sidebar
- ✅ Collapsible navigation
- ✅ Optimized table views
- ✅ Touch-friendly buttons

---

## 🎓 User Onboarding

### For First-time Pelanggan:
```
1. Login dengan credentials pelanggan
2. Welcome alert muncul:
   "Selamat Datang, [Nama]!"
   "Silakan pilih cabang terdekat..."
3. Pilih cabang di Smart Branch Selection
4. Browse produk by kategori
5. Add to cart (floating cart muncul)
6. Checkout dan selesai!
```

### For Admin Cabang:
```
1. Login dengan credentials cabang
2. Dashboard shows assigned branch info
3. Check Low Stock Alert (jika ada)
4. Update inventory untuk perishable goods
5. Process incoming orders
```

### For Admin Pusat:
```
1. Login dengan credentials pusat
2. View global stats
3. Edit master catalog (prices, names, categories)
4. Monitor multi-branch analytics
5. Manage users (future)
```

---

## 🚀 Next Steps (Production Ready)

### Current State: Demo Mode
- ✅ Mock authentication
- ✅ LocalStorage session
- ✅ Client-side validation

### Production Migration:
1. **Integrate Supabase Auth**
   - Replace mock login with real auth
   - Implement server-side session
   - Add JWT token validation

2. **Database Integration**
   - User profiles table
   - Role-based access control
   - Branch assignment for admin_cabang

3. **Security Enhancements**
   - Password hashing
   - Rate limiting
   - CSRF protection
   - Two-factor authentication

4. **Advanced Features**
   - Social login (Google, Facebook)
   - Email verification
   - Password reset flow
   - Session timeout

---

**Hasil Bumi** - Secure Login Required System untuk Multi-Role E-Commerce Platform
