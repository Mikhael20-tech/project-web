import "dotenv/config";

async function test() {
  const fonnteToken = (process.env.FONNTE_TOKEN || "").trim();
  console.log("Using Fonnte Token:", fonnteToken ? `${fonnteToken.slice(0, 4)}...${fonnteToken.slice(-4)}` : "None");
  
  try {
    const response = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: { Authorization: fonnteToken }
    });
    
    console.log("Fonnte Response Status:", response.status);
    const text = await response.text();
    console.log("Fonnte Response Body:", text);
    
    try {
      const data = JSON.parse(text);
      console.log("Parsed JSON:", data);
    } catch {
      console.log("Response is not JSON.");
    }
  } catch (err: any) {
    console.error("Fetch failed:", err);
  }
}

test();
