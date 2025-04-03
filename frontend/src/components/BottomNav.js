import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const tabWidth = screenWidth / 3;

const BottomNav = ({ state, navigation }) => {
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  }, [state.index]);

  return (
    <LinearGradient colors={["#0d1b3d", "#162f5b"]} style={styles.navbar}>
      <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]} />
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = route.name === 'Home' ? 'home' : route.name === 'Search' ? 'magnify' : 'wallet';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.navItem}
          >
            <MaterialCommunityIcons name={iconName} size={28} color={isFocused ? '#ffffff' : '#AAB7C4'} />
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10, // Было 14
    borderTopLeftRadius: 20, // Было 24
    borderTopRightRadius: 20, // Было 24
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10, // Было 12
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tabWidth,
    height: 55, // Было 65
  },
  indicator: {
    position: 'absolute',
    width: 50, // Было 60
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    bottom: 6, // Было 8
    left: (tabWidth - 50) / 2, // Уменьшено под новый размер
  },
});

export default BottomNav;
