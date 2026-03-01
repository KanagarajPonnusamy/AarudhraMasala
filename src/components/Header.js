import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function Header({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Feather name="menu" size={24} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.primary }]}>Aarudhra</Text>
          <Text style={[styles.logoSubText, { color: theme.text }]}>MASALA</Text>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="heart" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="shopping-cart" size={22} color={theme.text} />
            <View style={[styles.cartBadge, { backgroundColor: theme.badge }]}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          placeholder="Search masalas, oils, ghee..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 36,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  searchBar: {
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
    outlineStyle: 'none',
  },
});
