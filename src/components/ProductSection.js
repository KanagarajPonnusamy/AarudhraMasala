/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import ProductCard from './ProductCard';

const GAP = 20;

export default function ProductSection({ title, products }) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const columns = screenWidth >= 768 ? 4 : 2;
  const availableWidth = screenWidth - SIZES.padding * 2;
  const cardWidth = (availableWidth - GAP * (columns - 1)) / columns;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: theme.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {products.map((item) => (
          <View key={item.id} style={{ width: cardWidth }}>
            <ProductCard product={item} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0.8, height: 0 },
    textShadowRadius: 0,
  },
  viewAll: {
    fontSize: 15,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
    gap: GAP,
  },
});
