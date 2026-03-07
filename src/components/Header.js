/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { SIZES } from '../constants/theme';

export default function Header({ navigation, onSearchPress }) {
  const { theme } = useTheme();
  const { cartCount } = useCart();

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
        <Feather name="menu" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.primary }]}>Aarudhra</Text>
        <Text style={[styles.logoSubText, { color: theme.text }]}>MASALA</Text>
      </View>

      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onSearchPress}
        >
          <Feather name="search" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.getParent()?.navigate('Cart')}
        >
          <Feather name="shopping-cart" size={22} color={theme.text} />
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: theme.badge }]}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    padding: 4,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1.6, height: 0 },
    textShadowRadius: 0,
  },
  logoSubText: {
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 0,
    letterSpacing: 4,
    marginTop: -2,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
