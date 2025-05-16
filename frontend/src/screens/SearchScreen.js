// frontend/screens/SearchScreen.js

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Text,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CryptoCard from "../components/CryptoCard";
import { useCryptoData } from "../hooks/useCryptoData";

// Включаем LayoutAnimation на Android для плавных анимаций
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Ключ для хранения избранных монет в AsyncStorage, позволяет настраивать сохранение данных
const FAVORITES_KEY = "FAVORITE_COINS";

// Основной компонент экрана поиска, который управляет состояниями и анимациями
const SearchScreen = () => {
  // Используем хук для получения данных о криптовалютах и состояния загрузки, настраиваем источник данных
  const { cryptoData, loading } = useCryptoData();
  const navigation = useNavigation();

  // Инициализируем состояния для поиска, избранных монет и отфильтрованных данных, настраиваем начальные значения
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cryptoList, setCryptoList] = useState([...cryptoData]);

  // Создаем ссылки для управления списком и анимациями, настраиваем начальные значения анимаций
  const listRef = useRef(null);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const opacityFab = useRef(new Animated.Value(0)).current;
  const scaleFab = useRef(new Animated.Value(0)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const prevScrollY = useRef(0);
  const searchBarAnim = useRef(new Animated.Value(1)).current;

  // Эффект для загрузки избранных монет из AsyncStorage при монтировании компонента, настраиваем асинхронное поведение
  useEffect(() => {
    const loadFavorites = async () => {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    };
    loadFavorites();
  }, []);

  // Эффект для сохранения избранных монет в AsyncStorage при их изменении, настраиваем синхронизацию данных
  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Эффект для анимации появления данных после загрузки, настраиваем параметры анимации
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Функция для фильтрации данных на основе введенного текста, настраиваем параметры фильтрации
  const filterData = useCallback(
    debounce((text) => {
      const input = text.toLowerCase();
      const filtered = cryptoData.filter(
        (item) =>
          item.name.toLowerCase().includes(input) ||
          item.symbol.toLowerCase().includes(input)
      );

      const pinned = filtered
        .filter((item) => favorites.includes(item.id))
        .sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));
      const others = filtered.filter((item) => !favorites.includes(item.id));
      setFilteredData([...pinned, ...others]);
    }, 200),
    [cryptoData, favorites]
  );

  // Эффект для фильтрации данных при изменении запроса или данных, настраиваем зависимости
  useEffect(() => {
    filterData(query);
  }, [query, cryptoData, favorites, filterData]);

  // Функция для добавления или удаления монеты из избранного, настраиваем анимацию и обновление состояния
  const toggleFavorite = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Функции для анимации кнопки прокрутки вверх, настраиваем параметры анимации
  const runShowFab = () => {
    Animated.parallel([
      Animated.timing(opacityFab, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleFab, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runHideFab = () => {
    Animated.parallel([
      Animated.timing(opacityFab, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleFab, {
        toValue: 0,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => setShowScrollToTop(false));
  };

  // Обработчик прокрутки для управления видимостью кнопки прокрутки и анимацией строки поиска, настраиваем пороги и анимации
  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;

    if (y > 300) {
      if (!showScrollToTop) {
        setShowScrollToTop(true);
        runShowFab();
      }
    } else if (showScrollToTop) {
      runHideFab();
    }

    const delta = y - prevScrollY.current;
    const shouldHide = delta > 15;
    const shouldShow = delta < -15;

    if (shouldHide) {
      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (shouldShow) {
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }

    prevScrollY.current = y;
  };

  // Функция для перехода на экран с деталями монеты, настраиваем параметры навигации
  const handlePress = (asset) =>
    navigation.navigate("CoinDetail", { coinId: asset.id });

  // Функция для очистки строки поиска, настраиваем сброс состояния
  const clearQuery = () => setQuery("");

  // Функция для прокрутки списка вверх, настраиваем параметры прокрутки
  const scrollToTop = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

  // Функции для перемещения элемента в списке избранных, настраиваем логику перемещения
  const moveItem = (id, direction) => {
    const index = favorites.findIndex(item => item === id);
    if (index < 0) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= favorites.length) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newFavorites = [...favorites];
    const [movedItem] = newFavorites.splice(index, 1);
    newFavorites.splice(newIndex, 0, movedItem);
    setFavorites(newFavorites);
  };

  const handleMoveUp = (id) => moveItem(id, "up");
  const handleMoveDown = (id) => moveItem(id, "down");

  // Рендеринг строки поиска, настраиваем внешний вид и поведение
  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" style={styles.icon} />
        <TextInput
          placeholder="Search coins or symbols..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          clearButtonMode="always"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearQuery}>
            <Ionicons name="close-circle" size={22} color="#94a3b8" style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Основной рендеринг компонента, включая список криптовалют и кнопку прокрутки вверх, настраиваем внешний вид и поведение
  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10b981"
          style={styles.loader}
        />
      ) : (
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
        >
          {filteredData.length === 0 ? (
            <Text style={styles.emptyText}>No coins found</Text>
          ) : (
            <FlashList
              ref={listRef}
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <CryptoCard
                  item={item}
                  index={index}
                  onPress={handlePress}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(item.id)}
                  onMoveUp={() => handleMoveUp(item.id)}
                  onMoveDown={() => handleMoveDown(item.id)}
                  simultaneousHandlers={scrollRef}
                />
              )}
              ListHeaderComponent={renderSearchBar}
              estimatedItemSize={92}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          )}

          <Animated.View
            pointerEvents={showScrollToTop ? "auto" : "none"}
            style={[
              styles.fab,
              {
                opacity: opacityFab,
                transform: [{ scale: scaleFab }],
              },
            ]}
          >
            <TouchableOpacity onPress={scrollToTop}>
              <Ionicons name="arrow-up" size={24} color="#1f2937" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

// Экспортируем компонент экрана поиска, настраиваем оптимизацию рендеринга

// Стили для компонента, включая стили для анимаций и различных состояний
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  loader: { marginTop: 40 },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#1f2937" },
  clearButton: { marginLeft: 6 },
  listContent: { paddingBottom: 80 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#9ca3af",
  },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 90,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
