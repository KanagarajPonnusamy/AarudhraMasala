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

export default function Header({ navigation, onSearchPress, showBack }) {
  const { theme } = useTheme();
  const { cartCount } = useCart();

  const handleLeftPress = () => {
    if (showBack) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } else {
      navigation.openDrawer();
    }
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  };

  const handleCartPress = () => {
    if (showBack) {
      navigation.navigate('Cart');
    } else {
      navigation.getParent()?.navigate('Cart');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {showBack ? (
        <TouchableOpacity onPress={handleLeftPress} style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.primary }]}>Aarudhra</Text>
          <Text style={[styles.logoSubText, { color: theme.text }]}>MASALA</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity onPress={handleLeftPress} style={styles.iconBtn}>
            <Feather name="menu" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: theme.primary }]}>Aarudhra</Text>
            <Text style={[styles.logoSubText, { color: theme.text }]}>MASALA</Text>
          </View>
        </>
      )}

      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleSearchPress}
        >
          <Feather name="search" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleCartPress}
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
    fontSize: 36,
    fontFamily: 'BabyBoho',
    letterSpacing: 1,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1.6, height: 0 },
    textShadowRadius: 0,
  },
  logoSubText: {
    fontSize: 16,
    fontFamily: 'BabyBoho',
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
