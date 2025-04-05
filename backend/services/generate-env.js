const fs = require("fs");
const os = require("os");

const interfaces = os.networkInterfaces();
let localIp = "localhost";

// Поддержка интерфейсов на русском и английском
const preferredNames = [
  "Беспроводная сеть",        // Windows рус.
  "Wi-Fi",                    // macOS / Windows англ.
  "Wireless Network Connection", // старые Windows
  "WLAN",                     // Linux
  "en0",                      // macOS
];

// Пробуем приоритетные интерфейсы
for (const name of Object.keys(interfaces)) {
  const lowered = name.toLowerCase();

  if (
    preferredNames.some(pref => lowered.includes(pref.toLowerCase()))
  ) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp !== "localhost") break;
  }
}

// Fallback: берём первый внешний IPv4
if (localIp === "localhost") {
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp !== "localhost") break;
  }
}

const PORT = process.env.PORT || 5000;
const apiUrl = `http://${localIp}:${PORT}/api/crypto/prices`;
const binanceUrl = 'https://api.binance.com/api/v3/ticker/24hr';

const envContent = `API_URL=${apiUrl}\nPORT=${PORT}\nBINANCE_API_URL=${binanceUrl}`;

fs.writeFileSync(".env", envContent);
console.log("✅ .env обновлён. Использован IP:", localIp);
console.log(envContent);
