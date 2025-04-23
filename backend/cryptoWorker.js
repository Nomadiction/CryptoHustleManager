// backend/workers/cryptoWorker.js

const axios = require("axios");
const NodeCache = require("node-cache");
const { supportedCoins } = require("../utils/coinUtils");

const cryptoCache = new NodeCache({ stdTTL: 120 }); // 2 мин TTL
const CACHE_KEY = "coinData";

async function updateCryptoCache() {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        ids: supportedCoins.join(","),
        include_24hr_change: true
      }
    });

    const formatted = response.data.map((coin) => {
      const entry = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        priceChangePercent: coin.price_change_percentage_24h?.toFixed(2),
      };
      cryptoCache.set(coin.id, entry); // Индивидуально для fallback
      return entry;
    });

    cryptoCache.set(CACHE_KEY, formatted); // Основной список
    console.log("✅ Кэш успешно обновлён в фоне");
  } catch (err) {
    console.error("❌ Ошибка при обновлении кэша в фоне:", err.message);
  }
}

// Обновление раз в минуту
setInterval(updateCryptoCache, 60 * 1000);

// Немедленный запуск при старте
updateCryptoCache();

// Отдаём один и тот же экземпляр во все контроллеры
module.exports = cryptoCache;
