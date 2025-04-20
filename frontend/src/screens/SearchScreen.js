import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import CryptoCard from "../components/CryptoCard";
import { getBaseUrl } from "./utils/api";


const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [cryptoData, setCryptoData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const listRef = useRef(null);
  const scrollTopAnim = useRef(new Animated.Value(0)).current;
  const arrowScaleAnim = useRef(new Animated.Value(1)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const prevOffset = useRef(0);

  // Загрузка данных с сервера
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = await getBaseUrl();
        const res = await fetch(`${baseUrl}/api/crypto/prices`);
        const data = await res.json();

        const formatted = Object.entries(data).map(([id, info]) => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          symbol: id.slice(0, 3).toUpperCase(),
          price: info.price,
          priceChangePercent: info.priceChangePercent,
        }));

        setCryptoData(formatted);
      } catch (err) {
        console.error("❌ Ошибка при получении данных:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startArrowPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowScaleAnim, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowScaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY > 300 && !showScrollToTop) {
      setShowScrollToTop(true);
      Animated.timing(scrollTopAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start(() => startArrowPulse());
    } else if (offsetY <= 300 && showScrollToTop) {
      setShowScrollToTop(false);
      Animated.timing(scrollTopAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }

    prevOffset.current = offsetY;
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

  const clearQuery = () => setQuery("");
  const scrollToTop = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
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
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <>
          <FlashList
            ref={listRef}
            data={combinedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <CryptoCard
                item={item}
                index={index}
                onPress={handlePress}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(item.id)}
              />
            )}
            estimatedItemSize={92}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          <Animated.View
            style={[
              styles.fab,
              {
                transform: [
                  {
                    scale: scrollTopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
                opacity: scrollTopAnim,
              },
            ]}
          >
            <TouchableOpacity onPress={scrollToTop}>
              <Animated.View style={{ transform: [{ scale: arrowScaleAnim }] }}>
                <Ionicons name="arrow-up" size={24} color="#1f2937" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
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
    paddingTop: 10,
  },
  searchBarContainer: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  clearButton: {
    marginLeft: 6,
  },
  fab: {
    position: "absolute",
    right: 35,
    bottom: 90,
    width: 50,
    height: 50,
    borderRadius: 26,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
});
