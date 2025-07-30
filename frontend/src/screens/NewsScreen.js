// frontend/screens/NewsScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import NewsCard from '../components/NewsCard';

// Моковые данные новостей
const mockNewsData = [
  {
    id: '1',
    title: 'Bitcoin достиг нового максимума в 2024 году',
    excerpt: 'Крупнейшая криптовалюта по рыночной капитализации показала впечатляющий рост, достигнув новых высот благодаря институциональному интересу и принятию регуляторами.',
    category: 'Bitcoin',
    source: 'CoinDesk',
    sourceLogo: 'https://via.placeholder.com/40x40',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Ethereum 2.0: Обновление сети приближается',
    excerpt: 'Сообщество Ethereum с нетерпением ждет масштабного обновления, которое обещает улучшить масштабируемость и снизить комиссии за транзакции.',
    category: 'Ethereum',
    source: 'CryptoNews',
    sourceLogo: 'https://via.placeholder.com/40x40',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'DeFi протоколы показывают рекордную активность',
    excerpt: 'Децентрализованные финансы продолжают набирать популярность, с рекордными объемами торгов и новыми инновационными протоколами.',
    category: 'DeFi',
    source: 'DeFi Pulse',
    sourceLogo: 'https://via.placeholder.com/40x40',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'NFT рынок демонстрирует устойчивый рост',
    excerpt: 'Несмотря на волатильность крипторынка, сектор NFT показывает стабильный рост с новыми проектами и коллекциями.',
    category: 'NFT',
    source: 'NFT Now',
    sourceLogo: 'https://via.placeholder.com/40x40',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Крупные банки инвестируют в криптоактивы',
    excerpt: 'Традиционные финансовые институты все чаще обращают внимание на цифровые активы, что свидетельствует о растущем принятии криптовалют.',
    category: 'Bitcoin',
    source: 'Bloomberg',
    sourceLogo: 'https://via.placeholder.com/40x40',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const categories = [
  { id: 'all', name: 'Все', icon: 'newspaper' },
  { id: 'Bitcoin', name: 'Bitcoin', icon: 'currency-btc' },
  { id: 'Ethereum', name: 'Ethereum', icon: 'ethereum' },
  { id: 'DeFi', name: 'DeFi', icon: 'bank' },
  { id: 'NFT', name: 'NFT', icon: 'image' },
];

const NewsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState(mockNewsData);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filteredNews = selectedCategory === 'all' 
    ? newsData 
    : newsData.filter(news => news.category === selectedCategory);

  const handleCategoryPress = (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  };

  const handleNewsPress = (news) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Здесь можно добавить навигацию к детальному экрану новости
    console.log('News pressed:', news.title);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Имитация загрузки новых данных
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderCategoryItem = ({ item, index }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.categoryItemSelected
        ]}
        onPress={() => handleCategoryPress(item.id)}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={isSelected ? '#fff' : '#94a3b8'}
        />
        <Text style={[
          styles.categoryText,
          isSelected && styles.categoryTextSelected
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderNewsItem = ({ item, index }) => (
    <NewsCard
      news={item}
      index={index}
      onPress={handleNewsPress}
      isFirst={index === 0}
    />
  );

  const renderHeader = () => (
    <Animated.View style={[
      styles.header,
      {
        opacity: headerAnim,
        transform: [{
          translateY: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          })
        }]
      }
    ]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Новости</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <MaterialIcons name="search" size={24} color="#f8fafc" />
        </TouchableOpacity>
      </View>
      
      <Animated.View style={[
        styles.categoriesContainer,
        {
          opacity: categoryAnim,
          transform: [{
            translateY: categoryAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }
      ]}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </Animated.View>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10b981"
              colors={["#10b981"]}
            />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  searchButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginLeft: 8,
  },
  categoryTextSelected: {
    color: '#fff',
  },
});

export default NewsScreen; 