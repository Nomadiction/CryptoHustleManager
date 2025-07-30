// frontend/components/PortfolioStats.js

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

const PortfolioStats = ({ 
  totalValue, 
  totalChange, 
  totalChangePercent, 
  onPress,
  period = '24h'
}) => {
  const valueAnim = useRef(new Animated.Value(0)).current;
  const changeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(valueAnim, {
        toValue: totalValue,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(changeAnim, {
        toValue: totalChange,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [totalValue, totalChange]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress && onPress();
  };

  const isPositive = totalChangePercent >= 0;
  const [displayedValue, setDisplayedValue] = React.useState(0);
  const [displayedChange, setDisplayedChange] = React.useState(0);

  useEffect(() => {
    const valueListener = valueAnim.addListener(({ value }) => {
      setDisplayedValue(value);
    });
    const changeListener = changeAnim.addListener(({ value }) => {
      setDisplayedChange(value);
    });

    return () => {
      valueAnim.removeListener(valueListener);
      changeAnim.removeListener(changeListener);
    };
  }, []);

  const getPeriodLabel = () => {
    switch (period) {
      case '1h': return '1 час';
      case '24h': return '24 часа';
      case '7d': return '7 дней';
      case '30d': return '30 дней';
      case '1y': return '1 год';
      default: return '24 часа';
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={isPositive ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
          style={styles.card}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <MaterialIcons 
                name="trending-up" 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.title}>Портфель</Text>
            </View>
            <View style={styles.periodBadge}>
              <Text style={styles.periodText}>{getPeriodLabel()}</Text>
            </View>
          </View>

          <View style={styles.valueContainer}>
            <Text style={styles.valueLabel}>Общая стоимость</Text>
            <Text style={styles.value}>
              ${displayedValue.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </Text>
          </View>

          <View style={styles.changeContainer}>
            <View style={styles.changeInfo}>
              <MaterialIcons 
                name={isPositive ? "trending-up" : "trending-down"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.changeValue}>
                {isPositive ? '+' : ''}${displayedChange.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </Text>
              <Text style={styles.changePercent}>
                ({isPositive ? '+' : ''}{totalChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Активы</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Прибыль</Text>
              <Text style={[styles.statValue, isPositive ? styles.positiveText : styles.negativeText]}>
                {isPositive ? '+' : ''}{totalChangePercent.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Волатильность</Text>
              <Text style={styles.statValue}>Средняя</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  periodBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  valueContainer: {
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  changeContainer: {
    marginBottom: 20,
  },
  changeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  changePercent: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  positiveText: {
    color: '#10b981',
  },
  negativeText: {
    color: '#ef4444',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default PortfolioStats; 