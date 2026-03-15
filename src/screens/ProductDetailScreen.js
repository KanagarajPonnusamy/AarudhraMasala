/**
 * Created by: Kanagaraj P
 * Created on: 11-03-2026
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import CachedImage from '../components/CachedImage';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouriteContext';
import { fetchProduct } from '../services/api';
import { SIZES } from '../constants/theme';
import HtmlText from '../components/HtmlText';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';

const WIDE_BREAKPOINT = 768;

export default function ProductDetailScreen({ navigation, route }) {
  const { productId, categoryName, categoryTypecode } = route.params;
  const { theme } = useTheme();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const { width: screenWidth } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && screenWidth >= WIDE_BREAKPOINT;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProduct(productId);
        if (mounted) {
          setProduct(data);
          const weights = data.quantity ? data.quantity.split('|').map((w) => w.trim()).filter(Boolean) : [];
          if (weights.length > 0) setSelectedWeight(weights[0]);
        }
      } catch (e) {
        console.warn('Fetch product failed:', e.message);
        if (mounted) setError('Failed to load product details');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  const buildCrumbs = () => {
    const crumbs = [{ label: 'Home', screen: 'Main' }];
    if (categoryName) {
      crumbs.push({ label: categoryName, screen: 'ProductList', params: { title: categoryName, typecode: categoryTypecode } });
    }
    crumbs.push({ label: product?.productname || 'Product Details' });
    return crumbs;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <Header navigation={navigation} showBack />
        <Breadcrumb crumbs={[{ label: 'Home', screen: 'Main' }, { label: 'Loading...' }]} />
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
        <Header navigation={navigation} showBack />
        <Breadcrumb crumbs={[{ label: 'Home', screen: 'Main' }, { label: 'Error' }]} />
        <View style={styles.centered}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {error || 'Product not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const weightOptions = product.quantity ? product.quantity.split('|').map((w) => w.trim()).filter(Boolean) : [];

  const cartItem = {
    id: String(product.id),
    name: product.productname,
    price: product.offerprice || product.productprice,
    originalPrice: product.productprice,
    image: product.producturl,
    category: product.productcategory,
    productcode: product.productcode,
    weight: selectedWeight || '',
    quantity_val: selectedWeight || '',
  };

  const inCart = isInCart(String(product.id));
  const liked = isFavourite(String(product.id));
  const discount = product.offerprice && product.offerprice < product.productprice
    ? Math.round(((product.productprice - product.offerprice) / product.productprice) * 100)
    : 0;

  const imageSection = (
    <View style={[styles.imageContainer, { backgroundColor: theme.card }, isWide && styles.imageContainerWide]}>
      <View style={[styles.imageWrapper, isWide && styles.imageWrapperWide]}>
        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: theme.accent }]}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        <CachedImage source={{ uri: product.producturl }} style={[styles.productImage, isWide && styles.productImageWide]} />
        {!isWide && (
          <TouchableOpacity
            style={[styles.wishlistBtn, { backgroundColor: liked ? theme.accent : theme.surface }]}
            onPress={() => toggleFavourite(cartItem)}
          >
            <Feather name="heart" size={20} color={liked ? '#FFF' : theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const infoSection = (
    <View style={[styles.infoSection, isWide && styles.infoSectionWide]}>
      {isWide && (
        <View style={styles.webNameRow}>
          <Text style={[styles.webProductName, { color: theme.text }]}>
            {product.productname}
          </Text>
          <TouchableOpacity
            style={[styles.webWishlistBtn, { backgroundColor: liked ? theme.accent : theme.surface }]}
            onPress={() => toggleFavourite(cartItem)}
          >
            <Feather name="heart" size={20} color={liked ? '#FFF' : theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {isWide && product.shortdescription ? (
        <HtmlText
          text={product.shortdescription}
          style={[styles.webDescriptionSnippet, { color: theme.textSecondary }]}
          color={theme.textSecondary}
          numberOfLines={2}
        />
      ) : null}

      <View style={[styles.priceRow, isWide && styles.priceRowWide]}>
        <Text style={[styles.price, { color: theme.primary }, isWide && styles.priceWide]}>
          Rs. {product.offerprice || product.productprice}
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

      {weightOptions.length > 0 && (
        <View style={[styles.weightSection, isWide && styles.weightSectionWide]}>
          <Text style={[styles.weightLabel, { color: theme.text }]}>
            Weight : {selectedWeight}
          </Text>
          <View style={[styles.weightRow, isWide && styles.weightRowWide]}>
            {weightOptions.map((w) => {
              const isSelected = w === selectedWeight;
              return (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.weightChip,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primary + '10' : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedWeight(w)}
                >
                  <Text
                    style={[
                      styles.weightChipText,
                      { color: isSelected ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {w}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {!inCart && (
        <View style={[styles.qtyContainer, { borderColor: theme.border }, isWide && styles.qtyContainerWide]}>
          <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: theme.border + '40' }]}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Feather name="minus" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: theme.text }]}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: theme.border + '40' }]}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Feather name="plus" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      )}

      {inCart ? (
        <TouchableOpacity
          activeOpacity={1.0}
          style={[styles.cartButton, { backgroundColor: theme.accent }]}
          onPress={() => removeFromCart(String(product.id))}
        >
          <Feather name="x-circle" size={16} color="#FFF" />
          <Text style={[styles.cartButtonText, { color: '#FFF' }]}>
            Remove from Cart
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={1.0}
          style={[styles.cartButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            addToCart(cartItem, quantity);
            setQuantity(1);
          }}
        >
          <Feather name="shopping-cart" size={16} color="#FFF" />
          <Text style={[styles.cartButtonText, { color: '#FFF' }]}>
            Add To Cart
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.detailSection}>
        <Text style={[styles.detailLabel, { color: theme.text }]}>Description</Text>
        <HtmlText
          text={product.description || 'Description not available'}
          style={[styles.detailValue, { color: theme.textSecondary }]}
          color={theme.textSecondary}
        />
      </View>

      <View style={[styles.detailSection, { marginTop: 25 }]}>
        <Text style={[styles.detailLabel, { color: theme.text }]}>Manufacturer</Text>
        <HtmlText
          text={product.manufacturer || 'Not specified'}
          style={[styles.detailValue, { color: theme.textSecondary }]}
          color={theme.textSecondary}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Header navigation={navigation} showBack />
      <Breadcrumb crumbs={buildCrumbs()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}>
        {isWide ? (
          <View style={styles.wideLayout}>
            {imageSection}
            {infoSection}
          </View>
        ) : (
          <>
            {imageSection}
            {infoSection}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    paddingBottom: 30,
  },
  scrollContentWide: {
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  wideLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 40,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  imageContainerWide: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 0,
  },
  imageWrapper: {
    width: '80%',
    position: 'relative',
  },
  imageWrapperWide: {
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 280,
  },
  productImageWide: {
    height: 450,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    alignItems: 'center',
  },
  infoSectionWide: {
    flex: 1,
    padding: 0,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  webNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  webProductName: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    marginRight: 16,
  },
  webWishlistBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  webDescriptionSnippet: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    marginBottom: 12,
  },
  priceRowWide: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  priceWide: {
    fontSize: 20,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
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
  weightSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  weightSectionWide: {
    alignItems: 'flex-start',
  },
  weightLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  weightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  weightRowWide: {
    justifyContent: 'flex-start',
  },
  weightChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  weightChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  qtyContainerWide: {
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  cartActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  goToCartBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
