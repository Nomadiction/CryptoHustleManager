// frontend/src/components/CryptoCard.js

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
import { Ionicons } from '@expo/vector-icons';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { LayoutAnimation, Platform, UIManager } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_RADIUS = 16;
const CARD_HEIGHT = 88;
const ACTION_WIDTH = SCREEN_WIDTH * 0.22;
const ACTION_HEIGHT = CARD_HEIGHT;

const SWIPE_THRESHOLD = 60;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CryptoCard = ({
  item,
  index,
  onPress,
  onToggleFavorite,
  isFavorite,
  simultaneousHandlers,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const trashScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [localFavoriteState, setLocalFavoriteState] = useState(isFavorite);
  const coinStatsTranslateX = useRef(new Animated.Value(0)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 80),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index]);

  useEffect(() => {
    setLocalFavoriteState(isFavorite);
  }, [isFavorite]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(coinStatsTranslateX, {
        toValue: localFavoriteState ? -8 : 0,
        stiffness: 100,
        damping: 8,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(starOpacity, {
        toValue: localFavoriteState ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [localFavoriteState]);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const triggerIconAnimation = (icon) => {
    const scaleAnim = icon === "star" ? starScale : trashScale;
    scaleAnim.setValue(0.6);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;

      if (translationX > SWIPE_THRESHOLD) {
        if (!localFavoriteState) {
          setLocalFavoriteState(true); // Мгновенно обновляем локальное состояние
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggleFavorite(item.id, true);
          triggerIconAnimation("star");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsSwiped(false);
      } else if (translationX < -SWIPE_THRESHOLD) {
        if (localFavoriteState) {
          setLocalFavoriteState(false); // Мгновенно обновляем локальное состояние
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggleFavorite(item.id, false);
          triggerIconAnimation("trash");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsSwiped(false);
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

  const handleCardPress = () => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress && onPress(item);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  const getFallbackIcon = () => {
    const symbol = item.symbol?.toUpperCase() || '?';
    return symbol.charAt(0);
  };

  const changePct = parseFloat(item.priceChangePercent);
  const isPositive = !isNaN(changePct) && changePct >= 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.actionsLayer}>
        <View style={styles.hiddenBackground} />
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconBackground, { transform: [{ scale: starScale }] }]}>
            <Ionicons name="star" size={28} color={localFavoriteState ? "#FACC15" : "#9CA3AF"} />
          </Animated.View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconBackground, { transform: [{ scale: trashScale }] }]}>
            <Ionicons name="trash" size={28} color={localFavoriteState ? "#F43F5E" : "#9CA3AF"} />
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
              transform: [
                { translateY }, 
                { translateX },
                { scale: cardScale }
              ],
            },
          ]}
        >
          <View style={styles.assetCard}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              onPress={handleCardPress}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <View style={styles.imageBackground}>
                  {!imageError ? (
                    <Image
                      source={{ 
                        uri: item.image,
                        headers: {
                          'Accept': 'image/webp,image/png,image/jpeg,image/gif,image/svg+xml,*/*'
                        }
                      }}
                      style={styles.icon}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : (
                    <View style={styles.fallbackContainer}>
                      <Text style={styles.fallbackText}>{getFallbackIcon()}</Text>
                    </View>
                  )}
                  {!imageLoaded && !imageError && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#10b981" />
                    </View>
                  )}
                </View>
              </View>
              <View style={{ 
                flex: 1, 
                justifyContent: 'flex-start', 
                paddingRight: 12,
                paddingTop: localFavoriteState ? 8 : 4,
                paddingBottom: 8
              }}>
                <Text style={styles.assetName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                <Text style={styles.assetSymbol} numberOfLines={1} ellipsizeMode="tail">{item.symbol.toUpperCase()}</Text>
                {localFavoriteState && (
                  <Animated.View style={[styles.favoriteIndicator, { opacity: starOpacity }]}>
                    <View style={styles.favoriteBadge}>
                      <Ionicons name="star" size={9} color="#F59E0B" />
                      <Text style={styles.favoriteText}>Favorite</Text>
                    </View>
                  </Animated.View>
                )}
              </View>
              <Animated.View
                style={[
                  styles.coinStats,
                  localFavoriteState && styles.coinStatsWithStar,
                  { transform: [{ translateX: coinStatsTranslateX }] },
                ]}
              >
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
                    { backgroundColor: isPositive ? '#22c55e' : '#ef4444' }
                  ]}
                >
                  <Ionicons 
                    name={isPositive ? "trending-up" : "trending-down"} 
                    size={12} 
                    color="#ffffff" 
                  />
                  <Text
                    style={[
                      styles.coinChangeText,
                      { color: "#ffffff" }
                    ]}
                  >
                    {!isNaN(changePct)
                      ? `${isPositive ? "+" : ""}${changePct.toFixed(2)}%`
                      : "N/A"}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
    width: "100%",
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
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: CARD_RADIUS,
  },
  iconWrapper: {
    width: ACTION_WIDTH,
    height: ACTION_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBackground: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  cardWrapper: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: CARD_RADIUS,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    height: CARD_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#1e293b',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  imageBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: '#334155',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fallbackContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  assetSymbol: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  favoriteIndicator: {
    marginTop: 2,
  },
  favoriteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    backgroundColor: '#fef3c7',
    maxWidth: '90%',
    marginBottom: 2,
  },
  favoriteText: {
    fontSize: 10,
    color: '#F59E0B',
    marginLeft: 3,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  coinStats: {
    alignItems: "flex-end",
    minWidth: 85,
    paddingLeft: 12,
  },
  coinPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
    letterSpacing: 0.2,
    textAlign: 'right',
  },
  coinChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  coinChangeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  coinStatsWithStar: {
    marginRight: 0,
  },
});