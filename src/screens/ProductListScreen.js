/**
 * Created by: Kanagaraj P
 * Created on: 07-03-2026
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { fetchProductsByCode, fetchByProductCategory } from '../services/api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { SIZES } from '../constants/theme';

const GAP = 20;

export default function ProductListScreen({ navigation, route }) {
  const { title, typecode, categoryName } = route.params || {};
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerWidth = Platform.OS === 'web' && screenWidth > SIZES.maxWidth
    ? SIZES.maxWidth
    : screenWidth;
  const columns = containerWidth >= 768 ? 4 : 2;
  const availableWidth = containerWidth - SIZES.padding * 2;
  const cardWidth = (availableWidth - GAP * (columns - 1)) / columns;

  useEffect(() => {
    if (!typecode && !categoryName) return;
    let mounted = true;
    (async () => {
      try {
        const data = categoryName
          ? await fetchByProductCategory(categoryName)
          : await fetchProductsByCode(typecode);
        if (mounted && Array.isArray(data)) {
          setProducts(
            data.map((p, i) => ({
              id: String(p.id || i),
              productId: p.id,
              name: p.productname || '',
              weight: '',
              price: p.offerprice || p.productprice || 0,
              originalPrice: p.productprice || 0,
              rating: 4.5,
              reviews: 0,
              image: p.producturl || '',
              category: p.productcategory || '',
              badge: null,
              productcode: p.productcode || '',
            }))
          );
        }
      } catch (e) {
        console.warn('[ProductList] Fetch failed:', e.message);
        if (mounted) setError('Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [typecode, categoryName]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header navigation={navigation} showBack />
      <Breadcrumb
        crumbs={[
          { label: 'Home', screen: 'Main' },
          { label: title || 'Products' },
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No products found
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((item) => (
              <View key={item.id} style={{ width: cardWidth }}>
                <ProductCard
                  product={item}
                  onPress={() => item.productId && navigation.navigate('ProductDetail', { productId: item.productId, categoryName: title, categoryTypecode: typecode })}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: GAP,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
