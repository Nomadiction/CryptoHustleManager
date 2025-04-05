const express = require("express");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

// Получение локального IP
const interfaces = os.networkInterfaces();
let localIp = "localhost";
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === "IPv4" && !iface.internal) {
      localIp = iface.address;
    }
  }
}

// Подключение маршрутов
const cryptoRoutes = require("./routes/cryptoRoutes");
app.use("/api/crypto", cryptoRoutes);

// Конфигурационный endpoint
app.get("/api/config", (req, res) => {
  res.json({
    apiUrl: `http://${localIp}:${PORT}/api/crypto/prices`,
  });
});

// Старт сервера
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Сервер работает на http://${localIp}:${PORT}/api/crypto/prices`);
});
