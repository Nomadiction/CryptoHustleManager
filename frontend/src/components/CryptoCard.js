// frontend/components/CryptoCard.js

// frontend/components/CryptoCard.js

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_RADIUS = 18;
const CARD_HEIGHT = 76; // соответствует высоте карточки
const ACTION_WIDTH = SCREEN_WIDTH * 0.22;
const ACTION_HEIGHT = CARD_HEIGHT;

const SWIPE_THRESHOLD = 50;

const CryptoCard = ({
  item,
  index,
  onPress,
  onToggleFavorite,
  isFavorite,
  simultaneousHandlers,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const trashScale = useRef(new Animated.Value(1)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [starColor, setStarColor] = useState(isFavorite ? "#FACC15" : "#9CA3AF");

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

  useEffect(() => {
    setStarColor(isFavorite ? "#FACC15" : "#9CA3AF");
  }, [isFavorite]);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const triggerIconAnimation = (icon) => {
    const scaleAnim = icon === "star" ? starScale : trashScale;
    scaleAnim.setValue(0.8);
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    if (icon === "star") {
      setStarColor("#FACC15");
    }
  };

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;

      if (translationX > SWIPE_THRESHOLD) {
        if (!isFavorite) {
          onToggleFavorite(item.id, true);
          triggerIconAnimation("star");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsSwiped(false);
      } else if (translationX < -SWIPE_THRESHOLD) {
        if (isFavorite) {
          onToggleFavorite(item.id, false);
          triggerIconAnimation("trash");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsSwiped(true);
      } else {
        setIsSwiped(false);
      }

      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const changePct = parseFloat(item.priceChangePercent);
  const isPositive = !isNaN(changePct) && changePct >= 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.actionsLayer}>
        <View style={styles.hiddenBackground} />
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconBackground, { transform: [{ scale: starScale }] }]}>
            <Ionicons
              name="star"
              size={22}
              color={starColor}
            />
          </Animated.View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconBackground, { transform: [{ scale: trashScale }] }]}>
            <Ionicons
              name="trash"
              size={22}
              color={isFavorite && !isSwiped ? "#F43F5E" : "#9CA3AF"}
            />
          </Animated.View>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        simultaneousHandlers={simultaneousHandlers}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY }, { translateX }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.assetCard}
            onPress={() => onPress(item)}
            activeOpacity={1}
            accessibilityLabel={`View details for ${item.name}`}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.icon}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <ActivityIndicator size="small" color="#0000ff" />}
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
                  {!isNaN(changePct)
                    ? `${isPositive ? "+" : ""}${changePct.toFixed(2)}%`
                    : "N/A"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default React.memo(
  CryptoCard,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.current_price === next.item.current_price &&
    prev.item.priceChangePercent === next.item.priceChangePercent &&
    prev.isFavorite === next.isFavorite &&
    prev.index === next.index
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 8,
    width: "98%",
    alignSelf: "center",
  },
  actionsLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  hiddenBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#e2e8f0",
    borderRadius: CARD_RADIUS,
  },
  iconWrapper: {
    width: ACTION_WIDTH,
    height: ACTION_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    backgroundColor: "white",
    borderRadius: CARD_RADIUS,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    height: CARD_HEIGHT,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  assetSymbol: {
    fontSize: 12,
    color: "#6B7280",
  },
  coinStats: {
    alignItems: "flex-end",
  },
  coinPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  coinChangeContainer: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coinChangeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  positiveBg: {
    backgroundColor: "#DCFCE7",
  },
  negativeBg: {
    backgroundColor: "#FEE2E2",
  },
  positiveText: {
    color: "#16A34A",
  },
  negativeText: {
    color: "#DC2626",
  },
});
