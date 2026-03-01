/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchProducts } from '../services/api';
import { FEATURED_PRODUCTS, BEST_SELLERS } from '../constants/data';
import Header from '../components/Header';
import BannerCarousel from '../components/BannerCarousel';
import CategoryList from '../components/CategoryList';
import ProductSection from '../components/ProductSection';
import PromoBanner from '../components/PromoBanner';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { adminTokenReady } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminTokenReady) return;

    let mounted = true;
    (async () => {
      try {
        const data = await fetchProducts();
        if (mounted && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => ({
            id: String(p.id),
            name: p.productname,
            weight: '',
            price: p.productprice,
            originalPrice: p.productprice,
            rating: 4.5,
            reviews: 0,
            image: p.producturl,
            category: p.productcategory || '',
            badge: null,
          }));
          setProducts(mapped);
        }
      } catch (e) {
        console.warn('Fetch products failed:', e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [adminTokenReady]);

  // Use API products if available, otherwise fallback to dummy data
  const displayProducts = products.length > 0 ? products : FEATURED_PRODUCTS;
  const displayBestSellers = products.length > 0 ? products : BEST_SELLERS;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Header navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <BannerCarousel />
        <CategoryList />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
              Loading products...
            </Text>
          </View>
        ) : (
          <>
            <ProductSection title="Featured Products" products={displayProducts} />
            <PromoBanner />
            <ProductSection title="Best Sellers" products={displayBestSellers} />
          </>
        )}

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerLogo, { color: theme.primary }]}>Aarudhra Masala</Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Pure & Traditional Spices
          </Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Quality you can taste, purity you can trust.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    marginTop: 2,
  },
});
