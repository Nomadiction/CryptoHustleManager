// backend/pipe/wsHandler.js

const WebSocket = require("ws");
const cryptoCache = require("./cryptoWorker");

let clients = [];

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("🔌 Новый WebSocket клиент");

    clients.push(ws);

    // Отправка кэша при подключении
    const cache = cryptoCache.get("coinData");
    if (cache) {
      ws.send(JSON.stringify({ type: "initial", data: cache }));
    }

    ws.on("close", () => {
      clients = clients.filter((c) => c !== ws);
      console.log("❌ Клиент отключился");
    });
  });

  // Периодический пуш обновлений
  setInterval(() => {
    if (clients.length === 0) return;
    const cache = cryptoCache.get("coinData");
    if (!cache) return;

    const message = JSON.stringify({ type: "update", data: cache });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }, 5000);
}

module.exports = { setupWebSocket };
