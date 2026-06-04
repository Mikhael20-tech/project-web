# Gunakan image resmi Node.js LTS (Alpine untuk ukuran image kecil)
FROM node:22-alpine

# Set working directory di dalam kontainer
WORKDIR /app

# Install package yang dibutuhkan untuk build native modules (jika ada)
RUN apk add --no-cache python3 make g++

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Salin folder prisma untuk generate client sebelum install dependensi penuh
COPY prisma ./prisma/

# Install dependensi (termasuk devDependencies untuk kebutuhan build Vite)
RUN npm ci

# Salin seluruh kode proyek ke dalam kontainer
COPY . .

# Generate Prisma Client untuk berinteraksi dengan database Supabase
RUN npx prisma generate

# Build frontend (Vite) menjadi aset statis di folder dist/
RUN npm run build

# Ekspos port aplikasi (sesuai dengan PORT di server.ts)
EXPOSE 3000

# Jalankan aplikasi menggunakan tsx di lingkungan produksi
CMD ["npm", "run", "start"]
