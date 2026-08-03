# 🚀 SUPABASE MIGRATION GUIDE - HASIL BUMI E-COMMERCE

**Status:** ✅ **MIGRATION COMPLETE!**

Aplikasi Hasil Bumi telah berhasil dimigrasi dari hardcoded data ke **Full Supabase Backend** dengan fitur:
- ✅ Real Supabase Authentication
- ✅ Persistent data storage (KV Store)
- ✅ Multi-branch inventory management
- ✅ Real-time order tracking
- ✅ API-driven architecture

---

## 📋 TABLE OF CONTENTS

1. [Setup Instructions](#setup-instructions)
2. [Architecture Overview](#architecture-overview)
3. [API Endpoints](#api-endpoints)
4. [User Management](#user-management)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ SETUP INSTRUCTIONS

### **Step 1: Seed Database (REQUIRED - First Time Only)**

Sebelum menggunakan aplikasi, Anda **WAJIB seed data** ke database:

```bash
# Open browser console atau gunakan Postman/curl
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/seed', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweHR2Y21iZWJ6Y3NqYWVzeXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjE1MTcsImV4cCI6MjA5MTgzNzUxN30.SR3dXAAxg5jfSROL6oA7njFhsLW9zxvVjUQo60TwGZA'
  }
})
.then(res => res.json())
.then(data => console.log('Seed result:', data));
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Data seeded successfully",
  "productsCount": 2,
  "branchesCount": 3
}
```

### **Step 2: Create Test Users**

Buat user test untuk setiap role:

#### **A. Pelanggan (Customer)**
```javascript
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@hasilbumi.com',
    password: 'demo123',
    name: 'Budi Santoso',
    role: 'pelanggan'
  })
})
.then(res => res.json())
.then(data => console.log('Customer created:', data));
```

#### **B. Admin Cabang Jakarta Pusat**
```javascript
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
})
.then(res => res.json())
.then(data => console.log('Admin Cabang created:', data));
```

#### **C. Admin Cabang Jakarta Selatan**
```javascript
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin.jktselatan@hasilbumi.com',
    password: 'demo123',
    name: 'Admin Jakarta Selatan',
    role: 'admin_cabang',
    branchId: 2
  })
})
.then(res => res.json())
.then(data => console.log('Admin Cabang created:', data));
```

#### **D. Admin Pusat**
```javascript
fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin.pusat@hasilbumi.com',
    password: 'demo123',
    name: 'Admin Pusat',
    role: 'admin_pusat'
  })
})
.then(res => res.json())
.then(data => console.log('Admin Pusat created:', data));
```

### **Step 3: Login & Test**

Sekarang Anda bisa login di aplikasi dengan credentials:

| **Role** | **Email** | **Password** |
|----------|-----------|--------------|
| Pelanggan | customer@hasilbumi.com | demo123 |
| Admin Cabang (Jkt Pusat) | admin.jktpusat@hasilbumi.com | demo123 |
| Admin Cabang (Jkt Selatan) | admin.jktselatan@hasilbumi.com | demo123 |
| Admin Pusat | admin.pusat@hasilbumi.com | demo123 |

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React App (localhost:5173)                                  │
│  - AuthContext (login, register, session)                    │
│  - API utils (/src/app/utils/api.ts)                         │
│  - Hooks (useProducts, useBranches)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE EDGE FUNCTION                      │
│  Hono Web Server (/supabase/functions/server/index.tsx)     │
│  - Auth Routes (/auth/signin, /auth/signup)                 │
│  - Products Routes (/products, /products/:id)               │
│  - Inventory Routes (/inventory/:branchId)                  │
│  - Orders Routes (/orders, /orders/:id/status)              │
│  - Branches Routes (/branches)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ KV Store API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│  PostgreSQL + KV Store Table                                 │
│  - kv_store_376a5b07 (key-value pairs)                      │
│  - Supabase Auth (users management)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API ENDPOINTS

Base URL: `https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07`

### **Authentication**

#### **POST /auth/signup**
Register user baru
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "pelanggan|admin_cabang|admin_pusat",
  "branchId": 1 // optional, untuk admin_cabang
}
```

#### **POST /auth/signin**
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **GET /auth/session**
Check session validity
```
Headers: Authorization: Bearer {access_token}
```

---

### **Products**

#### **GET /products**
Get all products
```
Headers: Authorization: Bearer {token}
```

#### **GET /products/:id**
Get single product
```
Headers: Authorization: Bearer {token}
```

#### **PUT /products/:id**
Update product (Admin Pusat only)
```json
{
  "price": 15000,
  "stock": 100
}
```

---

### **Inventory**

#### **GET /inventory/:branchId**
Get inventory untuk branch tertentu
```
Headers: Authorization: Bearer {token}
```

#### **PUT /inventory/:branchId/:productId**
Update stock (Admin Cabang/Pusat)
```json
{
  "stock": 50,
  "threshold": 10
}
```

---

### **Orders**

#### **GET /orders/branch/:branchId**
Get orders by branch (Admin Cabang/Pusat)
```
Headers: Authorization: Bearer {token}
```

#### **GET /orders/user/:userId**
Get orders by user (Pelanggan)
```
Headers: Authorization: Bearer {token}
```

#### **POST /orders**
Create new order
```json
{
  "branchId": 1,
  "deliveryMethod": "pickup|delivery",
  "items": [...],
  "totalAmount": 50000,
  "shippingAddress": "..."
}
```

#### **PUT /orders/:orderId/status**
Update order status (Admin Cabang/Pusat)
```json
{
  "status": "confirmed|packing|shipping|ready|completed",
  "estimatedTime": "15:30"
}
```

---

### **Branches**

#### **GET /branches**
Get all branches
```
Headers: Authorization: Bearer {token}
```

---

## 👥 USER MANAGEMENT

### **Role-Based Access Control**

| **Role** | **Permissions** |
|----------|----------------|
| **pelanggan** | - View products<br>- Create orders<br>- View own orders<br>- Track order status |
| **admin_cabang** | - View branch inventory<br>- Update branch stock<br>- Manage branch orders<br>- Update order status |
| **admin_pusat** | - View all branches<br>- Update all products<br>- View all orders<br>- Analytics dashboard |

### **Create New User (Manual)**

Via Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/ppxtvcmbebzcsjaesyqe/auth/users
2. Click "Add user"
3. Fill email, password
4. In "User metadata", add:
   ```json
   {
     "name": "User Name",
     "role": "pelanggan",
     "branchId": 1
   }
   ```

---

## 🧪 TESTING GUIDE

### **Test 1: Authentication Flow**

1. **Register new user**
   - Navigate to `/register`
   - Fill form dengan email, password, name
   - Pilih role
   - Click "Daftar"
   - Should auto-login dan redirect ke homepage

2. **Login existing user**
   - Navigate to `/login`
   - Fill credentials
   - Pilih role
   - Click "Masuk"
   - Should redirect ke dashboard sesuai role

3. **Session persistence**
   - Login
   - Refresh page
   - Should tetap logged in
   - Check localStorage untuk token

### **Test 2: Product Browsing**

1. Navigate to `/products`
2. Products should load from API
3. Check console: `GET /products` success
4. Click product → Detail page
5. Check console: `GET /products/:id` success

### **Test 3: Order Creation**

1. Login sebagai pelanggan
2. Add products to cart
3. Navigate to `/checkout`
4. Pilih delivery method
5. Pilih cabang
6. Fill alamat (jika delivery)
7. Submit order
8. Check console: `POST /orders` success
9. Redirect to `/order-success`

### **Test 4: Admin Cabang - Order Management**

1. Login sebagai admin_cabang
2. Navigate to `/admin-cabang/orders`
3. Should see orders untuk branch sendiri
4. Update order status
5. Check console: `PUT /orders/:id/status` success

### **Test 5: Inventory Update**

1. Login sebagai admin_cabang
2. Navigate to `/admin-cabang/inventory`
3. Update stock untuk product
4. Check console: `PUT /inventory/:branchId/:productId` success
5. Refresh → Stock should persist

---

## 🐛 TROUBLESHOOTING

### **Problem: "Failed to fetch products"**

**Solution:**
1. Check if data sudah di-seed:
   ```javascript
   fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/products')
     .then(res => res.json())
     .then(data => console.log(data));
   ```
2. Jika empty array, jalankan seed:
   ```javascript
   fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/seed', { method: 'POST' })
   ```

### **Problem: "Unauthorized" error**

**Solution:**
1. Check token di localStorage:
   ```javascript
   console.log(localStorage.getItem('hasil_bumi_token'));
   ```
2. Jika null, login lagi
3. Jika ada token, check validity:
   ```javascript
   fetch('https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/auth/session', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('hasil_bumi_token')}`
     }
   }).then(res => res.json()).then(console.log);
   ```

### **Problem: "Email already exists"**

**Solution:**
User sudah terdaftar. Login dengan password yang sama atau gunakan email lain.

### **Problem: "Batas maksimal 100 pesanan delivery"**

**Solution:**
Ini validasi backend! Artinya backend bekerja dengan baik. Pilih:
1. Pickup method instead of delivery
2. Pilih cabang lain
3. Atau tunggu besok (reset per hari)

### **Problem: Orders tidak muncul**

**Solution:**
1. Check user ID match:
   ```javascript
   const user = JSON.parse(localStorage.getItem('hasil_bumi_user'));
   console.log('User ID:', user.id);
   ```
2. Check orders di database:
   ```javascript
   fetch(`https://ppxtvcmbebzcsjaesyqe.supabase.co/functions/v1/make-server-376a5b07/orders/user/${user.id}`, {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('hasil_bumi_token')}`
     }
   }).then(res => res.json()).then(console.log);
   ```

---

## 📊 DATABASE STRUCTURE (KV Store)

Data disimpan dalam format key-value di table `kv_store_376a5b07`:

### **Products**
```
Key: "products"
Value: [
  {
    id: 1,
    name: "Tomat Segar",
    price: 15000,
    stockByBranch: [
      { branchId: 1, stock: 50, threshold: 10 },
      ...
    ],
    ...
  }
]
```

### **Branches**
```
Key: "branches"
Value: [
  {
    id: 1,
    name: "Hasil Bumi Cabang Jakarta Pusat",
    address: "...",
    ...
  }
]
```

### **Orders (Multiple Keys)**
```
Key: "order:{orderId}"
Key: "order:branch:{branchId}:{orderId}"
Key: "order:user:{userId}:{orderId}"

Value: {
  id: "ORD-1234567890",
  userId: "uuid",
  branchId: 1,
  status: "new",
  items: [...],
  totalAmount: 50000,
  createdAt: "2026-04-16T10:30:00Z"
}
```

---

## 🚀 NEXT STEPS (Future Enhancements)

### **1. Payment Gateway Integration**
- [ ] Midtrans QRIS
- [ ] Virtual Account (BCA, Mandiri, BNI)
- [ ] E-Wallet (GoPay, OVO, Dana)

### **2. Real-time Notifications**
- [ ] Low stock alerts (< 20kg)
- [ ] Order status updates
- [ ] Email notifications

### **3. Analytics Dashboard**
- [ ] Sales reporting
- [ ] Inventory forecasting
- [ ] Popular products

### **4. Expired Goods Management**
- [ ] Auto-alert perishable expiry
- [ ] Cron job untuk expired products
- [ ] Diskon otomatis untuk near-expiry

---

## 📞 SUPPORT

**Dashboard:** https://supabase.com/dashboard/project/ppxtvcmbebzcsjaesyqe

**Edge Function Logs:** https://supabase.com/dashboard/project/ppxtvcmbebzcsjaesyqe/functions

**Database Tables:** https://supabase.com/dashboard/project/ppxtvcmbebzcsjaesyqe/database/tables

---

**Last Updated:** April 16, 2026
**Migration Status:** ✅ **COMPLETE**
**Version:** 1.0.0
