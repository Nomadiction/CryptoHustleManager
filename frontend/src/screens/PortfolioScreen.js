import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const chartData = {
  labels: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн"],
  datasets: [
    {
      data: [12000, 13500, 12800, 15000, 14200, 16000],
      strokeWidth: 2,
    },
  ],
};

const portfolioAssets = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", balance: 0.75, value: 28000, change: 2.5, icon: "bitcoin" },
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: 5, value: 1800, change: -1.2, icon: "ethereum" },
  { id: "ada", name: "Cardano", symbol: "ADA", balance: 1000, value: 1.5, change: 0.8, icon: "alpha-a-box" },
];

const PortfolioScreen = () => {
  const navigation = useNavigation();

  const totalBalance = portfolioAssets.reduce(
    (acc, asset) => acc + asset.balance * asset.value,
    0
  );

  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayedBalance, setDisplayedBalance] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: totalBalance,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    const id = animatedValue.addListener(({ value }) => {
      setDisplayedBalance(value);
    });

    return () => {
      animatedValue.removeListener(id);
    };
  }, [totalBalance]);

  return (
    <LinearGradient colors={["#0a1e44", "#162f5b"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ваш крипто-портфель</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Общий баланс</Text>
            <Text style={styles.balanceValue}>${displayedBalance.toFixed(2)}</Text>
            <View style={styles.changeContainer}>
              <MaterialCommunityIcons name="arrow-up" size={16} color="#10b981" />
              <Text style={styles.balanceChange}>+4.2%</Text>
            </View>
          </View>
        </View>

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

        <View style={styles.assetsContainer}>
          <Text style={styles.assetsTitle}>Активы</Text>
          {portfolioAssets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              style={styles.assetCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AssetDetails", { asset })}
            >
              <View style={styles.assetInfo}>
                <MaterialCommunityIcons
                  name={asset.icon || "currency-usd-circle-outline"}
                  size={30}
                  color="#fff"
                />
                <View style={styles.assetText}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetBalance}>
                    {asset.balance} {asset.symbol}
                  </Text>
                </View>
              </View>
              <View style={styles.assetStats}>
                <Text style={styles.assetValue}>
                  ${(asset.balance * asset.value).toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.assetChange,
                    asset.change >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {asset.change >= 0 ? `+${asset.change}%` : `${asset.change}%`}
                </Text>
              </View>
            </TouchableOpacity>
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
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 60 },
  header: { marginBottom: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  balanceContainer: {
    backgroundColor: "#1a305e",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  balanceChange: {
    color: "#10b981",
    fontSize: 16,
    marginLeft: 4,
  },
  chartContainer: {
    marginBottom: 28,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
    color: "#d1d5db",
    marginTop: 2,
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