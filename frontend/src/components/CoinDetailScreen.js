import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CoinDetailScreen = () => {
  const { coinId } = useRoute().params;
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
        );
        const data = await response.json();
        if (!data) throw new Error('Монета не найдена');
        setCoinData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [coinId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
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
        <Text style={styles.errorText}>{error || 'Ошибка загрузки данных'}</Text>
      </View>
    );
  }

  const price = Number(coinData.market_data.current_price.usd).toFixed(2);
  const change24h = coinData.market_data.price_change_percentage_24h;
  const sparkline = coinData.market_data.sparkline_7d?.price || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Image source={{ uri: coinData.image.large }} style={styles.coinImage} />
          <View>
            <Text style={styles.coinName}>{coinData.name}</Text>
            <Text style={styles.coinSymbol}>{coinData.symbol.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Текущая цена</Text>
          <Text style={styles.value}>${price}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Изменение за 24ч</Text>
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

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Капитализация</Text>
          <Text style={styles.value}>
            ${Number(coinData.market_data.market_cap.usd).toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Объём за сутки</Text>
          <Text style={styles.value}>
            ${Number(coinData.market_data.total_volume.usd).toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      {sparkline.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Динамика за 7 дней</Text>
          <LineChart
            data={{
              labels: [],
              datasets: [{ data: sparkline }],
            }}
            width={SCREEN_WIDTH - 40}
            height={220}
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundGradientFrom: '#f9fafb',
              backgroundGradientTo: '#f9fafb',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              labelColor: () => '#6b7280',
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
  },
  coinName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  coinSymbol: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  infoBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeBox: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveBg: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  negativeBg: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  positiveText: {
    color: '#22c55e',
  },
  negativeText: {
    color: '#ef4444',
  },
  chartSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  chartTitle: {
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 8,
    fontWeight: '500',
  },
  chart: {
    borderRadius: 16,
  },
});

export default CoinDetailScreen;
