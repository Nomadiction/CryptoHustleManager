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
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { LayoutAnimation, Platform, UIManager } from "react-native";

// Получаем размеры экрана для адаптивного дизайна
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Константы для настройки размеров карточки и анимации
const CARD_RADIUS = 3;
const CARD_HEIGHT = 76;
const ACTION_WIDTH = SCREEN_WIDTH * 0.22;
const ACTION_HEIGHT = CARD_HEIGHT;

const SWIPE_THRESHOLD = 50;

// Пороговое значение для определения свайпа

// Проверка платформы и включение анимации для Android, если это необходимо
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Пропсы компонента CryptoCard, которые позволяют настраивать его поведение и внешний вид
const CryptoCard = ({
  item,
  index,
  onPress,
  onToggleFavorite,
  isFavorite,
  simultaneousHandlers,
  onMoveUp,
  onMoveDown,
}) => {
  // Анимационные переменные и состояния для управления анимациями и состоянием компонента
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const trashScale = useRef(new Animated.Value(1)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [starColor, setStarColor] = useState(isFavorite ? "#FACC15" : "#9CA3AF");
  const coinStatsTranslateX = useRef(new Animated.Value(0)).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0)).current;

  // Эффект для анимации появления карточки при монтировании, настраиваем задержку и продолжительность
  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 40),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index]);

  // Эффект для изменения цвета звезды в зависимости от статуса избранного, настраиваем цвет
  useEffect(() => {
    setStarColor(isFavorite ? "#FACC15" : "#9CA3AF");
  }, [isFavorite]);

  // Эффект для анимации изменения состояния избранного, настраиваем параметры анимации
  useEffect(() => {
    Animated.parallel([
      Animated.spring(coinStatsTranslateX, {
        toValue: isFavorite ? -7 : 0,
        stiffness: 100,
        damping: 8,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(starOpacity, {
        toValue: isFavorite ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        useNativeDriver: true,
      }),
      Animated.timing(arrowOpacity, {
        toValue: isFavorite ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFavorite]);

  // Обработчик событий жестов для управления анимацией свайпа, настраиваем использование драйвера
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // Функция для анимации иконок при взаимодействии, настраиваем параметры анимации
  const triggerIconAnimation = (icon) => {
    const scaleAnim = icon === "star" ? starScale : trashScale;
    scaleAnim.setValue(0.8);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();

    if (icon === "star") {
      setStarColor("#FACC15");
    }
  };

  // Обработчик изменения состояния жестов для управления логикой свайпа, настраиваем анимацию возврата
  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;

      if (translationX > SWIPE_THRESHOLD) {
        if (!isFavorite) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggleFavorite(item.id, true);
          triggerIconAnimation("star");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setIsSwiped(false);
      } else if (translationX < -SWIPE_THRESHOLD) {
        if (isFavorite) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  // Определяем изменение процента и его знак для отображения, настраиваем форматирование
  const changePct = parseFloat(item.priceChangePercent);
  const isPositive = !isNaN(changePct) && changePct >= 0;

  // Возвращаем JSX разметку компонента, включая анимации и стили, настраиваем внешний вид
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.actionsLayer}>
        <View style={styles.hiddenBackground} />
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconBackground, { transform: [{ scale: starScale }] }]}>
            <Ionicons name="star" size={22} color={starColor} />
          </Animated.View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconBackground, { transform: [{ scale: trashScale }] }]}>
            <Ionicons name="trash" size={22} color={isFavorite && !isSwiped ? "#F43F5E" : "#9CA3AF"} />
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
          <View style={styles.assetCard}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              onPress={() => onPress(item)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.icon}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <ActivityIndicator size="small" color="#0000ff" />}
              <View style={{ flex: 1 }}>
                <Text style={styles.assetName}>{item.name}</Text>
                <Text style={styles.assetSymbol}>{item.symbol.toUpperCase()}</Text>
              </View>
              <Animated.View
                style={[
                  styles.coinStats,
                  isFavorite && styles.coinStatsWithStar,
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
              </Animated.View>
            </TouchableOpacity>
            {isFavorite && (
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  onPress={() => onToggleFavorite(item.id, !isFavorite)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.pinButton}
                >
                  <MaterialCommunityIcons
                    name="pin"
                    size={18}
                    color="#6B7280"
                    style={{ transform: [{ rotate: '45deg' }] }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMoveUp(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.moveButton}>
                  <Ionicons name="arrow-up" size={18} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMoveDown(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.moveButton}>
                  <Ionicons name="arrow-down" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

// Экспортируем компонент с оптимизацией рендеринга для предотвращения лишних перерисовок
export default React.memo(
  CryptoCard,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.current_price === next.item.current_price &&
    prev.item.priceChangePercent === next.item.priceChangePercent &&
    prev.isFavorite === next.isFavorite &&
    prev.index === next.index
);

// Стили для компонента, включая стили для анимаций и различных состояний
const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 8,
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
    backgroundColor: "#F3F4F6",
  },
  hiddenBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F3F4F6",
  },
  iconWrapper: {
    width: ACTION_WIDTH,
    height: ACTION_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBackground: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 12,
  },
  cardWrapper: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: CARD_RADIUS,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: CARD_HEIGHT,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  assetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  assetSymbol: {
    fontSize: 13,
    color: "#6B7280",
  },
  coinStats: {
    alignItems: "flex-end",
  },
  coinPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  coinChangeContainer: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  positiveBg: {
    backgroundColor: "#DCFCE7",
  },
  negativeBg: {
    backgroundColor: "#FEE2E2",
  },
  coinChangeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  positiveText: {
    color: "#16A34A",
  },
  negativeText: {
    color: "#DC2626",
  },
  starOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 10,
  },
  coinStatsWithStar: {
    marginRight: 30,
  },
  pinButton: {
    bottom: 4,
  },
  actionIcons: {
    position: "absolute",
    right: 10,
    top: 10,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },  
});