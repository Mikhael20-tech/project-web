import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.invitation.deleteMany();
  await prisma.mahasiswa.deleteMany();
  await prisma.kelompok.deleteMany();
  await prisma.dosen.deleteMany();
  await prisma.user.deleteMany();
  await prisma.warConfig.deleteMany();

  // Create War Config
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() + 5); // 5 minutes from now
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

  // Create Student User
  const studentPass = await bcrypt.hash('mhs123', 10);
  const studentUser = await prisma.user.upsert({
    where: { username: '12345678' },
    update: {},
    create: {
      username: '12345678',
      password: studentPass,
      role: 'STUDENT',
    },
  });

  // Create Student Profile & Group
  const student = await prisma.mahasiswa.create({
    data: {
      userId: studentUser.id,
      nim: '12345678',
      nama: 'Budi Mahasiswa',
      kontak: '08123456789',
      isLeader: true,
    },
  });

  await prisma.kelompok.create({
    data: {
      mahasiswa: { connect: { id: student.id } }
    }
  });

  // Create some Lecturers
  const lecturers = [
    { nama: 'Dr. Ir. Heryanto, M.T.', nip: '19750812-01', kuotaMax: 3 },
    { nama: 'Siti Aminah, S.Kom., M.Cs.', nip: '19820315-02', kuotaMax: 2 },
    { nama: 'Bambang Sudarsono, Ph.D.', nip: '19681120-03', kuotaMax: 5 },
    { nama: 'Ani Maryani, M.T.', nip: '19850625-04', kuotaMax: 4 },
  ];

  for (const lec of lecturers) {
    await prisma.dosen.create({
      data: lec,
    });
  }

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
