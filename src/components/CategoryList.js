import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import { CATEGORIES } from '../constants/data';

export default function CategoryList() {
  const { theme } = useTheme();

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Image source={{ uri: item.icon }} style={styles.categoryImage} />
      </View>
      <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Shop by Category</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SIZES.padding, flexGrow: 1, justifyContent: 'center' }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
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
    width: 126,
  },
  categoryIcon: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  categoryImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
