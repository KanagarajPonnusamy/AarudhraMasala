/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import ProductCard from './ProductCard';
import HtmlText from './HtmlText';

const GAP = 20;

function ProductSection({ title, products, typecode }) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const containerWidth = Platform.OS === 'web' && screenWidth > SIZES.maxWidth
    ? SIZES.maxWidth
    : screenWidth;
  const columns = containerWidth >= 768 ? 4 : 2;
  const availableWidth = containerWidth - SIZES.padding * 2;
  const cardWidth = (availableWidth - GAP * (columns - 1)) / columns;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <HtmlText text={title} style={[styles.sectionTitle, { color: theme.text }]} color={theme.text} />
        {typecode ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductList', { title, typecode })}
          >
            <Text style={[styles.viewAll, { color: theme.primary }]}>View All</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.grid}>
        {products.slice(0, columns >= 4 ? 8 : 6).map((item) => (
          <View key={item.id} style={{ width: cardWidth }}>
            <ProductCard
              product={item}
              onPress={() => item.productId && navigation.navigate('ProductDetail', { productId: item.productId, categoryName: title, categoryTypecode: typecode })}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default React.memo(ProductSection);

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
