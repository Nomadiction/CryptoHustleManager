// backend/controllers/cryptoController.js
const axios = require("axios");
const NodeCache = require("node-cache");

const cryptoCache = new NodeCache({ stdTTL: 60 });

const supportedCoins = [
  "bitcoin", "ethereum", "binancecoin", "litecoin", "cardano", "ripple", "eos",
  "tether", "iota", "stellar", "tron", "ethereum-classic", "usd-coin", "chainlink",
  "0x", "basic-attention-token", "zcash", "dash", "theta-token", "enjincoin",
  "cosmos", "dogecoin", "algorand", "metal", "chiliz"
];

async function getCryptoPrices(req, res) {
  const cached = cryptoCache.get("cryptoPrices");
  if (cached) {
    return res.json(cached);
  }

  try {
    const marketData = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets`,
      {
        params: {
          vs_currency: "usd",
          ids: supportedCoins.join(","),
          include_24hr_change: true
        },
      }
    );

    const formatted = marketData.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      current_price: coin.current_price,
      priceChangePercent: coin.price_change_percentage_24h?.toFixed(2),
    }));

    cryptoCache.set("cryptoPrices", formatted);
    res.json(formatted);
  } catch (err) {
    console.error("❌ CoinGecko error:", err.message);
    res.status(500).json({ error: "Failed to fetch data from CoinGecko" });
  }
}

module.exports = { getCryptoPrices };
