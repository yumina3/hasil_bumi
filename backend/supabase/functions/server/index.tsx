import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { Resend } from "npm:resend";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// 1. Inisialisasi Resend dengan mengambil API key dari environment variable (.env)
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// 2. Ambil Environment Variables untuk Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAdminKey = Deno.env.get("VITE_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAdminKey) {
  console.log("⚠️ PERINGATAN: Kredensial Supabase tidak terdeteksi di .env!");
}

// Inisialisasi Supabase Client dengan hak akses Admin penuh (service_role)
const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co", 
  supabaseAdminKey || "placeholder-key"
);

// Enable logger untuk tracking request masuk di terminal Deno
app.use('*', logger(console.log));

// Enable CORS agar frontend React tidak diblokir oleh browser
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Health check endpoint
app.get("/make-server-376a5b07/health", (c) => {
  return c.json({ status: "ok" });
});

// =======================================================
// ENDPOINT A: GENERATE DAN KIRIM EMAIL OTP ANGKA (FORGOT) - AMAN (TIDAK BERUBAH)
// =======================================================
app.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    if (!email) return c.json({ success: false, error: "Email wajib diisi" }, 400);

    const { data: linkData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (authError) return c.json({ success: false, error: "Email tidak terdaftar atau bermasalah." }, 400);
    const userId = linkData?.user?.id;
    if (!userId) return c.json({ success: false, error: "Gagal mengidentifikasi pengguna." }, 404);

    const displayOTP = Math.floor(100000 + Math.random() * 900000).toString();

    await resend.emails.send({
      from: 'Hasil Bumi <no-reply@sisfordev2.com>',
      to: [email],
      subject: 'Kode OTP Reset Password - Hasil Bumi',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #16a34a; text-align: center;">Kode OTP Reset Password</h2>
          <p>Berikut adalah 6 digit angka kode keamanan OTP verifikasi Anda:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; color: #16a34a; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; display: inline-block; border-radius: 8px;">${displayOTP}</div>
          </div>
        </div>
      `
    });

    return c.json({ success: true, displayOTP, userId });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =======================================================
// ENDPOINT B: UPDATE PASSWORD LANGSUNG PAKAI USER ID - AMAN (TIDAK BERUBAH)
// =======================================================
app.post("/update-password", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, newPassword } = body;
    if (!userId || !newPassword) return c.json({ success: false, error: "Data transaksi tidak lengkap." }, 400);

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    if (updateError) throw updateError;

    return c.json({ success: true, message: "Password berhasil diperbarui." });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =======================================================
// ENDPOINT C: DAFTAR AKUN BARU + LOGIKA TOLERANSI DUPLIKASI (FIXED OTP)
// =======================================================
app.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, username, phone, address, role, cabangId } = body;

    let authUserId = "";

    // 1. Coba daftarkan user baru di database autentikasi
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName, username, role }
    });

    if (authError) {
      // JIKA USER SUDAH TERDAFTAR TAPI BELUM AKTIF: Kita bypass dan timpa password barunya
      if (authError.message.includes("already registered") || authError.status === 422) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          authUserId = existingUser.id;
          // Perbarui kredensial password dan metadatanya secara paksa
          await supabase.auth.admin.updateUserById(authUserId, {
            password,
            user_metadata: { full_name: fullName, username, role }
          });
        } else {
          return c.json({ success: false, error: "Email terdeteksi duplikat pada kluster internal." }, 400);
        }
      } else {
        return c.json({ success: false, error: authError.message }, 400);
      }
    } else {
      authUserId = authData.user.id;
    }

    // 2. Insert atau Sinkronkan data ke tabel public.users
    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .upsert({
        auth_id: authUserId,
        nama_lengkap: fullName,
        nama_user: username,
        email: email,
        no_telepon: phone,
        peran: role,
        cabang_id: role === 'admin_cabang' ? cabangId : null,
        is_active: true,
      }, { onConflict: 'email' })
      .select();

    if (userError) throw userError;
    const userRecord = insertedUsers?.[0];

    // 3. Simpan relasi tabel data tambahan
    if (role === 'admin_cabang' && cabangId && userRecord) {
      await supabase.from('admin_cabang').upsert([{ user_id: userRecord.id, cabang_id: cabangId, is_active: true }], { onConflict: 'user_id' });
    }
    if (role === 'pelanggan' && address && userRecord) {
      await supabase.from('alamat_pelanggan').insert([{ user_id: userRecord.id, nama_penerima: fullName, no_telepon: phone, alamat_lengkap: address, is_utama: true }]);
    }

    // 4. Generate 6 Digit Angka acak untuk OTP Registrasi
    const displayOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Kirim Kode Keamanan OTP melalui Resend
    await resend.emails.send({
      from: 'Hasil Bumi <no-reply@sisfordev2.com>',
      to: [email],
      subject: 'Kode OTP Verifikasi Akun Baru - Hasil Bumi',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #16a34a; text-align: center;">Verifikasi Pendaftaran Akun</h2>
          <p>Halo <strong>${fullName}</strong>,</p>
          <p>Terima kasih telah bergabung. Berikut adalah 6 digit angka kode OTP verifikasi pendaftaran akun Anda:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; color: #16a34a; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; display: inline-block; border-radius: 8px;">
              ${displayOTP}
            </div>
          </div>
          <p style="font-size: 13px; color: #666; text-align: center;">Masukkan kode di atas pada layar verifikasi untuk mengaktifkan akun Hasil Bumi Anda.</p>
        </div>
      `
    });

    return c.json({ success: true, displayOTP, userId: authUserId });

  } catch (error: any) {
    console.error("❌ Catch Register Error:", error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =======================================================
// ENDPOINT D: AKTIVASI STATUS EMAIL_CONFIRM USER SETELAH OTP SUKSES
// =======================================================
app.post("/activate-user", async (c) => {
  try {
    const body = await c.req.json();
    const { userId } = body;
    if (!userId) return c.json({ success: false, error: "ID Pengguna tidak valid" }, 400);

    const { error } = await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) throw error;

    return c.json({ success: true, message: "Akun berhasil diaktifkan secara permanen!" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);