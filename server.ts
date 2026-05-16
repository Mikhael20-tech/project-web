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
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

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
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
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
const PORT = 3000;

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

// --- AUTH ROUTES ---
app.post("/api/register", async (req, res) => {
  try {
    const { nim, nama, password } = req.body;
    if (!nim || !nama || !password) {
      return res.status(400).json({ error: "NIM, Nama, dan Password wajib diisi." });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { username: nim } });
    if (existingUser) {
      return res.status(400).json({ error: "NIM tersebut sudah terdaftar." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        username: nim,
        password: hashedPassword,
        role: "STUDENT",
        mahasiswa: {
          create: {
            nim,
            nama,
            angkatan: "20" + nim.substring(0, 2)
          }
        }
      }
    });

    res.status(201).json({ message: "Registrasi berhasil. Silakan login." });
  } catch (err: any) {
    console.error("Register Error Details:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server saat registrasi." });
  }
});

app.post("/api/register-dosen", async (req, res) => {
  try {
    const { nip, nama, password } = req.body;
    if (!nip || !nama || !password) {
      return res.status(400).json({ error: "NIP, Nama, dan Password wajib diisi." });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { username: nip } });
    if (existingUser) {
      return res.status(400).json({ error: "Akun dengan NIP tersebut sudah terdaftar." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingDosen = await prisma.dosen.findFirst({ where: { nip } });
    
    if (existingDosen) {
      await prisma.user.create({
        data: {
          username: nip,
          password: hashedPassword,
          role: "DOSEN",
          dosen: { connect: { id: existingDosen.id } }
        }
      });
    } else {
      await prisma.user.create({
        data: {
          username: nip,
          password: hashedPassword,
          role: "DOSEN",
          dosen: { create: { nip, nama } }
        }
      });
    }

    res.status(201).json({ message: "Registrasi Dosen berhasil. Silakan login." });
  } catch (err: any) {
    console.error("Register Dosen Error:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server saat registrasi dosen." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
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

    let user = await prisma.user.findFirst({
        where: { OR: [{ email: email }, { username: email.split('@')[0] }] },
        include: { mahasiswa: true }
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

        const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: randomPassword,
                foto: picture,
                role: 'STUDENT',
                mahasiswa: {
                    create: {
                        nim: extractedNim,
                        nama: name || username,
                        foto: picture,
                        angkatan: extractedAngkatan
                    }
                }
            },
            include: { mahasiswa: true }
        });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nim: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.send(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', user: ${JSON.stringify(user)} }, '*');
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
    res.send(`<p>Error: ${err.message}</p><script>setTimeout(()=>window.close(), 5000);</script>`);
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
  const { nama, kontak, peminatan, bio, foto, angkatan } = req.body;
  try {
    const student = await prisma.mahasiswa.upsert({
      where: { userId: req.user.id },
      update: { 
        nama, 
        kontak, 
        peminatan, 
        bio, 
        foto: foto || null, 
        angkatan 
      },
      create: {
        userId: req.user.id,
        nim: req.user.nim, 
        nama,
        kontak,
        peminatan,
        bio,
        foto: foto || null,
        angkatan
      },
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
app.post("/api/war/select", authenticate, async (req: any, res) => {
  const { dosenId, rencanaJudul } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check War Time
      const config = await tx.warConfig.findUnique({ where: { id: "global_config" } });
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
      const student = await tx.mahasiswa.findUnique({
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

      // 3. PESSIMISTIC LOCKING / ATOMIC CHECK
      await tx.$executeRawUnsafe(`SELECT id FROM "Dosen" WHERE id = $1 FOR UPDATE`, dosenId);

      const lecturer = await tx.dosen.findUnique({
        where: { id: dosenId },
        include: { _count: { select: { mahasiswa: true } } },
      });

      if (!lecturer) throw new Error("Data dosen tidak ditemukan dalam sistem.");
      if (lecturer._count.mahasiswa >= lecturer.kuotaMax) {
        throw new Error(`Maaf, kuota untuk ${lecturer.nama} sudah penuh.`);
      }

      // 4. Update - save rencanaJudul, set status PENDING, and tag with current periode
      const updatedStudent = await tx.mahasiswa.update({
        where: { id: student.id },
        data: { 
          dosenId: lecturer.id,
          rencanaJudul: rencanaJudul || null,
          statusBimbingan: "APPROVED",
          periode: (config as any).periode || null,
        },
      });

      return { updatedStudent, lecturerName: lecturer.nama, studentName: student.nama, studentKontak: student.kontak };
    });

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

    // Broadcast update
    const allLecturers = await prisma.dosen.findMany({
      include: { _count: { select: { mahasiswa: true } } },
    });
    io.emit("quota_update", allLecturers);
    
    // Broadcast for Live Activity Feed
    io.emit("new_selection", { 
      lecturerName: result.lecturerName,
      timestamp: new Date()
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


app.post("/api/war/cancel", authenticate, async (req: any, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check War Time
      const config = await tx.warConfig.findUnique({ where: { id: "global_config" } });
      if (!config) throw new Error("Konfigurasi jadwal belum disetel.");
      
      const now = new Date();
      if (now < config.startTime || now > config.endTime) {
        throw new Error("Membatalkan dosen hanya diperbolehkan saat periode pemilihan aktif.");
      }

      // 2. Check Profile
      const student = await tx.mahasiswa.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        throw new Error("Profil mahasiswa tidak ditemukan.");
      }

      if (!student.dosenId) {
        throw new Error("Anda belum memilih dosen.");
      }

      // 3. Update
      await tx.mahasiswa.update({
        where: { id: student.id },
        data: { dosenId: null, statusBimbingan: "PENDING", rencanaJudul: null },
      });

      return { success: true };
    });

    // Broadcast
    const allLecturers = await prisma.dosen.findMany({
      include: { _count: { select: { mahasiswa: true } } },
    });
    io.emit("quota_update", allLecturers);

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
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

    io.emit("quota_update", await prisma.dosen.findMany({ include: { _count: { select: { mahasiswa: true } } } }));
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
      data: { dosenId: null, statusBimbingan: "PENDING", rencanaJudul: null },
    });

    io.emit("quota_update", await prisma.dosen.findMany({ include: { _count: { select: { mahasiswa: true } } } }));
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

    await prisma.mahasiswa.update({
      where: { id: mahasiswaId },
      data: { dosenId: null }
    });

    console.log(`Admin ${req.user.nim} membatalkan pilihan dosen untuk Mahasiswa ${mhs.nim}`);
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

app.post("/api/admin/mahasiswa", authenticate, isAdmin, async (req, res) => {
  try {
    const { nim, nama, kontak, password } = req.body;
    if (!nim || !nama) throw new Error("NIM dan Nama wajib diisi.");

    // Check existing
    const existing = await prisma.user.findUnique({ where: { username: nim } });
    if (existing) throw new Error("NIM sudah terdaftar dalam sistem.");

    const hashedPassword = await bcrypt.hash(password || "mhs123", 10);
    
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
          kontak
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
    const { nim, nama, kontak, password } = req.body;
    
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

      return tx.mahasiswa.update({
        where: { id },
        data: { nim, nama, kontak }
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

    const config = await prisma.warConfig.upsert({
      where: { id: "global_config" },
      update: { 
        startTime: new Date(startTime), 
        endTime: new Date(endTime),
        periode: periode || "Ganjil 2024/2025",
        targetAngkatan: req.body.targetAngkatan || "All",
        announcement: req.body.announcement || null,
        isForcedClosed: req.body.isForcedClosed ?? false
      },
      create: { 
        id: "global_config",
        startTime: new Date(startTime), 
        endTime: new Date(endTime),
        periode: periode || "Ganjil 2024/2025",
        targetAngkatan: req.body.targetAngkatan || "All",
        announcement: req.body.announcement || null,
        isForcedClosed: req.body.isForcedClosed ?? false
      }
    });
    res.json(config);
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
      data: { dosenId: null, statusBimbingan: "PENDING", rencanaJudul: null }
    });
    
    io.emit("quota_update", await prisma.dosen.findMany({ include: { _count: { select: { mahasiswa: true } } } }));
    res.json({ message: `Berhasil mereset ${result.count} data bimbingan mahasiswa angkatan ${angkatan}.` });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal me-reset data angkatan." });
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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const fullPrompt = `Kamu adalah asisten admin akademik prodi PTI UNESA. 
    Tugasmu adalah menyusun pesan pengumuman WhatsApp yang sangat informatif, rapi, dan menarik (gunakan emoji yang sesuai).
    Admin memberikan instruksi singkat: "${prompt}"
    Buatlah pesan tersebut dalam ${targetLang} yang profesional namun tetap asik bagi mahasiswa.
    Sertakan header pengumuman dan penutup yang sopan.
    Hanya berikan teks pesannya saja tanpa komentar apapun.`;

    const result = await model.generateContent(fullPrompt);
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
    if (targetAngkatan === "All") {
      students = await prisma.mahasiswa.findMany({ where: { NOT: { kontak: null } } });
    } else {
      const allowed = targetAngkatan.split(",").map((a: string) => a.trim());
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
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied." });
  const { id } = req.params;

  try {
    const current = await prisma.penelitian.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: "Penelitian tidak ditemukan." });

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
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied." });
  const { id } = req.params;

  try {
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
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: "Password saat ini salah." });
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
  } catch (err) {
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
