# ⚡ QUICK START GUIDE - HASIL BUMI DENGAN SUPABASE

**Aplikasi Anda sudah FULLY MIGRATED ke Supabase!** 🎉

---

## 🚀 LANGKAH CEPAT (5 Menit)

### **Step 1: Buka Aplikasi** ✅

Aplikasi sudah running di `http://localhost:5173`

**Auto-seed** sudah aktif! Database akan otomatis terisi saat pertama kali buka.

---

### **Step 2: Buat Akun Test** 🔐

#### **Option A: Via UI (Mudah)**

1. **Buka halaman Register:** `http://localhost:5173/register`
2. **Fill form:**
   - Email: `customer@hasilbumi.com`
   - Password: `demo123`
   - Nama: `Budi Santoso`
   - Role: **Pelanggan**
3. **Klik "Daftar"**
4. **Auto-login** → Redirect ke Homepage

#### **Option B: Via Console (Cepat)**

Buka **Browser Console (F12)** dan paste:

```javascript
// Create Customer
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@hasilbumi.com',
    password: 'demo123',
    name: 'Budi Santoso',
    role: 'pelanggan'
  })
}).then(res => res.json()).then(console.log);

// Create Admin Cabang
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin.jktpusat@hasilbumi.com',
    password: 'demo123',
    name: 'Admin Jakarta Pusat',
    role: 'admin_cabang',
    branchId: 1
  })
}).then(res => res.json()).then(console.log);

// Create Admin Pusat
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin.pusat@hasilbumi.com',
    password: 'demo123',
    name: 'Admin Pusat',
    role: 'admin_pusat'
  })
}).then(res => res.json()).then(console.log);
```

---

### **Step 3: Login & Test** 🧪

#### **Test Login Pelanggan:**
1. Buka `/login`
2. Pilih role: **Pelanggan**
3. Email: `customer@hasilbumi.com`
4. Password: `demo123`
5. Klik "Masuk"
6. ✅ Should redirect ke homepage dengan nama user di header

#### **Test Login Admin Cabang:**
1. Logout (klik profile → logout)
2. Login dengan:
   - Role: **Admin Cabang**
   - Email: `admin.jktpusat@hasilbumi.com`
   - Password: `demo123`
3. ✅ Should redirect ke `/admin-cabang`

#### **Test Login Admin Pusat:**
1. Logout
2. Login dengan:
   - Role: **Admin Pusat**
   - Email: `admin.pusat@hasilbumi.com`
   - Password: `demo123`
3. ✅ Should redirect ke `/admin-pusat`

---

## 🎯 FITUR YANG SUDAH BERFUNGSI

### ✅ **Authentication**
- [x] Register user baru (real Supabase Auth)
- [x] Login dengan role validation
- [x] Session persistence (refresh tetap login)
- [x] Logout functionality
- [x] Protected routes

### ✅ **Products**
- [x] Fetch products from database
- [x] Product detail page
- [x] Stock management per branch
- [x] Weight variants (0.5kg, 1kg, 2kg, etc)

### ✅ **Shopping Cart**
- [x] Add to cart
- [x] Update quantity
- [x] Remove from cart
- [x] Calculate total price

### ✅ **Orders**
- [x] Create order (dengan validasi max 100 delivery/day)
- [x] Order tracking
- [x] Status update by Admin Cabang
- [x] Pickup vs Delivery flow (3 tahap vs 5 tahap)

### ✅ **Inventory Management**
- [x] View inventory by branch
- [x] Update stock (Admin Cabang/Pusat)
- [x] Low stock alerts (< 20kg)
- [x] Threshold settings per product per branch

### ✅ **Admin Features**
- [x] Admin Cabang dashboard
- [x] Admin Pusat analytics
- [x] Multi-branch management
- [x] Order management per branch

---

## 🧪 TESTING SCENARIOS

### **Scenario 1: Customer Journey (End-to-End)**

1. **Register** sebagai pelanggan
2. **Browse products** di `/products`
3. **Add to cart** (pilih cabang & weight)
4. **Checkout** dengan delivery method
5. **Submit order**
6. **Track order** di `/orders`
7. ✅ Order tersimpan di database!

### **Scenario 2: Admin Cabang - Order Processing**

1. **Login** sebagai admin cabang
2. **Lihat pending orders** di `/admin-cabang/orders`
3. **Update status:** New → Confirmed
4. **Update status:** Confirmed → Packing
5. **Update status:** Packing → Shipping (delivery) atau Ready (pickup)
6. **Update status:** Shipping/Ready → Completed
7. ✅ Order pindah ke History!

### **Scenario 3: Inventory Management**

1. **Login** sebagai admin cabang
2. **Buka inventory** di `/admin-cabang/inventory`
3. **Update stock** untuk Tomat Segar: 50 → 30 kg
4. **Refresh page**
5. ✅ Stock persisted di database!
6. **Check low stock alert** (jika < 20kg)

### **Scenario 4: Multi-Branch Test**

1. **Create 2 orders** dari 2 cabang berbeda
2. **Login sebagai Admin Cabang Jkt Pusat**
3. ✅ Should only see orders from Jakarta Pusat
4. **Login sebagai Admin Pusat**
5. ✅ Should see ALL orders dari semua cabang

---

## 📊 VERIFIKASI BACKEND

### **Check Products in Database**

```javascript
// Open Console (F12)
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/products')
  .then(res => res.json())
  .then(data => console.log('Products:', data));
```

### **Check Your Orders**

```javascript
// Get your user ID
const user = JSON.parse(localStorage.getItem('hasil_bumi_user'));
console.log('User ID:', user.id);

// Fetch your orders
fetch(`https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/orders/user/${user.id}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('hasil_bumi_token')}`
  }
})
.then(res => res.json())
.then(data => console.log('My Orders:', data));
```

### **Check Branch Inventory**

```javascript
// Check Jakarta Pusat (branchId: 1)
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/inventory/1', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('hasil_bumi_token')}`
  }
})
.then(res => res.json())
.then(data => console.log('Inventory Jkt Pusat:', data));
```

---

## 🎨 UI PAGES YANG SUDAH TERINTEGRASI

| **Page** | **Route** | **Supabase Integration** |
|----------|-----------|--------------------------|
| Home | `/` | ✅ Fetch products |
| Products | `/products` | ✅ Fetch products |
| Product Detail | `/products/:id` | ✅ Fetch single product |
| Cart | `/cart` | ✅ Show cart items |
| Checkout | `/checkout` | ✅ Create order API |
| Order Success | `/order-success` | ✅ Display order data |
| Order Tracking | `/order-tracking` | ✅ Fetch order status |
| Orders List | `/orders` | ✅ Fetch user orders |
| Login | `/login` | ✅ Supabase Auth signin |
| Register | `/register` | ✅ Supabase Auth signup |
| Admin Cabang Dashboard | `/admin-cabang` | ✅ Fetch branch data |
| Admin Cabang Orders | `/admin-cabang/orders` | ✅ Fetch & update orders |
| Admin Cabang Inventory | `/admin-cabang/inventory` | ✅ Fetch & update stock |
| Admin Pusat Dashboard | `/admin-pusat` | ✅ Fetch all analytics |
| Admin Pusat Products | `/admin-pusat/products` | ✅ Update products |

---

## 🔧 TROUBLESHOOTING

### **Products tidak muncul?**

1. Open Console (F12)
2. Check error messages
3. Manual seed:
   ```javascript
   fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/seed', { 
     method: 'POST' 
   }).then(res => res.json()).then(console.log);
   ```
4. Refresh page

### **Login gagal dengan "Email atau password salah"?**

1. Pastikan user sudah didaftarkan (jalankan signup)
2. Check password: `demo123`
3. Check role yang dipilih match dengan role saat register

### **"Unauthorized" error?**

1. Logout dan login kembali
2. Clear localStorage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. Register user baru

### **Order tidak tersimpan?**

1. Check console untuk error message
2. Pastikan user sudah login (ada token)
3. Check inventory - stock might be insufficient

---

## 📖 NEXT STEPS

### **For Testing:**
- ✅ Buat 3 user (customer, admin cabang, admin pusat)
- ✅ Test full order flow
- ✅ Test inventory update
- ✅ Test order status update

### **For Production:**
- [ ] Setup email server untuk email confirmation
- [ ] Integrate payment gateway (Midtrans/Xendit)
- [ ] Add real-time notifications
- [ ] Setup automated backups

---

## 🎉 CONGRATULATIONS!

Aplikasi Anda sekarang sudah:
- ✅ **100% connected** ke Supabase
- ✅ **Real authentication** dengan user roles
- ✅ **Persistent data** di database
- ✅ **Production-ready** backend API
- ✅ **Multi-branch** inventory management
- ✅ **Order tracking** dengan validasi

**Siap untuk testing dan demo!** 🚀

---

**Questions?** Check `/SUPABASE_MIGRATION_GUIDE.md` untuk detail lengkap!

**Dashboard:** https://supabase.com/dashboard/project/ppxtvcmbebzcsjaesyqe
