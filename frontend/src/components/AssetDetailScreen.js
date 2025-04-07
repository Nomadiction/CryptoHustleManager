import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AssetDetailScreen = ({ route }) => {
  const { asset } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const assetChartData = {
    labels: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн"],
    datasets: [
      {
        data: [
          asset.value * 0.8,
          asset.value * 0.9,
          asset.value * 1.1,
          asset.value,
          asset.value * 1.05,
          asset.value * 1.1,
        ],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <LinearGradient colors={["#0a1e44", "#162f5b"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={asset.icon || "currency-usd"}
              size={40}
              color="#fff"
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={styles.name}>{asset.name}</Text>
              <Text style={styles.symbol}>{asset.symbol}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Баланс</Text>
            <Text style={styles.value}>
              {asset.balance} {asset.symbol}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Стоимость</Text>
            <Text style={styles.value}>${asset.value.toFixed(2)}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Общая сумма</Text>
            <Text style={styles.value}>
              ${(asset.balance * asset.value).toFixed(2)}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Изменение</Text>
            <Text
              style={[
                styles.value,
                asset.change >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {asset.change >= 0 ? `+${asset.change}%` : `${asset.change}%`}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>График цены</Text>
          <LineChart
            data={assetChartData}
            width={SCREEN_WIDTH - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#162f5b",
  backgroundGradientTo: "#0a1e44",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
  scrollContainer: {
    padding: 18,
  },
  card: {
    backgroundColor: "#1a305e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  symbol: {
    fontSize: 16,
    color: "#d1d5db",
  },
  infoBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  positive: {
    color: "#10b981",
  },
  negative: {
    color: "#e03131",
  },
  chartSection: {
    alignItems: "center",
    marginTop: 12,
  },
  chartTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },
  chartStyle: {
    borderRadius: 16,
  },
});

export default AssetDetailScreen;