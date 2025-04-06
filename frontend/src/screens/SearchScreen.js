import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

const AnimatedCard = ({ item, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(item)}>
        <BlurView intensity={60} tint="dark" style={styles.blurCard}>
          <Image source={{ uri: item.image }} style={styles.icon} />
          <View style={styles.textWrapper}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.price}>
              ${item.current_price < 0.01
                ? item.current_price.toFixed(6)
                : item.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
            </Text>
            <Text
              style={[
                styles.priceChange,
                { color: item.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444" },
              ]}
            >
              {item.price_change_percentage_24h?.toFixed(2)}%
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        setCryptoData(json);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = cryptoData.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.symbol.toLowerCase().includes(query.toLowerCase())
  );

  const handlePress = (asset) => {
    navigation.navigate("AssetDetails", { asset });
  };

  const renderItem = ({ item, index }) => (
    <AnimatedCard item={item} index={index} onPress={handlePress} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Search coins or symbols..."
          placeholderTextColor="#64748b"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#e2e8f0",
  },
  cardContainer: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: "hidden",
  },
  blurCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  icon: {
    width: 42,
    height: 42,
    marginRight: 16,
    borderRadius: 21,
  },
  textWrapper: {
    flex: 1,
  },
  name: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "600",
  },
  symbol: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
});
