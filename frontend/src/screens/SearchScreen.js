// frontend/src/screens/SearchScreen.js

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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';

import CryptoCard from "../components/CryptoCard";
import { useCryptoData } from "../hooks/useCryptoData";

// Enable LayoutAnimation on Android for smooth animations
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Key for storing favorite coins in AsyncStorage
const FAVORITES_KEY = "FAVORITE_COINS";

const SearchScreen = () => {
  const { cryptoData, loading } = useCryptoData();
  const navigation = useNavigation();

  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const listRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const prevScrollY = useRef(0);

  // Load favorite coins
  useEffect(() => {
    const loadFavorites = async () => {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    };
    loadFavorites();
  }, []);

  // Save favorite coins
  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Entrance animation
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Filter data
  const filterData = useCallback(
    debounce((text) => {
      const input = text.toLowerCase();
      let filtered = cryptoData.filter(
        (item) =>
          item.name.toLowerCase().includes(input) ||
          item.symbol.toLowerCase().includes(input)
      );

      // If "favorites only" filter is enabled
      if (showFavoritesOnly) {
        filtered = filtered.filter((item) => favorites.includes(item.id));
      }

      // Sort: favorites first, then others
      const pinned = filtered
        .filter((item) => favorites.includes(item.id))
        .sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));
      const others = filtered.filter((item) => !favorites.includes(item.id));
      
      setFilteredData([...pinned, ...others]);
    }, 200),
    [cryptoData, favorites, showFavoritesOnly]
  );

  useEffect(() => {
    filterData(query);
  }, [query, cryptoData, favorites, showFavoritesOnly, filterData]);

  // Toggle favorite
  const toggleFavorite = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Scroll handler
  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;

    if (y > 300) {
      if (!showScrollToTop) {
        setShowScrollToTop(true);
      }
    } else if (showScrollToTop) {
      setShowScrollToTop(false);
    }

    prevScrollY.current = y;
  };

  const handlePress = (asset) =>
    navigation.navigate("CoinDetail", { coinId: asset.id });

  const clearQuery = () => setQuery("");

  const scrollToTop = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const toggleFavoritesFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        <View style={styles.searchIconContainer}>
          <Ionicons name="search" size={18} color="#94a3b8" />
        </View>
        <TextInput
          placeholder="Search coins or symbols..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearQuery} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render filters
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          showFavoritesOnly && styles.filterButtonActive
        ]}
        onPress={toggleFavoritesFilter}
      >
        <LinearGradient
          colors={showFavoritesOnly ? ['#8b5cf6', '#7c3aed'] : ['rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.filterButtonGradient,
            { borderColor: showFavoritesOnly ? 'transparent' : '#8b5cf6' }
          ]}
        >
          <Ionicons 
            name="star" 
            size={16} 
            color={showFavoritesOnly ? "#fff" : "#8b5cf6"} 
          />
          <Text style={[
            styles.filterText,
            showFavoritesOnly && styles.filterTextActive
          ]}>
            Favorites ({favorites.length})
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsGradient}
        >
          <Text style={styles.statsText}>
            {filteredData.length} coins
          </Text>
        </LinearGradient>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['rgba(100, 116, 139, 0.1)', 'rgba(71, 85, 105, 0.1)']}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="search-outline" size={48} color="#64748b" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {showFavoritesOnly ? "No favorite coins" : "No coins found"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {showFavoritesOnly 
          ? "Add coins to favorites to see them here"
          : "Try changing your search query"
        }
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.1)']}
              style={styles.loaderBackground}
            >
              <ActivityIndicator size="large" color="#8b5cf6" />
            </LinearGradient>
            <Text style={styles.loaderText}>Loading data...</Text>
          </View>
        ) : (
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }}
          >
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
                  simultaneousHandlers={listRef}
                />
              )}
              ListHeaderComponent={
                <View>
                  {renderSearchBar()}
                  {renderFilters()}
                </View>
              }
              ListEmptyComponent={renderEmptyState()}
              estimatedItemSize={92}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />

            {showScrollToTop && (
              <Animated.View
                style={[
                  styles.scrollToTopButton,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: fadeAnim }]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.scrollToTopTouchable}
                  onPress={scrollToTop}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scrollToTopGradient}
                  >
                    <Ionicons name="arrow-up" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loaderText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#f8fafc",
    fontWeight: '500',
    paddingVertical: 6,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  filterButtonActive: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    marginLeft: 6,
  },
  filterTextActive: {
    color: '#fff',
  },
  statsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollToTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
  scrollToTopTouchable: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollToTopGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
