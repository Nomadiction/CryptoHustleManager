const axios = require('axios');
const NodeCache = require('node-cache');
const cryptoCache = new NodeCache({ stdTTL: 60 }); // Кэш на 60 секунд

const symbolMapping = {
  btc: 'btc', eth: 'eth', bnb: 'bnb', ltc: 'ltc', ada: 'ada',
  xrp: 'xrp', eos: 'eos', tusd: 'tusd', iota: 'iota', xlm: 'xlm',
  trx: 'trx', etc: 'etc', usdc: 'usdc', link: 'link', zrx: 'zrx',
  bat: 'bat', zec: 'zec', dash: 'dash', theta: 'theta', enj: 'enj',
  atom: 'atom', doge: 'doge', algo: 'algo', mtl: 'mtl', chz: 'chz',
};

// Функция для разбиения на чанки
function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// Функция для получения цен с поддержкой чанков
async function getCryptoPrices(symbols, chunkSize = 50) {
  const cachedData = cryptoCache.get('cryptoPrices');
  if (cachedData) {
    return cachedData;
  }

  const apiUrl = process.env.BINANCE_API_URL || 'https://api.binance.com/api/v3/ticker/24hr';
  const symbolChunks = chunkArray(symbols, chunkSize);
  let allPrices = {};

  for (const chunk of symbolChunks) {
    try {
      const requests = chunk.map(symbol => axios.get(`${apiUrl}?symbol=${symbol}`));
      const responses = await Promise.all(requests);

      const chunkPrices = responses.reduce((acc, response, index) => {
        const data = response.data;
        const symbolKey = chunk[index].toLowerCase().replace('usdt', '');
        acc[symbolKey] = {
          price: parseFloat(data.lastPrice),               // Текущая цена
          priceChange: parseFloat(data.priceChange),       // Изменение цены за 24ч
          priceChangePercent: parseFloat(data.priceChangePercent), // Изменение в процентах за 24ч
        };
        return acc;
      }, {});

      allPrices = { ...allPrices, ...chunkPrices };
    } catch (error) {
      console.error('Error fetching chunk:', error);
    }
  }

  // Кэшируем полный результат
  cryptoCache.set('cryptoPrices', allPrices);

  // Возвращаем данные в совместимом формате с маппингом ключей
  return Object.entries(allPrices).reduce((acc, [key, value]) => {
    const mappedKey = symbolMapping[key];
    if (mappedKey) {
      acc[mappedKey] = value;
    }
    return acc;
  }, {});
}

module.exports = { getCryptoPrices };