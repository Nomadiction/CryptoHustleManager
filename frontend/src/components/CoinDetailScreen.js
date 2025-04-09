import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const formatNumber = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

const CoinDetailScreen = () => {
  const { coinId } = useRoute().params;
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Избранное
  const [isFavorite, setIsFavorite] = useState(false);
  // Анимация появления
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Загрузка данных
  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
        );
        const data = await response.json();
        if (!data) throw new Error('Coin not found');
        setCoinData(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoinData();
  }, [coinId]);

  // Запуск анимации на монтаж
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (error || !coinData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Error loading data'}</Text>
      </View>
    );
  }

  const { market_data, image, name, symbol, market_cap_rank } = coinData;
  const price = Number(market_data.current_price.usd).toFixed(2);
  const change24h = market_data.price_change_percentage_24h;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Карточка о монете */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        {/* Кнопка добавления в избранное */}
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <MaterialIcons
            name={isFavorite ? 'star' : 'star-border'}
            size={32}
            color="#facc15"
          />
        </TouchableOpacity>

        {/* Заголовок монеты */}
        <View style={styles.header}>
          <Image source={{ uri: image.large }} style={styles.coinImage} />
          <View style={styles.headerText}>
            <Text style={styles.coinName}>{name}</Text>
            <Text style={styles.coinSymbol}>{symbol.toUpperCase()}</Text>
          </View>
        </View>

        {/* Текущая цена */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Current Price</Text>
          <Text style={styles.value}>${price}</Text>
        </View>

        {/* 24h Изменение */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>24h Change</Text>
          <View style={styles.row}>
            <MaterialIcons
              name={change24h >= 0 ? 'trending-up' : 'trending-down'}
              size={20}
              color={change24h >= 0 ? '#22c55e' : '#ef4444'}
            />
            <View
              style={[
                styles.changeBox,
                change24h >= 0 ? styles.positiveBg : styles.negativeBg,
              ]}
            >
              <Text
                style={[
                  styles.changeText,
                  change24h >= 0 ? styles.positiveText : styles.negativeText,
                ]}
              >
                {change24h >= 0 ? '+' : ''}
                {change24h.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Разделительная линия */}
        <View style={styles.divider} />

        {/* Market Cap */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Market Cap</Text>
          <Text style={styles.value}>${formatNumber(market_data.market_cap.usd)}</Text>
        </View>

        {/* 24h Volume */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>24h Volume</Text>
          <Text style={styles.value}>${formatNumber(market_data.total_volume.usd)}</Text>
        </View>

        {/* Low / High */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>24h Low/High</Text>
          <Text style={styles.value}>
            ${market_data.low_24h.usd.toFixed(2)} / ${market_data.high_24h.usd.toFixed(2)}
          </Text>
        </View>

        {/* Разделительная линия */}
        <View style={styles.divider} />

        {/* Total Supply */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Total Supply</Text>
          <Text style={styles.value}>
            {market_data.total_supply
              ? formatNumber(market_data.total_supply)
              : 'N/A'}
          </Text>
        </View>

        {/* CoinGecko Rank */}
        <View style={styles.infoBlock}>
          <Text style={styles.label}>CoinGecko Rank</Text>
          <Text style={styles.value}>#{market_cap_rank}</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Контейнер страницы
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  // Карточка
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,

    // Тень / Elevation
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  // Шапка с иконкой монеты
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  coinImage: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerText: {
    flexDirection: 'column',
  },
  coinName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  coinSymbol: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  // Блок с лейблом и значением
  infoBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  // Ряд
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 24h Изменение
  changeBox: {
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginLeft: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveBg: {
    backgroundColor: '#d1fae5',
  },
  negativeBg: {
    backgroundColor: '#fee2e2',
  },
  positiveText: {
    color: '#065f46',
  },
  negativeText: {
    color: '#991b1b',
  },
  // Разделитель
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  // Иконка избранного
  favoriteIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
});

export default CoinDetailScreen;
