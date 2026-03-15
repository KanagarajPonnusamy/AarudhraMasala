/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CachedImage from './CachedImage';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouriteContext';
import { SIZES } from '../constants/theme';
import HtmlText from './HtmlText';

function ProductCard({ product, style, onPress }) {
  const { theme } = useTheme();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const inCart = isInCart(product.id);
  const liked = isFavourite(product.id);

  const handleCartPress = () => {
    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadowColor }, style]}
    >
      <View style={styles.imageContainer}>
        <CachedImage source={{ uri: product.image }} style={styles.image} />
        {product.badge && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: theme.accent }]}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.wishlistBtn, { backgroundColor: liked ? theme.accent : theme.surface }]}
          onPress={() => toggleFavourite(product)}
        >
          <Feather name="heart" size={16} color={liked ? '#FFF' : theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <HtmlText text={product.category} style={[styles.category, { color: theme.textSecondary }]} color={theme.textSecondary} />
        <HtmlText text={product.name} style={[styles.name, { color: theme.text }]} color={theme.text} numberOfLines={1} />
        <Text style={[styles.weight, { color: theme.textSecondary }]}>{product.weight}</Text>

        <View style={styles.ratingRow}>
          <Feather name="star" size={12} color={theme.star} />
          <Text style={[styles.rating, { color: theme.text }]}>{product.rating}</Text>
          <Text style={[styles.reviews, { color: theme.textSecondary }]}>({product.reviews})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>₹{product.price}</Text>
          {product.originalPrice > product.price && (
            <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
              ₹{product.originalPrice}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleCartPress}
          style={[
            styles.addBtn,
            inCart
              ? { borderColor: theme.accent, backgroundColor: theme.accent }
              : { borderColor: theme.primary, backgroundColor: 'transparent' },
          ]}
        >
          <Feather
            name={inCart ? 'x-circle' : 'shopping-cart'}
            size={14}
            color={inCart ? '#FFF' : theme.primary}
          />
          <Text
            style={[
              styles.addBtnText,
              { color: inCart ? '#FFF' : theme.primary },
            ]}
          >
            {inCart ? 'Remove' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#F9F9F9',
  },
  image: {
    width: '100%',
    height: 140,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    padding: 10,
  },
  category: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  weight: {
    fontSize: 12,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviews: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
