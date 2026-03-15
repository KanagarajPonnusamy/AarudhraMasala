/**
 * Created by: Kanagaraj P
 * Created on: 04-03-2026
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';

export default function SearchScreen({ navigation }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header navigation={navigation} showBack />
      <Breadcrumb
        crumbs={[
          { label: 'Home', screen: 'Main' },
          { label: 'Search' },
        ]}
      />

      {/* Search Input */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          <Feather name="search" size={18} color={theme.textSecondary} />
          <TextInput
            autoFocus
            placeholder="Search masalas, oils, ghee..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results placeholder */}
      <View style={styles.content}>
        <EmptyState
          icon="search"
          title="Search Products"
          subtitle="Find your favourite masalas, oils, ghee and more"
          buttonText="Go Back"
          onPress={() => navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    borderBottomWidth: 1,
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
  content: {
    flex: 1,
  },
});
