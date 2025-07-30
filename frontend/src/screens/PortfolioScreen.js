import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import PortfolioStats from '../components/PortfolioStats';

const { width: screenWidth } = Dimensions.get('window');

const portfolioAssets = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', balance: 0.5, value: 5878.15, change: 2.34, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: '2', name: 'Ethereum', symbol: 'ETH', balance: 3.2, value: 7834.56, change: -1.23, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: '3', name: 'BNB', symbol: 'BNB', balance: 12.5, value: 1567.89, change: 0.56, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: '4', name: 'Cardano', symbol: 'ADA', balance: 2500, value: 234.56, change: -0.89, image: 'https://assets.coingecko.com/coins/images/975/large/Cardano.png' },
];

const chartData = {
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
  datasets: [
    {
      data: [12000, 13500, 12800, 14200, 13800, 15280],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 3,
    },
  ],
};

const PortfolioScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const totalBalance = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = portfolioAssets.reduce((sum, asset) => sum + (asset.value * asset.change / 100), 0);
  const totalChangePercent = (totalChange / totalBalance) * 100;

  const handlePeriodChange = (period) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriod(period);
  };

  const handleStatsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Здесь можно добавить навигацию к детальному экрану статистики
  };

  const handleAssetPress = (asset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Здесь можно добавить навигацию к детальному экрану актива
  };

  const renderPeriodSelector = () => {
    const periods = [
      { key: '1h', label: '1Ч' },
      { key: '24h', label: '24Ч' },
      { key: '7d', label: '7Д' },
      { key: '30d', label: '30Д' },
      { key: '1y', label: '1Г' },
    ];

    return (
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive
            ]}
            onPress={() => handlePeriodChange(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Портфель</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <MaterialCommunityIcons name="cog" size={24} color="#f8fafc" />
            </TouchableOpacity>
          </View>

          <PortfolioStats
            totalValue={totalBalance}
            totalChange={totalChange}
            totalChangePercent={totalChangePercent}
            onPress={handleStatsPress}
            period={selectedPeriod}
          />

          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>График портфеля</Text>
              {renderPeriodSelector()}
            </View>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#1e293b',
                backgroundGradientFrom: '#1e293b',
                backgroundGradientTo: '#1e293b',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#10b981',
                },
              }}
              bezier
              style={styles.chartStyle}
            />
          </View>

          <View style={styles.assetsContainer}>
            <View style={styles.assetsHeader}>
              <Text style={styles.assetsTitle}>Активы</Text>
              <TouchableOpacity style={styles.addAssetButton}>
                <MaterialCommunityIcons name="plus" size={20} color="#10b981" />
                <Text style={styles.addAssetText}>Добавить</Text>
              </TouchableOpacity>
            </View>

            {portfolioAssets.map((asset, index) => (
              <Animated.View
                key={asset.id}
                style={[
                  styles.assetCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      })
                    }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.assetTouchable}
                  onPress={() => handleAssetPress(asset)}
                  activeOpacity={0.9}
                >
                  <View style={styles.assetInfo}>
                    <View style={styles.assetIconContainer}>
                      <MaterialCommunityIcons name="currency-btc" size={24} color="#f8fafc" />
                    </View>
                    <View style={styles.assetText}>
                      <Text style={styles.assetName}>{asset.name}</Text>
                      <Text style={styles.assetBalance}>
                        {asset.balance} {asset.symbol}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.assetStats}>
                    <Text style={styles.assetValue}>${asset.value.toFixed(2)}</Text>
                    <View style={[
                      styles.assetChangeContainer,
                      asset.change >= 0 ? styles.positiveBg : styles.negativeBg
                    ]}>
                      <MaterialIcons 
                        name={asset.change >= 0 ? "trending-up" : "trending-down"} 
                        size={14} 
                        color={asset.change >= 0 ? "#10b981" : "#ef4444"} 
                      />
                      <Text style={[
                        styles.assetChange,
                        asset.change >= 0 ? styles.positive : styles.negative
                      ]}>
                        {asset.change >= 0 ? `+${asset.change.toFixed(2)}%` : `${asset.change.toFixed(2)}%`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodButtonActive: {
    backgroundColor: '#10b981',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chartStyle: {
    borderRadius: 16,
    paddingRight: 16,
  },
  assetsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  addAssetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginLeft: 4,
  },
  assetCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assetTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetText: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 2,
  },
  assetBalance: {
    fontSize: 14,
    color: '#94a3b8',
  },
  assetStats: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  assetChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  positiveBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  negativeBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
});

export default PortfolioScreen;