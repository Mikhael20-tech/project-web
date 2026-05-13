import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

// Baca data hasil seed (300 mahasiswa beserta token JWT, 16 dosen)
const testData = JSON.parse(open('./k6-data.json'));
const STUDENTS = testData.students;
const DOSEN_IDS = testData.dosenIds;

export const options = {
  vus: 300,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<10000'],
    'checks': ['rate>0.9'],
  },
};

export default function () {
  // 1. Pilih mahasiswa berdasarkan Virtual User ID (1-300)
  const student = STUDENTS[(__VU - 1) % STUDENTS.length];
  
  // 2. Token JWT sudah di-generate sebelumnya untuk menghindari bottleneck CPU pada proses Login
  const token = student.token;

  if (!token) {
    console.error(`Token tidak ditemukan untuk: ${student.username}`);
    sleep(1);
    return;
  }

  // 3. Pilih Dosen secara acak (1 dari 16 dosen)
  const randomDosenId = DOSEN_IDS[Math.floor(Math.random() * DOSEN_IDS.length)];

  // 4. Simulasi War (Klik "Pilih")
  const res = http.post(
    `${BASE_URL}/api/war/select`,
    JSON.stringify({ dosenId: randomDosenId }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  check(res, {
    'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
    'not unauthorized (401)': (r) => r.status !== 401,
    'not server error (5xx)': (r) => r.status < 500,
  });

  // Jeda agar tidak spam terlalu ekstrem (realistis)
  sleep(1);
}