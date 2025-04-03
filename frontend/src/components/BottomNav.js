import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;
const tabWidth = screenWidth / 3;

const BottomNav = ({ state, navigation }) => {
  const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      speed: 12,
      bounciness: 10,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.navbar}>
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
            <MaterialCommunityIcons name={iconName} size={28} color={isFocused ? '#ffffff' : '#AAB3CF'} />
          </TouchableOpacity>
        );
      })}
    </View>
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
    backgroundColor: '#0d1b3d',
    paddingVertical: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tabWidth,
    height: 56,
  },
  indicator: {
    position: 'absolute',
    width: 50,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    bottom: 8,
    left: (tabWidth - 50) / 2,
  },
});

export default BottomNav;
