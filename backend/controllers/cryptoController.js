// backend/controllers/cryptoController.js

const axios = require("axios");
const NodeCache = require("node-cache");
const {
  supportedCoins,
  convertToBinanceSymbol,
  generateSymbolMapFromCache
} = require("../utils/coinUtils");

// Создаем кэш с TTL 60 секунд
const cryptoCache = new NodeCache({ stdTTL: 60 });

// Ключ для хранения общего массива в кэше
const CACHE_KEY = "coinData";

// Основной контроллер получения цен крипты
async function getCryptoPrices(req, res) {
  try {
    // Запрашиваем актуальные данные с CoinGecko
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: supportedCoins.join(","),
          include_24hr_change: true
        }
      }
    );

    // Форматируем и кешируем данные по каждой монете
    const formatted = data.map((coin) => {
      const entry = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        priceChangePercent: coin.price_change_percentage_24h?.toFixed(2),
      };

      // Кэшируем индивидуально по ID
      cryptoCache.set(coin.id, entry);
      return entry;
    });

    // Сохраняем массив целиком и обновляем символы
    cryptoCache.set(CACHE_KEY, formatted);
    generateSymbolMapFromCache(formatted);

    return res.json(formatted);
  } catch (err) {
    console.warn("⚠️ Ошибка CoinGecko. Пробуем Binance + кэш...");

    try {
      // Получаем все данные по 24ч с Binance
      const { data: binanceData } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");

      // Собираем fallback-данные из кэша и Binance
      const fallback = supportedCoins.map((coinId) => {
        const cached = cryptoCache.get(coinId);
        const binanceSymbol = convertToBinanceSymbol(coinId);
        const binanceCoin = binanceData.find(c => c.symbol === binanceSymbol);

        if (!cached || !binanceCoin) return null;

        return {
          id: cached.id,
          name: cached.name,
          symbol: cached.symbol,
          image: cached.image,
          current_price: parseFloat(binanceCoin.lastPrice),
          priceChangePercent: parseFloat(binanceCoin.priceChangePercent).toFixed(2),
        };
      }).filter(Boolean); // убираем null

      // Проверяем, есть ли хоть что-то в fallback
      if (fallback.length === 0) throw new Error("Нет данных ни в кэше, ни от Binance");

      return res.json(fallback);
    } catch (fallbackErr) {
      console.error("❌ Ошибка Binance fallback:", fallbackErr.message);
      return res.status(500).json({ error: "Все источники данных недоступны" });
    }
  }
}

module.exports = { getCryptoPrices };
