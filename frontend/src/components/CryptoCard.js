import React, { useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, View, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_DRAG_DISTANCE = 120; // максимальное смещение карточки вправо
const THRESHOLD_RATIO = 0.9;    // порог срабатывания свайпа (90% от MAX_DRAG_DISTANCE)
const THRESHOLD = MAX_DRAG_DISTANCE * THRESHOLD_RATIO;

const CryptoCard = ({ symbol, price, priceChangePercent, IconComponent, isFavorite: propFavorite, onToggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(propFavorite);
  const translateX = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(1)).current;

  // Синхронизируем локальное состояние с пропсами
  useEffect(() => {
    setIsFavorite(propFavorite);
  }, [propFavorite]);

  // При изменении состояния (переключении избранного) запускаем анимацию звезды
  useEffect(() => {
    Animated.sequence([
      Animated.timing(starScale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(starScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFavorite, starScale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Разрешаем свайп только вправо
        const dx = Math.max(0, gestureState.dx);
        const clamped = Math.min(dx, MAX_DRAG_DISTANCE);
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = Math.max(0, gestureState.dx);
        if (dx >= THRESHOLD) {
          // Если свайп достаточный – анимируем смещение карточки вправо и возвращаем её,
          // затем переключаем избранное
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: MAX_DRAG_DISTANCE,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            const newFavoriteState = !isFavorite;
            setIsFavorite(newFavoriteState);
            onToggleFavorite && onToggleFavorite(symbol, newFavoriteState);
          });
        } else {
          // Если свайп недостаточный, возвращаем карточку в исходное положение
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.cardContainer}>
      {/* Фиксированная звезда, расположенная слева. В исходном состоянии она полностью покрывается верхней частью карточки */}
      <View style={styles.starContainer}>
        <Animated.View style={{ transform: [{ scale: starScale }] }}>
          <MaterialCommunityIcons
            name="star"
            size={28}
            color={isFavorite ? "#fed702" : "#ccc"}
          />
        </Animated.View>
      </View>
      {/* Свайповая часть карточки, которая в исходном положении закрывает звезду */}
      <Animated.View style={[styles.frontLayer, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <View style={styles.innerContent}>
          <View style={styles.iconContainer}>
            {IconComponent ? <IconComponent width={40} height={40} /> : null}
          </View>
          <View style={styles.info}>
            <Text style={styles.symbol}>{symbol.toUpperCase()}</Text>
            <Text style={styles.price}>{price ? `$${price.toFixed(2)}` : "N/A"}</Text>
            <Text style={[styles.change, priceChangePercent >= 0 ? styles.positive : styles.negative]}>
              {priceChangePercent !== undefined ? `${priceChangePercent.toFixed(2)}%` : "N/A"}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    marginHorizontal: 16,
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: "#1a2a4e",
    elevation: 5, // shadow effect for iOS
    shadowColor: "#000", // shadow effect for iOS
    shadowOffset: { width: 0, height: 4 }, // shadow direction
    shadowOpacity: 0.1, // shadow opacity
    shadowRadius: 6, // shadow blur radius
  },
  starContainer: {
    position: 'absolute',
    left: 15,  // Adjusted positioning for better visual balance
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 0,  // placed below the front layer
  },
  frontLayer: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    backgroundColor: "#1a2a4e",
    zIndex: 1, // placed above the star
    borderRadius: 15, // rounded corners for the front layer
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12, // added padding for better content alignment
  },
  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22.5, // circular icon container for better look
    backgroundColor: "#2c3e50", // dark background for the icon
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  symbol: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
  change: {
    fontSize: 14,
    marginTop: 5,
  },
  positive: {
    color: "#40c057",
  },
  negative: {
    color: "#e03131",
  },
});

export default CryptoCard;
