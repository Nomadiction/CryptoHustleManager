// utils/coinUtils.js

const supportedCoins = [
    "bitcoin", "ethereum", "binancecoin", "litecoin", "cardano", "ripple", "eos",
    "tether", "iota", "stellar", "tron", "ethereum-classic", "usd-coin", "chainlink",
    "0x", "basic-attention-token", "zcash", "dash", "theta-token", "enjincoin",
    "cosmos", "dogecoin", "algorand", "metal", "chiliz", "polkadot", "avalanche-2",
    "polygon", "solana", "uniswap", "aave", "compound-governance-token", "sushi",
    "yearn-finance", "curve-dao-token", "balancer", "synthetix-network-token",
    "1inch", "pancakeswap-token", "venus", "bakeryswap", "safemoon", "shiba-inu",
    "floki-inu", "baby-doge-coin", "doge", "monero", "bitcoin-cash", "tezos",
    "vechain", "neo", "icon", "qtum", "nem", "waves", "decred", "steem",
    "nano", "bytecoin-bcn", "verge", "siacoin", "digibyte", "vertcoin",
    "pivx", "reddcoin", "potcoin", "feathercoin", "novacoin", "franko",
    "phoenixcoin", "crown", "rubycoin", "unobtanium", "primecoin", "neoscoin",
    "megacoin", "quark", "tigercoin", "diamond", "hitcoin", "bitcoin-21",
    "vcash", "xde-ii", "credo", "equitrader", "slimcoin", "ohmacoin",
    "cryptojacks", "indocoin", "ersdl", "btc-talk-coin", "bitok", "bitcoinfast",
    "bitcoin-pos", "bitcoin-planet", "bitcoin-cash-abc-2", "bitcoin-atom",
    "bitcoin-god", "bitcoin-private", "bitcoin-rhodium", "bitcoin-silver",
    "bitcoin-zero", "bitcoin-2", "bitcoin-adult", "bitcoin-anonymous",
    "bitcoin-bep2", "bitcoin-br", "bitcoin-cash-sv", "bitcoin-classic",
    "bitcoin-diamond", "bitcoin-gold", "bitcoin-incognito", "bitcoin-lite",
    "bitcoin-money", "bitcoin-one", "bitcoin-pay", "bitcoin-pro",
    "bitcoin-red", "bitcoin-scrypt", "bitcoin-silver", "bitcoin-token",
    "bitcoin-trust", "bitcoin-ultra", "bitcoin-vault", "bitcoin-x",
    "bitcoin-zero", "bitcoin-2", "bitcoin-adult", "bitcoin-anonymous",
    "bitcoin-bep2", "bitcoin-br", "bitcoin-cash-sv", "bitcoin-classic",
    "bitcoin-diamond", "bitcoin-gold", "bitcoin-incognito", "bitcoin-lite",
    "bitcoin-money", "bitcoin-one", "bitcoin-pay", "bitcoin-pro",
    "bitcoin-red", "bitcoin-scrypt", "bitcoin-silver", "bitcoin-token",
    "bitcoin-trust", "bitcoin-ultra", "bitcoin-vault", "bitcoin-x"
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