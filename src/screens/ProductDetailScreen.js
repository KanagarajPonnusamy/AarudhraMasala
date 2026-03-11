/**
 * Created by: Kanagaraj P
 * Created on: 11-03-2026
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouriteContext';
import { fetchProduct } from '../services/api';
import { SIZES } from '../constants/theme';

export default function ProductDetailScreen({ navigation, route }) {
  const { productId } = route.params;
  const { theme } = useTheme();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProduct(productId);
        if (mounted) setProduct(data);
      } catch (e) {
        console.warn('Fetch product failed:', e.message);
        if (mounted) setError('Failed to load product details');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <Header theme={theme} navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <Header theme={theme} navigation={navigation} />
        <View style={styles.centered}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {error || 'Product not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const cartItem = {
    id: String(product.id),
    name: product.productname,
    price: product.offerprice || product.productprice,
    originalPrice: product.productprice,
    image: product.producturl,
    category: product.productcategory,
    productcode: product.productcode,
    weight: '',
  };

  const inCart = isInCart(String(product.id));
  const liked = isFavourite(String(product.id));
  const discount = product.offerprice && product.offerprice < product.productprice
    ? Math.round(((product.productprice - product.offerprice) / product.productprice) * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Header theme={theme} navigation={navigation} title={product.productcategory} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.card }]}>
          <View style={styles.imageWrapper}>
            {discount > 0 && (
              <View style={[styles.discountBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            )}
            <Image source={{ uri: product.producturl }} style={styles.productImage} />
            <TouchableOpacity
              style={[styles.wishlistBtn, { backgroundColor: liked ? theme.accent : theme.surface }]}
              onPress={() => toggleFavourite(cartItem)}
            >
              <Feather name="heart" size={20} color={liked ? '#FFF' : theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[
            styles.cartButton,
            inCart
              ? { borderColor: theme.accent, backgroundColor: theme.accent }
              : { borderColor: theme.primary, backgroundColor: 'transparent' },
          ]}
          onPress={() => inCart ? removeFromCart(String(product.id)) : addToCart(cartItem)}
        >
          <Feather
            name={inCart ? 'x-circle' : 'shopping-cart'}
            size={14}
            color={inCart ? '#FFF' : theme.primary}
          />
          <Text
            style={[
              styles.cartButtonText,
              { color: inCart ? '#FFF' : theme.primary },
            ]}
          >
            {inCart ? 'Remove' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.productName, { color: theme.text }]}>
            {product.productname}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>
              ₹{product.offerprice || product.productprice}
            </Text>
            {discount > 0 && (
              <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                ₹{product.productprice}
              </Text>
            )}
            {discount > 0 && (
              <View style={[styles.saveBadge, { backgroundColor: theme.accent + '20' }]}>
                <Text style={[styles.saveText, { color: theme.accent }]}>
                  Save ₹{product.productprice - product.offerprice}
                </Text>
              </View>
            )}
          </View>

          {/* Status */}
          <View style={[styles.statusBadge, { backgroundColor: product.status === 'ACTIVE' ? theme.primary + '15' : theme.badge + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: product.status === 'ACTIVE' ? theme.primary : theme.badge }]} />
            <Text style={[styles.statusText, { color: product.status === 'ACTIVE' ? theme.primary : theme.badge }]}>
              {product.status === 'ACTIVE' ? 'In Stock' : 'Unavailable'}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Description */}
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.text }]}>Description</Text>
            <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
              {product.description || 'Description not available'}
            </Text>
          </View>

          {/* Manufacturer */}
          <View style={[styles.detailSection, { marginTop: 25 }]}>
            <Text style={[styles.detailLabel, { color: theme.text }]}>Manufacturer</Text>
            <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
              {product.manufacturer || 'Not specified'}
            </Text>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

function Header({ theme, navigation, title }) {
  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
        {title || 'Product Details'}
      </Text>
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  imageWrapper: {
    width: '80%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 1,
  },
  discountText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSection: {
    padding: SIZES.padding,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    alignSelf: 'center',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    marginTop: 20,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  detailLabel: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 8,
  },
  cartButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
