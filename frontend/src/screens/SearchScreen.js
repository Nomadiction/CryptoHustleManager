import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Animated,
  Text,
  Alert,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CryptoCard from "../components/CryptoCard";
import icons from "../../data/icons";

const API_URL = process.env.API_URL || "http://192.168.111.100:5000/api/crypto/prices";

const SearchScreen = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      if (!data || Object.keys(data).length === 0) {
        console.warn("⚠️ API вернул пустые данные");
        setError("API вернул пустые данные");
        return;
      }
      setCryptoData(Object.entries(data));
      setError(null);
    } catch (err) {
      console.error("❌ Ошибка загрузки данных:", err);
      setError("Ошибка загрузки данных");
      Alert.alert("Ошибка", "Не удалось загрузить данные о криптовалютах");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const displayedData = useMemo(() => {
    if (!searchQuery) return cryptoData;
    return cryptoData.filter(([symbol]) =>
      symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cryptoData, searchQuery]);

  const handleToggleFavorite = useCallback((symbol) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[symbol]) {
        delete updated[symbol];
        console.log(`❌ Символ ${symbol} удален из избранных`);
      } else {
        updated[symbol] = true;
        console.log(`⭐ Символ ${symbol} добавлен в избранные`);
      }
      return updated;
    });
  }, []);

  const renderItem = useCallback(({ item }) => {
    const [symbol, data] = item;
    const IconComponent = icons[symbol.toLowerCase()] ?? icons["btc"];
    return (
      <CryptoCard
        symbol={symbol}
        price={data.price}
        priceChangePercent={data.priceChangePercent}
        IconComponent={IconComponent}
        isFavorite={!!favorites[symbol]}
        onToggleFavorite={() => handleToggleFavorite(symbol)}
      />
    );
  }, [favorites, handleToggleFavorite]);

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0d1b3d", "#162f5b"]} style={styles.searchContainer}>
        <Animated.View style={[styles.searchBox, { opacity: searchBarOpacity }]}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color="#ffffff"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск криптовалют..."
            placeholderTextColor="#AAB7C4"
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="always"
          />
        </Animated.View>
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={displayedData}
        keyExtractor={(item) => item[0]}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1e44",
    paddingTop: 20,
  },
  searchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#233567",
    zIndex: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2a4e",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 100,
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
});

export default SearchScreen;
