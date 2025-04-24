// frontend/navigation/SearchStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../screens/SearchScreen';
import CoinDetailScreen from '../screens/CoinDetailScreen'; 

const Stack = createNativeStackNavigator();

const SearchStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CoinDetail" 
        component={CoinDetailScreen} 
        options={{ title: 'Coin Details' }}  
      />
    </Stack.Navigator>
  );
}

export default SearchStack;