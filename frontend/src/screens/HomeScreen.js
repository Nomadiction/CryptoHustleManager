// frontend/screens/HomeScreen.js

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const walletsData = [
  { id: '1', name: 'Основной кошелек', balance: 1234.56, earnings: 123.45, color: ['#667eea', '#764ba2'] },
  { id: '2', name: 'Торговый кошелек', balance: 5678.90, earnings: 456.78, color: ['#f093fb', '#f5576c'] },
  { id: '3', name: 'Сбережения', balance: 2345.67, earnings: 89.01, color: ['#4facfe', '#00f2fe'] },
];

const favoriteCoinsData = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 23456.78, change: 2.34, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 1567.89, change: -1.23, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 345.67, change: 0.56, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
];

const ProfileHeader = () => {
  const greetingAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(greetingAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(profileAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.header}>
      <Animated.View style={[styles.profileSection, { opacity: profileAnim, transform: [{ translateY: profileAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }) }] }]}>
        <View style={styles.profilePicContainer}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }} style={styles.profilePic} />
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.greeting}>Добро пожаловать,</Text>
          <Text style={styles.profileName}>Richard Cooper</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.notificationContainer, { opacity: profileAnim, transform: [{ scale: profileAnim }] }]}>
        <TouchableOpacity style={styles.notification} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <MaterialCommunityIcons name="bell" size={24} color="#fff" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const BalanceCard = () => {
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const [displayedBalance, setDisplayedBalance] = useState(0);

  useEffect(() => {
    Animated.timing(balanceAnim, {
      toValue: 17258.13,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const listener = balanceAnim.addListener(({ value }) => {
      setDisplayedBalance(value);
    });

    return () => balanceAnim.removeListener(listener);
  }, []);

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.earningsContainer}>
      <View style={styles.totalBalance}>
        <Text style={styles.balanceLabel}>Общий баланс</Text>
        <Text style={styles.balanceValue}>${displayedBalance.toFixed(2)}</Text>
      </View>
      <View style={styles.allTime}>
        <View style={styles.changeIndicator}>
          <MaterialIcons name="trending-up" size={16} color="#10b981" />
          <Text style={styles.allTimeText}>
            <Text style={styles.allTimePositive}>+4,972.2</Text> • 37.4%
          </Text>
        </View>
        <Text style={styles.allTimeLabel}>за все время</Text>
      </View>
    </LinearGradient>
  );
};

const WalletSlider = () => {
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderWalletCard = ({ item, index }) => {
    const inputRange = [
      (index - 1) * 220,
      index * 220,
      (index + 1) * 220,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <LinearGradient colors={item.color} style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Text style={styles.walletTitle}>{item.name}</Text>
            <MaterialCommunityIcons name="wallet" size={20} color="#fff" />
          </View>
          <Text style={styles.walletBalance}>${item.balance.toFixed(2)}</Text>
          <View style={styles.walletEarningsContainer}>
            <MaterialIcons name="trending-up" size={14} color="#10b981" />
            <Text style={styles.walletEarnings}>+${item.earnings.toFixed(2)}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.sliderWrapper}>
      <Text style={styles.sliderTitle}>Мои кошельки</Text>
      <Animated.ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.slider}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {walletsData.map((wallet, index) => (
          <View key={wallet.id} style={styles.walletCardContainer}>
            {renderWalletCard({ item: wallet, index })}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const SearchBar = ({ searchText, setSearchText }) => {
  return (
    <View style={styles.searchWrapper}>
      <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск криптовалют..."
        placeholderTextColor="#94a3b8"
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="never"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={() => setSearchText("")}>
          <MaterialIcons name="clear" size={20} color="#94a3b8" style={styles.clearIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const FavoriteCoinCard = ({ item, index }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(pressAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={[
      styles.coinCard,
      {
        opacity: cardAnim,
        transform: [
          { translateY: cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }) },
          { scale: pressAnim }
        ]
      }
    ]}>
      <TouchableOpacity style={styles.coinCardTouchable} onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.coinInfo}>
          <Image source={{ uri: item.image }} style={styles.coinIcon} />
          <View style={styles.coinDetails}>
            <Text style={styles.coinName}>{item.name}</Text>
            <Text style={styles.coinSymbol}>{item.symbol}</Text>
          </View>
        </View>
        <View style={styles.coinStats}>
          <Text style={styles.coinPrice}>${item.price.toFixed(2)}</Text>
          <View style={[
            styles.coinChangeContainer,
            item.change >= 0 ? styles.positive : styles.negative
          ]}>
            <MaterialIcons 
              name={item.change >= 0 ? "trending-up" : "trending-down"} 
              size={14} 
              color={item.change >= 0 ? "#10b981" : "#ef4444"} 
            />
            <Text style={[
              styles.coinChange,
              item.change >= 0 ? styles.positive : styles.negative
            ]}>
              {item.change >= 0 ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = () => {
  const [searchText, setSearchText] = useState("");

  const filteredCoins = favoriteCoinsData.filter(coin =>
    coin.name.toLowerCase().includes(searchText.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredCoins}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <FavoriteCoinCard item={item} index={index} />}
          ListHeaderComponent={(
            <View>
              <ProfileHeader />
              <View style={styles.divider} />
              <View style={styles.earningsWrapper}>
                <BalanceCard />
              </View>
              <WalletSlider />
              <SearchBar searchText={searchText} setSearchText={setSearchText} />
              <View style={styles.favCoinsHeader}>
                <Text style={styles.favCoinsTitle}>Избранные монеты</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>Все</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#10b981" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 100,
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profilePicContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 2,
  },
  profileName: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
  },
  notificationContainer: {
    position: 'relative',
  },
  notification: {
    position: "relative",
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  divider: {
    borderBottomColor: "#334155",
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  earningsWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  earningsContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  totalBalance: {
    marginBottom: 12,
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 4,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  allTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allTimeText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  allTimePositive: {
    fontWeight: "bold",
  },
  allTimeLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  sliderWrapper: {
    marginBottom: 24,
  },
  sliderTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  slider: {
    paddingHorizontal: 20,
  },
  walletCardContainer: {
    marginRight: 16,
  },
  walletCard: {
    borderRadius: 20,
    padding: 20,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  walletBalance: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  walletEarningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletEarnings: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
  favCoinsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  favCoinsTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "600",
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  coinCard: {
    backgroundColor: "#334155",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinCardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  coinInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coinDetails: {
    flex: 1,
  },
  coinName: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  coinSymbol: {
    color: "#94a3b8",
    fontSize: 14,
  },
  coinStats: {
    alignItems: "flex-end",
  },
  coinPrice: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  coinChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  coinChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  positive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
  },
  negative: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
  },
});

export default HomeScreen;
