# 🔐 Hasil Bumi - Login System & Role-Based Access Guide

## 📋 Overview

Sistem login Hasil Bumi mendukung 3 role berbeda dengan dashboard dan fitur yang disesuaikan untuk setiap role:

1. **Pelanggan** - Customer shopping interface
2. **Admin Cabang** - Store operator with inventory control
3. **Admin Pusat** - Highest authority with full system access

---

## 🎯 Demo Credentials

### Pelanggan (Customer)
```
Email: customer@hasilbumi.com
Password: demo123
Role: pelanggan
```

### Admin Cabang
**Jakarta Pusat:**
```
Email: admin.jktpusat@hasilbumi.com
Password: demo123
Role: admin_cabang
Branch: Hasil Bumi Cabang Jakarta Pusat
```

**Jakarta Selatan:**
```
Email: admin.jktselatan@hasilbumi.com
Password: demo123
Role: admin_cabang
Branch: Hasil Bumi Cabang Jakarta Selatan
```

**Tangerang:**
```
Email: admin.tangerang@hasilbumi.com
Password: demo123
Role: admin_cabang
Branch: Hasil Bumi Cabang Tangerang
```

### Admin Pusat (Central Admin)
```
Email: admin.pusat@hasilbumi.com
Password: demo123
Role: admin_pusat
```

---

## 🏗️ System Architecture

### Authentication Flow

1. **Login Page** (`/login`)
   - Segmented control untuk memilih role (Pelanggan, Admin Cabang, Admin Pusat)
   - Email/Username input
   - Password input
   - Forgot Password link
   - Demo credentials ditampilkan untuk testing

2. **Authentication Context** (`/src/app/context/AuthContext.tsx`)
   - Manages user session
   - Stores user data in localStorage
   - Provides login/logout functions
   - Auto-loads session on app mount

3. **Protected Routes**
   - `/admin-pusat` - Only accessible by admin_pusat
   - `/admin-cabang` - Only accessible by admin_cabang
   - Customer routes accessible by all authenticated users

---

## 👥 Role-Based Features

### 1️⃣ Pelanggan (Customer)

**Access:** `/` (Home), `/products`, `/product/:id`, `/cart`, `/checkout`

**Features:**
- ✅ **Smart Branch Selection** - Pilih cabang terdekat di homepage
- ✅ **Visual Product Catalog** dengan kategori:
  - Sayuran Hijau
  - Sayuran Buah
  - Sayuran Akar
  - Bumbu Dapur
  - Daging
  - Peternakan
- ✅ **Floating Cart** - Quick access ke shopping cart
- ✅ **Checkout Flow** dengan pilihan:
  - Pick up In Store (Gratis)
  - Local Delivery (Rp 15.000)
- ✅ **Payment Gateway Options:**
  - COD (Cash on Delivery)
  - QRIS
  - Virtual Account (BCA, Mandiri, BNI, BRI)
  - E-Wallet (GoPay, OVO, Dana, ShopeePay)

**UI Components:**
- Smart Branch Selection Bar (sticky)
- Product Cards dengan SKU & Perishable status
- Floating Cart dengan quick view
- Checkout dengan branch selector

---

### 2️⃣ Admin Cabang (Store Operator)

**Access:** `/admin-cabang`

**Dashboard Layout:**
- Sidebar Navigation
- Branch Information Display
- Quick Stats (Low Stock & New Orders)

**Features:**

#### **Inventory Control Tab:**
- ✅ View local inventory for assigned branch only
- ✅ **Quick Update Buttons** (+/-) untuk adjust stok harian
- ✅ Khusus untuk **Perishable Goods** (sayuran, daging)
- ✅ Low Stock Alert dengan threshold monitoring
- ❌ **TIDAK BISA** edit harga produk (read-only)
- ✅ View SKU, current stock, threshold

#### **Order Management Tab:**
- ✅ **Task List** untuk incoming orders:
  - 🟠 **New Order** - Pesanan baru masuk
  - 🔵 **Packing** - Sedang dikemas
  - 🟢 **Ready for Pickup** - Siap diambil
- ✅ Order details: Customer name, items count, total price
- ✅ Process button untuk update order status

**Restrictions:**
- ⛔ Cannot edit product prices (Admin Pusat only)
- ⛔ Cannot view other branches' inventory
- ⛔ Cannot access master catalog management

---

### 3️⃣ Admin Pusat (Highest Authority)

**Access:** `/admin-pusat`

**Dashboard Layout:**
- Sidebar Navigation with:
  - Master Catalog
  - Multi-Branch Analytics
  - User Management
- Global System Alerts

**Features:**

#### **Master Catalog:**
- ✅ **Edit Product Details:**
  - ✏️ Product Name
  - ✏️ Category
  - ✏️ Price (Full control)
- ✅ View all SKUs across system
- ✅ See product status (Perishable/Normal)
- ✅ Save/Cancel inline editing

#### **Multi-Branch Analytics:**
- ✅ **Total Revenue Summary** - Aggregated from all branches
- ✅ **Revenue per Branch:**
  - Jakarta Pusat
  - Jakarta Selatan
  - Tangerang
- ✅ Monthly performance metrics
- 📊 Visual comparison antar cabang

#### **User Management:**
- ✅ View total users by role:
  - Total Pelanggan (1,247)
  - Admin Cabang (3)
  - Admin Pusat (1)
- ✅ Future: Create, Edit, Delete users

**Global Stats:**
- 💰 Total Revenue (All branches)
- 📦 Total Products (SKU count)
- 🏪 Total Branches
- 👥 Total Users

---

## 🎨 UI/UX Design

### Login Page Design
- **Color Palette:** Green & White (fresh produce theme)
- **Logo:** Gradient green circle with Leaf icon
- **Role Toggle:** Segmented control dengan 3 options
- **Form:** Clean, modern with proper spacing
- **Demo Info:** Visible untuk testing convenience

### Admin Pusat Dashboard
- **Sidebar:** Dark green header, organized navigation
- **Authority Badge:** "Highest Authority" badge
- **Stats Cards:** Color-coded (Green, Blue, Purple, Orange)
- **Editable Table:** Inline editing dengan Save/Cancel

### Admin Cabang Dashboard
- **Sidebar:** Branch-specific information
- **Authority Badge:** "Store Operator" badge
- **Quick Stats:** Red (Low Stock), Blue (New Orders)
- **Tabs:** Inventory Control & Order Management
- **Alert System:** Red alert untuk low stock items

### Customer Interface
- **Branch Selector:** Sticky bar dengan MapPin icon
- **Floating Cart:** Bottom-right dengan badge count
- **Categories:** Visual buttons dengan icons
- **Product Cards:** Image, SKU, Perishable badge

---

## 🔄 User Flows

### Customer Journey:
1. Login atau akses tanpa login
2. Pilih cabang terdekat di Smart Branch Selection
3. Browse produk by kategori (Sayuran Segar, Daging, Frozen Food)
4. Add to cart (Floating cart shows count)
5. View cart
6. Checkout:
   - Pilih metode: Pick up In Store / Local Delivery
   - Pilih cabang (jika pickup)
   - Isi alamat (jika delivery)
   - Pilih payment method
7. Complete order

### Admin Cabang Journey:
1. Login dengan email cabang
2. View dashboard cabang assigned
3. Check Low Stock Alert
4. Update inventory:
   - Go to Inventory Control tab
   - Use Quick Update (+/-) untuk perishable goods
   - Cannot edit prices
5. Process orders:
   - Go to Order Management tab
   - View New Orders
   - Mark as Packing → Ready for Pickup

### Admin Pusat Journey:
1. Login dengan admin pusat credentials
2. View global dashboard dengan all branches stats
3. Edit Master Catalog:
   - Change product names
   - Update categories
   - Adjust prices globally
4. View Multi-Branch Analytics
5. Manage users (future feature)

---

## 🔐 Security Features (Current)

### Client-Side (Demo Mode):
- ✅ Role-based access control
- ✅ Session persistence in localStorage
- ✅ Route protection
- ✅ Email/password validation
- ✅ Role verification on login

### Production Recommendations (Supabase Integration):

#### **Supabase Auth Setup:**

1. **Sign Up Route** (`/supabase/functions/server/auth.ts`):
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email: email,
  password: password,
  user_metadata: { 
    name: name,
    role: role, // pelanggan, admin_cabang, admin_pusat
    branchId: branchId // for admin_cabang
  },
  email_confirm: true // Auto-confirm for demo
})
```

2. **Sign In:**
```typescript
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})
```

3. **Role Verification:**
```typescript
// In protected routes
const { data: { user } } = await supabase.auth.getUser(accessToken);
if (user.user_metadata.role !== 'admin_pusat') {
  return new Response('Unauthorized', { status: 403 });
}
```

4. **Database RLS (Row Level Security):**
```sql
-- Only admin_pusat can update product prices
CREATE POLICY "Only admin_pusat can update prices" ON products
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin_pusat'
);

-- Admin_cabang can only view their branch inventory
CREATE POLICY "Admin cabang view own branch" ON branch_inventory
FOR SELECT USING (
  branch_id = (auth.jwt() -> 'user_metadata' ->> 'branchId')::integer
);
```

---

## 📊 Database Schema (Recommended for Supabase)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('pelanggan', 'admin_cabang', 'admin_pusat')),
  branch_id INTEGER REFERENCES branches(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products (Master Catalog)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  unit TEXT NOT NULL,
  is_perishable BOOLEAN DEFAULT false,
  expiry_days INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Branches
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  open_hours TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  delivery_radius INTEGER DEFAULT 5
);

-- Branch Inventory (Multi-Branch Stock)
CREATE TABLE branch_inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  branch_id INTEGER REFERENCES branches(id),
  stock INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 10,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, branch_id)
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  branch_id INTEGER REFERENCES branches(id),
  delivery_method TEXT CHECK (delivery_method IN ('pickup', 'delivery')),
  payment_method TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'packing', 'ready', 'completed', 'cancelled')),
  total_amount INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time INTEGER NOT NULL, -- Snapshot price
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Next Steps untuk Production

### 1. Supabase Integration
- [ ] Setup Supabase project
- [ ] Implement auth server routes
- [ ] Add RLS policies
- [ ] Migrate demo users to database

### 2. Payment Gateway
- [ ] Integrate Midtrans/Xendit
- [ ] Setup QRIS payment
- [ ] Setup Virtual Account
- [ ] Setup E-Wallet connectors

### 3. Real-time Features
- [ ] Live stock updates dengan Supabase Realtime
- [ ] Order status notifications
- [ ] Low stock alerts untuk admin

### 4. Advanced Features
- [ ] Email notifications (order confirmation, low stock alerts)
- [ ] SMS notifications untuk order updates
- [ ] Push notifications
- [ ] Analytics dashboard dengan charts
- [ ] Export reports (Excel/PDF)

### 5. Security Enhancements
- [ ] Two-factor authentication (2FA)
- [ ] Password strength requirements
- [ ] Rate limiting
- [ ] HTTPS enforcement
- [ ] CSRF protection
- [ ] Input sanitization

---

## 📱 Mobile Optimization

All dashboards are fully responsive:
- ✅ Mobile sidebar with hamburger menu
- ✅ Collapsible navigation
- ✅ Touch-friendly buttons
- ✅ Optimized table views untuk mobile
- ✅ Floating cart accessible di mobile

---

## 🎓 Training Guide

### For Admin Cabang:
1. Login menggunakan email cabang Anda
2. Dashboard menampilkan info cabang dan quick stats
3. **Update Stok Harian:**
   - Buka tab "Inventory Control"
   - Untuk produk perishable, gunakan tombol +/- untuk update stok
   - Perhatikan Low Stock Alert (warna merah)
4. **Process Orders:**
   - Buka tab "Order Management"
   - Lihat pesanan baru di status "New Order"
   - Klik "Process" untuk update ke "Packing"
   - Setelah siap, update ke "Ready for Pickup"

### For Admin Pusat:
1. Login dengan credentials admin pusat
2. Dashboard menampilkan overview semua cabang
3. **Edit Master Catalog:**
   - Klik tab "Master Catalog"
   - Klik tombol "Edit" pada produk yang ingin diubah
   - Edit nama, kategori, atau harga
   - Klik "Save" untuk menyimpan atau "Cancel" untuk batal
4. **View Analytics:**
   - Klik tab "Multi-Branch Analytics"
   - Lihat revenue per cabang
   - Compare performance antar cabang

---

**Hasil Bumi** - Digitalisasi Lengkap dengan Multi-Role Access Control
