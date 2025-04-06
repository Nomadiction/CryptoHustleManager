import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './frontend/src/screens/HomeScreen';
import SearchScreen from './frontend/src/screens/SearchScreen';
import PortfolioStack from './frontend/src/navigation/PortfolioStack'; 
import BottomNav from './frontend/src/components/BottomNav';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator tabBar={(props) => <BottomNav {...props} />}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Portfolio" component={PortfolioStack} /> 
      </Tab.Navigator>
    </NavigationContainer>
  );
}
