const { getCryptoPrices } = require('../services/cryptoService');

exports.getCryptoPrices = async (req, res) => {
  try {
    const symbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'LTCUSDT', 'ADAUSDT',
      'XRPUSDT', 'EOSUSDT', 'TUSDUSDT', 'IOTAUSDT', 'XLMUSDT',
      'TRXUSDT', 'ETCUSDT', 'USDCUSDT', 'LINKUSDT', 'ZRXUSDT',
      'BATUSDT', 'ZECUSDT', 'DASHUSDT', 'THETAUSDT', 'ENJUSDT',
      'ATOMUSDT', 'DOGEUSDT', 'ALGOUSDT', 'MTLUSDT', 'CHZUSDT',
    ]

    const prices = await getCryptoPrices(symbols);
    res.json(prices);
  } catch (error) {
    console.error('❌ Ошибка в контроллере:', error.message);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
};