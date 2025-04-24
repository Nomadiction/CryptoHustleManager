// frontend/components/BottomNav.js

import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
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
    <LinearGradient colors={["#e2e8f0", "#f9fafb"]} style={styles.navbar}>
      <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]} />
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName =
          route.name === 'Home'
            ? 'home'
            : route.name === 'Search'
            ? 'magnify'
            : 'wallet';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.navItem}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={28}
              color={isFocused ? '#1f2937' : '#64748b'}
            />
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
    backgroundColor: "#e2e8f0",
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tabWidth,
    height: 55,
  },
  indicator: {
    position: 'absolute',
    width: 50,
    height: 4,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    bottom: 6,
    left: (tabWidth - 50) / 2,
  },
});

export default BottomNav;
