import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import multer from "multer";
import fs from "fs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Supabase Storage Client
const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/^["']|["']$/g, "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || "").replace(/^["']|["']$/g, "").trim();
let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error("❌ Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("⚠️ WARNING: SUPABASE_URL atau SUPABASE_SERVICE_KEY belum disetel. Fitur upload foto tidak akan berfungsi.");
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let _prisma: PrismaClient | null = null;
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!_prisma) {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set. Please provide it in the Settings menu.");
      }
      _prisma = new PrismaClient();
    }
    const val = (_prisma as any)[prop];
    return typeof val === 'function' ? val.bind(_prisma) : val;
  }
});

const app = express();

// Allowed origins: localhost for dev, APP_URL for production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://dosenkita.up.railway.app", // Railway production URL (hardcoded fallback)
  "https://dosenkitapti.up.railway.app", // User's Railway production URL
  "http://72.60.79.72", // VPS IP Address
  "http://srv1730879.hstgr.cloud", // VPS Hostname
  ...(process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL" ? [process.env.APP_URL] : []),
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith(".railway.app")) {
      callback(null, true);
    } else {
      // Return false instead of throwing an Error to prevent 500 Internal Server Error
      callback(null, false);
    }
  },
  credentials: true,
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Redis Adapter for Auto-Scaling
if (process.env.REDIS_URL) {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  
  pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
  subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Socket.io Redis adapter connected (Auto-scaling enabled)");
  }).catch(err => {
    console.error("❌ Failed to connect to Redis for auto-scaling:", err);
  });
}

const JWT_SECRET = process.env.JWT_SECRET || "wardosen-secret-key-123";
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET tidak diatur di .env! Menggunakan fallback yang tidak aman untuk production.");
}
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Multer Storage Configuration (Use memory storage for Supabase upload)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Middleware: Auth
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Removed DB lookup to prevent connection pool exhaustion during war
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Rate Limiter specifically for selection (Max 2 requests per 1 second per user)
const selectionRateLimits = new Map<string, number[]>();
const rateLimitSelection = (req: any, res: any, next: any) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const now = Date.now();
  const windowMs = 1000;
  const maxRequests = 2;

  let timestamps = selectionRateLimits.get(userId) || [];
  timestamps = timestamps.filter(ts => now - ts < windowMs);

  if (timestamps.length >= maxRequests) {
    return res.status(429).json({ 
      error: "Terlalu banyak permintaan. Silakan tunggu 1 detik sebelum mencoba lagi." 
    });
  }

  timestamps.push(now);
  selectionRateLimits.set(userId, timestamps);
  next();
};

// Fix #7: Periodic cleanup of selectionRateLimits to prevent memory leak
// Removes entries older than 60 seconds every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of selectionRateLimits.entries()) {
    const fresh = timestamps.filter(ts => now - ts < 60_000);
    if (fresh.length === 0) {
      selectionRateLimits.delete(userId);
    } else {
      selectionRateLimits.set(userId, fresh);
    }
  }
}, 5 * 60 * 1000);

// Debounced Socket.io Broadcast Helper for Lecturer Quota Updates (Max once per 1 second)
let broadcastTimeout: NodeJS.Timeout | null = null;
const triggerQuotaUpdate = () => {
  if (broadcastTimeout) return;
  broadcastTimeout = setTimeout(async () => {
    broadcastTimeout = null;
    try {
      const allLecturers = await prisma.dosen.findMany({
        include: { 
          _count: { select: { mahasiswa: true } },
          penelitian: true
        },
      });
      io.emit("quota_update", allLecturers);
    } catch (err) {
      console.error("Failed to broadcast debounced quota update:", err);
    }
  }, 1000);
};

// Self-registration endpoint for Students
app.post("/api/register", async (req, res) => {
  try {
    const { nim, nama, password } = req.body;
    if (!nim || !nama || !password) {
      return res.status(400).json({ error: "NIM/Email, Nama, dan Password wajib diisi." });
    }

    let usernameInput = nim.trim();
    let emailInput: string | null = null;
    let extractedNim = usernameInput;
    let extractedAngkatan = "";

    // If the username input is an email, enforce UNESA domains and extract NIM
    if (usernameInput.includes("@")) {
      const emailDomain = usernameInput.split("@")[1];
      const allowedEmailDomains = ["unesa.ac.id", "mhs.unesa.ac.id"];
      if (!allowedEmailDomains.includes(emailDomain)) {
        return res.status(403).json({ 
          error: "Akses ditolak. Hanya email institusi UNESA (@unesa.ac.id atau @mhs.unesa.ac.id) yang diizinkan." 
        });
      }
      emailInput = usernameInput;
      usernameInput = usernameInput.split("@")[0];
      extractedNim = usernameInput;
    }

    // Smart Extraction for UNESA NIM (usually 11 digits, first 2 are year)
    if (/^\d+$/.test(usernameInput) && usernameInput.length >= 2) {
      extractedNim = usernameInput;
      extractedAngkatan = "20" + usernameInput.substring(0, 2);
    }

    // Check if the username or email is already registered
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameInput },
          ...(emailInput ? [{ email: emailInput }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: "NIM atau Email sudah terdaftar dalam sistem." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: usernameInput,
          email: emailInput,
          password: hashedPassword,
          role: "STUDENT"
        }
      });
      return tx.mahasiswa.create({
        data: {
          userId: user.id,
          nim: extractedNim,
          nama: nama,
          angkatan: extractedAngkatan
        }
      });
    });

    res.json(student);
  } catch (err: any) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: err.message || "Gagal melakukan registrasi." });
  }
});

// Self-registration endpoint for Dosen
app.post("/api/register-dosen", async (req, res) => {
  try {
    const { nip, nama, password } = req.body;
    if (!nip || !nama || !password) {
      return res.status(400).json({ error: "NIP, Nama, dan Password wajib diisi." });
    }

    const nipInput = nip.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: nipInput }
    });
    if (existingUser) {
      return res.status(400).json({ error: "NIP sudah terdaftar dalam sistem." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if Dosen profile already exists (seeded by admin)
    let dosenProfile = await prisma.dosen.findUnique({
      where: { nip: nipInput }
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          username: nipInput,
          password: hashedPassword,
          role: "DOSEN"
        }
      });

      // 2. If Dosen profile exists, link it; otherwise create a new one
      if (dosenProfile) {
        return tx.dosen.update({
          where: { id: dosenProfile.id },
          data: { userId: user.id }
        });
      } else {
        return tx.dosen.create({
          data: {
            userId: user.id,
            nip: nipInput,
            nama: nama,
            kuotaMax: 10 // Default quota
          }
        });
      }
    });

    res.json(result);
  } catch (err: any) {
    console.error("Dosen Registration Error:", err);
    res.status(500).json({ error: err.message || "Gagal melakukan registrasi dosen." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate that if login is attempted with an email, it must be an official UNESA domain
    if (username && username.includes("@")) {
      const emailDomain = username.split("@")[1];
      const allowedEmailDomains = ["unesa.ac.id", "mhs.unesa.ac.id"];
      if (!allowedEmailDomains.includes(emailDomain)) {
        return res.status(403).json({ 
          error: "Akses ditolak. Hanya email institusi UNESA (@unesa.ac.id atau @mhs.unesa.ac.id) yang diizinkan." 
        });
      }
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      },
      include: { mahasiswa: true, dosen: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nim: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, mahasiswa: user.mahasiswa, dosen: user.dosen, foto: user.foto } });
  } catch (err: any) {
    console.error("Login Error Details:", err);
    res.status(500).json({ error: `Server error during login: ${err.message || "Unknown error"}` });
  }
});

// Google OAuth
app.get("/api/auth/google/url", (req, res) => {
  const origin = req.query.origin as string || `http://${req.headers.host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ origin })).toString('base64');
  
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    prompt: 'select_account',
    state,
  });
  
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    let origin = `http://localhost:3000`; 
    if (state && typeof state === 'string') {
        try {
            const parsed = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
            if (parsed.origin) origin = parsed.origin;
        } catch (e) {}
    }
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
        throw new Error(JSON.stringify(tokenData));
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    const email = userData.email;
    const name = userData.name;
    const picture = userData.picture;
    
    if (!email) throw new Error("No email returned from Google");

    // Fix #12: Validate that the email is from an official UNESA domain
    const emailDomain = email.split("@")[1];
    const allowedEmailDomains = ["unesa.ac.id", "mhs.unesa.ac.id"];
    if (!allowedEmailDomains.includes(emailDomain)) {
      throw new Error(`Akses ditolak. Hanya email institusi UNESA (@unesa.ac.id atau @mhs.unesa.ac.id) yang diizinkan. Email Anda: ${email}`);
    }

    let user = await prisma.user.findFirst({
        where: { OR: [{ email: email }, { username: email.split('@')[0] }] },
        include: { mahasiswa: true, dosen: true }
    });

    if (!user) {
        // Create user
        const username = email.split('@')[0];
        let extractedNim = username;
        let extractedAngkatan = "";
        
        // Smart Extraction for UNESA NIM (usually 11 digits, first 2 are year)
        if (/^\d+$/.test(username) && username.length >= 2) {
            extractedNim = username;
            extractedAngkatan = "20" + username.substring(0, 2);
        }

        const isLecturer = emailDomain === "unesa.ac.id";
        const role = isLecturer ? "DOSEN" : "STUDENT";

        const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: randomPassword,
                foto: picture,
                role: role,
                ...(role === "STUDENT" ? {
                    mahasiswa: {
                        create: {
                            nim: extractedNim,
                            nama: name || username,
                            foto: picture,
                            angkatan: extractedAngkatan
                        }
                    }
                } : {
                    dosen: {
                        create: {
                            nip: username,
                            nama: name || username,
                            foto: picture
                        }
                    }
                })
            },
            include: { mahasiswa: true, dosen: true }
        });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nim: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Fix #2: Use specific origin instead of '*' to prevent XSS via postMessage
    const safeUser = JSON.stringify({ id: user.id, username: user.username, role: user.role, mahasiswa: user.mahasiswa, dosen: user.dosen });
    res.send(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', user: ${safeUser} }, '${origin}');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <p>Login Berhasil. Menutup jendela...</p>
      </body>
    </html>
    `);

  } catch (err: any) {
    console.error("OAuth Error:", err);
    // Fix: Sanitize error — do not expose internal error details (stack traces, DB info) to browser
    const safeErrorMsg = err.message?.includes("Akses ditolak")
      ? err.message
      : "Terjadi kesalahan saat proses OAuth. Silakan coba lagi.";
    res.send(`<html><body><p style="font-family:sans-serif;color:#c00;padding:2rem">${safeErrorMsg}</p><script>setTimeout(()=>window.close(), 4000);</script></body></html>`);
  }
});

// --- STUDENT PROFILE ---
app.get("/api/me", authenticate, async (req: any, res) => {
  try {
    const student = await prisma.mahasiswa.findUnique({
      where: { userId: req.user.id },
      include: { 
        dosen: true
      }
    });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data profil." });
  }
});

app.get("/api/me-dosen", authenticate, async (req: any, res) => {
  try {
    const dosen = await prisma.dosen.findUnique({
      where: { userId: req.user.id },
      include: { 
        mahasiswa: true,
        penelitian: true 
      }
    });
    res.json(dosen);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data profil dosen." });
  }
});

app.post("/api/profile", authenticate, async (req: any, res) => {
  const { nim, nama, kontak, peminatan, bio, foto, angkatan, rencanaJudul, magangPosisi, magangTempat, plpLokasi } = req.body;
  try {
    const student = await prisma.$transaction(async (tx) => {
      // 1. If NIM is updated, check uniqueness and update User.username
      if (nim) {
        const existingUser = await tx.user.findFirst({
          where: {
            username: nim,
            NOT: { id: req.user.id }
          }
        });
        if (existingUser) {
          throw new Error("NIM sudah terdaftar oleh pengguna lain.");
        }
        await tx.user.update({
          where: { id: req.user.id },
          data: { username: nim }
        });
      }

      // 2. Automatically determine angkatan from the first 2 digits of the NIM
      let finalAngkatan = angkatan;
      if (nim && /^\d+$/.test(nim) && nim.length >= 2) {
        finalAngkatan = "20" + nim.substring(0, 2);
      }

      // Only include fields that were explicitly sent (not undefined)
      // This prevents category switching from wiping data from other WAR types
      const mhsData: Record<string, any> = {};
      if (nama !== undefined) mhsData.nama = nama;
      if (kontak !== undefined) mhsData.kontak = kontak;
      if (peminatan !== undefined) mhsData.peminatan = peminatan;
      if (bio !== undefined) mhsData.bio = bio;
      if (foto !== undefined) mhsData.foto = foto || null;
      if (rencanaJudul !== undefined) mhsData.rencanaJudul = rencanaJudul;
      if (magangPosisi !== undefined) mhsData.magangPosisi = magangPosisi;
      if (magangTempat !== undefined) mhsData.magangTempat = magangTempat;
      if (plpLokasi !== undefined) mhsData.plpLokasi = plpLokasi;

      return tx.mahasiswa.upsert({
        where: { userId: req.user.id },
        update: {
          ...mhsData,
          ...(nim ? { nim } : {}),
          ...(finalAngkatan ? { angkatan: finalAngkatan } : {})
        },
        create: {
          userId: req.user.id,
          nim: nim || req.user.nim || "",
          nama: nama || "Mahasiswa",
          ...mhsData,
          angkatan: finalAngkatan || ""
        }
      });
    });

    if (foto) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { foto }
      });
    }

    res.json(student);
  } catch (err: any) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: err.message || "Gagal memperbarui profil." });
  }
});


// --- THE CRITICAL WAR LOGIC: SELECT DOSEN ---
app.post("/api/war/select", authenticate, rateLimitSelection, async (req: any, res) => {
  const { dosenId, rencanaJudul } = req.body;

  try {
    // 1. Check War Time
    const config = await prisma.warConfig.findUnique({ where: { id: "global_config" } });
    if (!config) throw new Error("Konfigurasi jadwal pemilihan belum disetel oleh admin.");
    
    const now = new Date();
    if (config.isForcedClosed) {
      throw new Error("SISTEM DITUTUP SEMENTARA OLEH ADMIN (EMERGENCY STOP).");
    }
    if (now < config.startTime) {
      throw new Error("Sistem pemilihan belum dibuka. Silakan tunggu hingga waktu countdown selesai.");
    }
    if (now > config.endTime) {
      throw new Error("Masa pemilihan dosen telah berakhir.");
    }

    // 2. Check Profile
    const student = await prisma.mahasiswa.findUnique({
      where: { userId: req.user.id },
    });
    
    if (!student) throw new Error("Profil mahasiswa tidak ditemukan. Silakan lengkapi profil Anda.");
    
    // Batch (Angkatan) Check
    if (config.targetAngkatan && config.targetAngkatan !== "All") {
      const allowed = config.targetAngkatan.split(",").map(a => a.trim());
      if (!student.angkatan || !allowed.includes(student.angkatan)) {
        throw new Error(`Akses ditolak. Pemilihan periode ini hanya dibuka untuk angkatan: ${config.targetAngkatan}`);
      }
    }

    if (student.dosenId) {
      throw new Error("Anda sudah memiliki dosen pembimbing.");
    }

    // 3. EXECUTE ATOMIC SINGLE-STATEMENT ASSIGNMENT
    // We update the student row if and only if:
    // a. The student does not have a lecturer yet (dosenId IS NULL).
    // b. The count of students assigned to the chosen lecturer is less than kuotaMax.
    const affectedRows = await prisma.$executeRaw`
      UPDATE "Mahasiswa"
      SET "dosenId" = ${dosenId}, 
          "rencanaJudul" = CASE 
            WHEN (SELECT category FROM "WarConfig" WHERE id = 'global_config') = 'SKRIPSI_ARTIKEL' THEN ${rencanaJudul || null}::text
            ELSE "rencanaJudul"
          END,
          "statusBimbingan" = 'APPROVED', 
          "periode" = ${config.periode || null}
      WHERE "id" = ${student.id}
        AND "dosenId" IS NULL
        AND (
          SELECT COUNT(*)::integer FROM "Mahasiswa" WHERE "dosenId" = ${dosenId}
        ) < (
          SELECT "kuotaMax" FROM "Dosen" WHERE id = ${dosenId}
        )
    `;

    // 4. Precise Error Reporting on Failure
    if (affectedRows === 0) {
      const checkStudent = await prisma.mahasiswa.findUnique({ where: { id: student.id } });
      if (checkStudent?.dosenId) {
        throw new Error("Anda sudah memiliki dosen pembimbing.");
      }
      const lecturer = await prisma.dosen.findUnique({
        where: { id: dosenId },
        include: { _count: { select: { mahasiswa: true } } },
      });
      if (!lecturer) {
        throw new Error("Data dosen tidak ditemukan dalam sistem.");
      }
      if (lecturer._count.mahasiswa >= lecturer.kuotaMax) {
        throw new Error(`Maaf, kuota untuk ${lecturer.nama} sudah penuh.`);
      }
      throw new Error("Pilihan gagal dilakukan. Silakan coba kembali.");
    }

    // Fetch lecturer details for response & notifications
    const lecturer = await prisma.dosen.findUnique({
      where: { id: dosenId }
    });
    if (!lecturer) throw new Error("Data dosen tidak ditemukan dalam sistem.");

    const result = {
      updatedStudent: { ...student, dosenId, rencanaJudul, statusBimbingan: "APPROVED", periode: config.periode },
      lecturerName: lecturer.nama,
      studentName: student.nama,
      studentKontak: student.kontak
    };

    // 5. SEND AUTOMATED WA NOTIFICATION (TRIGGERED)
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (fonnteToken && !fonnteToken.includes("PLACEHOLDER") && result.studentKontak) {
      const waMessage = `*PENGUMUMAN BERHASIL (WAR DOSPEM)* 📢

Halo *${result.studentName}*! Selamat, Anda telah berhasil memilih dosen pembimbing:
👨‍🏫 *${result.lecturerName}*

Silakan cek dashboard Anda untuk mendownload bukti pemilihan. Tetap semangat! 🚀`;

      fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { Authorization: fonnteToken },
        body: new URLSearchParams({
          target: result.studentKontak,
          message: waMessage,
          countryCode: "62",
        })
      }).catch(err => console.error("Triggered WA Error:", err));
    }

    // Debounced quota update broadcast
    triggerQuotaUpdate();
    
    // Broadcast for Live Activity Feed (instantly)
    io.emit("new_selection", { 
      studentName: result.studentName,
      lecturerName: result.lecturerName,
      timestamp: new Date()
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


app.post("/api/war/cancel", authenticate, async (req: any, res) => {
  // ⛔ Mahasiswa tidak diizinkan membatalkan pemilihan sendiri.
  // Hanya Admin (via reset endpoint) atau Dosen (via kick endpoint) yang berwenang.
  if (req.user.role === "STUDENT") {
    return res.status(403).json({ 
      error: "Akses ditolak. Pembatalan pemilihan hanya dapat dilakukan oleh Dosen Pembimbing atau Admin Prodi." 
    });
  }
  res.status(400).json({ error: "Endpoint ini sudah tidak digunakan." });
});

// --- DOSEN MANAGEMENT ROUTES ---
const isDosen = (req: any, res: any, next: any) => {
  if (req.user.role !== "DOSEN") return res.status(403).json({ error: "Access denied" });
  next();
};

// Dosen: Approve a student
app.post("/api/dosen/approve-student/:mahasiswaId", authenticate, isDosen, async (req: any, res) => {
  const { mahasiswaId } = req.params;
  try {
    const dosen = await prisma.dosen.findUnique({ where: { userId: req.user.id } });
    if (!dosen) return res.status(404).json({ error: "Data dosen tidak ditemukan." });

    const student = await prisma.mahasiswa.findFirst({
      where: { id: mahasiswaId, dosenId: dosen.id },
    });
    if (!student) return res.status(404).json({ error: "Mahasiswa tidak ditemukan dalam daftar bimbingan Anda." });

    await prisma.mahasiswa.update({
      where: { id: mahasiswaId },
      data: { statusBimbingan: "APPROVED" },
    });

    triggerQuotaUpdate();
    res.json({ message: `Mahasiswa ${student.nama} berhasil disetujui.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dosen: Kick/Reject a student (free up quota)
app.post("/api/dosen/kick-student/:mahasiswaId", authenticate, isDosen, async (req: any, res) => {
  const { mahasiswaId } = req.params;
  try {
    const dosen = await prisma.dosen.findUnique({ where: { userId: req.user.id } });
    if (!dosen) return res.status(404).json({ error: "Data dosen tidak ditemukan." });

    const student = await prisma.mahasiswa.findFirst({
      where: { id: mahasiswaId, dosenId: dosen.id },
    });
    if (!student) return res.status(404).json({ error: "Mahasiswa tidak ditemukan dalam daftar bimbingan Anda." });

    await prisma.mahasiswa.update({
      where: { id: mahasiswaId },
      data: { dosenId: null, statusBimbingan: "PENDING" },
    });

    triggerQuotaUpdate();
    io.emit("student_update", { id: student.id, userId: student.userId, nim: student.nim });
    res.json({ message: `Mahasiswa ${student.nama} berhasil dikeluarkan dari daftar bimbingan.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN CRUD ROUTES ---
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
};

app.get("/api/admin/reports", authenticate, isAdmin, async (req: any, res) => {
  try {
    const reports = await prisma.dosen.findMany({
      include: {
        mahasiswa: true,
        penelitian: true
      }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Admin: Cancel Student Selection
app.post("/api/admin/war/cancel", authenticate, isAdmin, async (req: any, res) => {
  const { mahasiswaId } = req.body;
  try {
    if (!mahasiswaId) throw new Error("Mahasiswa ID wajib diisi.");
    
    // Check if student exists
    const mhs = await prisma.mahasiswa.findUnique({ 
      where: { id: mahasiswaId },
      include: { dosen: true }
    });
    
    if (!mhs) throw new Error("Mahasiswa tidak ditemukan.");
    if (!mhs.dosenId) throw new Error("Mahasiswa ini belum memilih dosen.");

    // Fix #11: Reset all related fields, not just dosenId
    await prisma.mahasiswa.update({
      where: { id: mahasiswaId },
      data: { 
        dosenId: null,
        statusBimbingan: "PENDING"
      }
    });

    console.log(`Admin ${req.user.nim} membatalkan pilihan dosen untuk Mahasiswa ${mhs.nim}`);
    triggerQuotaUpdate();
    io.emit("student_update", { id: mhs.id, userId: mhs.userId, nim: mhs.nim });
    res.json({ message: `Berhasil membatalkan pilihan dosen untuk ${mhs.nama}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Photo Upload (To Supabase Storage)
app.post("/api/upload", authenticate, (req: any, res: any) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.message || "Gagal mengupload file." });
    }
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      if (!supabase) {
        return res.status(500).json({ error: "Supabase storage is not configured on this server." });
      }
      const bucketName = req.user?.role === 'STUDENT' ? 'mahasiswa-photos' : 'dosen-photos';
      const fileExt = path.extname(req.file.originalname);
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const oldUrl = req.body.oldUrl; // Pass old URL from frontend if replacing

      // 1. Delete old photo if replacing
      if (oldUrl && oldUrl.includes("supabase.co/storage")) {
        const oldFilename = oldUrl.split("/").pop();
        if (oldFilename) {
          await supabase.storage.from(bucketName).remove([oldFilename]);
          console.log(`Deleted old photo: ${oldFilename} from bucket: ${bucketName}`);
        }
      }

      // 2. Upload new photo to Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFilename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (error) throw error;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      res.json({ url: publicUrl });
    } catch (uploadErr: any) {
      console.error("Supabase Upload Error:", uploadErr);
      res.status(500).json({ error: uploadErr.message || "Gagal mengunggah foto ke Supabase" });
    }
  });
});

// Dosen CRUD
app.post("/api/admin/dosen", authenticate, isAdmin, async (req, res) => {
  try {
    const { nama, nip, kuotaMax, foto, keahlian, bio, moto, pendidikan, publikasi, kontak, password } = req.body;
    if (!nama || !nip || !kuotaMax) throw new Error("Nama, NIP, dan kuota maksimal wajib diisi.");
    
    const dosen = await prisma.dosen.create({
      data: { 
        nama, 
        nip, 
        kuotaMax: parseInt(kuotaMax), 
        foto: foto || null,
        keahlian,
        bio,
        moto,
        pendidikan,
        publikasi,
        kontak
      }
    });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          username: nip,
          password: hashedPassword,
          role: "DOSEN",
          dosen: { connect: { id: dosen.id } }
        }
      });
    }

    triggerQuotaUpdate();
    res.json(dosen);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/admin/dosen/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nip, kuotaMax, foto, keahlian, bio, moto, pendidikan, publikasi, kontak, password } = req.body;
    
    const currentDosen = await prisma.dosen.findUnique({ where: { id } });
    if (currentDosen?.foto && currentDosen.foto !== foto && currentDosen.foto.startsWith('/uploads/')) {
      try {
        const oldPath = path.join(process.cwd(), currentDosen.foto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.error("Gagal menghapus file lama (admin):", err);
      }
    }

    const dosen = await prisma.dosen.update({
      where: { id },
      data: { 
        nama, 
        nip, 
        kuotaMax: parseInt(String(kuotaMax)), 
        foto: foto || null,
        keahlian,
        bio,
        moto,
        kontak
      }
    });

    // Sync User record if it exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { dosen: { id: dosen.id } },
          { username: currentDosen?.nip }
        ]
      }
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          username: nip, // Sync with new NIP if changed
          foto: foto || existingUser.foto 
        }
      });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.findUnique({ where: { username: dosen.nip } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      } else {
        await prisma.user.create({
          data: {
            username: dosen.nip,
            password: hashedPassword,
            role: "DOSEN",
            dosen: { connect: { id } }
          }
        });
      }
    }

    triggerQuotaUpdate();
    res.json(dosen);
  } catch (err: any) {
    res.status(400).json({ error: "Gagal memperbarui data dosen." });
  }
});

app.delete("/api/admin/dosen/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Dosen deletion logic
    
    await prisma.dosen.delete({ where: { id } });
    
    // Broadcast update to all clients
    const updatedDosenList = await prisma.dosen.findMany({
      include: {
        _count: {
          select: { mahasiswa: true }
        }
      }
    });
    io.emit("quota_update", updatedDosenList);
    
    res.json({ success: true });
  } catch (err: any) {
    console.error("Delete dosen error:", err);
    res.status(400).json({ error: "Gagal menghapus dosen." });
  }
});

// Mahasiswa CRUD
app.get("/api/admin/mahasiswa", authenticate, isAdmin, async (req, res) => {
  try {
    const students = await prisma.mahasiswa.findMany({
      include: { user: true, dosen: true }
    });
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memuat daftar mahasiswa." });
  }
});

app.post("/api/admin/mahasiswa/import", authenticate, isAdmin, async (req, res) => {
  try {
    const students = req.body; // Array of { nim: string, nama: string }
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: "Data harus berupa array." });
    }

    let successCount = 0;
    let skipCount = 0;

    for (const std of students) {
      const nim = String(std.nim || "").trim();
      const nama = String(std.nama || "").trim();
      if (!nim || !nama) {
        skipCount++;
        continue;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { username: nim } });
      if (existingUser) {
        skipCount++;
        continue;
      }

      const defaultPassword = std.password || "123456";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      let extractedAngkatan = "";
      if (/^\d+$/.test(nim) && nim.length >= 2) {
        extractedAngkatan = "20" + nim.substring(0, 2);
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: nim,
            password: hashedPassword,
            role: "STUDENT"
          }
        });
        await tx.mahasiswa.create({
          data: {
            userId: user.id,
            nim,
            nama,
            angkatan: extractedAngkatan || null
          }
        });
      });
      successCount++;
    }

    res.json({ success: true, successCount, skipCount });
  } catch (err: any) {
    console.error("Bulk Import Error:", err);
    res.status(500).json({ error: err.message || "Gagal mengimpor data." });
  }
});

// --- AI BULK IMPORT & VALIDATION ENDPOINTS ---
app.post("/api/admin/import/analyze-ai", authenticate, isAdmin, async (req: any, res) => {
  const { type, rawText, parsedData } = req.body;
  if (!type || (type !== "mahasiswa" && type !== "dosen")) {
    return res.status(400).json({ error: "Tipe data harus 'mahasiswa' atau 'dosen'." });
  }

  try {
    let fullPrompt = "";
    if (rawText) {
      fullPrompt = `Kamu adalah asisten AI akademik Universitas Negeri Surabaya (UNESA) untuk Program Studi Pendidikan Teknologi Informasi.
Tugasmu adalah menganalisis dan mengekstrak data dari teks mentah bebas (misalnya dari pesan chat WhatsApp/Telegram) menjadi format JSON terstruktur.

Tipe data yang diekstrak: ${type}
Teks Mentah:
"${rawText}"

Format Keluaran harus berupa JSON valid dengan struktur berikut (pastikan persis sama):
{
  "items": [
    ${type === "mahasiswa" ? 
      `{ "nim": "NIM_DI_SINI", "nama": "NAMA_DI_SINI" }` : 
      `{ "nip": "NIP_DI_SINI", "nama": "NAMA_DI_SINI", "kuotaMax": 5, "kontak": "KONTAK_DI_SINI" }`
    }
  ],
  "anomalies": [
    { "row": 1, "message": "Pesan peringatan format jika ada" }
  ],
  "summary": "Ringkasan ekstraksi singkat"
}

Aturan ekstraksi dan validasi:
1. Bersihkan nama menjadi Title Case (contoh: "IQBAL AMRI" -> "Iqbal Amri", "ALDI MAULANA" -> "Aldi Maulana").
2. Untuk mahasiswa: Ekstrak NIM dan Nama. Validasi format NIM Unesa (deretan angka 11-15 digit, biasanya diawali 15 sampai 29). Jika format NIM tidak sesuai, masukkan pesan di "anomalies".
3. Untuk dosen: Ekstrak NIP, Nama, Kuota Maksimal (jika ada, default 5), dan Kontak (jika ada). Validasi NIP (biasanya 18 digit untuk PNS). Jika format mencurigakan, masukkan pesan di "anomalies".
4. Harap kembalikan hanya string JSON mentah yang valid di dalam blok kode \`\`\`json ... \`\`\` atau sebagai string JSON langsung. Jangan tambahkan penjelasan teks di luar JSON.`;
    } else if (parsedData) {
      fullPrompt = `Kamu adalah asisten AI akademik Universitas Negeri Surabaya (UNESA) untuk Program Studi Pendidikan Teknologi Informasi.
Tugasmu adalah memverifikasi, membersihkan nama, dan menemukan anomali format pada data yang sudah diuraikan dari file Excel/CSV.

Tipe data: ${type}
Data Input (JSON):
${JSON.stringify(parsedData)}

Format Keluaran harus berupa JSON valid dengan struktur berikut (pastikan persis sama):
{
  "items": [
    ${type === "mahasiswa" ? 
      `{ "nim": "NIM_DI_SINI", "nama": "NAMA_DI_SINI" }` : 
      `{ "nip": "NIP_DI_SINI", "nama": "NAMA_DI_SINI", "kuotaMax": 5, "kontak": "KONTAK_DI_SINI" }`
    }
  ],
  "anomalies": [
    { "row": 1, "message": "Pesan peringatan format jika ada" }
  ],
  "summary": "Ringkasan validasi singkat"
}

Aturan pembersihan dan validasi:
1. Bersihkan nama menjadi Title Case (contoh: "IQBAL AMRI" -> "Iqbal Amri").
2. NIM/NIP harus divalidasi. NIM Unesa valid adalah deretan angka 11-15 digit. NIP Dosen valid biasanya 18 digit angka (PNS). Masukkan anomali jika format tidak sesuai.
3. Kuota bimbingan dosen jika tidak ada atau tidak valid harus diisi default 5.
4. Harap kembalikan hanya string JSON mentah yang valid di dalam blok kode \`\`\`json ... \`\`\` atau sebagai string JSON langsung. Jangan tambahkan penjelasan teks di luar JSON.`;
    } else {
      return res.status(400).json({ error: "Input rawText atau parsedData wajib diisi." });
    }

    const result = await aiModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean markdown JSON wrapper
    let cleanText = text;
    if (cleanText.includes("```")) {
      cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Gemini Response parsing error. Raw Text:", text);
      throw new Error("Respon AI tidak berupa JSON valid.");
    }

    const items = parsedResult.items || [];
    const checkedItems = [];
    const anomalies = parsedResult.anomalies || [];

    // Validasi duplikasi dengan Database
    if (type === "mahasiswa") {
      const nims = items.map((it: any) => String(it.nim || "").trim()).filter(Boolean);
      const existingUsers = await prisma.user.findMany({
        where: { username: { in: nims } }
      });
      const existingNims = new Set(existingUsers.map(u => u.username));
      const seenNims = new Set<string>();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const nim = String(item.nim || "").trim();
        const nama = String(item.nama || "").trim();

        let status = "OK";
        if (!nim) {
          status = "NIM Kosong";
          anomalies.push({ row: i + 1, message: `Baris ${i + 1}: NIM tidak boleh kosong.` });
        } else if (seenNims.has(nim)) {
          status = "Duplikat di Input";
          anomalies.push({ row: i + 1, message: `Baris ${i + 1}: NIM ${nim} duplikat di dalam input.` });
        } else if (existingNims.has(nim)) {
          status = "Sudah Terdaftar";
          anomalies.push({ row: i + 1, message: `Baris ${i + 1}: NIM ${nim} sudah terdaftar di sistem.` });
        }

        seenNims.add(nim);
        checkedItems.push({
          ...item,
          nim,
          nama,
          status
        });
      }
    } else {
      const nips = items.map((it: any) => String(it.nip || "").trim()).filter(Boolean);
      const existingUsers = await prisma.user.findMany({
        where: { username: { in: nips } }
      });
      const existingNips = new Set(existingUsers.map(u => u.username));
      const seenNips = new Set<string>();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const nip = String(item.nip || "").trim();
        const nama = String(item.nama || "").trim();
        const kuotaMax = item.kuotaMax ? parseInt(item.kuotaMax) : 5;
        const kontak = item.kontak ? String(item.kontak).trim() : null;

        let status = "OK";
        if (!nip) {
          status = "NIP Kosong";
          anomalies.push({ row: i + 1, message: `Baris ${i + 1}: NIP tidak boleh kosong.` });
        } else if (seenNips.has(nip)) {
          status = "Duplikat di Input";
          anomalies.push({ row: i + 1, message: `Baris ${i + 1}: NIP ${nip} duplikat di dalam input.` });
        } else if (existingNips.has(nip)) {
          status = "Sudah Terdaftar";
          anomalies.push({ row: i + 1, message: `Baris ${i + 1}: NIP ${nip} sudah terdaftar di sistem.` });
        }

        seenNips.add(nip);
        checkedItems.push({
          ...item,
          nip,
          nama,
          kuotaMax,
          kontak,
          status
        });
      }
    }

    res.json({
      success: true,
      items: checkedItems,
      anomalies,
      summary: parsedResult.summary || "Analisis selesai."
    });

  } catch (err: any) {
    console.error("AI Import Analysis Error:", err);
    res.status(500).json({ error: err.message || "Gagal menganalisis data dengan AI." });
  }
});

app.post("/api/admin/dosen/import", authenticate, isAdmin, async (req, res) => {
  try {
    const lecturers = req.body;
    if (!Array.isArray(lecturers)) {
      return res.status(400).json({ error: "Data harus berupa array." });
    }

    let successCount = 0;
    let skipCount = 0;

    for (const dsn of lecturers) {
      const nip = String(dsn.nip || "").trim();
      const nama = String(dsn.nama || "").trim();
      const kuotaMax = dsn.kuotaMax ? parseInt(dsn.kuotaMax) : 5;
      const kontak = dsn.kontak ? String(dsn.kontak).trim() : null;

      if (!nip || !nama) {
        skipCount++;
        continue;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { username: nip } });
      if (existingUser) {
        skipCount++;
        continue;
      }

      const defaultPassword = "dsn" + nip.slice(-4);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await prisma.$transaction(async (tx) => {
        const dosen = await tx.dosen.create({
          data: {
            nama,
            nip,
            kuotaMax,
            kontak,
            keahlian: "Pendidikan Teknologi Informasi",
            bio: "Dosen tetap di Program Studi Pendidikan Teknologi Informasi UNESA.",
            moto: "Mendidik dengan hati, membangun masa depan dengan teknologi."
          }
        });

        await tx.user.create({
          data: {
            username: nip,
            password: hashedPassword,
            role: "DOSEN",
            dosen: { connect: { id: dosen.id } }
          }
        });
      });

      successCount++;
    }

    triggerQuotaUpdate();
    res.json({ success: true, successCount, skipCount });
  } catch (err: any) {
    console.error("Lecturer Bulk Import Error:", err);
    res.status(500).json({ error: err.message || "Gagal mengimpor data dosen." });
  }
});

app.post("/api/admin/mahasiswa", authenticate, isAdmin, async (req, res) => {
  try {
    const { nim, nama, kontak, password, angkatan } = req.body;
    if (!nim || !nama) throw new Error("NIM dan Nama wajib diisi.");

    // Check existing
    const existing = await prisma.user.findUnique({ where: { username: nim } });
    if (existing) throw new Error("NIM sudah terdaftar dalam sistem.");

    const hashedPassword = await bcrypt.hash(password || "mhs123", 10);
    
    let finalAngkatan = angkatan;
    if (!finalAngkatan && /^\d+$/.test(nim) && nim.length >= 2) {
      finalAngkatan = "20" + nim.substring(0, 2);
    }
    
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: nim,
          password: hashedPassword,
          role: "STUDENT"
        }
      });
      return tx.mahasiswa.create({
        data: {
          userId: user.id,
          nim,
          nama,
          kontak,
          angkatan: finalAngkatan || ""
        }
      });
    });
    res.json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/mahasiswa/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.mahasiswa.findUnique({ where: { id } });
    if (student) {
      // Simply delete student
      // Delete user also cascades to delete mahasiswa usually, but Prisma needs careful cascading.
      await prisma.mahasiswa.delete({ where: { id } });
      await prisma.user.delete({ where: { id: student.userId } });

      // Broadcast update to all clients
      const updatedDosenList = await prisma.dosen.findMany({
        include: {
          _count: {
            select: { mahasiswa: true }
          }
        }
      });
      io.emit("quota_update", updatedDosenList);
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Delete mahasiswa error:", err);
    res.status(400).json({ error: "Gagal menghapus data mahasiswa." });
  }
});

app.put("/api/admin/mahasiswa/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nim, nama, kontak, password, angkatan } = req.body;
    
    const student = await prisma.$transaction(async (tx) => {
      const current = await tx.mahasiswa.findUnique({ where: { id } });
      if (!current) throw new Error("Mahasiswa tidak ditemukan.");
      
      if (nim && nim !== current.nim) {
        const existing = await tx.user.findUnique({ where: { username: nim } });
        if (existing) throw new Error("NIM sudah terdaftar.");
      }
      
      let updateDataUser: any = {};
      if (nim) updateDataUser.username = nim;
      if (password) updateDataUser.password = await bcrypt.hash(password, 10);
      
      if (Object.keys(updateDataUser).length > 0) {
        await tx.user.update({
          where: { id: current.userId },
          data: updateDataUser
        });
      }

      let finalAngkatan = angkatan;
      if (!finalAngkatan && nim && /^\d+$/.test(nim) && nim.length >= 2) {
        finalAngkatan = "20" + nim.substring(0, 2);
      }

      return tx.mahasiswa.update({
        where: { id },
        data: { 
          nim, 
          nama, 
          kontak,
          angkatan: finalAngkatan || undefined
        }
      });
    });
    
    res.json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// WarConfig update
app.put("/api/admin/war-config", authenticate, isAdmin, async (req, res) => {
  try {
    const { startTime, endTime, periode } = req.body;
    if (!startTime || !endTime) throw new Error("Waktu mulai dan selesai wajib diisi.");
    
    if (new Date(startTime) >= new Date(endTime)) {
      throw new Error("Waktu mulai harus lebih awal dari waktu selesai.");
    }

    const updateData: any = { 
        startTime: new Date(startTime), 
        endTime: new Date(endTime),
        periode: periode || "Ganjil 2024/2025",
        targetAngkatan: req.body.targetAngkatan || "All",
        announcement: req.body.announcement || null,
        isForcedClosed: req.body.isForcedClosed ?? false
    };

    // Only add category if it's provided and we want to be safe with DB schema
    if (req.body.category) {
        updateData.category = req.body.category;
    }

    try {
        const config = await prisma.warConfig.upsert({
          where: { id: "global_config" },
          update: updateData,
          create: { 
            id: "global_config",
            ...updateData
          }
        });
        io.emit("config_update", config);
        res.json(config);
    } catch (err: any) {
        if (err.message.includes("category") || err.code === 'P2025' || err.message.includes("column")) {
            console.log("⚠️ Database belum tersinkronisasi. Menyimpan tanpa kolom category...");
            const { category, ...safeData } = updateData;
            
            // Define explicit selection to avoid Prisma querying the non-existent 'category' column
            const safeSelection = {
                id: true,
                startTime: true,
                endTime: true,
                periode: true,
                targetAngkatan: true,
                announcement: true,
                isForcedClosed: true
            };

            const config = await prisma.warConfig.upsert({
              where: { id: "global_config" },
              update: safeData,
              create: { 
                id: "global_config",
                ...safeData
              },
              select: safeSelection
            });
            return res.json(config);
        }
        console.error("Upsert WarConfig Error:", err);
        res.status(400).json({ error: err.message });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset Data by Angkatan
app.post("/api/admin/reset-angkatan", authenticate, isAdmin, async (req, res) => {
  const { angkatan } = req.body;
  if (!angkatan) return res.status(400).json({ error: "Angkatan wajib ditentukan." });

  try {
    const result = await prisma.mahasiswa.updateMany({
      where: { angkatan: angkatan },
      data: { dosenId: null, statusBimbingan: "PENDING" }
    });
    
    io.emit("quota_update", await prisma.dosen.findMany({ include: { _count: { select: { mahasiswa: true } }, penelitian: true } }));
    io.emit("student_update", { angkatan: angkatan });
    res.json({ message: `Berhasil mereset ${result.count} data bimbingan mahasiswa angkatan ${angkatan}.` });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal me-reset data angkatan." });
  }
});

// Delete all dummy/test students
app.delete("/api/admin/mahasiswa/dummy", authenticate, isAdmin, async (req, res) => {
  try {
    // Find dummy students: nama like "Mahasiswa Test %" OR nim matches old seed format (2205xxx, 7 digits)
    const dummyStudents = await prisma.mahasiswa.findMany({
      where: {
        OR: [
          { nama: { startsWith: "Mahasiswa Test" } },
          { nim: { startsWith: "2205" } }
        ]
      },
      select: { id: true, userId: true, nama: true }
    });

    if (dummyStudents.length === 0) {
      return res.json({ success: true, deletedCount: 0, message: "Tidak ada mahasiswa dummy ditemukan." });
    }

    const userIds = dummyStudents.map(s => s.userId);
    const mhsIds = dummyStudents.map(s => s.id);

    await prisma.$transaction(async (tx) => {
      await tx.mahasiswa.deleteMany({ where: { id: { in: mhsIds } } });
      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    });

    io.emit("quota_update", await prisma.dosen.findMany({ include: { _count: { select: { mahasiswa: true } }, penelitian: true } }));

    res.json({ success: true, deletedCount: dummyStudents.length, message: `Berhasil menghapus ${dummyStudents.length} mahasiswa dummy.` });
  } catch (err: any) {
    console.error("Delete Dummy Error:", err);
    res.status(500).json({ error: err.message || "Gagal menghapus mahasiswa dummy." });
  }
});

// Admin Management
app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, username: true, createdAt: true }
    });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat administrator." });
  }
});

app.post("/api/admin/users", authenticate, isAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error("Username dan Password wajib diisi.");

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) throw new Error("Username sudah terdaftar.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "ADMIN"
      },
      select: { id: true, username: true, createdAt: true }
    });
    res.json(admin);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/users/:id", authenticate, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({ error: "Tidak dapat menghapus akun Anda sendiri yang sedang login." });
    }
    
    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Tidak dapat menghapus administrator terakhir." });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: "Gagal menghapus administrator." });
  }
});

app.put("/api/admin/password", authenticate, isAdmin, async (req: any, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password baru harus memiliki minimal 6 karakter." });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    
    res.json({ success: true, message: "Password berhasil diperbarui" });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memperbarui password." });
  }
});

app.put("/api/admin/profile-foto", authenticate, isAdmin, async (req: any, res) => {
  const { foto } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { foto }
    });
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (err: any) {
    console.error("Gagal update foto profil:", err);
    res.status(500).json({ error: "Gagal memperbarui foto profil." });
  }
});

// --- BROADCAST SYSTEM (AI + WHATSAPP) ---
app.post("/api/admin/broadcast/ai", authenticate, isAdmin, async (req, res) => {
  const { prompt, lang = "id" } = req.body;
  if (!prompt) return res.status(400).json({ error: "Instruksi wajib diisi." });

  const langNames: Record<string, string> = {
    id: "Bahasa Indonesia",
    en: "English",
    zh: "Chinese (Mandarin)",
    ja: "Japanese",
    ko: "Korean"
  };

  const targetLang = langNames[lang] || "Bahasa Indonesia";

  try {
    const fullPrompt = `Kamu adalah asisten admin akademik prodi PTI UNESA. 
    Tugasmu adalah menyusun pesan pengumuman WhatsApp yang sangat informatif, rapi, dan menarik (gunakan emoji yang sesuai).
    Admin memberikan instruksi singkat: "${prompt}"
    Buatlah pesan tersebut dalam ${targetLang} yang profesional namun tetap asik bagi mahasiswa.
    Sertakan header pengumuman dan penutup yang sopan.
    Hanya berikan teks pesannya saja tanpa komentar apapun.`;

    const result = await aiModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text().trim();
    
    res.json({ message: text });
  } catch (err: any) {
    console.error("AI Broadcast Error:", err);
    res.status(500).json({ error: "Gagal menghasilkan pesan AI." });
  }
});

app.post("/api/admin/broadcast/send", authenticate, isAdmin, async (req: any, res) => {
  const { message, targetAngkatan } = req.body;
  const fonnteToken = (process.env.FONNTE_TOKEN || "").trim();

  if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong." });
  if (!fonnteToken || fonnteToken.includes("PLACEHOLDER")) {
    return res.status(400).json({ error: "Fonnte Token belum diatur di server." });
  }

  try {
    // 1. Get recipients
    let students;
    if (targetAngkatan === "All" || !targetAngkatan) {
      students = await prisma.mahasiswa.findMany({ where: { NOT: { kontak: null } } });
    } else {
      const allowed = String(targetAngkatan).split(",").map((a: string) => a.trim());
      students = await prisma.mahasiswa.findMany({ 
        where: { 
          angkatan: { in: allowed },
          NOT: { kontak: null }
        } 
      });
    }

    if (students.length === 0) return res.status(404).json({ error: "Tidak ada mahasiswa dengan nomor kontak yang ditemukan." });

    // 2. Prepare numbers (Comma separated)
    const numbers = students.map(s => s.kontak).join(",");

    // 3. Send to Fonnte
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: fonnteToken },
      body: new URLSearchParams({
        target: numbers,
        message: message,
        countryCode: "62",
      })
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.reason || "Gagal mengirim ke Fonnte.");

    res.json({ success: true, count: students.length, details: data });
  } catch (err: any) {
    console.error("WA Broadcast Error:", err);
    res.status(500).json({ error: err.message || "Gagal mengirim pesan WhatsApp." });
  }
});

// --- DOSEN SELF MANAGEMENT ---
app.put("/api/dosen/profile", authenticate, async (req: any, res) => {
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied." });
  const { nama, keahlian, bio, moto, pendidikan, publikasi, kontak, foto } = req.body;
  try {
    const currentDosen = await prisma.dosen.findUnique({ where: { nip: req.user.nim } });
    
    // Hapus file foto lama jika ada dan berbeda dengan yang baru
    if (currentDosen?.foto && currentDosen.foto !== foto && currentDosen.foto.startsWith('/uploads/')) {
      try {
        const oldPath = path.join(process.cwd(), currentDosen.foto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.error("Gagal menghapus file lama:", err);
      }
    }

    const updatedDosen = await prisma.dosen.update({
      where: { nip: req.user.nim },
      data: { 
        nama, 
        keahlian, 
        bio, 
        moto, 
        kontak, 
        foto 
      }
    });
    if (foto) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { foto }
      });
    }
    res.json(updatedDosen);
  } catch (err: any) {
    console.error("Update Dosen Profile Error:", err);
    res.status(500).json({ error: "Gagal memperbarui profil dosen." });
  }
});

// --- RESEARCH PROJECT MANAGEMENT ---
app.post("/api/dosen/penelitian", authenticate, async (req: any, res) => {
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied." });
  const { judul } = req.body;
  if (!judul) return res.status(400).json({ error: "Judul penelitian wajib diisi." });

  try {
    const dosen = await prisma.dosen.findUnique({ where: { nip: req.user.nim } });
    if (!dosen) return res.status(404).json({ error: "Dosen not found." });

    const penelitian = await prisma.penelitian.create({
      data: {
        judul,
        dosenId: dosen.id,
        isActive: true
      }
    });
    res.status(201).json(penelitian);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menambahkan penelitian." });
  }
});

app.patch("/api/dosen/penelitian/:id/toggle", authenticate, async (req: any, res) => {
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied" });
  const { id } = req.params;

  try {
    // Fix #5: Verify ownership before allowing toggle
    const dosen = await prisma.dosen.findUnique({ where: { nip: req.user.nim } });
    if (!dosen) return res.status(404).json({ error: "Data dosen tidak ditemukan." });

    const current = await prisma.penelitian.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: "Penelitian tidak ditemukan." });
    if (current.dosenId !== dosen.id) return res.status(403).json({ error: "Akses ditolak. Bukan penelitian Anda." });

    const updated = await prisma.penelitian.update({
      where: { id },
      data: { isActive: !current.isActive }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengubah status penelitian." });
  }
});

app.delete("/api/dosen/penelitian/:id", authenticate, async (req: any, res) => {
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied" });
  const { id } = req.params;

  try {
    // Fix #5: Verify ownership before allowing delete
    const dosen = await prisma.dosen.findUnique({ where: { nip: req.user.nim } });
    if (!dosen) return res.status(404).json({ error: "Data dosen tidak ditemukan." });

    const penelitian = await prisma.penelitian.findUnique({ where: { id } });
    if (!penelitian) return res.status(404).json({ error: "Penelitian tidak ditemukan." });
    if (penelitian.dosenId !== dosen.id) return res.status(403).json({ error: "Akses ditolak. Bukan penelitian Anda." });

    await prisma.penelitian.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menghapus penelitian." });
  }
});

app.put("/api/dosen/password", authenticate, async (req: any, res) => {
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied." });
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password baru minimal 6 karakter." });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

    // Skip current password verification for Google SSO users who leave it blank
    const isGoogleSSO = user.email !== null;
    if (!(isGoogleSSO && !currentPassword)) {
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ error: "Password saat ini salah." });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    res.json({ message: "Password berhasil diperbarui." });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memperbarui password." });
  }
});

app.put("/api/student/password", authenticate, async (req: any, res) => {
  if (req.user.role !== 'STUDENT') return res.status(403).json({ error: "Access denied." });
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password baru minimal 6 karakter." });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

    if (currentPassword) {
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ error: "Password saat ini salah." });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    res.json({ message: "Password berhasil diperbarui." });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memperbarui password." });
  }
});

// --- GLOBAL DATA ---
app.get("/api/dosen", async (req, res) => {
  try {
    const lecturers = await prisma.dosen.findMany({
      include: { 
        _count: { select: { mahasiswa: true } },
        penelitian: true
      },
    });
    res.json(lecturers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dosen" });
  }
});

app.get("/api/war-config", async (req, res) => {
  try {
    const config = await prisma.warConfig.findUnique({ where: { id: "global_config" } });
    res.json(config);
  } catch (err: any) {
    // Fallback if category column does not exist in DB yet
    if (err.message && (err.message.includes("category") || err.message.includes("column"))) {
        try {
            const config = await prisma.warConfig.findUnique({
                where: { id: "global_config" },
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                    periode: true,
                    targetAngkatan: true,
                    announcement: true,
                    isForcedClosed: true
                }
            });
            return res.json(config);
        } catch (innerErr) {
            return res.status(500).json({ error: "Failed to fetch config (fallback)" });
        }
    }
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

// --- VITE SETUP ---
async function startServer() {
  // Migration for Angkatan on startup
  try {
    const students = await prisma.mahasiswa.findMany({ where: { angkatan: null } });
    if (students.length > 0) {
      console.log(`🚀 Migrating ${students.length} students to detect Angkatan...`);
      for (const s of students) {
        const yearDigits = s.nim.substring(0, 2);
        const angkatan = "20" + yearDigits;
        await prisma.mahasiswa.update({ where: { id: s.id }, data: { angkatan } });
      }
      console.log("✅ Migration completed.");
    }
  } catch (mErr) {
    console.error("Migration error:", mErr);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
