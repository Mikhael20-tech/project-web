import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.mahasiswa.deleteMany();
  await prisma.dosen.deleteMany();
  await prisma.user.deleteMany();
  await prisma.warConfig.deleteMany();

  // Create War Config
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - 5); // 5 minutes ago (war sudah dimulai)
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 24);

  await prisma.warConfig.upsert({
    where: { id: 'global_config' },
    update: { startTime, endTime },
    create: { id: 'global_config', startTime, endTime },
  });

  // Create Admin
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPass,
      role: 'ADMIN',
    },
  });

  // Generate 300 Students
  const studentPass = await bcrypt.hash('mhs123', 10);
  
  const studentUsers = Array.from({ length: 300 }).map((_, i) => ({
    username: `2205${String(i + 1).padStart(3, '0')}`,
    password: studentPass,
    role: 'STUDENT' as const,
  }));
  
  await prisma.user.createMany({ data: studentUsers, skipDuplicates: true });

  const allStudentUsers = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  
  const studentProfiles = allStudentUsers.map((u, i) => ({
    userId: u.id,
    nim: u.username,
    nama: `Mahasiswa Test ${i + 1}`,
    kontak: `0812345${String(i).padStart(4, '0')}`,
  }));

  await prisma.mahasiswa.createMany({ data: studentProfiles, skipDuplicates: true });

  // Generate 16 Lecturers with 18 quota
  const lecturers = Array.from({ length: 16 }).map((_, i) => ({
    nama: `Dosen Penguji ${i + 1}, S.Kom., M.T.`,
    nip: `19800101${String(i + 1).padStart(2, '0')}`,
    kuotaMax: 18,
  }));

  await prisma.dosen.createMany({ data: lecturers, skipDuplicates: true });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
