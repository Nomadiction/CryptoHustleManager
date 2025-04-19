const fs = require("fs");
const os = require("os");

const interfaces = os.networkInterfaces();
let localIp = "localhost";

const preferredNames = [
  "Беспроводная сеть", "Wi-Fi", "Wireless Network Connection", "WLAN", "en0"
];

for (const name of Object.keys(interfaces)) {
  const lowered = name.toLowerCase();

  if (preferredNames.some(pref => lowered.includes(pref.toLowerCase()))) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp !== "localhost") break;
  }
}

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

const envContent = `API_URL=${apiUrl}\nPORT=${PORT}`;
fs.writeFileSync(".env", envContent);
console.log("✅ .env обновлён. Использован IP:", localIp);
console.log(envContent);
