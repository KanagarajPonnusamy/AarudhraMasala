/**
 * Created by: Kanagaraj P
 * Created on: 04-03-2026
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ icon, title, subtitle, buttonText, onPress }) {
  const { theme } = useTheme();

  const iconScale = useRef(new Animated.Value(0)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(16)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(16)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // Icon: spring scale in
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // Title: fade + slide up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle: fade + slide up
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Button: fade + slide up
      Animated.parallel([
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(btnTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous gentle float on the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconFloat, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.primary + '15' },
          { transform: [{ scale: iconScale }, { translateY: iconFloat }] },
        ]}
      >
        <Feather name={icon} size={56} color={theme.primary} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.title,
          { color: theme.text },
          { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] },
        ]}
      >
        {title}
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          { color: theme.textSecondary },
          { opacity: subtitleOpacity, transform: [{ translateY: subtitleTranslateY }] },
        ]}
      >
        {subtitle}
      </Animated.Text>

      <Animated.View
        style={{ opacity: btnOpacity, transform: [{ translateY: btnTranslateY }] }}
      >
        <TouchableOpacity
          onPress={onPress}
          style={[styles.btn, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>{buttonText}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  btn: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 10,
  },
  btnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
