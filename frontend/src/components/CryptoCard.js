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
    setTimeout(() => {
      swipeableRef.current?.close();
    }, 200);
  };

  const handleLeftSwipe = () => {
    onToggleFavorite(item.id, false);
    setTimeout(() => {
      swipeableRef.current?.close();
    }, 200);
  };

  const handleCardPress = () => {
    swipeableRef.current?.close();
    onPress(item);
  };

  const changePercent = parseFloat(item.priceChangePercent);
  const isPositive = !isNaN(changePercent) && changePercent >= 0;

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
      renderLeftActions={isFavorite ? renderLeftActions : undefined}
      onSwipeableRightOpen={handleRightSwipe}
      onSwipeableLeftOpen={handleLeftSwipe}
      friction={2}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateY }],
        }}
      >
        <TouchableOpacity
          style={styles.assetCard}
          onPress={handleCardPress}
          activeOpacity={0.85}
        >
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
              {typeof item.current_price === "number"
                ? item.current_price < 0.01
                  ? item.current_price.toFixed(6)
                  : item.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })
                : "N/A"}
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
                {!isNaN(changePercent)
                  ? `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

export default React.memo(CryptoCard, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.current_price === next.item.current_price &&
    prev.item.priceChangePercent === next.item.priceChangePercent &&
    prev.isFavorite === next.isFavorite &&
    prev.index === next.index
  );
});

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
