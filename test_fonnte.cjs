require('dotenv').config();

async function testFonnte() {
  const token = (process.env.FONNTE_TOKEN || "").trim();
  console.log(`Testing token: "${token}"`);
  
  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: token },
    body: new URLSearchParams({
      target: "08123456789", // dummy number
      message: "Test connection",
    })
  });

  const data = await response.json();
  console.log("Fonnte Response:", data);
}

testFonnte();
