// frontend/src/navigation/SearchStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../screens/SearchScreen';
import CoinDetailScreen from '../screens/CoinDetailScreen'; 

// Создаем стековый навигатор для управления переходами между экранами
const Stack = createNativeStackNavigator();

// Определяем компонент SearchStack, который будет содержать стек навигации
const SearchStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SearchScreen" 
        component={SearchScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CoinDetail" 
        component={CoinDetailScreen} 
        options={{ headerShown: false }}  
      />
    </Stack.Navigator>
  );
}

// Экспортируем компонент SearchStack для использования в других частях приложения
export default SearchStack;