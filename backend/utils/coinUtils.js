// utils/coinUtils.js

const supportedCoins = [
    "bitcoin", "ethereum", "binancecoin", "litecoin", "cardano", "ripple", "eos",
    "tether", "iota", "stellar", "tron", "ethereum-classic", "usd-coin", "chainlink",
    "0x", "basic-attention-token", "zcash", "dash", "theta-token", "enjincoin",
    "cosmos", "dogecoin", "algorand", "metal", "chiliz"
  ];
  
  let dynamicMap = {}; // генерируется из кэша
  
  function generateSymbolMapFromCache(cacheData) {
    dynamicMap = {}; // очищаем
  
    if (!Array.isArray(cacheData)) return;
  
    cacheData.forEach(coin => {
      if (coin?.id && coin?.symbol) {
        dynamicMap[coin.id] = `${coin.symbol.toUpperCase()}USDT`;
      }
    });
  }  
  
  function convertToBinanceSymbol(coinId) {
    return dynamicMap[coinId] || null;
  }
  
  module.exports = {
    supportedCoins,
    convertToBinanceSymbol,
    generateSymbolMapFromCache,
    __internalSymbolMap: () => dynamicMap  // read-only доступ
  };
  