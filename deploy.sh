#!/bin/bash

# --- AUTOMATED DEPLOYMENT SCRIPT FOR WARDOSEN ---
# Jalankan skrip ini di VPS KVM Anda dengan perintah: bash deploy.sh

echo "=================================================="
echo "🚀 MEMULAI OTOMASI DEPLOYMENT WARDOSEN DI VPS KVM"
echo "=================================================="

# 1. Tarik Kode Terbaru Dari GitHub
echo "📥 Langkah 1: Menarik kode terbaru dari GitHub..."
git pull origin main

# 2. Instal Dependensi Node.js
echo "📦 Langkah 2: Menginstal dependensi NPM..."
npm install

# 3. Sinkronisasi Skema Database ke Supabase
echo "🗄️ Langkah 3: Sinkronisasi skema Prisma ke database..."
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Build Aset Frontend
echo "⚡ Langkah 4: Membangun aset produksi frontend (Vite)..."
npm run build

# 5. Kelola Proses Server Dengan PM2 (Zero Downtime)
echo "🔄 Langkah 5: Memuat ulang server dengan PM2..."
if pm2 list | grep -q "wardosen"; then
    echo "✅ Server aktif ditemukan. Melakukan reload tanpa downtime (Zero Downtime)..."
    pm2 reload ecosystem.config.cjs
else
    echo "🆕 Server belum berjalan di PM2. Memulai proses baru..."
    pm2 start ecosystem.config.cjs
fi

# 6. Simpan Konfigurasi PM2 Agar Otomatis Menyala Saat Reboot
echo "💾 Langkah 6: Menyimpan daftar proses PM2..."
pm2 save

echo "=================================================="
echo "🎉 DEPLOYMENT SELESAI & BERHASIL DENGAN SUKSES!"
echo "🌐 Akses web Anda melalui domain yang terhubung."
echo "=================================================="
