/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

const AUTO_SCROLL_DELAY = 4000;
const CARD_SPACING = 12;

export default function PromoBanner({ promos }) {
  const { theme } = useTheme();

  // If no promos prop, render the original static banner
  if (!promos || promos.length === 0) {
    return (
      <View style={[styles.staticContainer, { backgroundColor: theme.isDark ? '#1a2e2a' : '#E8F5F1' }]}>
        <View style={styles.staticContent}>
          <View style={styles.iconCircle}>
            <Feather name="truck" size={20} color={theme.primary} />
          </View>
          <View style={styles.staticTextContainer}>
            <Text style={[styles.staticTitle, { color: theme.text }]}>Free Delivery on orders above ₹499</Text>
            <Text style={[styles.staticSubtitle, { color: theme.textSecondary }]}>
              Pure & authentic masalas delivered to your doorstep
            </Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.staticBtn, { backgroundColor: theme.primary }]}>
          <Text style={styles.staticBtnText}>Order Now</Text>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return <PromoCarousel promos={promos} theme={theme} />;
}

function PromoCarousel({ promos, theme }) {
  const { width: rawScreenWidth } = useWindowDimensions();
  const screenWidth = Platform.OS === 'web' && rawScreenWidth > SIZES.maxWidth
    ? SIZES.maxWidth
    : rawScreenWidth;

  const cardWidth = useMemo(() => screenWidth - SIZES.padding * 2, [screenWidth]);
  const snapInterval = useMemo(() => cardWidth + CARD_SPACING, [cardWidth]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const activeIndexRef = useRef(0);
  const isUserInteracting = useRef(false);
  const autoScrollTimer = useRef(null);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const scrollToIndex = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, promos.length - 1));
    activeIndexRef.current = clamped;
    flatListRef.current?.scrollToOffset({
      offset: clamped * snapInterval,
      animated: true,
    });
  }, [snapInterval, promos.length]);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (promos.length <= 1) return;
    autoScrollTimer.current = setInterval(() => {
      if (!isUserInteracting.current) {
        const nextIndex = (activeIndexRef.current + 1) % promos.length;
        scrollToIndex(nextIndex);
      }
    }, AUTO_SCROLL_DELAY);
  }, [promos.length, scrollToIndex, stopAutoScroll]);

  useEffect(() => {
    if (promos.length > 1) startAutoScroll();
    return stopAutoScroll;
  }, [promos.length, startAutoScroll, stopAutoScroll]);

  const onScrollBeginDrag = () => {
    isUserInteracting.current = true;
    stopAutoScroll();
  };

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    activeIndexRef.current = Math.max(0, Math.min(index, promos.length - 1));
    isUserInteracting.current = false;
    if (promos.length > 1) startAutoScroll();
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const PROMO_COLORS = ['#108474', '#D4A373', '#E76F51', '#8B5E3C', '#6B8E23', '#9B2335'];

  const renderPromo = ({ item, index }) => {
    const bgColor = PROMO_COLORS[index % PROMO_COLORS.length];
    return (
      <View style={[styles.promoCard, { width: cardWidth, backgroundColor: bgColor }]}>
        <View style={styles.promoIconCircle}>
          <Feather name="gift" size={22} color="#FFF" />
        </View>
        <Text style={styles.promoName} numberOfLines={2}>{item.promoname}</Text>
        <Text style={styles.promoDesc} numberOfLines={2}>{item.description}</Text>
        {item.promocode ? (
          <View style={styles.promoCodeBadge}>
            <Text style={styles.promoCodeText}>Code: {item.promocode}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <Animated.FlatList
        ref={flatListRef}
        data={promos}
        renderItem={renderPromo}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        bounces={false}
        contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      {promos.length > 1 && (
        <View style={styles.dots}>
          {promos.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (i - 1) * snapInterval,
                i * snapInterval,
                (i + 1) * snapInterval,
              ],
              outputRange: [8, 22, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * snapInterval,
                i * snapInterval,
                (i + 1) * snapInterval,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Static fallback styles
  staticContainer: {
    marginHorizontal: SIZES.padding,
    marginTop: 24,
    borderRadius: SIZES.radius,
    padding: 16,
  },
  staticContent: {
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
  staticTextContainer: {
    flex: 1,
  },
  staticTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  staticSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  staticBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  staticBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Carousel styles
  carouselContainer: {
    marginTop: 24,
  },
  promoCard: {
    borderRadius: SIZES.radius + 4,
    padding: 20,
    minHeight: 140,
    justifyContent: 'center',
  },
  promoIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  promoName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  promoDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 10,
  },
  promoCodeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  promoCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
