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
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: supportedCoins.join(","),
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      }
    );

    const formatted = Object.entries(response.data).reduce((acc, [key, value]) => {
      acc[key] = {
        price: value.usd,
        priceChangePercent: value.usd_24h_change.toFixed(2),
      };
      return acc;
    }, {});

    cryptoCache.set("cryptoPrices", formatted);
    res.json(formatted);
  } catch (err) {
    console.error("❌ CoinGecko error:", err.message);
    res.status(500).json({ error: "Failed to fetch data from CoinGecko" });
  }
}

module.exports = { getCryptoPrices };
