import React, { useState, useEffect, useRef, memo } from "react";
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
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

// === API URL ===
const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

// === Функция форматирования чисел ===
const formatNumber = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
};

// === КАРТОЧКА С АНИМАЦИЕЙ И СВАЙПОМ ===
const AnimatedCard = memo(
  ({ item, index, onPress, onToggleFavorite, isFavorite }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const swipeableRef = useRef(null);

    useEffect(() => {
      // Параллельная анимация появления карточки
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 30,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          delay: index * 30,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index, fadeAnim, translateY]);

    const handleRightSwipe = () => {
      onToggleFavorite(item.id, true); // Добавить в избранное
      swipeableRef.current?.close();
    };

    const handleLeftSwipe = () => {
      onToggleFavorite(item.id, false); // Удалить из избранного
      swipeableRef.current?.close();
    };

    const isPositive = item.price_change_percentage_24h >= 0;

    const renderRightActions = () => (
      <View style={styles.rightAction}>
        <Ionicons
          name={isFavorite ? "star" : "star-outline"}
          size={28}
          color="#facc15"
        />
        <Text style={styles.swipeText}>{isFavorite ? "Unpin" : "Pin"}</Text>
      </View>
    );

    const renderLeftActions = () => (
      <View style={styles.leftAction}>
        <Ionicons name="trash-outline" size={28} color="#ef4444" />
        <Text style={styles.swipeText}>Delete</Text>
      </View>
    );

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={isFavorite ? renderLeftActions : null}
        onSwipeableRightOpen={handleRightSwipe}
        onSwipeableLeftOpen={isFavorite ? handleLeftSwipe : undefined}
        friction={2}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          <TouchableOpacity style={styles.assetCard} onPress={() => onPress(item)}>
            <Image source={{ uri: item.image }} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.assetName}>{item.name}</Text>
              <Text style={styles.assetSymbol}>{item.symbol.toUpperCase()}</Text>
            </View>
            <View style={styles.coinStats}>
              <Text style={styles.coinPrice}>
                $
                {item.current_price < 0.01
                  ? item.current_price.toFixed(6)
                  : item.current_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
              </Text>
              <View
                style={[
                  styles.coinChangeContainer,
                  isPositive ? styles.positiveBg : styles.negativeBg,
                ]}
              >
                <Text
                  style={[
                    styles.coinChangeText,
                    isPositive ? styles.positiveText : styles.negativeText,
                  ]}
                >
                  {isPositive ? "+" : ""}
                  {item.price_change_percentage_24h?.toFixed(2)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Swipeable>
    );
  }
);

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [cryptoData, setCryptoData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Реф для FlatList, чтобы скроллить к верху
  const listRef = useRef(null);

  // Анимация для строки поиска (высота и прозрачность)
  const searchHeight = useRef(new Animated.Value(60)).current;
  const searchOpacity = useRef(new Animated.Value(1)).current;

  // Флаг видимости поисковой строки
  const [searchVisible, setSearchVisible] = useState(true);
  // Состояние показа кнопки "скролл вверх"
  const [showScrollToTop, setShowScrollToTop] = useState(false);

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

  // Обработчик прокрутки FlatList
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Если прокрутили больше 50 и поисковая строка видна, скрываем её
    if (offsetY > 50 && searchVisible) {
      setSearchVisible(false);
      Animated.parallel([
        Animated.timing(searchHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(searchOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ]).start();
    } 
    // Если прокрутка меньше 50 и поисковая строка скрыта, показываем её
    else if (offsetY <= 50 && !searchVisible) {
      setSearchVisible(true);
      Animated.parallel([
        Animated.timing(searchHeight, {
          toValue: 60,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ]).start();
    }

    // Показывать кнопку "вверх", если прокрутка больше 300
    setShowScrollToTop(offsetY > 300);
  };

  const toggleFavorite = (id, add) => {
    setFavorites((prev) => {
      if (add === true) return [...new Set([...prev, id])];
      if (add === false) return prev.filter((f) => f !== id);
      return prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
    });
  };

  const filteredData = cryptoData.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.symbol.toLowerCase().includes(query.toLowerCase())
  );
  const pinned = filteredData.filter((item) => favorites.includes(item.id));
  const others = filteredData.filter((item) => !favorites.includes(item.id));
  const combinedData = [...pinned, ...others];

  const handlePress = (asset) => {
    navigation.navigate("CoinDetail", { coinId: asset.id });
  };

  const clearQuery = () => {
    setQuery("");
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Анимированная обёртка для строки поиска */}
      <Animated.View
        style={[
          styles.searchBarContainer,
          { height: searchHeight, opacity: searchOpacity },
        ]}
      >
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#94a3b8"
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search coins or symbols..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearQuery} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={combinedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <AnimatedCard
                item={item}
                index={index}
                onPress={handlePress}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(item.id)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={5}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {/* FAB-кнопка для прокрутки вверх */}
          {showScrollToTop && (
            <TouchableOpacity style={styles.fab} onPress={scrollToTop}>
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  // Анимация строки поиска
  searchBarContainer: {
    overflow: "hidden",
    marginBottom: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  clearButton: {
    marginLeft: 6,
  },
  // Стиль карточки актива
  assetCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    width: 44,
    height: 44,
    marginRight: 16,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  assetSymbol: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  coinStats: {
    alignItems: "flex-end",
  },
  coinPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  coinChangeContainer: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  coinChangeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  positiveBg: {
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  negativeBg: {
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  positiveText: {
    color: "#22c55e",
  },
  negativeText: {
    color: "#ef4444",
  },
  // Свайп-акшены
  rightAction: {
    backgroundColor: "#fef08a",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 18,
    marginBottom: 12,
  },
  leftAction: {
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 18,
    marginBottom: 12,
  },
  swipeText: {
    color: "#92400e",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
  // FAB-кнопка для прокрутки вверх
  fab: {
    position: "absolute",
    right: 40,
    bottom: 90,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
});
