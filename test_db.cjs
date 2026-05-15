const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConn() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("Database connected successfully!");
    const count = await prisma.mahasiswa.count();
    console.log("Mahasiswa count:", count);
    const first = await prisma.mahasiswa.findFirst();
    console.log("First mahasiswa angkatan:", first?.angkatan);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConn();
