// backend/services/getLocalIP.js

const fs = require("fs");
const os = require("os");
const path = require("path");

const interfaces = os.networkInterfaces();
let localIp = "localhost";

// Предпочтительные имена интерфейсов (для Wi-Fi и Ethernet)
const preferredNames = [
  "Беспроводная сеть", "Wi-Fi", "Wireless Network Connection", "WLAN", "en0"
];

// Ищем предпочтительные интерфейсы и берем их IP
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

// Если IP ещё не найден, пытаемся найти его на других интерфейсах
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

// Путь к файлу .env
const envPath = path.resolve(".env");

// Проверяем, существует ли .env файл
if (!fs.existsSync(envPath)) {
  // Если файла нет, создаём его с текущими настройками
  const envContent = `API_URL=${apiUrl}\nPORT=${PORT}`;
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env создан. Использован IP:", localIp);
} else {
  // Если файл существует, обновляем только нужные строки
  try {
    const envContent = fs.readFileSync(envPath, "utf-8");

    // Печатаем текущий контент для отладки
    console.log("Текущий контент .env:\n", envContent);

    const updatedContent = envContent.replace(/API_URL=[^\n]*/, `API_URL=${apiUrl}`);

    // Печатаем новый контент после замены
    console.log("Обновлённый контент .env:\n", updatedContent);

    fs.writeFileSync(envPath, updatedContent);
    console.log("✅ .env обновлён. Использован IP:", localIp);
  } catch (error) {
    console.error("Ошибка при обновлении .env:", error);
  }
}

module.exports = { localIp, apiUrl };
