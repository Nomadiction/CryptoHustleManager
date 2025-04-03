import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, FlatList, Animated, Text, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CryptoCard from "../components/CryptoCard";
import icons from "../../data/icons";

const API_URL = process.env.API_URL || "http://192.168.8.56:5000/api/crypto/prices";

const SearchScreen = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;

  // Функция загрузки избранного из AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : {});
    } catch (error) {
      console.error("Ошибка загрузки избранного:", error);
    }
  };

  // Функция сохранения избранного в AsyncStorage
  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Ошибка сохранения избранного:", error);
    }
  };

  // Функция получения данных с API
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn("⚠️ API вернул пустые данные");
        setError("API вернул пустые данные");
        return;
      }
      const formattedData = Object.entries(response.data);
      setCryptoData(formattedData);
      setError(null);
    } catch (error) {
      console.error("❌ Ошибка загрузки данных:", error);
      setError("Ошибка загрузки данных");
      Alert.alert("Ошибка", "Не удалось загрузить данные о криптовалютах");
    }
  }, []);

  // Загрузка данных и избранного при первом рендере
  useEffect(() => {
    fetchData();
    loadFavorites();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      loadFavorites();
    }, [fetchData])
  );

  // Фильтр данных при поиске
  const getDisplayedData = useCallback(() => {
    if (!searchQuery) return cryptoData;
    return cryptoData.filter(([symbol]) =>
      symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cryptoData, searchQuery]);

  // Обработчик поиска
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = async (symbol) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[symbol]) {
        delete updated[symbol];
        console.log(`❌ Символ ${symbol} удален из избранных`);
      } else {
        updated[symbol] = true;
        console.log(`⭐ Символ ${symbol} добавлен в избранные`);
      }
      saveFavorites(updated); // Сохранение обновленного списка избранного
      return updated;
    });
  };

  // Отрисовка каждой криптовалюты
  const renderItem = ({ item }) => {
    const [symbol, data] = item;
    const IconComponent = icons[symbol.toLowerCase()] || icons["btc"];
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
  };

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, { opacity: searchBarOpacity }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск криптовалют..."
          placeholderTextColor="#6c6f93"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={getDisplayedData()}
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
    backgroundColor: "#112a57",
    paddingTop: 20,
  },
  searchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1c2b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#2c305b",
  },
  searchInput: {
    backgroundColor: "#1a1c2b",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#2c305b",
  },
  listContainer: {
    paddingTop: 70,
    paddingBottom: 120,
    paddingHorizontal: 8,
  },
  errorText: {
    color: "#e03131",
    textAlign: "center",
    marginTop: 80,
    fontSize: 16,
  },
});

export default SearchScreen;
