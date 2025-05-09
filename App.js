// App.js

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './frontend/src/screens/HomeScreen';
import SearchStack from './frontend/src/navigation/SearchStack';
import PortfolioStack from './frontend/src/navigation/PortfolioStack';
import BottomNav from './frontend/src/components/BottomNav';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator 
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <BottomNav {...props} />}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchStack} />
            <Tab.Screen name="Portfolio" component={PortfolioStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
