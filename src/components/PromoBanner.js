import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function PromoBanner() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.isDark ? '#1a2e2a' : '#E8F5F1' }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="truck" size={20} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Free Delivery on orders above ₹499</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Pure & authentic masalas delivered to your doorstep
          </Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]}>
        <Text style={styles.btnText}>Order Now</Text>
        <Feather name="arrow-right" size={14} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.padding,
    marginTop: 24,
    borderRadius: SIZES.radius,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16,132,116,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
