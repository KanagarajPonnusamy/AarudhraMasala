/**
 * Created by: Kanagaraj P
 * Created on: 25-03-2026
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomDialog({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
  loading,
}) {
  const { theme } = useTheme();

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const dialogOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Reset before animating in
      scaleAnim.setValue(0.85);
      dialogOpacity.setValue(0);
      logoScale.setValue(0.5);
      overlayAnim.setValue(0);

      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(dialogOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          delay: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(dialogOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Overlay — tap to dismiss */}
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Animated.View
          style={[styles.overlayBg, { opacity: overlayAnim }]}
        />
      </Pressable>

      {/* Centered dialog container (not pressable so taps go to overlay) */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.card,
              opacity: dialogOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Brand logo badge floating on top */}
          <Animated.View
            style={[
              styles.logoBadge,
              {
                backgroundColor: theme.primary,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Text style={styles.logoBadgeText}>Aarudhra</Text>
            <Text style={styles.logoBadgeSub}>MASALA</Text>
          </Animated.View>

          {/* Decorative accent line */}
          <View style={[styles.accentLine, { backgroundColor: theme.primary }]} />

          {/* Title */}
          {title ? (
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          ) : null}

          {/* Message */}
          {message ? (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {message}
            </Text>
          ) : null}

          {/* Buttons */}
          {loading ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.btnRow}>
              {buttons.map((btn, idx) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    style={[
                      styles.btn,
                      isCancel && [styles.btnCancel, { borderColor: theme.border }],
                      isDestructive && styles.btnDestructive,
                      !isCancel && !isDestructive && { backgroundColor: theme.primary },
                    ]}
                    onPress={btn.onPress}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isCancel && { color: theme.textSecondary },
                        !isCancel && { color: '#FFF' },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  centeredContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  dialog: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 56,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoBadge: {
    position: 'absolute',
    top: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  logoBadgeText: {
    fontFamily: 'BabyBoho',
    fontSize: 18,
    color: '#FFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0.8, height: 0 },
    textShadowRadius: 0,
  },
  logoBadgeSub: {
    fontFamily: 'BabyBoho',
    fontSize: 8,
    color: '#FFF',
    letterSpacing: 3,
    marginTop: -2,
    opacity: 0.9,
  },
  accentLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  btnDestructive: {
    backgroundColor: '#EF4444',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
