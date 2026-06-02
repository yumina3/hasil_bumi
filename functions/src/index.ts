import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
// 💡 UBAH DI SINI: Menggunakan v1 API agar ramah paket gratisan Spark
import * as functions from "firebase-functions/v1";

const app = new Hono();

const MY_RESEND_KEY = "re_Bm5Vccto_9ozp1yxcuCnWrPtx4siRCvVe"; 
const MY_SUPABASE_URL = "https://ppxtvcmbehzcsjaesyqe.supabase.co"; 
const MY_SUPABASE_SERVICE_KEY = "sb_secret_8u7o93JOVR70MvYxEyzrAw_vmTjBy-5"; 

const resend = new Resend(MY_RESEND_KEY);
const supabase = createClient(MY_SUPABASE_URL, MY_SUPABASE_SERVICE_KEY);

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.get("/health", (c) => {
  return c.json({ status: "ok", platform: "Firebase Cloud Functions v1 Spark Free" });
});

// =======================================================
// ENDPOINT A: GENERATE DAN KIRIM EMAIL OTP ANGKA (FORGOT)
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
// ENDPOINT B: UPDATE PASSWORD LANGSUNG PAKAI USER ID
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
// ENDPOINT C: DAFTAR AKUN BARU + LOGIKA TOLERANSI DUPLIKASI
// =======================================================
app.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, username, phone, address, role, cabangId } = body;

    let authUserId = "";

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName, username, role }
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.status === 422) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          authUserId = existingUser.id;
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

    if (role === 'admin_cabang' && cabangId && userRecord) {
      await supabase.from('admin_cabang').upsert([{ user_id: userRecord.id, cabang_id: cabangId, is_active: true }], { onConflict: 'user_id' });
    }
    if (role === 'pelanggan' && address && userRecord) {
      await supabase.from('alamat_pelanggan').insert([{ user_id: userRecord.id, nama_penerima: fullName, no_telepon: phone, alamat_lengkap: address, is_utama: true }]);
    }

    const displayOTP = Math.floor(100000 + Math.random() * 900000).toString();

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
            <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; color: #16a34a; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; display: inline-block; border-radius: 8px;">${displayOTP}</div>
          </div>
        </div>
      `
    });

    return c.json({ success: true, displayOTP, userId: authUserId });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =======================================================
// ENDPOINT D: AKTIVASI STATUS EMAIL_CONFIRM USER
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

// =======================================================
// BRIDGE UNTUK FIREBASE FUNCTIONS V1 EXPRESS-STYLE
// =======================================================
export const api = functions.https.onRequest(async (req, res) => {
  const incomingHeaders = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => incomingHeaders.append(key, v));
      } else {
        incomingHeaders.set(key, value);
      }
    }
  }

  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const honoReq = new Request(url, {
    method: req.method,
    headers: incomingHeaders,
    body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined
  });

  const honoRes = await app.fetch(honoReq);
  
  honoRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.status(honoRes.status);
  const resBody = await honoRes.text();
  res.send(resBody);
});