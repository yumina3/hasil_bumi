# 🔗 URL REFERENCES - COPY & PASTE

Daftar URL lengkap untuk akses cepat setiap page.

---

## 🔐 LOGIN CREDENTIALS

### Admin Pusat
```
URL: http://localhost:5173/login
Email: admin@hasilbumi.com
Password: admin123
```

### Admin Cabang - Jakarta Pusat
```
URL: http://localhost:5173/login
Email: jakarta.pusat@hasilbumi.com
Password: admin123
```

### Admin Cabang - Jakarta Selatan
```
URL: http://localhost:5173/login
Email: jakarta.selatan@hasilbumi.com
Password: admin123
```

### Admin Cabang - Tangerang
```
URL: http://localhost:5173/login
Email: tangerang@hasilbumi.com
Password: admin123
```

### Pelanggan
```
URL: http://localhost:5173/login
Email: customer@example.com
Password: customer123
```

---

## 🏢 ADMIN PUSAT - 4 PAGES

### 1. Dashboard
```
http://localhost:5173/admin-pusat
```
**Fitur:**
- Stats: Cabang (3), Produk (24), Stok (1247), Revenue (Rp 125M)
- Alert low stock
- Status semua cabang
- List produk stok rendah

---

### 2. Kelola Produk
```
http://localhost:5173/admin-pusat/products
```
**Fitur:**
- Table 24 produk
- Edit: Nama, Kategori, Harga
- Badge low stock / baik
- Info: Perubahan berlaku semua cabang

---

### 3. Monitor Cabang
```
http://localhost:5173/admin-pusat/branches
```
**Fitur:**
- Grid 3 cabang cards
- Stats per cabang: Total Stok, Low Stock, Habis
- Info: Alamat, Telepon, Jam Buka
- Detail stok produk per cabang

---

### 4. Analytics
```
http://localhost:5173/admin-pusat/analytics
```
**Fitur:**
- Sales summary (Total Sales, Orders, AOV)
- Tren penjualan 4 bulan
- Top 5 produk terlaris
- Growth indicators

---

## 🏬 ADMIN CABANG - 4 PAGES

### 1. Dashboard
```
http://localhost:5173/admin-cabang
```
**Fitur:**
- Stats: Stok Rendah, Pesanan Baru, Delivery Quota, Total Produk
- Alert low stock & kuota delivery
- Quick action cards (clickable)

---

### 2. Order Management
```
http://localhost:5173/admin-cabang/orders
```
**Fitur:**
- List pesanan aktif
- Filter: Status, Delivery Method
- Update status: Konfirmasi → Packing → Kirim → Selesai
- Timeline status per order
- Auto-move ke history saat completed

---

### 3. History Pesanan
```
http://localhost:5173/admin-cabang/history
```
**Fitur:**
- Summary stats: Total Orders, Revenue, Delivery, Pickup
- Filter: Method, Payment
- List completed orders
- Persisten data

---

### 4. Inventory Control
```
http://localhost:5173/admin-cabang/inventory
```
**Fitur:**
- Summary: Total Stok, Low Stock, Out of Stock
- Filter: Kategori, Status
- Edit stok: Quick adjust (+5, +10, -5) atau manual
- Alert low stock
- Harga read-only (hanya Admin Pusat bisa edit)

---

## 🛍️ PELANGGAN - 9 PAGES

### 1. Home / Beranda
```
http://localhost:5173/
```
**Fitur:**
- Hero banner
- Pilihan 3 cabang
- Kategori produk
- CTA "Lihat Semua Produk"

---

### 2. Daftar Produk
```
http://localhost:5173/products
```
**Fitur:**
- Grid 24 produk
- Filter: Cabang, Kategori
- Search by nama
- Badge stok (Tersedia, Low Stock, Habis)

---

### 3. Detail Produk - Bayam
```
http://localhost:5173/product/1
```
**Fitur:**
- Foto produk (placeholder)
- Info: Nama, SKU, Harga, Kategori
- Stok di cabang terpilih
- Deskripsi lengkap
- Pilih quantity
- Add to cart

---

### 4. Detail Produk - Wortel
```
http://localhost:5173/product/2
```

### 5. Detail Produk - Tomat
```
http://localhost:5173/product/3
```

### ... (Semua produk ID 1-24)

---

### 6. Keranjang
```
http://localhost:5173/cart
```
**Fitur:**
- List item di cart
- Edit quantity
- Hapus item
- Info cabang
- Total + Subtotal
- Lanjut ke Checkout

---

### 7. Checkout
```
http://localhost:5173/checkout
```
**Fitur:**
- Ringkasan pesanan
- Pilih metode: Delivery / Pick Up
- Form alamat (jika delivery)
- Ringkasan biaya (Subtotal, Ongkir, Total)
- Lanjut ke Pembayaran

---

### 8. Payment
```
http://localhost:5173/payment
```
**Fitur:**
- Pilih metode pembayaran:
  - 💳 QRIS
  - 🏦 Virtual Account (BCA, Mandiri, BNI)
  - 💰 E-Wallet (GoPay, OVO, Dana, ShopeePay)
  - 💵 COD
- Ringkasan total
- Bayar Sekarang

---

### 9. Order Success
```
http://localhost:5173/order-success
```
**Fitur:**
- Konfirmasi pesanan berhasil
- Order ID
- Total pembayaran
- Metode pembayaran & pengiriman
- Estimasi waktu
- Tombol: Lacak, Lihat Pesanan, Beranda

---

### 10. Daftar Pesanan
```
http://localhost:5173/orders
```
**Fitur:**
- List semua pesanan user
- Status badge
- Info: Tanggal, Total, Metode
- Tombol "Lacak" per order

---

### 11. Tracking Pesanan - Contoh
```
http://localhost:5173/order-tracking/HB1734258960123
```
**Fitur:**
- Timeline status detail
- Info driver (jika delivery)
- Estimasi waktu
- Detail pesanan
- Alamat pengiriman
- Contact toko

---

## 🔐 AUTH PAGES - 3 PAGES

### 1. Login
```
http://localhost:5173/login
```

### 2. Register
```
http://localhost:5173/register
```

### 3. Forgot Password
```
http://localhost:5173/forgot-password
```
(4-step flow: Email → Verifikasi Kode → Reset Password → Success)

---

## 🎯 QUICK TEST URLS

### Test Flow Admin Pusat (Copy semua):
```
http://localhost:5173/login
http://localhost:5173/admin-pusat
http://localhost:5173/admin-pusat/products
http://localhost:5173/admin-pusat/branches
http://localhost:5173/admin-pusat/analytics
```

### Test Flow Admin Cabang (Copy semua):
```
http://localhost:5173/login
http://localhost:5173/admin-cabang
http://localhost:5173/admin-cabang/orders
http://localhost:5173/admin-cabang/history
http://localhost:5173/admin-cabang/inventory
```

### Test Flow Pelanggan (Copy semua):
```
http://localhost:5173/
http://localhost:5173/products
http://localhost:5173/product/1
http://localhost:5173/cart
http://localhost:5173/checkout
http://localhost:5173/payment
http://localhost:5173/order-success
http://localhost:5173/orders
http://localhost:5173/order-tracking/HB1734258960123
```

---

## 📋 TESTING SEQUENCE

### Sequence 1: Admin Pusat (2 min)
```bash
# 1. Login
http://localhost:5173/login
# Email: admin@hasilbumi.com | Password: admin123

# 2. Dashboard → Lihat stats
http://localhost:5173/admin-pusat

# 3. Products → Edit harga Bayam
http://localhost:5173/admin-pusat/products

# 4. Branches → Lihat stok Jakarta Pusat
http://localhost:5173/admin-pusat/branches

# 5. Analytics → Top products
http://localhost:5173/admin-pusat/analytics

# 6. Logout (klik tombol di sidebar)
```

---

### Sequence 2: Admin Cabang (3 min)
```bash
# 1. Login
http://localhost:5173/login
# Email: jakarta.pusat@hasilbumi.com | Password: admin123

# 2. Dashboard → Quick actions
http://localhost:5173/admin-cabang

# 3. Orders → Konfirmasi pesanan
http://localhost:5173/admin-cabang/orders
# Klik "Konfirmasi Pesanan" → "Mulai Packing" → "Kirim" → "Selesai"

# 4. History → Lihat completed
http://localhost:5173/admin-cabang/history

# 5. Inventory → Edit stok Bayam +10
http://localhost:5173/admin-cabang/inventory

# 6. Logout
```

---

### Sequence 3: Pelanggan (5 min)
```bash
# 1. Home
http://localhost:5173/

# 2. Products → Pilih cabang
http://localhost:5173/products

# 3. Detail Bayam
http://localhost:5173/product/1

# 4. Add to cart → Login
http://localhost:5173/login
# Email: customer@example.com | Password: customer123

# 5. Cart
http://localhost:5173/cart

# 6. Checkout → Delivery → Alamat
http://localhost:5173/checkout

# 7. Payment → QRIS
http://localhost:5173/payment

# 8. Order Success
http://localhost:5173/order-success

# 9. Tracking
http://localhost:5173/order-tracking/[ORDER_ID]

# 10. Orders
http://localhost:5173/orders

# 11. Logout
```

---

## 🌐 DEPLOYMENT URLS (Setelah Deploy)

### Vercel (Contoh)
```
Production: https://hasil-bumi.vercel.app
Preview: https://hasil-bumi-git-main.vercel.app
```

### Netlify (Contoh)
```
Production: https://hasil-bumi.netlify.app
Preview: https://hasil-bumi--preview.netlify.app
```

### Ngrok (Temporary untuk testing remote)
```bash
# Install ngrok
npm install -g ngrok

# Run dev server
npm run dev

# Di terminal baru, jalankan:
ngrok http 5173

# Output:
# Forwarding: https://abc123.ngrok.io → http://localhost:5173
```

**Share link `https://abc123.ngrok.io` ke team untuk testing!**

---

## 📱 RESPONSIVE TESTING URLS

### Mobile Simulator (Chrome DevTools)
```
1. Buka Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Pilih device: iPhone 12 Pro, iPad Air, dll
4. Test semua URL di atas
```

### Breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

## 🎨 DESIGN SYSTEM REFERENCES

### Color Palette
```css
/* Primary Green */
--color-green-600: #16a34a
--color-green-700: #15803d
--color-green-50: #f0fdf4

/* Status Colors */
--color-blue-600: #2563eb   /* Info, Dikonfirmasi */
--color-red-600: #dc2626    /* Low Stock, Habis */
--color-orange-600: #ea580c /* Delivery, Dikirim */
--color-yellow-600: #ca8a04 /* Pesanan Baru */
--color-purple-600: #9333ea /* Dikemas */
```

### Typography
```css
/* Headings */
h1: text-4xl font-bold (36px)
h2: text-2xl font-bold (24px)
h3: text-xl font-semibold (20px)

/* Body */
p: text-base (16px)
small: text-sm (14px)
```

---

## 📸 SCREENSHOT CHECKLIST

### Admin Pusat (4 pages)
- [ ] `/admin-pusat` - Dashboard overview
- [ ] `/admin-pusat/products` - Table with edit mode
- [ ] `/admin-pusat/branches` - Grid 3 cabang
- [ ] `/admin-pusat/analytics` - Charts & top products

### Admin Cabang (4 pages)
- [ ] `/admin-cabang` - Dashboard with alerts
- [ ] `/admin-cabang/orders` - Order card with timeline
- [ ] `/admin-cabang/history` - History list with stats
- [ ] `/admin-cabang/inventory` - Table with edit mode

### Pelanggan (9 pages)
- [ ] `/` - Home hero
- [ ] `/products` - Grid with filters
- [ ] `/product/1` - Detail page
- [ ] `/cart` - Cart with items
- [ ] `/checkout` - Form filled
- [ ] `/payment` - Payment methods
- [ ] `/order-success` - Success message
- [ ] `/orders` - Order list
- [ ] `/order-tracking/:id` - Timeline

### Auth (3 pages)
- [ ] `/login` - Login form
- [ ] `/register` - Register form
- [ ] `/forgot-password` - Reset flow

**TOTAL: 20 SCREENSHOTS**

---

## 🔧 DEV TOOLS

### Browser Console Commands
```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('user')))

// Check cart
console.log(JSON.parse(localStorage.getItem('cart')))

// Clear all data
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Network Tab
```
Filter: Fetch/XHR
Watch for API calls (none yet, all mock data)
```

---

## ✅ TESTING COMPLETION

```
□ Admin Pusat Login      → /admin-pusat
□ Edit Product Price     → Save successful
□ View All Branches      → 3 cards visible
□ View Analytics         → Top 5 products shown
□ Logout                 → Back to login

□ Admin Cabang Login     → /admin-cabang
□ Confirm New Order      → Status updated
□ Complete Order Flow    → Auto move to history
□ Edit Inventory Stock   → +10 saved
□ Logout                 → Back to login

□ Customer Browse        → /products
□ Select Branch          → Jakarta Pusat
□ Add to Cart            → Login redirect
□ Complete Checkout      → Delivery selected
□ Process Payment        → QRIS chosen
□ View Order Success     → Order ID shown
□ Track Order            → Timeline visible
□ Logout                 → Back to home
```

---

**🎉 SEMUA URL READY UNTUK TESTING!**

Copy-paste URL di atas untuk akses langsung setiap page tanpa navigasi manual!

---

**Last Updated:** April 16, 2026  
**URL Reference Version:** 1.0
