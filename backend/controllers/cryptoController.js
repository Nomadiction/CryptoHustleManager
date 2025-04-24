// backend/controllers/cryptoController.js

const axios = require("axios");
// Убираем создание нового кэша — теперь импортируем готовый общий кэш
const {
  supportedCoins,
  convertToBinanceSymbol
} = require("../utils/coinUtils");

// Импорт общего кэша из воркера
const cryptoCache = require("../services/cryptoWorker");

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

    // Сохраняем массив целиком
    cryptoCache.set(CACHE_KEY, formatted);

    // ⚠️ Символы теперь формируются в воркере, не здесь!
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
      }).filter(Boolean); // Убираем null

      // Проверяем, есть ли хоть что-то в fallback
      if (fallback.length === 0) throw new Error("Нет данных ни в кэше, ни от Binance");

      return res.json(fallback);
    } catch (fallbackErr) {
      console.error("❌ Ошибка Binance fallback:", fallbackErr.message);

      // Последняя попытка — достать полностью сохранённый массив из кэша
      const cachedFallback = cryptoCache.get(CACHE_KEY);
      if (cachedFallback) return res.json(cachedFallback);

      return res.status(500).json({ error: "Все источники данных недоступны" });
    }
  }
}

module.exports = { getCryptoPrices };

