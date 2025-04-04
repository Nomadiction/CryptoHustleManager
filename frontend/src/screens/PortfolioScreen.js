import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Пример данных для графика
const chartData = {
  labels: ["Ян", "Фев", "Мар", "Апр", "Май", "Июн"],
  datasets: [
    {
      data: [12000, 13500, 12800, 15000, 14200, 16000],
      strokeWidth: 2,
    },
  ],
};

// Пример данных портфеля (активы)
const portfolioAssets = [
  { id: "btc", name: "Bitcoin", balance: 0.75, value: 28000, change: 2.5 },
  { id: "eth", name: "Ethereum", balance: 5, value: 1800, change: -1.2 },
  { id: "ada", name: "Cardano", balance: 1000, value: 1.5, change: 0.8 },
];

const PortfolioScreen = () => {
  // Общий баланс рассчитывается как сумма произведений баланса на текущую стоимость для каждого актива
  const totalBalance = portfolioAssets.reduce((acc, asset) => acc + asset.balance * asset.value, 0);

  return (
    <LinearGradient
      colors={["#0a1e44", "#162f5b"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header с общим балансом */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ваш криптовалютный портфель</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Общий баланс</Text>
            <Text style={styles.balanceValue}>${totalBalance.toFixed(2)}</Text>
            <View style={styles.changeContainer}>
              <MaterialCommunityIcons name="arrow-up" size={16} color="#10b981" />
              <Text style={styles.balanceChange}>+4.2%</Text>
            </View>
          </View>
        </View>

        {/* График динамики портфеля */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Динамика портфеля</Text>
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        </View>

        {/* Список активов портфеля */}
        <View style={styles.assetsContainer}>
          <Text style={styles.assetsTitle}>Активы</Text>
          {portfolioAssets.map((asset) => (
            <View key={asset.id} style={styles.assetCard}>
              <View style={styles.assetInfo}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#fff" />
                <View style={styles.assetText}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetBalance}>
                    {asset.balance} {asset.name}
                  </Text>
                </View>
              </View>
              <View style={styles.assetStats}>
                <Text style={styles.assetValue}>${(asset.balance * asset.value).toFixed(2)}</Text>
                <Text style={[
                  styles.assetChange, 
                  asset.change >= 0 ? styles.positive : styles.negative
                ]}>
                  {asset.change >= 0 ? `+${asset.change}%` : `${asset.change}%`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#162f5b",
  backgroundGradientTo: "#0a1e44",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#10b981",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  balanceContainer: {
    backgroundColor: "#1a305e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  balanceChange: {
    color: "#10b981",
    fontSize: 16,
    marginLeft: 4,
  },
  chartContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
  },
  chartStyle: {
    borderRadius: 16,
  },
  assetsContainer: {
    marginBottom: 16,
  },
  assetsTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 12,
  },
  assetCard: {
    flexDirection: "row",
    backgroundColor: "#1a2a4e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  assetInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetText: {
    marginLeft: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  assetBalance: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  assetStats: {
    alignItems: "flex-end",
  },
  assetValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  assetChange: {
    fontSize: 14,
    marginTop: 4,
  },
  positive: {
    color: "#10b981",
  },
  negative: {
    color: "#e03131",
  },
});

export default PortfolioScreen;
