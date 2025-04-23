// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();  
const cryptoRoutes = require("./routes/cryptoRoutes");

const app = express();
app.use(cors());

const PORT = process.env.PORT;
const apiUrl = process.env.API_URL;  

// Роуты
app.use("/api/crypto", cryptoRoutes);

// Endpoint для клиента с адресом API
app.get("/api/config", (req, res) => {
  res.json({
    apiUrl,  
  });
});

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Сервер работает с доменом: ${apiUrl}`);
});
