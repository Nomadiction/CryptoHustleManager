import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

const CryptoCard = ({
  item,
  index,
  onPress,
  onToggleFavorite,
  isFavorite,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const swipeableRef = useRef(null);

  useEffect(() => {
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
  }, [index]);

  const handleRightSwipe = () => {
    onToggleFavorite(item.id, true);
    swipeableRef.current?.close();
  };

  const handleLeftSwipe = () => {
    onToggleFavorite(item.id, false);
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
      <Text style={styles.swipeText}>Pin</Text>
    </View>
  );

  const renderLeftActions = () =>
    isFavorite ? (
      <View style={styles.leftAction}>
        <Ionicons name="trash-outline" size={28} color="#ef4444" />
        <Text style={styles.swipeText}>Delete</Text>
      </View>
    ) : null;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableRightOpen={handleRightSwipe}
      onSwipeableLeftOpen={handleLeftSwipe}
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
            <Text style={styles.assetSymbol}>
              {item.symbol.toUpperCase()}
            </Text>
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
};

export default React.memo(CryptoCard);

const styles = StyleSheet.create({
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
});
