# 🧪 TESTING INSTRUCTIONS - ORDER TRACKING

**Last Updated:** 16 April 2026  
**Version:** 4.1.0 FINAL  

---

## 🎯 APA YANG SUDAH DIUBAH?

### **✅ FITUR BARU: DEMO MODE SWITCHER**

Sekarang di halaman **Lacak Pesanan** ada **DEMO MODE** untuk testing yang lebih mudah!

**Lokasi:** `/tracking/HB1734258960123`

**Fitur:**
- ✅ **Button Switcher** untuk toggle antara Pickup dan Delivery
- ✅ **Auto-update** tracking steps saat switch
- ✅ **Visual indicator** menunjukkan mode aktif
- ✅ **Badge counter** menampilkan jumlah tahap (3 atau 5)

---

## 📱 CARA TESTING

### **METHOD 1: MENGGUNAKAN DEMO MODE (RECOMMENDED)**

```bash
# Step 1: Buka aplikasi
http://localhost:5173

# Step 2: Navigate ke Order Tracking
http://localhost:5173/tracking/HB1734258960123

# Step 3: Lihat "Demo Mode" card (warna biru)
# Default: PICKUP mode aktif

# Step 4: TEST PICKUP
1. Pastikan button "Pickup" berwarna hijau (aktif)
2. Lihat "Status Pengiriman" card
3. ✅ VERIFY:
   - Badge di kanan atas: "3 Tahap"
   - Step 1: "Pesanan Dibuat" (✓ hijau)
   - Step 2: "Pesanan Dikonfirmasi" (✓ hijau)
   - Step 3: "Pesanan Siap Diambil" (⭕ abu-abu, icon Store)
   - Total: HANYA 3 steps
   - NO "Dikemas", NO "Dalam Pengiriman", NO "Selesai"

# Step 5: TEST DELIVERY
1. Klik button "Delivery"
2. Lihat perubahan INSTANT
3. ✅ VERIFY:
   - Badge di kanan atas: "5 Tahap"
   - Step 1: "Pesanan Dibuat" (✓ hijau)
   - Step 2: "Pesanan Dikonfirmasi" (✓ hijau)
   - Step 3: "Pesanan Sudah Dikemas" (⭕ abu-abu) ← IMPORTANT!
   - Step 4: "Pesanan Dalam Pengiriman" (⭕ abu-abu, icon Truck)
   - Step 5: "Pesanan Selesai" (⭕ abu-abu)
   - Total: 5 steps

# Step 6: Toggle beberapa kali
1. Klik "Pickup" → lihat 3 steps
2. Klik "Delivery" → lihat 5 steps
3. Klik "Pickup" → lihat 3 steps lagi
4. Pastikan selalu konsisten
```

---

### **METHOD 2: HARD REFRESH BROWSER**

Jika perubahan tidak terlihat:

```bash
# Chrome / Edge
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Firefox
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (Mac)

# Safari
Cmd + Option + R (Mac)
```

---

## 🎨 VISUAL GUIDE

### **PICKUP MODE (3 Tahap)**

```
┌────────────────────────────────────────┐
│ 🔧 Demo Mode - Metode Pengiriman       │
│                                        │
│ 📦 PICKUP - 3 Tahap                    │
│ (Dibuat → Dikonfirmasi → Siap Diambil) │
│                                        │
│ [PICKUP ✓]  [Delivery]  ← Buttons     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Status Pengiriman          [3 Tahap]   │
├────────────────────────────────────────┤
│                                        │
│  ✓  Pesanan Dibuat                     │ ← Hijau
│  │  15 Des 2024, 10:30                 │
│  │                                     │
│  ✓  Pesanan Dikonfirmasi               │ ← Hijau
│  │  15 Des 2024, 10:35                 │
│  │                                     │
│  ⭕ Pesanan Siap Diambil               │ ← Abu-abu
│     Pesanan siap untuk diambil di toko │
│                                        │
└────────────────────────────────────────┘
```

### **DELIVERY MODE (5 Tahap)**

```
┌────────────────────────────────────────┐
│ 🔧 Demo Mode - Metode Pengiriman       │
│                                        │
│ 🚚 DELIVERY - 5 Tahap                  │
│ (Dibuat → Dikonfirmasi → Sudah Dikemas │
│  → Dalam Pengiriman → Selesai)         │
│                                        │
│ [Pickup]  [DELIVERY ✓]  ← Buttons     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Status Pengiriman          [5 Tahap]   │
├────────────────────────────────────────┤
│                                        │
│  ✓  Pesanan Dibuat                     │ ← Hijau
│  │  15 Des 2024, 10:30                 │
│  │                                     │
│  ✓  Pesanan Dikonfirmasi               │ ← Hijau
│  │  15 Des 2024, 10:35                 │
│  │                                     │
│  ⭕ Pesanan Sudah Dikemas              │ ← Abu-abu
│  │  Pesanan sudah selesai dikemas      │
│  │  oleh toko                           │
│  │                                     │
│  ⭕ Pesanan Dalam Pengiriman           │ ← Abu-abu
│  │  Pesanan sedang dalam perjalanan    │
│  │                                     │
│  ⭕ Pesanan Selesai                    │ ← Abu-abu
│     Pesanan telah diterima              │
│                                        │
└────────────────────────────────────────┘
```

---

## 📋 CHECKLIST TESTING

### **✅ PICKUP (3 Tahap):**
- [ ] Klik button "Pickup"
- [ ] Button "Pickup" berwarna hijau (aktif)
- [ ] Demo card menunjukkan: "📦 PICKUP - 3 Tahap"
- [ ] Badge di Status Pengiriman: "3 Tahap"
- [ ] Step 1: "Pesanan Dibuat" ✓ hijau
- [ ] Step 2: "Pesanan Dikonfirmasi" ✓ hijau
- [ ] Step 3: "Pesanan Siap Diambil" ⭕ abu-abu
- [ ] Icon Step 3: Store (bukan Truck atau CheckCircle)
- [ ] Total steps: **HANYA 3**
- [ ] Tidak ada step "Dikemas"
- [ ] Tidak ada step "Sudah Dikemas"
- [ ] Tidak ada step "Dalam Pengiriman"
- [ ] Tidak ada step "Selesai"

### **✅ DELIVERY (5 Tahap):**
- [ ] Klik button "Delivery"
- [ ] Button "Delivery" berwarna hijau (aktif)
- [ ] Demo card menunjukkan: "🚚 DELIVERY - 5 Tahap"
- [ ] Badge di Status Pengiriman: "5 Tahap"
- [ ] Step 1: "Pesanan Dibuat" ✓ hijau
- [ ] Step 2: "Pesanan Dikonfirmasi" ✓ hijau
- [ ] Step 3: **"Pesanan Sudah Dikemas"** ⭕ abu-abu ← PENTING!
- [ ] Step 3 description: "Pesanan sudah selesai dikemas oleh toko"
- [ ] Step 4: "Pesanan Dalam Pengiriman" ⭕ abu-abu
- [ ] Icon Step 4: Truck
- [ ] Step 5: "Pesanan Selesai" ⭕ abu-abu
- [ ] Total steps: **5**

---

## 🔍 DEBUGGING TIPS

### **Jika Masih Belum Berubah:**

#### **1. Clear Browser Cache**
```bash
# Chrome
1. Buka DevTools (F12)
2. Klik kanan pada Refresh button
3. Pilih "Empty Cache and Hard Reload"

# Firefox
1. Preferences → Privacy & Security
2. Cookies and Site Data → Clear Data

# Safari
1. Develop → Empty Caches
2. Refresh page
```

#### **2. Check Console Errors**
```bash
# Buka DevTools (F12)
# Tab: Console
# Lihat jika ada error merah
# Screenshot dan share jika ada error
```

#### **3. Verify File Changes**
```bash
# Cek file /src/app/pages/OrderTracking.tsx
# Line 62-128: Function getTrackingSteps

# PICKUP (line 63-87):
if (deliveryMethod === 'pickup') {
  return [
    { status: 'Pesanan Dibuat', ... },
    { status: 'Pesanan Dikonfirmasi', ... },
    { status: 'Pesanan Siap Diambil', ... },
  ];
}

# DELIVERY (line 88-128):
else {
  return [
    { status: 'Pesanan Dibuat', ... },
    { status: 'Pesanan Dikonfirmasi', ... },
    { status: 'Pesanan Sudah Dikemas', ... }, ← MUST BE "SUDAH"
    { status: 'Pesanan Dalam Pengiriman', ... },
    { status: 'Pesanan Selesai', ... },
  ];
}
```

#### **4. Restart Dev Server**
```bash
# Terminal 1: Stop server
Ctrl + C

# Terminal 2: Restart
npm run dev

# Atau
pnpm dev
```

---

## 📸 SCREENSHOT CHECKLIST

### **PICKUP Mode:**
```
Screenshot harus menunjukkan:
✅ Demo card dengan text "📦 PICKUP - 3 Tahap"
✅ Button "Pickup" berwarna hijau
✅ Badge "3 Tahap" di kanan atas Status Pengiriman
✅ Timeline dengan HANYA 3 steps
✅ Step terakhir: "Pesanan Siap Diambil" dengan icon Store
```

### **DELIVERY Mode:**
```
Screenshot harus menunjukkan:
✅ Demo card dengan text "🚚 DELIVERY - 5 Tahap"
✅ Button "Delivery" berwarna hijau
✅ Badge "5 Tahap" di kanan atas Status Pengiriman
✅ Timeline dengan 5 steps lengkap
✅ Step 3: "Pesanan Sudah Dikemas" (bukan "Dikemas")
✅ Step 4: "Pesanan Dalam Pengiriman" dengan icon Truck
✅ Step 5: "Pesanan Selesai"
```

---

## 🎯 EXPECTED BEHAVIOR

### **Button Interaction:**
```
1. Click "Pickup" → Timeline berubah ke 3 steps (instant)
2. Click "Delivery" → Timeline berubah ke 5 steps (instant)
3. Toggle multiple times → Selalu konsisten
4. No page refresh needed
5. No delay or loading
```

### **Visual Feedback:**
```
Active button:
- Background: hijau (green-600)
- Text: putih
- Border: none

Inactive button:
- Background: putih
- Text: hitam
- Border: abu-abu
```

---

## 📊 COMPARISON TABLE

| **Aspect**              | **PICKUP** ✅          | **DELIVERY** ✅                |
|-------------------------|------------------------|-------------------------------|
| **Demo Card Text**      | 📦 PICKUP - 3 Tahap    | 🚚 DELIVERY - 5 Tahap         |
| **Active Button**       | Pickup (hijau)         | Delivery (hijau)              |
| **Badge Count**         | 3 Tahap                | 5 Tahap                       |
| **Step 1**              | Pesanan Dibuat ✓       | Pesanan Dibuat ✓              |
| **Step 2**              | Pesanan Dikonfirmasi ✓ | Pesanan Dikonfirmasi ✓        |
| **Step 3**              | **Siap Diambil** ⭕    | **Sudah Dikemas** ⭕          |
| **Step 4**              | -                      | Dalam Pengiriman ⭕           |
| **Step 5**              | -                      | Pesanan Selesai ⭕            |
| **Total Steps**         | **3**                  | **5**                         |
| **Last Icon**           | 🏪 Store               | ✅ CheckCircle                |

---

## 🚀 PRODUCTION READINESS

### **Before Production:**

```bash
# 1. Remove Demo Mode Card
# Edit /src/app/pages/OrderTracking.tsx
# Comment out atau delete lines dengan "Demo Mode" card

# 2. Set Default Delivery Method
# Dari API response, bukan state
const deliveryMethod = orderData.deliveryMethod; // dari API

# 3. Remove State Management
# Delete line: const [deliveryMethod, setDeliveryMethod] = useState(...)
# Use API data directly

# 4. Remove Button Switcher
# Keep only tracking timeline
# Remove demo buttons
```

### **API Integration:**

```typescript
// Expected API Response
interface OrderTrackingResponse {
  orderId: string;
  deliveryMethod: 'pickup' | 'delivery'; // ← Important!
  currentStatus: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

// Usage
const orderData = await fetchOrderTracking(orderId);
const trackingSteps = getTrackingSteps(orderData.deliveryMethod);
```

---

## 📝 SUMMARY

**What Changed:**
- ✅ Added Demo Mode Switcher for easy testing
- ✅ Added visual badge counter (3 Tahap / 5 Tahap)
- ✅ Added instant toggle between Pickup and Delivery
- ✅ Step 3 Delivery: **"Pesanan Sudah Dikemas"** (confirmed)

**Files Modified:**
- ✅ `/src/app/pages/OrderTracking.tsx`

**How to Test:**
1. ✅ Navigate to `/tracking/HB1734258960123`
2. ✅ Click "Pickup" button → See 3 steps
3. ✅ Click "Delivery" button → See 5 steps
4. ✅ Verify text: "Pesanan Sudah Dikemas" on Step 3 (Delivery)

**Production Ready:**
- ✅ Logic is correct
- ✅ UI is responsive
- ✅ Demo mode for testing
- ⚠️ Remove demo mode before production

---

**Status:** ✅ **READY FOR TESTING!**  
**Version:** 4.1.0 FINAL  
**Last Updated:** 16 April 2026  

**SILAKAN TEST SEKARANG DENGAN DEMO MODE!** 🚀  
**Klik button "Pickup" dan "Delivery" untuk melihat perbedaan!** 🎉
