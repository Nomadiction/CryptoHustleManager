const axios = require("axios");
const NodeCache = require("node-cache");
const { generateSymbolMapFromCache } = require("../utils/coinUtils");

const cryptoCache = new NodeCache({ stdTTL: 120 });
const CACHE_KEY = "coinData";

async function updateCryptoCache() {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        price_change_percentage: "24h",
        sparkline: true,
        order: "market_cap_desc",
        per_page: 50,
        page: 1
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
    generateSymbolMapFromCache(formatted);

    console.log("✅ Кэш крипты успешно обновлён");
  } catch (err) {
    console.error("❌ Ошибка при обновлении кэша крипты:", err.message);
  }
}

setInterval(updateCryptoCache, 60 * 1000);
updateCryptoCache();

module.exports = cryptoCache;
