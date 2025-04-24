// backend/pipe/cryptoWorker.js

const axios = require("axios");
const NodeCache = require("node-cache");
const { supportedCoins, generateSymbolMapFromCache } = require("../utils/coinUtils");

// Создаём общий кэш с TTL = 120 секунд (2 минуты)
// Этот кэш будет использоваться и в контроллере через module.exports
const cryptoCache = new NodeCache({ stdTTL: 120 });

// Ключ для хранения всего массива монет
const CACHE_KEY = "coinData";

// Основная функция обновления кэша криптовалют
async function updateCryptoCache() {
  try {
    // Получаем данные с CoinGecko по всем поддерживаемым монетам
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        ids: supportedCoins.join(","), // Список ID монет
        include_24hr_change: true     // Включаем % изменения за 24ч
      }
    });

    // Преобразуем и кэшируем каждую монету отдельно
    const formatted = response.data.map((coin) => {
      const entry = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        priceChangePercent: coin.price_change_percentage_24h?.toFixed(2),
      };
      cryptoCache.set(coin.id, entry); // Кэш по ID монеты
      return entry;
    });

    // Сохраняем весь массив монет под единым ключом
    cryptoCache.set(CACHE_KEY, formatted);

    // Генерируем карту символов для быстрого доступа (например: BTC -> bitcoin)
    generateSymbolMapFromCache(formatted);

    console.log("✅ Кэш крипты успешно обновлён");
  } catch (err) {
    console.error("❌ Ошибка при обновлении кэша крипты:", err.message);
  }
}

// ⏱ Запускаем обновление кэша каждую минуту
setInterval(updateCryptoCache, 60 * 1000);

// 🚀 Первый запуск при инициализации
updateCryptoCache();

// Экспортируем общий кэш для доступа из других модулей
module.exports = cryptoCache;


