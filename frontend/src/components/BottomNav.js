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
            <MaterialCommunityIcons name={iconName} size={30} color={isFocused ? '#0d1b3d' : '#ffffff'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0d1b3d',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tabWidth,
    height: 65,
  },
  indicator: {
    position: 'absolute',
    width: 54,
    height: 54,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    top: 17,
    left: (tabWidth - 54) / 2,
  },
});

export default BottomNav;