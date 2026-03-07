/**
 * Created by: Kanagaraj P
 * Created on: 04-03-2026
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFavourites } from '../context/FavouriteContext';
import { useCart } from '../context/CartContext';
import { SIZES } from '../constants/theme';
import EmptyState from '../components/EmptyState';

function FavouriteItem({ item, theme, removeFromFavourites, addToCart, isInCart }) {
  const inCart = isInCart(item.id);
  const discount = Math.round(
    ((item.originalPrice - item.price) / item.originalPrice) * 100
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>

      <View style={styles.itemInfo}>
        <Text style={[styles.itemCategory, { color: theme.textSecondary }]}>
          {item.category}
        </Text>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.weight ? (
          <Text style={[styles.itemWeight, { color: theme.textSecondary }]}>
            {item.weight}
          </Text>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={[styles.itemPrice, { color: theme.primary }]}>
            ₹{item.price}
          </Text>
          {discount > 0 && (
            <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
              ₹{item.originalPrice}
            </Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => {
              if (!inCart) addToCart(item);
            }}
            style={[
              styles.cartBtn,
              {
                backgroundColor: inCart ? theme.primary + '15' : theme.primary,
                borderColor: theme.primary,
              },
            ]}
          >
            <Feather
              name={inCart ? 'check' : 'shopping-cart'}
              size={14}
              color={inCart ? theme.primary : '#FFF'}
            />
            <Text
              style={[
                styles.cartBtnText,
                { color: inCart ? theme.primary : '#FFF' },
              ]}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeFromFavourites(item.id)}
            style={styles.removeBtn}
          >
            <Feather name="trash-2" size={18} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function FavouritesScreen({ navigation }) {
  const { theme } = useTheme();
  const { favourites, favouriteCount, removeFromFavourites } = useFavourites();
  const { addToCart, isInCart } = useCart();

  const renderItem = ({ item }) => (
    <FavouriteItem
      item={item}
      theme={theme}
      removeFromFavourites={removeFromFavourites}
      addToCart={addToCart}
      isInCart={isInCart}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="heart"
      title="No favourites yet"
      subtitle="Tap the heart icon on products to save them here"
      buttonText="Browse Products"
      onPress={() => navigation.goBack()}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Favourites ({favouriteCount})
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={favourites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          favourites.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: SIZES.padding,
    gap: 12,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 110,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemWeight: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  cartBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 6,
  },
});
