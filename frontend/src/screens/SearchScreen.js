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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "lodash";

import CryptoCard from "../components/CryptoCard";
import { useCryptoData } from "../hooks/useCryptoData";

const SearchScreen = () => {
  const { cryptoData, loading } = useCryptoData();
  const navigation = useNavigation();

  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const listRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const scrollTopAnim = useRef(new Animated.Value(0)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);

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

  const filterData = useCallback(
    debounce((text) => {
      const input = text.toLowerCase();
      const filtered = cryptoData.filter(
        (item) =>
          item.name.toLowerCase().includes(input) ||
          item.symbol.toLowerCase().includes(input)
      );
      const pinned = filtered.filter((item) => favorites.includes(item.id));
      const others = filtered.filter((item) => !favorites.includes(item.id));
      setFilteredData([...pinned, ...others]);
    }, 200),
    [cryptoData, favorites]
  );

  useEffect(() => {
    filterData(query);
  }, [query, cryptoData, favorites, filterData]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id]
    );
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 300 && !showScrollToTop) {
      setShowScrollToTop(true);
      Animated.timing(scrollTopAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (offsetY <= 300 && showScrollToTop) {
      setShowScrollToTop(false);
      Animated.timing(scrollTopAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = (asset) => {
    navigation.navigate("CoinDetail", { coinId: asset.id });
  };

  const clearQuery = () => setQuery("");
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

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
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearQuery} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#a1a1aa" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
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

          {showScrollToTop && (
            <Animated.View
              style={[
                styles.fab,
                {
                  opacity: scrollTopAnim,
                  transform: [
                    {
                      scale: scrollTopAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity onPress={scrollToTop}>
                <Ionicons name="arrow-up" size={24} color="#1f2937" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loader: {
    marginTop: 40,
  },
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
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  clearButton: {
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 80,
  },
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
