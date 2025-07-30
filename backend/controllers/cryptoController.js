const axios = require("axios");
const {
  convertToBinanceSymbol
} = require("../utils/coinUtils");

const cryptoCache = require("../services/cryptoWorker");
const CACHE_KEY = "coinData";

async function getCryptoPrices(req, res) {
  try {
    // Пытаемся получить данные из кэша cryptoWorker
    const cachedData = cryptoCache.get(CACHE_KEY);
    
    if (cachedData && cachedData.length > 0) {
      console.log("✅ Данные получены из кэша cryptoWorker");
      return res.json(cachedData);
    }

    // Если кэш пуст, делаем прямой запрос к API
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          price_change_percentage: "24h",
          sparkline: true,
          order: "market_cap_desc",
          per_page: 250,
          page: 1
        }
      }
    );

    const formatted = data.map((coin) => {
      const entry = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        current_price: coin.current_price,
        priceChangePercent: coin.price_change_percentage_24h?.toFixed(2),
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_24h: coin.price_change_24h,
        market_cap: coin.market_cap,
        market_cap_change_24h: coin.market_cap_change_24h,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        total_supply: coin.total_supply,
        circulating_supply: coin.circulating_supply,
        max_supply: coin.max_supply,
        market_cap_rank: coin.market_cap_rank,
        fully_diluted_valuation: coin.fully_diluted_valuation,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        ath_date: coin.ath_date,
        atl: coin.atl,
        atl_change_percentage: coin.atl_change_percentage,
        atl_date: coin.atl_date,
        roi: coin.roi,
        last_updated: coin.last_updated,
        sparkline_in_7d: coin.sparkline_in_7d?.price || []
      };

      cryptoCache.set(coin.id, entry);
      return entry;
    });

    cryptoCache.set(CACHE_KEY, formatted);
    return res.json(formatted);
  } catch (err) {
    console.warn("⚠️ Ошибка CoinGecko. Пробуем Binance + кэш...");

    try {
      const { data: binanceData } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");

      // Получаем все монеты из кэша для fallback
      const cachedData = cryptoCache.get(CACHE_KEY) || [];
      const fallback = cachedData.map((cached) => {
        const binanceSymbol = convertToBinanceSymbol(cached.id);
        const binanceCoin = binanceData.find(c => c.symbol === binanceSymbol);

        if (!binanceCoin) return null;

        return {
          id: cached.id,
          name: cached.name,
          symbol: cached.symbol,
          image: cached.image,
          current_price: parseFloat(binanceCoin.lastPrice),
          priceChangePercent: parseFloat(binanceCoin.priceChangePercent).toFixed(2),
          price_change_percentage_24h: parseFloat(binanceCoin.priceChangePercent),
          price_change_24h: parseFloat(binanceCoin.priceChange),
          total_volume: parseFloat(binanceCoin.volume),
          high_24h: parseFloat(binanceCoin.highPrice),
          low_24h: parseFloat(binanceCoin.lowPrice),
          market_cap: cached.market_cap,
          market_cap_change_24h: cached.market_cap_change_24h,
          market_cap_change_percentage_24h: cached.market_cap_change_percentage_24h,
          total_supply: cached.total_supply,
          circulating_supply: cached.circulating_supply,
          max_supply: cached.max_supply,
          market_cap_rank: cached.market_cap_rank,
          fully_diluted_valuation: cached.fully_diluted_valuation,
          ath: cached.ath,
          ath_change_percentage: cached.ath_change_percentage,
          ath_date: cached.ath_date,
          atl: cached.atl,
          atl_change_percentage: cached.atl_change_percentage,
          atl_date: cached.atl_date,
          roi: cached.roi,
          last_updated: cached.last_updated,
          sparkline_in_7d: cached.sparkline_in_7d || []
        };
      }).filter(Boolean);

      if (fallback.length === 0) throw new Error("Нет данных ни в кэше, ни от Binance");

      return res.json(fallback);
    } catch (fallbackErr) {
      console.error("❌ Ошибка Binance fallback:", fallbackErr.message);

      const cachedFallback = cryptoCache.get(CACHE_KEY);
      if (cachedFallback) return res.json(cachedFallback);

      return res.status(500).json({ error: "Все источники данных недоступны" });
    }
  }
}

module.exports = { getCryptoPrices };
