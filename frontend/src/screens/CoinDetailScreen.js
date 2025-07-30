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
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { useCryptoData } from '../hooks/useCryptoData';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Ключ для хранения избранных монет в AsyncStorage
const FAVORITES_KEY = "FAVORITE_COINS";

const formatNumber = (num) => {
  if (!num && num !== 0) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

const MetricCard = ({ label, value, icon, color = '#8b5cf6' }) => (
  <View style={styles.metricCard}>
    <View style={styles.metricHeader}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const CoinDetailScreen = () => {
  const { coinId } = useRoute().params;
  const navigation = useNavigation();
  const { cryptoData, loading, error } = useCryptoData();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const coin = cryptoData.find((item) => item.id === coinId);

  // Загрузка состояния избранного
  useEffect(() => {
    const loadFavoriteState = async () => {
      try {
        const saved = await AsyncStorage.getItem(FAVORITES_KEY);
        if (saved) {
          const favorites = JSON.parse(saved);
          setIsFavorite(favorites.includes(coinId));
        }
      } catch (error) {
        console.log('Error loading favorites:', error);
      }
    };
    
    if (coinId) {
      loadFavoriteState();
    }
  }, [coinId]);

  useEffect(() => {
    if (coin) {
      Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
          duration: 800,
        useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
        useNativeDriver: true,
      }),
        Animated.timing(headerOpacity, {
        toValue: 1,
          duration: 600,
          delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
    }
  }, [coin]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={styles.loadingGradient}
        >
                      <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading coin details...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (error || !coin) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={styles.errorGradient}
        >
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Coin not found'}</Text>
        </LinearGradient>
      </View>
    );
  }

  const {
    image,
    name,
    symbol,
    current_price,
    priceChangePercent,
    market_cap,
    total_volume,
    high_24h,
    low_24h,
    total_supply,
    market_cap_rank,
    sparkline_in_7d,
  } = coin;

  const price = current_price ? Number(current_price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A';
  const change = priceChangePercent ? parseFloat(priceChangePercent).toFixed(2) : '0.00';
  const isPositive = parseFloat(change) >= 0;
  const sparkline = Array.isArray(sparkline_in_7d) ? sparkline_in_7d : [1, 2, 3];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Coin Details</Text>
        </View>
        
        <View style={styles.favoriteButton}>
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={24}
            color={isFavorite ? "#FACC15" : "#64748b"}
          />
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        <Animated.View style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Coin Header */}
          <View style={styles.coinHeader}>
            <View style={styles.coinInfo}>
              <View style={styles.coinIconContainer}>
                <Image source={{ uri: image }} style={styles.coinIcon} />
              </View>
              <View style={styles.coinTextInfo}>
              <Text style={styles.coinName}>{name}</Text>
              <Text style={styles.coinSymbol}>{symbol.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{market_cap_rank}</Text>
            </View>
        </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.priceValue}>${price}</Text>
            <View style={[
              styles.priceChangeContainer,
              { backgroundColor: isPositive ? '#22c55e' : '#ef4444' }
            ]}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={16}
                color="#ffffff"
              />
              <Text style={styles.priceChangeText}>
                {isPositive ? '+' : ''}{change}%
              </Text>
            </View>
          </View>

          {/* Chart Section */}
          <View style={styles.chartSection}>
            <View style={styles.chartContainer}>
            <LineChart
              style={styles.chart}
              data={sparkline}
              svg={{
                stroke: isPositive ? '#22c55e' : '#ef4444',
                strokeWidth: 3,
              }}
              contentInset={{ top: 20, bottom: 20 }}
              curve={shape.curveBasis}
            />
            <LineChart
              style={[styles.chart, styles.chartFill]}
              data={sparkline}
              svg={{
                fill: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                stroke: 'none',
              }}
              contentInset={{ top: 20, bottom: 20 }}
              curve={shape.curveBasis}
            />
          </View>
        </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Market Cap"
              value={`$${formatNumber(market_cap)}`}
              icon="business"
              color="#8b5cf6"
            />
            <MetricCard
              label="24h Volume"
              value={`$${formatNumber(total_volume)}`}
              icon="trending-up"
              color="#3b82f6"
            />
            <MetricCard
              label="Price Change 24h"
              value={`${coin.price_change_percentage_24h ? parseFloat(coin.price_change_percentage_24h).toFixed(2) : '0.00'}%`}
              icon="trending-up"
              color={coin.price_change_percentage_24h && parseFloat(coin.price_change_percentage_24h) >= 0 ? "#22c55e" : "#ef4444"}
            />
            <MetricCard
              label="All Time High"
              value={`$${Number(coin.ath).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon="trophy"
              color="#fbbf24"
            />
            <MetricCard
              label="ATH Change"
              value={`${coin.ath_change_percentage ? parseFloat(coin.ath_change_percentage).toFixed(2) : '0.00'}%`}
              icon="trending-down"
              color={coin.ath_change_percentage && parseFloat(coin.ath_change_percentage) < 0 ? "#ef4444" : "#22c55e"}
            />
            <MetricCard
              label="Market Cap Change 24h"
              value={`${coin.market_cap_change_percentage_24h ? parseFloat(coin.market_cap_change_percentage_24h).toFixed(2) : '0.00'}%`}
              icon="bar-chart"
              color={coin.market_cap_change_percentage_24h && parseFloat(coin.market_cap_change_percentage_24h) >= 0 ? "#22c55e" : "#ef4444"}
            />
            <MetricCard
              label="Total Supply"
              value={formatNumber(total_supply)}
              icon="infinite"
              color="#8b5cf6"
            />
            <MetricCard
              label="24h High"
              value={`$${Number(high_24h).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon="arrow-up"
              color="#22c55e"
            />
        </View>
      </Animated.View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    minHeight: '100%',
  },
  coinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  coinIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  coinTextInfo: {
    marginLeft: 16,
    flex: 1,
  },
  coinName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  coinSymbol: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rankBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b5cf6',
    letterSpacing: 0.5,
  },
  priceSection: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  priceChangeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  chartSection: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chartContainer: {
    height: 120,
    position: 'relative',
  },
  chart: {
    height: 120,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  chartFill: {
    zIndex: -1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    width: (SCREEN_WIDTH - 72) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
});

export default CoinDetailScreen; 