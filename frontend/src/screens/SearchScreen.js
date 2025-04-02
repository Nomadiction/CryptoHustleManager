import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import icons from "../../data/icons";

// Импортируем компоненты и хуки из reanimated и gesture-handler
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

const API_URL = "http://192.168.8.56:5000/api/crypto/prices";

const SearchScreen = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Функция сохранения избранного в AsyncStorage
  const saveFavorites = async (favList) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(favList));
    } catch (error) {
      console.error("Ошибка сохранения избранного:", error);
    }
  };

  // Функция загрузки избранного из AsyncStorage
  const loadFavorites = async () => {
    try {
      const favs = await AsyncStorage.getItem("favorites");
      if (favs !== null) {
        setFavorites(JSON.parse(favs));
      }
    } catch (error) {
      console.error("Ошибка загрузки избранного:", error);
    }
  };

  // Функция для переключения избранного
  const toggleFavorite = async (symbol) => {
    const lowerSymbol = symbol.toLowerCase();
    let updatedFavorites;
    if (favorites.includes(lowerSymbol)) {
      updatedFavorites = favorites.filter((item) => item !== lowerSymbol);
    } else {
      updatedFavorites = [...favorites, lowerSymbol];
    }
    setFavorites(updatedFavorites);
    await saveFavorites(updatedFavorites);
  };

  // Функция загрузки данных
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn("⚠️ API вернул пустые данные");
        return;
      }
      const formattedData = Object.entries(response.data);
      setCryptoData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("❌ Ошибка загрузки данных:", error);
    }
  }, []);

  // Загрузка данных и избранного при монтировании
  useEffect(() => {
    fetchData();
    loadFavorites();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Обновление при возврате на экран
  useFocusEffect(
    useCallback(() => {
      fetchData();
      loadFavorites();
    }, [fetchData])
  );

  // Фильтрация списка по вводу
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = cryptoData.filter(([symbol]) =>
        symbol.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(cryptoData);
    }
  };

  // Анимация скрытия строки поиска при прокрутке вниз
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Функция рендера элементов списка с обработкой свайпа в верхней части карточки
  const renderItem = ({ item }) => {
    const [symbol, { price, priceChangePercent } = {}] = item;
    const normalizedSymbol = symbol?.toLowerCase();
    const IconComponent = icons[normalizedSymbol] || icons["btc"];
    const isFavorite = favorites.includes(normalizedSymbol);

    // Создаем shared value для отслеживания горизонтального смещения
    const translateX = useSharedValue(0);

    // Обработчик жеста свайпа
    const gestureHandler = useAnimatedGestureHandler({
      onActive: (event) => {
        // Обновляем смещение; нас интересует свайп влево (отрицательное значение)
        translateX.value = event.translationX;
      },
      onEnd: () => {
        // Если свайп влево превышает порог, переключаем избранное
        if (translateX.value < -50) {
          runOnJS(toggleFavorite)(symbol);
        }
        // Возвращаем область в исходное положение
        translateX.value = withTiming(0);
      },
    });

    // Применяем анимированный стиль для области свайпа
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <View style={styles.card}>
        {/* Область для свайпа в верхней части карточки */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.topSwipeArea, animatedStyle]}>
            <Text style={styles.swipeHint}>Свайпните влево для избранного</Text>
          </Animated.View>
        </PanGestureHandler>

        {/* Основное содержимое карточки */}
        <View style={styles.iconContainer}>
          {IconComponent ? <IconComponent width={40} height={40} /> : null}
        </View>
        <View style={styles.info}>
          <Text style={styles.symbol}>{symbol?.toUpperCase()}</Text>
          <Text style={styles.price}>
            ${price ? price.toFixed(2) : "N/A"}
          </Text>
          <Text
            style={[
              styles.change,
              priceChangePercent >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {priceChangePercent !== undefined
              ? priceChangePercent.toFixed(2) + "%"
              : "N/A"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(symbol)}>
          <Text
            style={[
              styles.favoriteIcon,
              { color: isFavorite ? "#ffd700" : "#fff" },
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Анимированная строка поиска */}
      <Animated.View
        style={[styles.searchContainer, { opacity: searchBarOpacity }]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск криптовалют..."
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </Animated.View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item[0] || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120, marginTop: 40 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
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
    backgroundColor: "#1c3b70",
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: "#2a4f8d",
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  card: {
    flexDirection: "column",
    backgroundColor: "#1c3b70",
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  topSwipeArea: {
    height: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  swipeHint: {
    fontSize: 10,
    color: "#ccc",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  info: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 15,
  },
  symbol: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    color: "#ffffff",
    fontSize: 14,
  },
  change: {
    fontSize: 14,
  },
  positive: {
    color: "#00ff00",
  },
  negative: {
    color: "#ff0000",
  },
  favoriteIcon: {
    fontSize: 24,
    paddingRight: 15,
    alignSelf: "center",
  },
});

export default SearchScreen;

