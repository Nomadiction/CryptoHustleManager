import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PortfolioScreen from '../screens/PortfolioScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';

const Stack = createNativeStackNavigator();

const PortfolioStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PortfolioMain"
        component={PortfolioScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AssetDetails"
        component={AssetDetailScreen} 
      />
    </Stack.Navigator>
  );
};

export default PortfolioStack;
