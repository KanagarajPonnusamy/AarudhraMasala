/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import CachedImage from '../components/CachedImage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchHomeProducts } from '../services/api';
import { SECTION_TYPES } from '../constants/data';
import { SIZES } from '../constants/theme';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import CategoryList from '../components/CategoryList';
import ProductSection from '../components/ProductSection';
import PromoBanner from '../components/PromoBanner';
import BannerSection from '../components/BannerSection';
import HtmlText from '../components/HtmlText';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { adminTokenReady } = useAuth();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef(null);

  // Extract all products from list sections for local search
  const allProducts = useMemo(() => {
    const products = [];
    sections.forEach((section, sIdx) => {
      if (section?.type === SECTION_TYPES.LIST && Array.isArray(section.collections)) {
        section.collections.forEach((p, i) => {
          if (!p || typeof p !== 'object') return;
          products.push({
            id: `${sIdx}-${p.id || i}`,
            productId: p.id,
            name: p.productname || '',
            weight: '',
            price: p.offerprice || p.productprice || 0,
            originalPrice: p.productprice || 0,
            image: p.producturl || '',
            category: p.productcategory || '',
            productcode: p.productcode || '',
          });
        });
      }
    });
    return products;
  }, [sections]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.productcode.toLowerCase().includes(q)
    );
  }, [query, allProducts]);

  const openSearch = () => {
    setSearchVisible(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setSearchVisible(false);
    setQuery('');
    Keyboard.dismiss();
  };

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchHomeProducts();
      if (Array.isArray(data) && data.length > 0) {
        setSections(data);
      }
    } catch (e) {
      console.warn('Refresh home products failed:', e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const orderedSections = useMemo(() => {
    const nonFooter = sections.filter((s) => s.type !== SECTION_TYPES.FOOTER);
    const footers = sections.filter((s) => s.type === SECTION_TYPES.FOOTER);
    return [...nonFooter, ...footers];
  }, [sections]);

  const renderSearchItem = useCallback(({ item }) => {
    const inCart = isInCart(item.id);
    return (
      <View style={[styles.searchItem, { borderBottomColor: theme.border }]}>
        {item.image ? (
          <CachedImage source={{ uri: item.image }} style={styles.searchItemImage} />
        ) : (
          <View style={[styles.searchItemImage, { backgroundColor: theme.inputBg }]} />
        )}
        <View style={styles.searchItemInfo}>
          <Text style={[styles.searchItemName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.category ? (
            <Text style={[styles.searchItemCategory, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.category}
            </Text>
          ) : null}
          <Text style={[styles.searchItemPrice, { color: theme.primary }]}>
            ₹{item.price}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.searchCartBtn,
            { backgroundColor: inCart ? theme.badge : theme.primary },
          ]}
          onPress={() => inCart ? removeFromCart(item.id) : addToCart(item)}
        >
          <Feather name={inCart ? 'check' : 'plus'} size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }, [theme, isInCart, addToCart, removeFromCart]);

  const renderSection = (section, index) => {
    try {
      if (!section || typeof section !== 'object') return null;
      const { type, title, typecode, collections } = section;
      const safeCollections = Array.isArray(collections) ? collections : [];

      switch (type) {
        case SECTION_TYPES.CATEGORY:
          if (!safeCollections.length) return null;
          return (
            <CategoryList
              key={`category-${index}`}
              categories={safeCollections}
              title={title}
            />
          );

        case SECTION_TYPES.LIST: {
          if (!safeCollections.length) return null;
          const products = safeCollections.map((p, i) => ({
            id: `${index}-${p?.id || i}`,
            productId: p?.id,
            name: p?.productname || '',
            weight: '',
            price: p?.offerprice || p?.productprice || 0,
            originalPrice: p?.productprice || 0,
            rating: 4.5,
            reviews: 0,
            image: p?.producturl || '',
            category: p?.productcategory || '',
            badge: null,
            productcode: p?.productcode || '',
          }));
          return (
            <ProductSection
              key={`list-${index}`}
              title={title}
              products={products}
              typecode={typecode}
            />
          );
        }

        case SECTION_TYPES.PROMO:
          return (
            <PromoBanner
              key={`promo-${index}`}
              promos={safeCollections}
            />
          );

        case SECTION_TYPES.FOOTER: {
          return (
            <View key={`footer-${index}`} style={[styles.footer, { borderTopColor: theme.border }]}>
              <View style={styles.footerLogoContainer}>
                <Text style={[styles.footerLogoText, { color: theme.primary }]}>Aarudhra</Text>
                <Text style={[styles.footerLogoSub, { color: theme.primary }]}>MASALA</Text>
              </View>
              {safeCollections.map((item, i) => {
                const text = typeof item === 'string' ? item : String(item?.pageval ?? '');
                if (!text) return null;
                return (
                  <HtmlText key={item?.id || i} text={text} style={styles.footerText} color="#999" />
                );
              })}
            </View>
          );
        }

        case SECTION_TYPES.BANNER:
          return (
            <BannerSection
              key={`banner-${index}`}
              banners={safeCollections}
            />
          );

        default:
          return null;
      }
    } catch (e) {
      console.warn('Failed to render section:', e.message);
      return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Header navigation={navigation} onSearchPress={openSearch} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />
        }
      >
        <View style={isWeb ? [styles.webContentWrapper, { maxWidth: SIZES.maxWidth }] : undefined}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
                Loading...
              </Text>
            </View>
          ) : orderedSections.length > 0 ? (
            orderedSections.map(renderSection)
          ) : (
            <View style={styles.loaderContainer}>
              <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
                No content available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Search Overlay — sits below the header */}
      {searchVisible && (
        <View style={styles.searchOverlay}>
          {/* Tappable transparent backdrop — body area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeSearch}
            style={[styles.searchBackdrop, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.7)' }]}
          />

          {/* Search content on top of backdrop */}
          <View style={styles.searchContent}>
            {/* Opaque top area (notch + search bar) */}
            <View style={[styles.searchTopArea, { paddingTop: insets.top, backgroundColor: theme.headerBg }]}>
              <View style={styles.searchHeader}>
                <TouchableOpacity onPress={closeSearch} style={styles.searchBackBtn}>
                  <Feather name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Feather name="search" size={18} color={theme.textSecondary} />
                  <TextInput
                    ref={searchInputRef}
                    placeholder="Search masalas, oils, ghee..."
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                      <Feather name="x" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Results */}
            {query.trim().length > 0 && (
              searchResults.length === 0 ? (
                <View style={[styles.searchResultsBox, { backgroundColor: theme.background }]}>
                  <Text style={[styles.searchEmptyText, { color: theme.textSecondary, padding: 20 }]}>
                    No products found for "{query}"
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  style={[styles.searchResultsBox, { backgroundColor: theme.background }]}
                  removeClippedSubviews={Platform.OS !== 'web'}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={6}
                  renderItem={renderSearchItem}
                />
              )
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  webContentWrapper: {
    width: '100%',
    alignSelf: 'center',
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
  // Search overlay
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  searchBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContent: {
    maxHeight: '80%',
  },
  searchTopArea: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    gap: 10,
  },
  searchBackBtn: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  searchResultsBox: {
    maxHeight: 400,
  },
  searchEmptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  searchItemInfo: {
    flex: 1,
    gap: 2,
  },
  searchItemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchItemCategory: {
    fontSize: 12,
  },
  searchItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
