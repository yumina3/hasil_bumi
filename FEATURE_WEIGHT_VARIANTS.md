# ✅ FEATURE: Weight Variants (Varian Berat) - Seperti Shopee! 🛒

## 📋 OVERVIEW

Fitur pemilihan varian berat (kg) yang memungkinkan pelanggan memilih berapa kilogram produk yang ingin mereka beli, persis seperti Shopee. Pelanggan dapat memilih dari berbagai pilihan berat (0.5kg, 1kg, 2kg, 3kg, 5kg) sebelum menambahkan produk ke keranjang.

---

## 🎯 FITUR UTAMA

### **1. Modal Pemilihan Varian (WeightSelector)**
- ✅ Modal bottom sheet di mobile (seperti Shopee)
- ✅ Modal centered di desktop
- ✅ Preview gambar produk
- ✅ Harga per kg ditampilkan
- ✅ Grid pilihan berat dengan visual yang jelas
- ✅ Checkmark pada varian yang dipilih
- ✅ Kalkulasi harga real-time
- ✅ Tombol konfirmasi "Tambah ke Keranjang"
- ✅ Warning stok terbatas

### **2. Product Interface Enhancement**
- ✅ `WeightVariant` interface untuk define pilihan berat
- ✅ `hasWeightVariants` boolean flag
- ✅ `weightVariants` array of weight options
- ✅ `selectedWeight` pada CartItem

### **3. Cart Context Update**
- ✅ Support weight parameter di `addToCart()`
- ✅ Support weight parameter di `removeFromCart()`
- ✅ Support weight parameter di `updateQuantity()`
- ✅ Auto-calculate price berdasarkan weight
- ✅ Memoized functions dengan `useCallback`

### **4. Cart Display**
- ✅ Tampilkan varian berat yang dipilih
- ✅ Badge hijau untuk menunjukkan varian
- ✅ Kalkulasi harga otomatis: `price × weight × quantity`
- ✅ Breakdown harga di display

---

## 📁 FILES CREATED/MODIFIED

### **Created:**
1. `/src/app/components/WeightSelector.tsx` - Modal selector component

### **Modified:**
1. `/src/app/context/CartContext.tsx` - Added weight support
2. `/src/app/pages/ProductDetail.tsx` - Integrated WeightSelector
3. `/src/app/pages/Cart.tsx` - Display weight variants
4. `/src/app/data/products.ts` - Added weight variants data

---

## 🔧 TECHNICAL IMPLEMENTATION

### **1. WeightVariant Interface**

```typescript
export interface WeightVariant {
  value: number; // dalam kg (0.5, 1, 2, 5)
  label: string; // "0.5 kg", "1 kg", "2 kg"
  priceMultiplier: number; // pengali harga (sama dengan value)
}
```

### **2. Product Interface Update**

```typescript
export interface Product {
  // ... existing fields
  hasWeightVariants?: boolean;
  weightVariants?: WeightVariant[];
}

export interface CartItem extends Product {
  // ... existing fields
  selectedWeight?: number; // berat yang dipilih
}
```

### **3. Cart Context Methods**

```typescript
addToCart(product: Product, branchId?: number, weight?: number)
removeFromCart(productId: number, weight?: number)
updateQuantity(productId: number, quantity: number, weight?: number)
```

### **4. Price Calculation**

```typescript
const getTotalPrice = useCallback(() => {
  return cart.reduce((total, item) => {
    const weight = item.selectedWeight || 1;
    return total + (item.price * weight * item.quantity);
  }, 0);
}, [cart]);
```

---

## 🎨 UI/UX DESIGN

### **WeightSelector Modal**

```
┌─────────────────────────────────────┐
│ Pilih Varian                    ✕   │
├─────────────────────────────────────┤
│ [Image] Tomat Segar                 │
│         Harga per kg: Rp 15.000     │
│         Stok: 50 kg                 │
├─────────────────────────────────────┤
│ Pilih Berat:                        │
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ 0.5 kg  │ │  1 kg ✓ │ │  2 kg   ││
│ │ Rp 7.5K │ │ Rp 15K  │ │ Rp 30K  ││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │  3 kg   │ │  5 kg   │            │
│ │ Rp 45K  │ │ Rp 75K  │            │
│ └─────────┘ └─────────┘            │
├─────────────────────────────────────┤
│ Total Harga:         Rp 15.000      │
│ [Tambah ke Keranjang]               │
└─────────────────────────────────────┘
```

### **Cart Item with Weight**

```
┌────────────────────────────────────────┐
│ [Image] Tomat Segar                    │
│         Rp 15.000 / kg                 │
│         [Varian: 2 kg] ← Badge hijau   │
│                                        │
│ [-] 1 [+]            Rp 30.000 × 1     │
│                      Rp 30.000         │
└────────────────────────────────────────┘
```

---

## 📊 DATA EXAMPLE

### **Product with Weight Variants**

```typescript
{
  id: 1,
  name: 'Tomat Segar',
  price: 15000, // harga per kg
  unit: 'kg',
  hasWeightVariants: true,
  weightVariants: [
    { value: 0.5, label: '0.5 kg', priceMultiplier: 0.5 },
    { value: 1, label: '1 kg', priceMultiplier: 1 },
    { value: 2, label: '2 kg', priceMultiplier: 2 },
    { value: 3, label: '3 kg', priceMultiplier: 3 },
    { value: 5, label: '5 kg', priceMultiplier: 5 },
  ],
}
```

### **Products with Weight Variants:**
- ✅ Tomat Segar (0.5kg - 5kg)
- ✅ Wortel Organik (0.5kg - 5kg)
- ✅ Brokoli (0.5kg - 3kg)

---

## 🚀 USER FLOW

### **Scenario 1: Add to Cart dengan Weight Variant**

```
1. User klik "Tambah ke Keranjang" di ProductDetail
   ↓
2. Modal WeightSelector muncul (slide dari bawah)
   ↓
3. User pilih berat (contoh: 2 kg)
   ↓
4. User klik "Tambah ke Keranjang"
   ↓
5. Toast notification: "1x Tomat Segar (2 kg) ditambahkan ke keranjang"
   ↓
6. Cart updated dengan item + weight
```

### **Scenario 2: Buy Now dengan Weight Variant**

```
1. User klik "Beli Sekarang"
   ↓
2. Modal WeightSelector muncul
   ↓
3. User pilih berat (contoh: 1 kg)
   ↓
4. User klik "Tambah ke Keranjang"
   ↓
5. Auto navigate ke /checkout
```

### **Scenario 3: Produk tanpa Weight Variant**

```
1. User klik "Tambah ke Keranjang" (produk non-kg)
   ↓
2. Langsung ditambahkan ke cart (NO modal)
   ↓
3. Toast notification: "1 Selada ditambahkan ke keranjang"
```

---

## 🧪 TESTING GUIDE

### **Test Case 1: Modal Opens Correctly**
```bash
1. Navigate to /product/1 (Tomat Segar)
2. Klik "Tambah ke Keranjang"
3. ✅ Modal muncul dengan smooth animation
4. ✅ Product info ditampilkan
5. ✅ Weight options tampil di grid
6. ✅ Default selection adalah 0.5 kg (first variant)
```

### **Test Case 2: Weight Selection**
```bash
1. Buka modal
2. Klik varian "2 kg"
3. ✅ Border berubah jadi hijau
4. ✅ Checkmark muncul
5. ✅ Total harga update: Rp 30.000
6. Klik varian "5 kg"
7. ✅ Varian sebelumnya unselected
8. ✅ Total harga update: Rp 75.000
```

### **Test Case 3: Add to Cart**
```bash
1. Pilih varian "1 kg"
2. Klik "Tambah ke Keranjang"
3. ✅ Modal close
4. ✅ Toast: "1x Tomat Segar (1 kg) ditambahkan ke keranjang"
5. Navigate to /cart
6. ✅ Item muncul dengan badge "Varian: 1 kg"
7. ✅ Harga: Rp 15.000
```

### **Test Case 4: Multiple Weights Same Product**
```bash
1. Tambah Tomat 1kg ke cart
2. Tambah Tomat 2kg ke cart
3. Navigate to /cart
4. ✅ Muncul 2 items terpisah:
   - Tomat Segar (1 kg) - Rp 15.000
   - Tomat Segar (2 kg) - Rp 30.000
5. Update quantity Tomat 1kg = 2
6. ✅ Harga update: Rp 30.000
7. ✅ Total: Rp 60.000 (2×1kg + 1×2kg)
```

### **Test Case 5: Price Calculation**
```bash
Product: Tomat Segar (Rp 15.000/kg)
Weight: 2 kg
Quantity: 3

Calculation:
- Price per kg: Rp 15.000
- Weight: 2 kg
- Item price: Rp 15.000 × 2 = Rp 30.000
- Quantity: 3
- Total: Rp 30.000 × 3 = Rp 90.000

✅ Verify di Cart page
✅ Verify di Checkout
✅ Verify getTotalPrice()
```

### **Test Case 6: Remove from Cart**
```bash
1. Tambah Tomat 1kg ke cart
2. Tambah Tomat 2kg ke cart
3. Di cart, hapus Tomat 1kg
4. ✅ Hanya Tomat 1kg yang dihapus
5. ✅ Tomat 2kg masih ada
6. Update quantity Tomat 2kg
7. ✅ Quantity update hanya untuk Tomat 2kg
```

### **Test Case 7: Low Stock Warning**
```bash
1. Buat produk dengan stock < 5
2. Buka WeightSelector
3. ✅ Warning muncul: "⚠️ Stok terbatas! Tersisa X kg"
4. ✅ Background orange
```

### **Test Case 8: Mobile Responsive**
```bash
1. Buka di mobile (viewport < 640px)
2. Klik "Tambah ke Keranjang"
3. ✅ Modal slide dari bawah
4. ✅ Full width
5. ✅ Rounded top corners
6. ✅ Grid 3 columns untuk weight options
7. Touch varian weight
8. ✅ Touch feedback smooth
```

### **Test Case 9: Products Without Variants**
```bash
1. Navigate to /product/4 (Selada - unit: ikat)
2. Klik "Tambah ke Keranjang"
3. ✅ NO modal muncul
4. ✅ Langsung ditambah ke cart
5. ✅ Toast: "1 Selada ditambahkan ke keranjang"
6. Navigate to /cart
7. ✅ Selada tampil tanpa weight badge
8. ✅ Harga langsung: Rp 8.000
```

---

## 📱 RESPONSIVE DESIGN

### **Desktop (≥ 1024px)**
- Modal centered di screen
- Max width: 512px
- Rounded corners all sides
- Grid 3 columns

### **Tablet (640px - 1024px)**
- Modal centered
- Max width: 100%
- Grid 3 columns

### **Mobile (< 640px)**
- Modal slide dari bawah
- Full width
- Rounded top corners only
- Grid 3 columns (compact)

---

## 🎨 STYLING DETAILS

### **Colors**
- Primary Green: `#16a34a` (green-600)
- Green Hover: `#15803d` (green-700)
- Green Light: `#f0fdf4` (green-50)
- Badge Green: `#dcfce7` (green-100)
- Orange Warning: `#fed7aa` (orange-200)

### **Animations**
```css
/* Modal entrance */
animate-in slide-in-from-bottom duration-300

/* Selected state */
border-2 border-green-600 bg-green-50
transition-all

/* Checkmark */
absolute -top-1 -right-1
bg-green-600 rounded-full
```

---

## 💡 BEST PRACTICES

### **1. Unique Cart Keys**
```typescript
// ✅ Good - Unique key dengan weight
key={`${item.id}-${item.selectedWeight || 'default'}`}

// ❌ Bad - Hanya item.id (conflict untuk same product different weight)
key={item.id}
```

### **2. Price Calculation**
```typescript
// ✅ Good - Handle undefined weight
const weight = item.selectedWeight || 1;
const itemPrice = item.price * weight;

// ❌ Bad - Assume weight always exist
const itemPrice = item.price * item.selectedWeight;
```

### **3. Remove/Update with Weight**
```typescript
// ✅ Good - Pass weight parameter
removeFromCart(item.id, item.selectedWeight);
updateQuantity(item.id, qty, item.selectedWeight);

// ❌ Bad - Missing weight (will remove ALL weights)
removeFromCart(item.id);
```

---

## 🚀 FUTURE ENHANCEMENTS

### **Phase 2 (Optional):**
- [ ] Custom weight input (user bisa input manual, misal: 1.3 kg)
- [ ] Weight presets per category
- [ ] Bulk discount for certain weights (misal: 5kg dapat diskon 10%)
- [ ] Weight-based stock warning
- [ ] Save favorite weights per user

### **Phase 3 (Advanced):**
- [ ] Weight recommendations based on purchase history
- [ ] Multi-weight add to cart (tambah beberapa weight sekaligus)
- [ ] Weight comparison (compare prices across weights)
- [ ] Weight calculator (berapa kg yang dibutuhkan untuk X porsi)

---

## ✅ CHECKLIST IMPLEMENTASI

- [x] Create WeightVariant interface
- [x] Update Product interface
- [x] Update CartItem interface
- [x] Create WeightSelector component
- [x] Update CartContext with weight support
- [x] Memoize CartContext functions
- [x] Update ProductDetail page
- [x] Update Cart page display
- [x] Add weight variants to products data
- [x] Test add to cart flow
- [x] Test cart display
- [x] Test price calculation
- [x] Test remove/update
- [x] Mobile responsive
- [x] Documentation

---

## 📝 NOTES

- Default weight adalah first variant (index 0)
- Jika produk tidak punya `hasWeightVariants`, langsung tambah ke cart
- Weight disimpan di `selectedWeight` pada CartItem
- Price calculation: `price × weight × quantity`
- Cart items dengan weight berbeda dianggap sebagai items terpisah
- Modal auto-close setelah confirm

---

## 🎉 HASIL AKHIR

**Before:**
```
❌ User hanya bisa beli 1 kg (fixed)
❌ Tidak ada pilihan berat
❌ Seperti toko tradisional
```

**After:**
```
✅ User bisa pilih 0.5kg, 1kg, 2kg, 3kg, 5kg
✅ Modal modern seperti Shopee/Tokopedia
✅ Badge varian di cart
✅ Harga otomatis terhitung
✅ UX premium & modern
✅ Mobile-friendly
```

---

**Status:** ✅ PRODUCTION READY  
**Version:** 1.0.0  
**Last Updated:** April 16, 2026  
**Developer:** Figma Make AI Assistant
