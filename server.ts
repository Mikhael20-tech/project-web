import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import multer from "multer";
import fs from "fs";

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

const JWT_SECRET = process.env.JWT_SECRET || "wardosen-secret-key-123";
const PORT = 3000;

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
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
    // Look up by nim (username) instead of id to handle re-seeding
    const userExists = await prisma.user.findUnique({ where: { username: decoded.nim } });
    if (!userExists) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    req.user = { ...decoded, id: userExists.id };
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
            nama
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
                        nim: username,
                        nama: name || username,
                        foto: picture
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
      include: { kelompok: { include: { mahasiswa: true, dosen: true } } }
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
      include: { kelompok: { include: { mahasiswa: true } } }
    });
    res.json(dosen);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data profil dosen." });
  }
});

app.post("/api/profile", authenticate, async (req: any, res) => {
  const { nama, kontak, peminatan, bio, foto, ipk } = req.body;
  try {
    const student = await prisma.mahasiswa.upsert({
      where: { userId: req.user.id },
      update: { nama, kontak, peminatan, bio, foto, ipk },
      create: {
        userId: req.user.id,
        nim: req.user.nim, 
        nama,
        kontak,
        peminatan,
        bio,
        foto,
        ipk
      },
    });
    res.json(student);
  } catch (err: any) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: err.message || "Gagal memperbarui profil." });
  }
});

// --- GROUP SYSTEM ---
app.get("/api/invitations", authenticate, async (req: any, res) => {
  try {
    const student = await prisma.mahasiswa.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const invitations = await prisma.invitation.findMany({
      where: { toId: student.id, status: "PENDING" },
      include: { kelompok: { include: { mahasiswa: true } }, from: true }
    });
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat undangan." });
  }
});

app.post("/api/invitations/:id/accept", authenticate, async (req: any, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.mahasiswa.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.kelompokId) return res.status(400).json({ error: "Sudah berada dalam kelompok." });

    const invite = await prisma.invitation.findUnique({
      where: { id },
      include: { kelompok: { include: { _count: { select: { mahasiswa: true } } } } }
    });

    if (!invite || invite.toId !== student.id || invite.status !== "PENDING") {
      return res.status(400).json({ error: "Undangan tidak valid." });
    }

    if (invite.kelompok._count.mahasiswa >= 3) {
      return res.status(400).json({ error: "Kelompok sudah penuh." });
    }

    await prisma.$transaction([
      prisma.invitation.update({
        where: { id },
        data: { status: "ACCEPTED" }
      }),
      prisma.mahasiswa.update({
        where: { id: student.id },
        data: { kelompokId: invite.kelompokId }
      })
    ]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menerima undangan." });
  }
});

app.post("/api/invitations/:id/reject", authenticate, async (req: any, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.mahasiswa.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const invite = await prisma.invitation.findUnique({ where: { id } });
    if (!invite || invite.toId !== student.id) {
      return res.status(400).json({ error: "Undangan tidak valid." });
    }

    await prisma.invitation.update({
      where: { id },
      data: { status: "REJECTED" }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menolak undangan." });
  }
});

app.post("/api/groups/create", authenticate, async (req: any, res) => {
  const { nama } = req.body;
  const mahasiswa = await prisma.mahasiswa.findUnique({ where: { userId: req.user.id } });
  if (!mahasiswa) return res.status(400).json({ error: "Profile not found" });
  if (mahasiswa.kelompokId) return res.status(400).json({ error: "Already in a group" });

  const kelompok = await prisma.kelompok.create({
    data: {
      nama: nama || "Team Tanpa Nama",
      mahasiswa: { connect: { id: mahasiswa.id } },
    },
  });

  await prisma.mahasiswa.update({
    where: { id: mahasiswa.id },
    data: { isLeader: true },
  });

  res.json(kelompok);
});

app.put("/api/groups/rename", authenticate, async (req: any, res) => {
  const { nama } = req.body;
  if (!nama) return res.status(400).json({ error: "Nama kelompok wajib diisi." });
  if (nama.length > 25) return res.status(400).json({ error: "Nama kelompok terlalu panjang (maks 25 karakter)." });
  
  try {
    const student = await prisma.mahasiswa.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!student || !student.isLeader || !student.kelompokId) {
      return res.status(403).json({ error: "Hanya ketua kelompok yang dapat mengganti nama." });
    }

    const updated = await prisma.kelompok.update({
      where: { id: student.kelompokId },
      data: { nama }
    });
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengganti nama kelompok." });
  }
});

app.post("/api/groups/invite", authenticate, async (req: any, res) => {
  const { targetNim } = req.body;
  const leader = await prisma.mahasiswa.findUnique({
    where: { userId: req.user.id },
    include: { kelompok: { include: { mahasiswa: true } } },
  });

  if (!leader || !leader.isLeader || !leader.kelompokId) {
    return res.status(403).json({ error: "Only group leaders can invite" });
  }

  if (leader.kelompok!.mahasiswa.length >= 3) { // Max 3 for example
    return res.status(400).json({ error: "Group full" });
  }

  const target = await prisma.mahasiswa.findUnique({ where: { nim: targetNim } });
  if (!target) return res.status(404).json({ error: "Student not found" });
  if (target.kelompokId) return res.status(400).json({ error: "Target already in a group" });

  const invite = await prisma.invitation.create({
    data: {
      kelompokId: leader.kelompokId,
      fromId: leader.id,
      toId: target.id,
    },
  });

  res.json(invite);
});

// --- THE CRITICAL WAR LOGIC: SELECT DOSEN ---
app.post("/api/war/select", authenticate, async (req: any, res) => {
  const { dosenId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check War Time
      const config = await tx.warConfig.findUnique({ where: { id: "global_config" } });
      if (!config) throw new Error("Konfigurasi jadwal pemilihan belum disetel oleh admin.");
      
      const now = new Date();
      if (now < config.startTime) {
        throw new Error("Sistem pemilihan belum dibuka. Silakan tunggu hingga waktu countdown selesai.");
      }
      if (now > config.endTime) {
        throw new Error("Masa pemilihan dosen telah berakhir.");
      }

      // 2. Check if user is Leader
      const student = await tx.mahasiswa.findUnique({
        where: { userId: req.user.id },
        include: { kelompok: true },
      });
      
      if (!student) throw new Error("Profil mahasiswa tidak ditemukan. Silakan lengkapi profil Anda.");
      if (!student.isLeader || !student.kelompokId) {
        throw new Error("Hanya Ketua Kelompok yang diperbolehkan memilih dosen pembimbing.");
      }
      if (student.kelompok?.dosenId) {
        throw new Error("Kelompok Anda sudah memiliki dosen pembimbing.");
      }

      // 3. PESSIMISTIC LOCKING / ATOMIC CHECK
      const lecturer = await tx.dosen.findUnique({
        where: { id: dosenId },
        include: { _count: { select: { kelompok: true } } },
      });

      if (!lecturer) throw new Error("Data dosen tidak ditemukan dalam sistem.");
      if (lecturer._count.kelompok >= lecturer.kuotaMax) {
        throw new Error(`Maaf, kuota untuk ${lecturer.nama} sudah penuh.`);
      }

      // 4. Update
      const updatedKelompok = await tx.kelompok.update({
        where: { id: student.kelompokId },
        data: { dosenId: lecturer.id },
      });

      return { updatedKelompok, lecturerName: lecturer.nama };
    });

    // Broadcast update
    const allLecturers = await prisma.dosen.findMany({
      include: { _count: { select: { kelompok: true } } },
    });
    io.emit("quota_update", allLecturers);

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

      // 2. Check Role
      const student = await tx.mahasiswa.findUnique({
        where: { userId: req.user.id },
        include: { kelompok: true },
      });

      if (!student || !student.isLeader || !student.kelompokId) {
        throw new Error("Akses ditolak. Hanya ketua kelompok yang dapat membatalkan.");
      }

      if (!student.kelompok?.dosenId) {
        throw new Error("Kelompok Anda belum memilih dosen.");
      }

      // 3. Update
      await tx.kelompok.update({
        where: { id: student.kelompokId },
        data: { dosenId: null },
      });

      return { success: true };
    });

    // Broadcast
    const allLecturers = await prisma.dosen.findMany({
      include: { _count: { select: { kelompok: true } } },
    });
    io.emit("quota_update", allLecturers);

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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
        kelompok: {
          include: { mahasiswa: true }
        }
      }
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Photo Upload
app.post("/api/upload", authenticate, (req: any, res: any) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.message || "Gagal mengupload file." });
    }
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

// Dosen CRUD
app.post("/api/admin/dosen", authenticate, isAdmin, async (req, res) => {
  try {
    const { nama, nip, kuotaMax, foto, keahlian, bio, pendidikan, publikasi, kontak, password } = req.body;
    if (!nama || !nip || !kuotaMax) throw new Error("Nama, NIP, dan kuota maksimal wajib diisi.");
    
    const dosen = await prisma.dosen.create({
      data: { 
        nama, 
        nip, 
        kuotaMax: parseInt(kuotaMax), 
        foto,
        keahlian,
        bio,
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
    const { nama, nip, kuotaMax, foto, keahlian, bio, pendidikan, publikasi, kontak, password } = req.body;
    const dosen = await prisma.dosen.update({
      where: { id },
      data: { 
        nama, 
        nip, 
        kuotaMax: parseInt(kuotaMax), 
        foto,
        keahlian,
        bio,
        pendidikan,
        publikasi,
        kontak
      }
    });

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
    // Putuskan relasi kelompok sebelum menghapus dosen
    await prisma.kelompok.updateMany({
      where: { dosenId: id },
      data: { dosenId: null }
    });
    
    await prisma.dosen.delete({ where: { id } });
    
    // Broadcast update to all clients
    const updatedDosenList = await prisma.dosen.findMany({
      include: {
        _count: {
          select: { kelompok: true }
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
      include: { user: true, kelompok: true }
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
      // Clean up any invitations associated with this student
      await prisma.invitation.deleteMany({
        where: {
          OR: [
            { fromId: id },
            { toId: id }
          ]
        }
      });
      
      if (student.kelompokId) {
        // Disconnect from group before deleting
        await prisma.mahasiswa.update({ where: { id }, data: { kelompokId: null }});
        
        // If this student was the leader, we might need to delete the kelompok if it's now empty,
        // or just let it be. To be safe, if kelompok is empty, delete it.
        const remainingMembers = await prisma.mahasiswa.count({
          where: { kelompokId: student.kelompokId }
        });
        
        if (remainingMembers === 0) {
          // Delete any remaining invitations for this group
          await prisma.invitation.deleteMany({
            where: { kelompokId: student.kelompokId }
          });
          await prisma.kelompok.delete({
            where: { id: student.kelompokId }
          });
        } else if (student.isLeader) {
          // Reassign leadership to the first remaining member
          const nextMember = await prisma.mahasiswa.findFirst({
            where: { kelompokId: student.kelompokId }
          });
          if (nextMember) {
            await prisma.mahasiswa.update({
              where: { id: nextMember.id },
              data: { isLeader: true }
            });
          }
        }
      }
      // Delete user also cascades to delete mahasiswa usually, but Prisma needs careful cascading.
      await prisma.mahasiswa.delete({ where: { id } });
      await prisma.user.delete({ where: { id: student.userId } });

      // Broadcast update to all clients
      const updatedDosenList = await prisma.dosen.findMany({
        include: {
          _count: {
            select: { kelompok: true }
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
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) throw new Error("Waktu mulai dan selesai wajib diisi.");
    
    if (new Date(startTime) >= new Date(endTime)) {
      throw new Error("Waktu mulai harus lebih awal dari waktu selesai.");
    }

    const config = await prisma.warConfig.upsert({
      where: { id: "global_config" },
      update: { 
        startTime: new Date(startTime), 
        endTime: new Date(endTime) 
      },
      create: { 
        id: "global_config",
        startTime: new Date(startTime), 
        endTime: new Date(endTime) 
      }
    });
    res.json(config);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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

// --- DOSEN SELF MANAGEMENT ---
app.put("/api/dosen/profile", authenticate, async (req: any, res) => {
  if (req.user.role !== 'DOSEN') return res.status(403).json({ error: "Access denied." });
  const { nama, keahlian, bio, pendidikan, publikasi, kontak, foto } = req.body;
  try {
    const updatedDosen = await prisma.dosen.update({
      where: { nip: req.user.nim },
      data: { nama, keahlian, bio, pendidikan, publikasi, kontak, foto }
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
      include: { _count: { select: { kelompok: true } } },
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
