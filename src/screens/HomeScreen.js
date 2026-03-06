/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchHomeProducts } from '../services/api';
import { SECTION_TYPES } from '../constants/data';
import Header from '../components/Header';
import CategoryList from '../components/CategoryList';
import ProductSection from '../components/ProductSection';
import PromoBanner from '../components/PromoBanner';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { adminTokenReady } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminTokenReady) return;

    let mounted = true;
    (async () => {
      try {
        const data = await fetchHomeProducts();
        if (mounted && Array.isArray(data) && data.length > 0) {
          setSections(data);
        }
      } catch (e) {
        console.warn('Fetch home products failed:', e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [adminTokenReady]);

  const renderSection = (section, index) => {
    const { type, title, collections } = section;

    switch (type) {
      case SECTION_TYPES.CATEGORY:
        return (
          <CategoryList
            key={`category-${index}`}
            categories={collections}
            title={title}
          />
        );

      case SECTION_TYPES.LIST: {
        const products = (collections || []).map((p, i) => ({
          id: String(p.id || i),
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
        }));
        return (
          <ProductSection
            key={`list-${index}`}
            title={title}
            products={products}
          />
        );
      }

      case SECTION_TYPES.PROMO:
        return (
          <PromoBanner
            key={`promo-${index}`}
            promos={collections}
          />
        );

      case SECTION_TYPES.FOOTER: {
        const items = collections || [];
        return (
          <View key={`footer-${index}`} style={[styles.footer, { borderTopColor: theme.border }]}>
            <View style={styles.footerLogoContainer}>
              <Text style={[styles.footerLogoText, { color: theme.primary }]}>Aarudhra</Text>
              <Text style={[styles.footerLogoSub, { color: theme.primary }]}>MASALA</Text>
            </View>
            {items.map((text, i) => (
              <Text key={i} style={styles.footerText}>{text}</Text>
            ))}
          </View>
        );
      }

      case SECTION_TYPES.BANNER:
        // Banner type design deferred — skip for now
        return null;

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Header navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
              Loading...
            </Text>
          </View>
        ) : sections.length > 0 ? (
          (() => {
            const nonFooter = sections.filter((s) => s.type !== SECTION_TYPES.FOOTER);
            const footer = sections.find((s) => s.type === SECTION_TYPES.FOOTER);
            const ordered = footer ? [...nonFooter, footer] : nonFooter;
            return ordered.map(renderSection);
          })()
        ) : (
          <View style={styles.loaderContainer}>
            <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
              No content available
            </Text>
          </View>
        )}
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
  footerLogoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLogoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1.6, height: 0 },
    textShadowRadius: 0,
  },
  footerLogoSub: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0.6, height: 0 },
    textShadowRadius: 0,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
