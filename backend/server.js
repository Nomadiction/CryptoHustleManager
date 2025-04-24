// backend/server.js

// Определение локального IP и порта
require("./utils/getLocalIp");

// Загрузка переменных из окружение среды
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const cryptoRoutes = require("./routes/cryptoRoutes");
const { setupWebSocket } = require("./services/wsHandler");

const app = express();
app.use(cors());

const PORT = process.env.PORT;
const apiUrl = process.env.API_URL;

// Роуты
app.use("/api/crypto", cryptoRoutes);
app.get("/api/config", (req, res) => res.json({ apiUrl }));

const server = http.createServer(app);

// Подключаем WebSocket-обработчик
setupWebSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Сервер запущен: ${apiUrl}`);
});
