# Hasil Bumi - E-Commerce Platform

Platform aplikasi berbasis web yang dirancang khusus untuk digitalisasi pemasaran dan manajemen stok produk pertanian, peternakan, serta kebutuhan dapur di Toko Sayur "Hasil Bumi".

## 🎯 Fitur Utama

### 1. **Multi Branch (Multi Cabang)**
Sistem mendukung pengelolaan lebih dari satu lokasi toko fisik dengan inventaris stok independen:
- **3 Cabang Aktif:**
  - Hasil Bumi Cabang Jakarta Pusat
  - Hasil Bumi Cabang Jakarta Selatan
  - Hasil Bumi Cabang Tangerang
- Setiap cabang memiliki:
  - Stok independen per produk
  - Threshold stok yang dapat dikonfigurasi
  - Informasi kontak dan jam operasional

### 2. **Pick up In Store**
Pelanggan dapat:
- Memilih cabang toko untuk pengambilan barang
- Melakukan pemesanan dan pembayaran online
- Mengambil barang langsung di cabang yang dipilih
- **GRATIS biaya pengambilan**

### 3. **Local Delivery**
Layanan pengantaran dengan fitur:
- Pengiriman ke alamat pelanggan dalam radius tertentu
- Perhitungan ongkos kirim berbasis jarak (contoh: Rp 15.000)
- Setiap cabang memiliki radius delivery yang ditentukan (5 km)

### 4. **SKU (Stock Keeping Unit)**
Setiap produk memiliki:
- Kode SKU unik untuk pelacakan (contoh: VEG-TOM-001)
- Format SKU: [KATEGORI]-[SINGKATAN]-[NOMOR]
- Memudahkan identifikasi dan manajemen gudang

### 5. **Perishable Goods Management**
Sistem pemantauan khusus untuk produk cepat rusak:
- Label "Perishable" pada produk
- Masa simpan dalam hari (expiryDays)
- Prioritas monitoring di dashboard admin
- Alert visual untuk produk dengan masa simpan pendek

### 6. **Payment Gateway Integration**
Metode pembayaran yang tersedia:
- **COD (Cash on Delivery)** - Bayar saat terima/ambil barang
- **QRIS** - via Midtrans/Xendit
- **Virtual Account** - BCA, Mandiri, BNI, BRI
- **E-Wallet** - GoPay, OVO, Dana, ShopeePay

*Note: Untuk implementasi payment gateway sesungguhnya, diperlukan integrasi dengan Midtrans atau Xendit.*

### 7. **Threshold Stok & Alert System**
Dashboard Admin menampilkan:
- Notifikasi real-time untuk stok rendah
- Batas minimum stok per cabang per produk
- Rekomendasi jumlah restock
- Alert visual dengan warna untuk prioritas

## 📊 Kategori Produk

1. **Sayuran Hijau** - Bayam, Selada, Brokoli
2. **Sayuran Buah** - Tomat, Paprika, Timun, Jagung
3. **Sayuran Akar** - Wortel, Kentang
4. **Bumbu Dapur** - Bawang Bombay
5. **Daging** - Daging Sapi, Ayam Kampung, Ikan Salmon
6. **Peternakan** - Telur Ayam Kampung

## 🛠️ Struktur Aplikasi

### Halaman Customer
1. **Home** - Hero section, fitur utama, produk unggulan
2. **Products** - Katalog lengkap dengan filter kategori
3. **Product Detail** - Informasi detail, SKU, stok per cabang
4. **Cart** - Manajemen keranjang belanja
5. **Checkout** - Form pemesanan dengan pilihan pickup/delivery dan cabang
6. **Order Success** - Konfirmasi pesanan

### Halaman Admin
**Admin Dashboard** (`/admin`) - Manajemen stok komprehensif:
- Selector cabang untuk melihat stok per lokasi
- Overview statistik (Total SKU, Stok Rendah, Perishable Goods, Nilai Inventori)
- Tabel produk dengan informasi lengkap (SKU, stok, threshold)
- Tab khusus untuk monitoring:
  - Semua Produk
  - Produk Stok Rendah
  - Perishable Goods dengan prioritas

## 📱 Fitur Teknis

### Data Management
- **Context API** untuk state management cart
- **Multi-branch inventory** dengan stok independen
- **Product interface** yang komprehensif dengan SKU tracking
- **Branch data** dengan koordinat GPS untuk future features

### UI/UX Features
- Responsive design (mobile-first)
- Badge indicators untuk status produk
- Alert system untuk low stock
- Color-coded priority system
- Sticky header untuk navigasi mudah

## 🚀 Pengembangan Selanjutnya (dengan Supabase)

Untuk mengubah aplikasi ini menjadi production-ready, dapat diintegrasikan dengan Supabase:

### Database Tables yang Dibutuhkan:
1. **products** - Data produk dengan SKU
2. **branches** - Data cabang toko
3. **branch_inventory** - Stok per produk per cabang
4. **orders** - Data pesanan customer
5. **order_items** - Detail item dalam pesanan
6. **users** - Data pelanggan dan admin

### Backend Features:
1. **Real-time Stock Updates** - Sinkronisasi stok real-time
2. **Order Management** - Tracking status pesanan
3. **User Authentication** - Login customer dan admin
4. **Payment Integration** - Integrasi Midtrans/Xendit API
5. **Notification System** - Email/SMS konfirmasi pesanan
6. **Analytics** - Laporan penjualan dan performa cabang

### Advanced Features:
1. **GPS-based Delivery Calculation** - Ongkir otomatis by distance
2. **Inventory Forecasting** - Prediksi kebutuhan restock
3. **Multi-user Admin** - Role-based access control
4. **Mobile App** - Progressive Web App (PWA)
5. **Barcode Scanning** - Untuk SKU tracking
6. **Supplier Management** - Integrasi dengan pemasok

## 📦 Teknologi yang Digunakan

- **React** - UI Framework
- **React Router** - Navigation
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast Notifications
- **Radix UI** - Component Library

## 🎨 Design System

- **Primary Color**: Green (#16a34a) - Representing freshness
- **Alert Colors**:
  - Red - Low stock / Critical
  - Orange - Perishable / Warning
  - Blue - Information
  - Green - Success / Normal stock

## 📝 SDLC Notes

Aplikasi ini dikembangkan mengikuti metodologi SDLC:
1. ✅ **Analisis** - Requirement gathering untuk multi-branch e-commerce
2. ✅ **Perancangan** - Design data structure, UI/UX wireframes
3. ✅ **Pengkodean** - Implementation dengan React & TypeScript
4. ⏳ **Pengujian** - Unit testing dan integration testing (next phase)
5. ⏳ **Deployment** - Production deployment (next phase)
6. ⏳ **Maintenance** - Bug fixes dan feature updates (ongoing)

## 🔐 Catatan Keamanan

**PENTING**: Aplikasi ini adalah prototipe untuk demonstrasi. Untuk production:
- Implementasi autentikasi yang proper
- Enkripsi data sensitif
- Validasi input di backend
- Rate limiting untuk API
- HTTPS wajib untuk payment gateway
- Compliance dengan PCI DSS untuk payment data

---

**Hasil Bumi** - Digitalisasi Pemasaran Produk Pertanian & Peternakan
