/**
 * Created by: Kanagaraj P
 * Created on: 04-03-2026
 */
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About Us</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.brandName, { color: theme.primary }]}>Aarudhra</Text>
          <Text style={[styles.brandTag, { color: theme.text }]}>MASALA</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Pure & Traditional Spices
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* About Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Who We Are</Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            At Aarudhra Masala, we bring you the authentic taste of tradition. Our masalas are carefully prepared using time-honoured homemade recipes passed down through generations, ensuring every spice blend carries the warmth and richness of home cooking.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pure Nattu Chekku Oil</Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            We take pride in using only pure Nattu Chekku (wood-pressed) oil in our preparations. Unlike refined oils, Nattu Chekku oil is extracted using traditional wooden cold-press methods that preserve the natural nutrients, aroma, and flavour of the oil. This ensures that every product we offer is not only delicious but also wholesome and healthy.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Promise</Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Every product from Aarudhra Masala is made with the finest natural ingredients — no artificial colours, no preservatives, and no adulteration. We believe in delivering quality you can taste and purity you can trust, straight from our kitchen to yours.
          </Text>

          {/* Highlights */}
          <View style={styles.highlightsContainer}>
            {[
              { icon: 'home', text: 'Homemade Recipes' },
              { icon: 'droplet', text: 'Pure Nattu Chekku Oil' },
              { icon: 'shield', text: 'No Preservatives' },
              { icon: 'heart', text: 'Made with Love' },
            ].map((item, index) => (
              <View
                key={index}
                style={[styles.highlightCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.highlightIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Feather name={item.icon} size={22} color={theme.primary} />
                </View>
                <Text style={[styles.highlightText, { color: theme.text }]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer Copyright */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.copyright, { color: theme.textSecondary }]}>
            {'\u00A9'} 2026 Aarudhra Masala. All Rights Reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 36,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1.6, height: 0 },
    textShadowRadius: 0,
  },
  brandTag: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: -2,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 0,
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 40,
  },
  contentSection: {
    paddingHorizontal: SIZES.padding + 4,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    justifyContent: 'center',
  },
  highlightCard: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    paddingBottom: 16,
    marginHorizontal: SIZES.padding,
  },
  copyright: {
    fontSize: 11,
    fontWeight: '500',
  },
});
