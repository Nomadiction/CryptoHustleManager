import React, { useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, View, Text, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MAX_DRAG_DISTANCE = 120;
const THRESHOLD_RATIO = 0.9; // 90% от максимального смещения
const THRESHOLD = MAX_DRAG_DISTANCE * THRESHOLD_RATIO;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CryptoCard = ({ symbol, price, priceChangePercent, IconComponent, isFavorite: propFavorite, onToggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(propFavorite);

  // Анимация свайпа
  const translateX = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(1)).current;

  // Обновление состояния при изменении пропсов
  useEffect(() => {
    setIsFavorite(propFavorite);
  }, [propFavorite]);

  // Анимация вспышки звезды
  useEffect(() => {
    if (isFavorite) {
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
        })
      ]).start();
    }
  }, [isFavorite]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const dx = Math.max(0, gestureState.dx);
        const clamped = Math.min(dx, MAX_DRAG_DISTANCE);
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = Math.max(0, gestureState.dx);
        if (dx >= THRESHOLD) {
          setIsFavorite((prev) => {
            const newFavoriteState = !prev;

            Animated.sequence([
              Animated.timing(translateX, {
                toValue: MAX_DRAG_DISTANCE,
                duration: 150,
                useNativeDriver: true,
              }),
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
              Animated.delay(300),
              Animated.timing(translateX, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onToggleFavorite && onToggleFavorite(symbol, newFavoriteState);
            });

            return newFavoriteState; // Обновляем `isFavorite`
          });
        } else {
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
      {/* Фон со звездой */}
      <View style={styles.backLayer}>
        <Animated.View style={{ transform: [{ scale: starScale }] }}>
          <MaterialCommunityIcons
            name="star"
            size={24} // уменьшил размер звезды
            color={isFavorite ? "#fed702" : "#ccc"}
          />
        </Animated.View>
      </View>
      {/* Карточка, которая свайпается */}
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
    marginVertical: 5,
    marginHorizontal: 16,
    height: 70,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: "#0d1b3d",
  },
  backLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1f2d51",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 15,
    zIndex: 0,
  },
  frontLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
    justifyContent: "center",
    borderRadius: 15,
    paddingHorizontal: 10,
    backgroundColor: "#0d1b3d",
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  symbol: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    color: "#ffffff",
    fontSize: 14,
  },
  change: {
    fontSize: 14,
  },
  positive: {
    color: "#40c057",
  },
  negative: {
    color: "#e03131",
  },
});

export default CryptoCard;
