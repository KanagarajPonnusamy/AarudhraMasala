/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CachedImage from './CachedImage';
import { SIZES } from '../constants/theme';
import { CATEGORIES } from '../constants/data';
import HtmlText from './HtmlText';

const CategorySeparator = () => <View style={{ width: 16 }} />;

export default function CategoryList({ categories, title }) {
  const { theme } = useTheme();

  // Map API data to internal format, falling back to CATEGORIES placeholder images
  const displayCategories = categories
    ? categories.map((cat, index) => ({
        id: cat.categorycode || String(index),
        name: cat.categoryname || '',
        icon: cat.categoryurl || (CATEGORIES[index]?.icon ?? ''),
      }))
    : CATEGORIES;

  const sectionTitle = title || 'Shop by Category';

  const renderCategory = useCallback(({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <CachedImage source={{ uri: item.icon }} style={styles.categoryImage} contentFit="cover" />
      </View>
      <HtmlText text={item.name} style={[styles.categoryName, { color: theme.text }]} color={theme.text} numberOfLines={2} />
    </TouchableOpacity>
  ), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <HtmlText text={sectionTitle} style={[styles.sectionTitle, { color: theme.text }]} color={theme.text} />
      </View>
      <FlatList
        data={displayCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SIZES.padding, flexGrow: 1, justifyContent: 'center' }}
        ItemSeparatorComponent={CategorySeparator}
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 26,
  },
  sectionHeader: {
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0.8, height: 0 },
    textShadowRadius: 0,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryItem: {
    alignItems: 'center',
    width: 120,
  },
  categoryIcon: {
    width: 102,
    height: 102,
    borderRadius: 51,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
