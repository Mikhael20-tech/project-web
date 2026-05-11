const http = require('http');

const urls = [
  "/api/dosen",
  "/api/war-config",
  "/api/admin/reports",
  "/api/admin/mahasiswa",
  "/api/me"
];

const checkUrl = (path) => {
  http.get({ host: '127.0.0.1', port: 3000, path: path }, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(`[${res.statusCode}] ${path} -> ${rawData.substring(0, 30).replace(/\n/g, ' ')}...`);
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
};

urls.forEach(checkUrl);
