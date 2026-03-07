/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
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
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SIZES } from '../constants/theme';
import EmptyState from '../components/EmptyState';

function CartItem({ item, theme, updateQuantity, removeFromCart }) {
  return (
    <View
      style={[
        styles.cartItem,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.weight ? (
          <Text style={[styles.itemWeight, { color: theme.textSecondary }]}>
            {item.weight}
          </Text>
        ) : null}
        <Text style={[styles.itemPrice, { color: theme.primary }]}>
          ₹{item.price}
        </Text>

        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={[styles.qtyBtn, { borderColor: theme.border }]}
            >
              <Feather name="minus" size={16} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: theme.text }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={[styles.qtyBtn, { borderColor: theme.border }]}
            >
              <Feather name="plus" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeFromCart(item.id)}
            style={styles.deleteBtn}
          >
            <Feather name="trash-2" size={18} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtotal, { color: theme.textSecondary }]}>
          Subtotal: ₹{item.price * item.quantity}
        </Text>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart } =
    useCart();

  const handleCheckout = () => {
    if (user) {
      navigation.navigate('Checkout');
    } else {
      navigation.navigate('Login', { returnTo: 'Checkout' });
    }
  };

  const renderItem = ({ item }) => (
    <CartItem
      item={item}
      theme={theme}
      updateQuantity={updateQuantity}
      removeFromCart={removeFromCart}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="shopping-cart"
      title="Your cart is empty"
      subtitle="Add some products to get started"
      buttonText="Continue Shopping"
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
            My Cart ({cartCount})
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Cart List */}
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            cartItems.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />

        {/* Order Summary Footer */}
        {cartItems.length > 0 && (
          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
                shadowColor: theme.shadowColor,
              },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                Total ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </Text>
              <Text style={[styles.totalAmount, { color: theme.primary }]}>
                ₹{cartTotal}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
              onPress={handleCheckout}
            >
              <Feather name="check-circle" size={18} color="#FFF" />
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
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
  cartItem: {
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
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemWeight: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  subtotal: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '900',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
