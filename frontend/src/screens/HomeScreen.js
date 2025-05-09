// frontend/screens/HomeScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const walletsData = [
  { id: '1', name: 'Wallet 1', balance: 1234.56, earnings: 123.45 },
  { id: '2', name: 'Wallet 2', balance: 5678.90, earnings: 456.78 },
  { id: '3', name: 'Wallet 3', balance: 2345.67, earnings: 89.01 },
];

const favoriteCoinsData = [
  { id: 'btc', name: 'BTC', price: 23456.78, change: 2.34 },
  { id: 'eth', name: 'ETH', price: 1567.89, change: -1.23 },
  { id: 'bnb', name: 'BNB', price: 345.67, change: 0.56 },
];

const ProfileHeader = () => (
  <View style={styles.header}>
    <View style={styles.profileSection}>
      <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profilePic} />
      <Text style={styles.profileName}>Richard Cooper</Text>
    </View>
    <TouchableOpacity style={styles.notification}>
      <MaterialCommunityIcons name="bell" size={25} color="#fff" />
      <View style={styles.notificationBadge} />
    </TouchableOpacity>
  </View>
);

const BalanceCard = () => (
  <LinearGradient colors={["#1a305e", "#162f5b"]} style={styles.earningsContainer}>
    <View style={styles.totalBalance}>
      <Text style={styles.balanceLabel}>Total Balance</Text>
      <Text style={styles.balanceValue}>$17,258.13</Text>
    </View>
    <View style={styles.allTime}>
      <Text style={styles.allTimeText}><Text style={styles.allTimePositive}>+4,972.2</Text> • 37.4%</Text>
      <Text style={styles.allTimeLabel}>all time</Text>
    </View>
  </LinearGradient>
);

const WalletSlider = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slider}>
    {walletsData.map(wallet => (
      <LinearGradient key={wallet.id} colors={["#182547", "#122956"]} style={styles.walletCard}>
        <Text style={styles.walletTitle}>{wallet.name}</Text>
        <Text style={styles.walletBalance}>${wallet.balance.toFixed(2)}</Text>
        <Text style={styles.walletEarnings}>+${wallet.earnings.toFixed(2)}</Text>
      </LinearGradient>
    ))}
  </ScrollView>
);

const SearchBar = ({ searchText, setSearchText }) => (
  <View style={styles.searchWrapper}>
    <MaterialIcons name="search" size={20} color="#fff" style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder="Поиск криптовалют..."
      placeholderTextColor="#AAB7C4"
      value={searchText}
      onChangeText={setSearchText}
      clearButtonMode="never"
    />
    {searchText.length > 0 && (
      <TouchableOpacity onPress={() => setSearchText("")}>
        <MaterialIcons name="clear" size={20} color="#fff" style={styles.clearIcon} />
      </TouchableOpacity>
    )}
  </View>
);

const FavoriteCoinCard = ({ item }) => (
  <View style={styles.coinCard}>
    <View style={styles.coinInfo}>
      <View style={styles.coinIcon}>
        <MaterialCommunityIcons name="currency-usd" size={24} color="#fff" />
      </View>
      <Text style={styles.coinName}>{item.name}</Text>
    </View>
    <View style={styles.coinStats}>
      <Text style={styles.coinPrice}>${item.price.toFixed(2)}</Text>
      <Text style={[
        styles.coinChange,
        item.change >= 0 ? styles.positive : styles.negative
      ]}>
        {item.change >= 0 ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
      </Text>
    </View>
  </View>
);

const HomeScreen = () => {
  const [searchText, setSearchText] = useState("");

  const filteredCoins = favoriteCoinsData.filter(coin =>
    coin.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <LinearGradient colors={["#0a1e44", "#162f5b"]} style={styles.container}>
      <FlatList
        data={filteredCoins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FavoriteCoinCard item={item} />}
        ListHeaderComponent={(
          <View>
            <ProfileHeader />
            <View style={styles.divider} />
            <View style={styles.earningsWrapper}>
              <BalanceCard />
            </View>
            <View style={styles.sliderWrapper}>
              <WalletSlider />
            </View>
            <SearchBar searchText={searchText} setSearchText={setSearchText} />
            <View style={styles.favCoinsHeader}>
              <Text style={styles.favCoinsTitle}>Favorite Coins</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 72,
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  profileName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  notification: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
  divider: {
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    opacity: 0.3,
    marginHorizontal: 16,
  },
  earningsWrapper: {
    padding: 16,
  },
  earningsContainer: {
    borderRadius: 16,
    padding: 16,
  },
  totalBalance: {
    marginBottom: 8,
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 14,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  allTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allTimeText: {
    color: "#10b981",
    fontSize: 14,
  },
  allTimePositive: {
    fontWeight: "bold",
  },
  allTimeLabel: {
    color: "#aaa",
    fontSize: 12,
  },
  sliderWrapper: {
    marginVertical: 16,
  },
  slider: {
    paddingHorizontal: 16,
  },
  walletCard: {
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  walletTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  walletBalance: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  walletEarnings: {
    color: "#10b981",
    fontSize: 14,
    marginTop: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1c4b",
    marginHorizontal: 16,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
  favCoinsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  favCoinsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  coinCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2d51",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
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
    backgroundColor: "#fff",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  coinName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  coinStats: {
    alignItems: "flex-end",
  },
  coinPrice: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  coinChange: {
    fontSize: 14,
    fontWeight: "bold",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
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
